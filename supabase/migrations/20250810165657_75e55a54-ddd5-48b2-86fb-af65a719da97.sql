-- =========================================================
-- © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
-- Hardening RLS, cleanup duplicati, vincoli QR e report
-- Eseguire in Production
-- =========================================================

-- 0) Sicurezza: assicurati che siamo nello schema pubblico
set search_path = public;

-- 1) Funzioni critiche: forza search_path per tutte le SECURITY DEFINER note
do $$
begin
  execute 'alter function if exists public.qr_redeem(text,double precision,double precision) owner to postgres';
  execute 'alter function if exists public.qr_redeem(text,double precision,double precision) set search_path = public';
exception when others then null;
end $$;

do $$
begin
  execute 'alter function if exists public.get_my_balance() owner to postgres';
  execute 'alter function if exists public.get_my_balance() set search_path = public';
exception when others then null;
end $$;

do $$
begin
  execute 'alter function if exists public.qr_admin_upsert(text,text,text,int,int,int,double precision,double precision,int,boolean) owner to postgres';
  execute 'alter function if exists public.qr_admin_upsert(text,text,text,int,int,int,double precision,double precision,int,boolean) set search_path = public';
exception when others then null;
end $$;

-- 2) RLS ON sulle tabelle sensibili
alter table if exists public.user_balances enable row level security;
alter table if exists public.user_custom_rewards enable row level security;
alter table if exists public.api_rate_limits enable row level security;
alter table if exists public.blocked_ips enable row level security;
alter table if exists public.qr_redemption_logs enable row level security;

-- 3) Policy minime sicure (crea se non esistono già)
-- user_balances: solo il proprietario può leggere/aggiornare; niente INSERT diretti da client
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='user_balances' and policyname='ub_select_own'
  ) then
    execute $$create policy ub_select_own on public.user_balances 
      for select to authenticated using (user_id = auth.uid());$$;
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='user_balances' and policyname='ub_update_own'
  ) then
    execute $$create policy ub_update_own on public.user_balances 
      for update to authenticated using (user_id = auth.uid());$$;
  end if;

  -- esplicitamente nessuna insert da client (si affida a RPC/Server)
end $$;

-- user_custom_rewards: read own, insert solo service_role (se necessario)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='user_custom_rewards' and policyname='ucr_select_own'
  ) then
    execute $$create policy ucr_select_own on public.user_custom_rewards 
      for select to authenticated using (user_id = auth.uid());$$;
  end if;
  -- niente insert/update/delete per authenticated; eventuali scritture via service_role/RPC
end $$;

-- api_rate_limits / blocked_ips: solo service_role può mutare, admin può leggere
-- (assumiamo esistenza funzione is_admin_secure())
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='api_rate_limits' and policyname='arl_select_admin'
  ) then
    execute $$create policy arl_select_admin on public.api_rate_limits
      for select to authenticated using (is_admin_secure());$$;
  end if;
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='api_rate_limits' and policyname='arl_mutate_srv'
  ) then
    execute $$create policy arl_mutate_srv on public.api_rate_limits
      for all to public
      using (auth.jwt()->>'role' = 'service_role')
      with check (auth.jwt()->>'role' = 'service_role');$$;
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='blocked_ips' and policyname='bip_select_admin'
  ) then
    execute $$create policy bip_select_admin on public.blocked_ips
      for select to authenticated using (is_admin_secure());$$;
  end if;
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='blocked_ips' and policyname='bip_mutate_srv'
  ) then
    execute $$create policy bip_mutate_srv on public.blocked_ips
      for all to public
      using (auth.jwt()->>'role' = 'service_role')
      with check (auth.jwt()->>'role' = 'service_role');$$;
  end if;
end $$;

-- qr_redemption_logs: inserire solo come utente stesso o service_role; no update/delete
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='qr_redemption_logs' and policyname='qrrl_insert_user_or_srv'
  ) then
    execute $$create policy qrrl_insert_user_or_srv on public.qr_redemption_logs
      for insert to public
      with check ( (user_id = auth.uid()) or (auth.jwt()->>'role' = 'service_role') );$$;
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='qr_redemption_logs' and policyname='qrrl_select_own'
  ) then
    execute $$create policy qrrl_select_own on public.qr_redemption_logs
      for select to authenticated using (user_id = auth.uid() or is_admin_secure());$$;
  end if;
end $$;

-- 4) INDICI e VINCOLI (FK + UNIQUE) — FK NOT VALID finché non puliamo
-- Indice su qr_codes(code)
create index if not exists idx_qr_codes_code on public.qr_codes(code);

-- FK (NOT VALID per evitare blocchi su dati storici incoerenti)
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.qr_redemption_logs'::regclass
      and conname = 'qr_redemption_logs_qr_code_fk'
  ) then
    execute $SQL$
      alter table public.qr_redemption_logs
      add constraint qr_redemption_logs_qr_code_fk
      foreign key (qr_code_id) references public.qr_codes(id)
      on delete cascade not valid;
    $SQL$;
  end if;
end $$;

-- 5) CLEANUP DUPLICATI (necessario per creare unique index)
-- Trova eventuali duplicati per (qr_code_id, user_id)
with d as (
  select qr_code_id, user_id, count(*) c
  from public.qr_redemption_logs
  group by 1,2
  having count(*) > 1
)
select 'DUPLICATI', count(*) as pairs_with_dups from d;

-- Elimina righe duplicate mantenendo la più recente (redeemed_at max)
with ranked as (
  select id, qr_code_id, user_id,
         row_number() over (partition by qr_code_id, user_id order by redeemed_at desc, id desc) as rn
  from public.qr_redemption_logs
)
delete from public.qr_redemption_logs
where id in (select id from ranked where rn > 1);

-- 6) UNIQUE INDEX dopo cleanup
do $$
begin
  if not exists (
    select 1 from pg_indexes 
    where schemaname='public' and tablename='qr_redemption_logs' and indexname='uniq_qrrl_qrcode_user'
  ) then
    execute 'create unique index uniq_qrrl_qrcode_user on public.qr_redemption_logs(qr_code_id, user_id);';
  end if;
end $$;

-- 7) VALIDATE CONSTRAINTS
do $$
begin
  execute 'alter table public.qr_redemption_logs validate constraint qr_redemption_logs_qr_code_fk';
exception when others then
  raise notice 'VALIDATE FK: %', SQLERRM;
end $$;

-- 8) REPORT POLICY SNAPSHOT (restituisce elenco)
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname='public'
  and tablename in ('user_balances','user_custom_rewards','api_rate_limits','blocked_ips','qr_redemption_logs')
order by tablename, policyname;