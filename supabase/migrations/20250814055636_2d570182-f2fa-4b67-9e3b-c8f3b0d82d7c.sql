-- Robust QR redeem: schema & policies (idempotente)
begin;

-- 1) Log: uniforma colonna del codice
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='qr_redemption_logs' and column_name='qr_code'
  ) then
    alter table public.qr_redemption_logs rename column qr_code to qr_code_id;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='qr_redemption_logs' and column_name='qr_code_id'
  ) then
    alter table public.qr_redemption_logs add column qr_code_id text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='qr_redemption_logs' and column_name='status'
  ) then
    alter table public.qr_redemption_logs add column status text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='qr_redemption_logs' and column_name='details'
  ) then
    alter table public.qr_redemption_logs add column details jsonb;
  end if;
end$$;

-- 2) qr_redemptions: default e NOT NULL per reward_type/ reward_value
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='qr_redemptions' and column_name='reward_value'
  ) then
    alter table public.qr_redemptions add column reward_value integer;
  end if;
end$$;

alter table public.qr_redemptions alter column reward_type set default 'buzz_credit';
update public.qr_redemptions set reward_type = 'buzz_credit' where reward_type is null;

alter table public.qr_redemptions alter column reward_value set default 1;
update public.qr_redemptions set reward_value = 1 where reward_value is null;

alter table public.qr_redemptions alter column reward_type set not null;
alter table public.qr_redemptions alter column reward_value set not null;

-- check constraint (una sola volta)
do $$
begin
  if not exists (select 1 from pg_constraint where conname='qr_redemptions_reward_type_check') then
    alter table public.qr_redemptions
      add constraint qr_redemptions_reward_type_check
      check (reward_type in ('buzz_credit','clue','enigma','fake','sorpresa_speciale'));
  end if;
end$$;

-- 3) qr_codes: default prudente su reward_type (senza forzare NOT NULL se già serve null)
alter table public.qr_codes alter column reward_type set default 'buzz_credit';
update public.qr_codes set reward_type = 'buzz_credit' where reward_type is null;

-- 4) Indice anti-doppione (utente+codice)
create unique index if not exists uq_qr_redemptions_user_code on public.qr_redemptions(user_id, code);

-- 5) RLS & policy (letture/insert)
drop policy if exists qr_redemption_logs_select_own on public.qr_redemption_logs;
create policy qr_redemption_logs_select_own
on public.qr_redemption_logs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists qr_codes_select_auth on public.qr_codes;
create policy qr_codes_select_auth
on public.qr_codes for select
to authenticated using (true);

drop policy if exists qr_codes_insert_auth on public.qr_codes;
create policy qr_codes_insert_auth
on public.qr_codes for insert
to authenticated with check (true);

commit;