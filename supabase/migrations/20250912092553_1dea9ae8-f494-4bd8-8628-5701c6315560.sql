-- Fix geo_push.settings to work with existing structure
-- First, insert the geofence settings into the existing JSONB value column
INSERT INTO geo_push.settings (key, value) VALUES
  ('radius_meters', '1000'::jsonb),
  ('hysteresis_meters', '150'::jsonb),
  ('cooldown_hours', '12'::jsonb),
  ('daily_cap_per_user', '3'::jsonb),
  ('quiet_hours_start', '"22:00"'::jsonb),
  ('quiet_hours_end', '"08:00"'::jsonb),
  ('timezone', '"Europe/Rome"'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();