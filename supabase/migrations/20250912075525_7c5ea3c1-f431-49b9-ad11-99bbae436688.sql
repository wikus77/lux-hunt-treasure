-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Geofenced Push Notifications - Isolated Schema Creation

-- 1. Schema and extensions (idempotent)
CREATE SCHEMA IF NOT EXISTS geo_push;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Config & rules (ours only)
CREATE TABLE IF NOT EXISTS geo_push.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default config (idempotent)
INSERT INTO geo_push.settings(key, value)
VALUES 
  ('engine', jsonb_build_object(
     'enabled', true,
     'default_radius_m', 1000,  -- 1 km
     'hysteresis_m', 150,       -- avoid enter/exit bouncing
     'cooldown_hours', 12,      -- per marker/user
     'quiet_hours', jsonb_build_object('start','22:00','end','08:00','timezone','Europe/Rome'),
     'daily_cap', 3,            -- max push/day/user
     'title_template', 'Sei vicino a {{marker_name}}',
     'body_template',  'Apri M1SSION™ per scoprire di più',
     'click_url', '/map'        -- conservative deep-link
  ))
ON CONFLICT (key) DO NOTHING;

-- 3. State/telemetry (ours only)
CREATE TABLE IF NOT EXISTS geo_push.delivery_state (
  user_id uuid NOT NULL,
  marker_id uuid NOT NULL,
  last_enter_at timestamptz,
  last_sent_at timestamptz,
  enter_count int NOT NULL DEFAULT 0,
  sent_count int  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, marker_id)
);

CREATE TABLE IF NOT EXISTS geo_push.delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  marker_id uuid NOT NULL,
  distance_m numeric NOT NULL,
  reason text NOT NULL,        -- 'ENTER', 'HYSTERESIS_SKIP', 'COOLDOWN', 'QUIET_HOURS', 'DAILY_CAP', 'SENT'
  title text,
  body text,
  payload jsonb,
  sent boolean NOT NULL DEFAULT false,
  provider text,               -- filled later if available
  response jsonb               -- echo from webpush-admin-broadcast (if capturable)
);

-- 4. Watermark for scheduler engine (ours only)
CREATE TABLE IF NOT EXISTS geo_push.watermarks (
  name text PRIMARY KEY,
  last_run_at timestamptz NOT NULL DEFAULT '1970-01-01 00:00:00+00'
);

INSERT INTO geo_push.watermarks(name) VALUES ('geofence_engine')
ON CONFLICT (name) DO NOTHING;

-- 5. Diagnostic views (read-only)
-- Recent view (48h) for quick audit
CREATE OR REPLACE VIEW geo_push.v_recent_log AS
SELECT *
FROM geo_push.delivery_log
WHERE created_at >= now() - interval '48 hours'
ORDER BY created_at DESC;

-- 6. RLS (admin only using existing is_admin_secure function)
ALTER TABLE geo_push.delivery_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_push.delivery_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_push.settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_push.watermarks    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS geo_push_admin_only_state ON geo_push.delivery_state;
CREATE POLICY geo_push_admin_only_state ON geo_push.delivery_state
  FOR ALL TO authenticated USING (is_admin_secure());

DROP POLICY IF EXISTS geo_push_admin_only_log ON geo_push.delivery_log;
CREATE POLICY geo_push_admin_only_log ON geo_push.delivery_log
  FOR ALL TO authenticated USING (is_admin_secure());

DROP POLICY IF EXISTS geo_push_admin_only_settings ON geo_push.settings;
CREATE POLICY geo_push_admin_only_settings ON geo_push.settings
  FOR ALL TO authenticated USING (is_admin_secure());

DROP POLICY IF EXISTS geo_push_admin_only_watermarks ON geo_push.watermarks;
CREATE POLICY geo_push_admin_only_watermarks ON geo_push.watermarks
  FOR ALL TO authenticated USING (is_admin_secure());