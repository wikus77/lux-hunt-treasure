begin;

-- Lettura/creazione QR dal pannello/app
drop policy if exists qr_codes_select_auth on public.qr_codes;
create policy qr_codes_select_auth
on public.qr_codes for select
to authenticated using (true);

drop policy if exists qr_codes_insert_auth on public.qr_codes;
create policy qr_codes_insert_auth
on public.qr_codes for insert
to authenticated with check (true);

-- Redemption: blocco doppioni via indice univoco
create unique index if not exists uq_qr_redemptions_user_code on public.qr_redemptions(user_id, code);

-- Log: ogni utente legge solo i propri
drop policy if exists qr_redemption_logs_select_own on public.qr_redemption_logs;
create policy qr_redemption_logs_select_own
on public.qr_redemption_logs for select
to authenticated using (auth.uid() = user_id);

commit;