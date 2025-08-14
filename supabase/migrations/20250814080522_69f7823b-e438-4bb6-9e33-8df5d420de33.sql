-- ========== EMERGENCY FIX: QR MAP + REDEEM ==========
begin;

-- 0) TABELLA app_config (per soglia marker)
create table if not exists public.app_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now()
);

-- RLS per app_config
alter table public.app_config enable row level security;
drop policy if exists app_config_select_all on public.app_config;
drop policy if exists app_config_update_admin on public.app_config;

-- lettura per tutti (mappa deve leggerla anche da pubblico)
create policy app_config_select_all on public.app_config
  for select to anon, authenticated
  using (true);

-- update solo admin
create policy app_config_update_admin on public.app_config
  for update to authenticated
  using (is_admin_secure())
  with check (is_admin_secure());

-- Valore di default per la soglia dei marker a 17
insert into public.app_config (key, value)
values ('marker_min_zoom', jsonb_build_object('minZoom', 17))
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

-- 1) NORMALIZZA LOGS REDEEM (niente qr_code_id)
alter table public.qr_redemption_logs
  add column if not exists qr_code text;

alter table public.qr_redemption_logs
  drop column if exists qr_code_id;

-- assicura che non esistano trigger/func vecchi
drop trigger if exists trg_sync_qr_log_cols on public.qr_redemption_logs;
drop function if exists public.sync_qr_log_cols();

-- 2) RLS e visibilità QR/Markers
-- lettura QR a tutti (pubblica mappa)
drop policy if exists qr_codes_select_auth on public.qr_codes;
drop policy if exists qr_codes_select_anon on public.qr_codes;

create policy qr_codes_select_auth on public.qr_codes
  for select to authenticated using (true);

create policy qr_codes_select_anon on public.qr_codes
  for select to anon using (true);

-- RLS su redemptions: solo proprie
drop policy if exists qr_redemptions_select_own on public.qr_redemptions;
drop policy if exists qr_redemptions_insert_own on public.qr_redemptions;

create policy qr_redemptions_select_own on public.qr_redemptions
  for select to authenticated using (auth.uid() = user_id);

create policy qr_redemptions_insert_own on public.qr_redemptions
  for insert to authenticated with check (auth.uid() = user_id);

-- 3) VIEWS markers compatibili: qr_codes_markers e alias buzz_map_markers
drop view if exists public.qr_codes_markers cascade;
drop view if exists public.buzz_map_markers cascade;

-- Adattamento ai campi comuni: title/name, lat/lng numerici
create view public.qr_codes_markers as
select
  code,
  (case
     when title is not null then title
     else coalesce(position_name, name, code)
   end) as title,
  (lat)::numeric as latitude,
  (lng)::numeric as longitude
from public.qr_codes
where lat is not null and lng is not null;

create view public.buzz_map_markers as
select * from public.qr_codes_markers;

grant select on public.qr_codes_markers to anon, authenticated;
grant select on public.buzz_map_markers to anon, authenticated;

commit;