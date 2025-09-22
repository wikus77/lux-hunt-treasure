-- Add missing grants to public views for geofence-engine access
grant select on public.geo_push_settings_v to anon, authenticated, service_role;
grant select on public.geo_push_positions_v to anon, authenticated, service_role;
grant select on public.geo_push_delivery_state_v to anon, authenticated, service_role;