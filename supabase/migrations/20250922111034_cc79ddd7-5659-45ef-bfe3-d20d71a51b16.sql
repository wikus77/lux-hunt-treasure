-- Fix: Push observability and subscription cleanup
-- © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ

-- 1. Diagnostic view for endpoint analysis (using existing columns)
CREATE OR REPLACE VIEW public.v_webpush_diag AS
SELECT
  endpoint, user_id, endpoint_type,
  COALESCE(endpoint_type,
    CASE
      WHEN endpoint LIKE 'https://web.push.apple.com/%' THEN 'apns'
      WHEN endpoint LIKE 'https://fcm.googleapis.com/%' THEN 'fcm'
      WHEN endpoint LIKE 'https://updates.push.services.mozilla.com/%' THEN 'mozilla'
      ELSE 'unknown'
    END
  ) as detected_provider,
  SPLIT_PART(endpoint, '/', 3) as endpoint_host,
  created_at, platform
FROM push_subscriptions
ORDER BY created_at DESC;

-- 2. Performance index for user lookups  
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_created
  ON push_subscriptions (user_id, created_at DESC);

-- 3. Cleanup duplicate subscriptions (keep latest per user+host)
DELETE FROM push_subscriptions a
USING push_subscriptions b
WHERE a.user_id = b.user_id
  AND SPLIT_PART(a.endpoint, '/', 3) = SPLIT_PART(b.endpoint, '/', 3)
  AND a.created_at < b.created_at;

-- 4. Update endpoint_type for existing subscriptions
UPDATE push_subscriptions
SET endpoint_type = CASE
  WHEN endpoint LIKE 'https://web.push.apple.com/%' THEN 'apns'
  WHEN endpoint LIKE 'https://fcm.googleapis.com/%' THEN 'fcm'
  WHEN endpoint LIKE 'https://updates.push.services.mozilla.com/%' THEN 'mozilla'
  ELSE 'unknown'
END
WHERE endpoint_type IS NULL OR endpoint_type = '' OR endpoint_type = 'unknown';