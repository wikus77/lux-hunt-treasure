-- Align qr_redemption_logs schema + indices + policies (idempotent)

begin;

-- Rinomina qr_code -> qr_code_id se esiste, oppure crea la colonna se manca
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

  -- colonne utili ma non bloccanti (idempotenti)
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

-- Unicità redeem principale
create unique index if not exists uq_qr_redemptions_user_code on public.qr_redemptions(user_id, code);

-- Indici utili sui log
create index if not exists idx_qr_redemption_logs_user on public.qr_redemption_logs(user_id);
create index if not exists idx_qr_redemption_logs_code on public.qr_redemption_logs(qr_code_id);

-- RLS (lettura solo propri log)
drop policy if exists qr_redemption_logs_select_own on public.qr_redemption_logs;
create policy qr_redemption_logs_select_own
on public.qr_redemption_logs
for select
to authenticated
using (auth.uid() = user_id);

-- RLS per qr_codes (già presenti, idempotenti)
drop policy if exists qr_codes_select_auth on public.qr_codes;
create policy qr_codes_select_auth
on public.qr_codes for select
to authenticated using (true);

drop policy if exists qr_codes_insert_auth on public.qr_codes;
create policy qr_codes_insert_auth
on public.qr_codes for insert
to authenticated with check (true);

commit;