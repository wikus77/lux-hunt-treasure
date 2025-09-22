-- CREATE MIRROR PUSH SCHEMA (Zero-Risk Diagnostics)
-- This schema is completely separate from production push flow

-- Create dedicated schema for mirror diagnostics
CREATE SCHEMA IF NOT EXISTS mirror_push;

-- Main unified subscriptions table
CREATE TABLE mirror_push.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('apple', 'fcm', 'unknown')),
  platform TEXT DEFAULT 'unknown',
  keys_p256dh TEXT,
  keys_auth TEXT,
  device_info JSONB DEFAULT '{}',
  source_table TEXT NOT NULL, -- webpush_subscriptions, fcm_subscriptions, etc
  source_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(source_table, source_id)
);

-- Notification logs for mirror system
CREATE TABLE mirror_push.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  provider TEXT NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  test_mode BOOLEAN DEFAULT true
);

-- Sync watermarks to track backfill progress
CREATE TABLE mirror_push.sync_watermarks (
  source_table TEXT PRIMARY KEY,
  last_synced_id UUID,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  records_processed INTEGER DEFAULT 0
);

-- Indices for performance
CREATE INDEX idx_mirror_subscriptions_user_id ON mirror_push.subscriptions(user_id);
CREATE INDEX idx_mirror_subscriptions_provider ON mirror_push.subscriptions(provider);
CREATE INDEX idx_mirror_subscriptions_active ON mirror_push.subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_mirror_subscriptions_source ON mirror_push.subscriptions(source_table, source_id);

-- Latest subscription per user per provider (window function view)
CREATE VIEW mirror_push.v_latest_unified AS
WITH latest_by_provider AS (
  SELECT 
    user_id,
    provider,
    endpoint,
    platform,
    keys_p256dh,
    keys_auth,
    source_table,
    is_active,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id, provider ORDER BY created_at DESC) as rn
  FROM mirror_push.subscriptions
  WHERE is_active = true
)
SELECT 
  user_id,
  provider,
  endpoint,
  platform,
  keys_p256dh,
  keys_auth,
  source_table,
  is_active,
  created_at
FROM latest_by_provider 
WHERE rn = 1;

-- Mismatch detection view
CREATE VIEW mirror_push.v_mismatch_report AS
WITH current_system AS (
  SELECT 
    user_id,
    endpoint,
    CASE 
      WHEN endpoint LIKE '%web.push.apple.com%' OR endpoint LIKE '%api.push.apple.com%' THEN 'apple'
      WHEN endpoint LIKE '%fcm.googleapis.com%' THEN 'fcm'
      ELSE 'unknown'
    END as provider,
    'current' as source
  FROM v_latest_webpush_subscription
),
mirror_system AS (
  SELECT 
    user_id,
    endpoint,
    provider,
    'mirror' as source
  FROM mirror_push.v_latest_unified
  WHERE provider = 'apple' OR provider = 'fcm'
)
SELECT 
  COALESCE(c.user_id, m.user_id) as user_id,
  c.endpoint as current_endpoint,
  c.provider as current_provider,
  m.endpoint as mirror_endpoint,
  m.provider as mirror_provider,
  CASE 
    WHEN c.endpoint IS NULL THEN 'missing_in_current'
    WHEN m.endpoint IS NULL THEN 'missing_in_mirror'
    WHEN c.endpoint = m.endpoint THEN 'match'
    WHEN c.provider != m.provider THEN 'provider_mismatch'
    ELSE 'endpoint_mismatch'
  END as mismatch_type
FROM current_system c
FULL OUTER JOIN mirror_system m ON c.user_id = m.user_id;

-- RLS Policies for mirror schema (admin only)
ALTER TABLE mirror_push.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_push.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_push.sync_watermarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access mirror subscriptions" ON mirror_push.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin access mirror logs" ON mirror_push.notification_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin access sync watermarks" ON mirror_push.sync_watermarks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to detect provider from endpoint
CREATE OR REPLACE FUNCTION mirror_push.detect_provider(endpoint TEXT)
RETURNS TEXT AS $$
BEGIN
  IF endpoint LIKE '%web.push.apple.com%' OR endpoint LIKE '%api.push.apple.com%' THEN
    RETURN 'apple';
  ELSIF endpoint LIKE '%fcm.googleapis.com%' THEN
    RETURN 'fcm';
  ELSE
    RETURN 'unknown';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill function (INSERT only, no modifications to original)
CREATE OR REPLACE FUNCTION mirror_push.backfill_subscriptions()
RETURNS JSONB AS $$
DECLARE
  processed_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Backfill from webpush_subscriptions
  INSERT INTO mirror_push.subscriptions (
    user_id, endpoint, provider, platform, keys_p256dh, keys_auth,
    source_table, source_id, is_active, created_at
  )
  SELECT 
    user_id,
    endpoint,
    mirror_push.detect_provider(endpoint),
    COALESCE(platform, 'unknown'),
    p256dh,
    auth,
    'webpush_subscriptions',
    id,
    is_active,
    created_at
  FROM webpush_subscriptions
  ON CONFLICT (source_table, source_id) DO UPDATE SET
    last_synced_at = now();
  
  GET DIAGNOSTICS processed_count = ROW_COUNT;
  
  -- Backfill from fcm_subscriptions  
  INSERT INTO mirror_push.subscriptions (
    user_id, endpoint, provider, platform, device_info,
    source_table, source_id, is_active, created_at
  )
  SELECT 
    user_id,
    token as endpoint,
    mirror_push.detect_provider(token),
    COALESCE(platform, 'unknown'),
    device_info,
    'fcm_subscriptions',
    id,
    is_active,
    created_at
  FROM fcm_subscriptions
  ON CONFLICT (source_table, source_id) DO UPDATE SET
    last_synced_at = now();
  
  -- Update sync watermarks
  INSERT INTO mirror_push.sync_watermarks (source_table, records_processed)
  VALUES ('webpush_subscriptions', processed_count)
  ON CONFLICT (source_table) DO UPDATE SET
    records_processed = sync_watermarks.records_processed + EXCLUDED.records_processed,
    last_synced_at = now();
  
  result := jsonb_build_object(
    'success', true,
    'processed_count', processed_count,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;