-- PUNTO 1: Create geo_push schema and position view (READ-ONLY)
-- Since no recent positions found in any table, creating empty view structure

-- Create geo_push schema if not exists
CREATE SCHEMA IF NOT EXISTS geo_push;

-- Create read-only view for positions (currently empty as no source has recent data)
CREATE OR REPLACE VIEW geo_push.v_positions AS
SELECT 
  user_id::uuid AS user_id,
  lat::float8 AS lat,
  lng::float8 AS lng,
  updated_at::timestamptz AS updated_at
FROM public.geo_radar_coordinates
WHERE updated_at IS NOT NULL
  AND lat IS NOT NULL 
  AND lng IS NOT NULL;

-- Create empty diagnostic view to flag the issue
CREATE OR REPLACE VIEW geo_push.v_positions_empty AS
SELECT 
  NULL::uuid AS user_id,
  NULL::float8 AS lat,
  NULL::float8 AS lng,
  NULL::timestamptz AS updated_at
WHERE false; -- Always empty to signal no recent data

-- Create delivery_state table for tracking user/marker cooldowns
CREATE TABLE IF NOT EXISTS geo_push.delivery_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  marker_id uuid NOT NULL,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, marker_id)
);

-- Create delivery_log table for tracking all delivery attempts
CREATE TABLE IF NOT EXISTS geo_push.delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  marker_id uuid,
  action text NOT NULL, -- 'sent', 'blocked_radius', 'blocked_cooldown', 'blocked_quiet', 'blocked_cap'
  reason text,
  distance_meters double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create watermarks table for tracking engine runs
CREATE TABLE IF NOT EXISTS geo_push.watermarks (
  name text PRIMARY KEY,
  last_run_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert initial watermark
INSERT INTO geo_push.watermarks (name, last_run_at) 
VALUES ('geofence_engine', now()) 
ON CONFLICT (name) DO NOTHING;

-- Create settings table for geofence configuration
CREATE TABLE IF NOT EXISTS geo_push.settings (
  key text PRIMARY KEY,
  value_text text,
  value_numeric double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default geofence settings
INSERT INTO geo_push.settings (key, value_numeric) VALUES
  ('radius_meters', 1000),
  ('hysteresis_meters', 150),
  ('cooldown_hours', 12),
  ('daily_cap_per_user', 3)
ON CONFLICT (key) DO NOTHING;

INSERT INTO geo_push.settings (key, value_text) VALUES
  ('quiet_hours_start', '22:00'),
  ('quiet_hours_end', '08:00'),
  ('timezone', 'Europe/Rome')
ON CONFLICT (key) DO NOTHING;