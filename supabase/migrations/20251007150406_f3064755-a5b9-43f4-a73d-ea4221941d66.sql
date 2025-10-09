-- M1SSION™ Push System Optimization
-- © 2025 Joseph MULÉ – NIYVORA KFT™

-- 1️⃣ Create partial index for active subscriptions (performance boost)
CREATE INDEX IF NOT EXISTS idx_webpush_active_subs 
ON public.webpush_subscriptions(endpoint) 
WHERE is_active = true;

-- 2️⃣ Create composite index for user queries
CREATE INDEX IF NOT EXISTS idx_webpush_user_active 
ON public.webpush_subscriptions(user_id, is_active);

-- 3️⃣ Add policy for self-unsubscribe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webpush_subscriptions' 
    AND policyname = 'webpush_delete_own'
  ) THEN
    EXECUTE 'CREATE POLICY webpush_delete_own ON public.webpush_subscriptions 
             FOR DELETE TO authenticated 
             USING (user_id = auth.uid())';
  END IF;
END $$;

-- 4️⃣ Create stats view for push analytics
CREATE OR REPLACE VIEW push_stats_daily AS
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN delivery->>'success' = 'true' THEN 1 END) as successful,
  ROUND(
    100.0 * COUNT(CASE WHEN delivery->>'success' = 'true' THEN 1 END) / NULLIF(COUNT(*), 0),
    2
  ) as success_rate
FROM public.auto_push_log
GROUP BY DATE(sent_at)
ORDER BY DATE(sent_at) DESC;