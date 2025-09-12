-- Fix the geo_push.settings table structure
CREATE TABLE IF NOT EXISTS geo_push.settings (
  key text PRIMARY KEY,
  value_text text,
  value_numeric double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default geofence settings with correct column name
INSERT INTO geo_push.settings (key, value_numeric) VALUES
  ('radius_meters', 1000),
  ('hysteresis_meters', 150),
  ('cooldown_hours', 12),
  ('daily_cap_per_user', 3)
ON CONFLICT (key) DO UPDATE SET value_numeric = EXCLUDED.value_numeric;

INSERT INTO geo_push.settings (key, value_text) VALUES
  ('quiet_hours_start', '22:00'),
  ('quiet_hours_end', '08:00'),
  ('timezone', 'Europe/Rome')
ON CONFLICT (key) DO UPDATE SET value_text = EXCLUDED.value_text;