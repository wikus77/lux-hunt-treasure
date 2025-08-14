-- PHASE 1: Enable SELECT and INSERT on qr_codes for authenticated users
begin;

-- SELECT on qr_codes for authenticated users (serves map/app)
drop policy if exists qr_codes_select_auth on public.qr_codes;
create policy qr_codes_select_auth
on public.qr_codes
for select
to authenticated
using ( true );

-- INSERT from app/panel: enables for authenticated users
drop policy if exists qr_codes_insert_auth on public.qr_codes;
create policy qr_codes_insert_auth
on public.qr_codes
for insert
to authenticated
with check ( true );

-- Indices/uniqueness (idempotent)
create unique index if not exists uq_qr_codes_code on public.qr_codes(code);
create unique index if not exists uq_qr_redemptions_user_code on public.qr_redemptions(user_id, code);

commit;