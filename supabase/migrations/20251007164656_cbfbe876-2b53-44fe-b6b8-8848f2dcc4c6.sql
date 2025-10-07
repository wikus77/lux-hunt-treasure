-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- Performance indices for push notification system
-- Safe to run - idempotent with IF NOT EXISTS

-- Index for fast lookup of active subscriptions by user
CREATE INDEX IF NOT EXISTS idx_webpush_user_active 
ON public.webpush_subscriptions(user_id, is_active)
WHERE is_active = true;

-- Partial index for counting active subscriptions (health checks)
CREATE INDEX IF NOT EXISTS idx_active_subs 
ON public.webpush_subscriptions(is_active) 
WHERE is_active = true;

-- Index for endpoint uniqueness checks (prevents duplicates)
CREATE INDEX IF NOT EXISTS idx_webpush_endpoint 
ON public.webpush_subscriptions(endpoint);

-- Index for fast last_sent queries in auto_push_log (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'auto_push_log'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_auto_push_sent_at 
    ON public.auto_push_log(sent_at DESC);
  END IF;
END $$;

-- Vacuum analyze for immediate effect
ANALYZE public.webpush_subscriptions;