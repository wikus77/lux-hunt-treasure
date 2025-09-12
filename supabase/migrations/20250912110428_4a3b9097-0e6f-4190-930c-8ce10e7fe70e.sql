-- Ensure all public views exist for geofence-engine read access (idempotent)
create or replace view public.geo_push_settings_v as
  select * from geo_push.settings;

create or replace view public.geo_push_positions_v as
  select user_id, lat, lng, updated_at
  from public.geo_radar_coordinates;

create or replace view public.geo_push_delivery_state_v as
  select * from geo_push.delivery_state;

-- Ensure SELECT grants on all views (idempotent)
grant select on public.geo_push_settings_v to anon, authenticated, service_role;
grant select on public.geo_push_positions_v to anon, authenticated, service_role;
grant select on public.geo_push_delivery_state_v to anon, authenticated, service_role;