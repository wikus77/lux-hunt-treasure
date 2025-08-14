begin;

-- 1) Config globale: tabella key/value con RLS sicure
create table if not exists public.app_config (
  key text primary key,
  value_int integer,
  value_text text,
  updated_at timestamptz default now()
);

alter table public.app_config enable row level security;

-- Lettura aperta a tutti (serve al client per leggere la soglia)
drop policy if exists app_config_select_all on public.app_config;
create policy app_config_select_all
  on public.app_config for select
  to anon, authenticated
  using (true);

-- Upsert/Update solo admin
drop policy if exists app_config_insert_admin on public.app_config;
create policy app_config_insert_admin
  on public.app_config for insert
  to authenticated
  with check (is_admin_secure());

drop policy if exists app_config_update_admin on public.app_config;
create policy app_config_update_admin
  on public.app_config for update
  to authenticated
  using (is_admin_secure())
  with check (is_admin_secure());

drop policy if exists app_config_delete_admin on public.app_config;
create policy app_config_delete_admin
  on public.app_config for delete
  to authenticated
  using (is_admin_secure());

-- Valore di default: marker mostrati da zoom 17
insert into public.app_config(key, value_int, value_text)
values ('marker_min_zoom', 17, null)
on conflict (key) do update set value_int = excluded.value_int, updated_at = now();

-- 2) (idempotente) Vista marker per la mappa + grant
drop view if exists public.qr_codes_markers cascade;
drop view if exists public.buzz_map_markers cascade;

create view public.qr_codes_markers as
select
  code,
  coalesce(title, code) as title,
  lat::numeric as latitude,
  lng::numeric as longitude
from public.qr_codes
where lat is not null and lng is not null and coalesce(is_hidden, false) = false;

create view public.buzz_map_markers as
select * from public.qr_codes_markers;

grant select on public.qr_codes_markers to anon, authenticated;
grant select on public.buzz_map_markers to anon, authenticated;

commit;