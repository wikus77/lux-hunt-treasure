-- Crea un QR marker vicino all'utente per il test (43.829233, 7.585201)
INSERT INTO public.qr_buzz_codes (
  code, location_name, lat, lng, reward_type, reward_content, 
  is_used, created_by, created_at
) VALUES (
  'HOME-QR-TEST', 
  'Casa Test Marker', 
  43.829233, 
  7.585201, 
  'buzz', 
  '{"message": "Test QR marker for geofence"}',
  false,
  'SYSTEM',
  now()
) ON CONFLICT DO NOTHING;

-- Vista che unisce i marker classici e i QR/Buzz marker
create or replace view public.geo_push_markers_v as
  -- marker "classici"
  select m.id, m.title, m.lat, m.lng
  from public.markers m
  where coalesce(m.active, true) = true

  union all
  -- QR/Buzz marker (adatta i nomi colonna se diversi)
  select q.id,
         coalesce(q.location_name, 'QR Marker') as title,
         q.lat, q.lng
  from public.qr_buzz_codes q
  where coalesce(q.is_used, false) = false
     and q.expires_at is null or q.expires_at > now();

grant select on public.geo_push_markers_v to anon, authenticated, service_role;