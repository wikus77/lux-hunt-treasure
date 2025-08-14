-- MIGRAZIONE ROBUSTA QR – schema + RLS + backfill
begin;

-- 1) qr_codes: colonne essenziali e defaults
alter table public.qr_codes
  alter column reward_type drop default,
  alter column reward_value drop default;

alter table public.qr_codes
  alter column reward_type set data type text,
  alter column reward_value set data type integer;

-- backfill sicuro: imposta valori se mancanti
update public.qr_codes
set reward_type = coalesce(nullif(trim(reward_type), ''), 'buzz_credit'),
    reward_value = coalesce(reward_value, 1)
where (reward_type is null or trim(reward_type) = '')
   or reward_value is null;

-- 2) qr_redemptions: struttura coerente e indice univoco
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemptions' and column_name='reward_type') then
    alter table public.qr_redemptions add column reward_type text not null default 'buzz_credit';
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemptions' and column_name='reward_value') then
    alter table public.qr_redemptions add column reward_value integer not null default 1;
  end if;
end$$;

-- garantisci il vincolo unico (redeem per-utente)
create unique index if not exists uq_qr_redemptions_user_code
  on public.qr_redemptions(user_id, code);

-- 3) qr_redemption_logs: massima compatibilità (code + qr_code + qr_code_id)
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemption_logs' and column_name='code') then
    alter table public.qr_redemption_logs add column code text;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemption_logs' and column_name='qr_code') then
    alter table public.qr_redemption_logs add column qr_code text;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemption_logs' and column_name='qr_code_id') then
    alter table public.qr_redemption_logs add column qr_code_id text;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemption_logs' and column_name='status') then
    alter table public.qr_redemption_logs add column status text;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemption_logs' and column_name='details') then
    alter table public.qr_redemption_logs add column details jsonb;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='qr_redemption_logs' and column_name='created_at') then
    alter table public.qr_redemption_logs add column created_at timestamptz not null default now();
  end if;
end$$;

-- trigger per tenere sincronizzate le 3 colonne del codice
create or replace function public.sync_qr_log_cols()
returns trigger language plpgsql as $$
begin
  if new.code is null then new.code := coalesce(new.qr_code, new.qr_code_id); end if;
  if new.qr_code is null then new.qr_code := new.code; end if;
  if new.qr_code_id is null then new.qr_code_id := new.code; end if;
  return new;
end$$;

drop trigger if exists trg_sync_qr_log_cols on public.qr_redemption_logs;
create trigger trg_sync_qr_log_cols
before insert or update on public.qr_redemption_logs
for each row execute function public.sync_qr_log_cols();

-- indici utili sui log
create index if not exists idx_qr_logs_user on public.qr_redemption_logs(user_id);
create index if not exists idx_qr_logs_code on public.qr_redemption_logs(code);

-- 4) RLS/POLICIES
-- qr_codes: lettura/insert per autenticati
drop policy if exists qr_codes_select_auth on public.qr_codes;
create policy qr_codes_select_auth on public.qr_codes
for select to authenticated using (true);

drop policy if exists qr_codes_insert_auth on public.qr_codes;
create policy qr_codes_insert_auth on public.qr_codes
for insert to authenticated with check (true);

-- qr_redemptions: select/insert solo per se stessi
drop policy if exists qr_redemptions_select_own on public.qr_redemptions;
create policy qr_redemptions_select_own on public.qr_redemptions
for select to authenticated using (auth.uid() = user_id);

drop policy if exists qr_redemptions_insert_own on public.qr_redemptions;
create policy qr_redemptions_insert_own on public.qr_redemptions
for insert to authenticated with check (auth.uid() = user_id);

-- qr_redemption_logs: select/insert solo per se stessi (l'edge con service role bypassa)
drop policy if exists qr_redemption_logs_select_own on public.qr_redemption_logs;
create policy qr_redemption_logs_select_own on public.qr_redemption_logs
for select to authenticated using (auth.uid() = user_id);

drop policy if exists qr_redemption_logs_insert_own on public.qr_redemption_logs;
create policy qr_redemption_logs_insert_own on public.qr_redemption_logs
for insert to authenticated with check (auth.uid() = user_id);

commit;