-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Rate Limiting System for Edge Functions

-- 1. Create rate limit log table
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
  ON public.rate_limit_log (user_id, action, created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- 4. Only service role can access (Edge Functions)
CREATE POLICY "Service role only access" ON public.rate_limit_log
  FOR ALL USING (auth.role() = 'service_role');

-- 5. Auto-cleanup old entries (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_log()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limit_log
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 6. Schedule cleanup (runs every hour via pg_cron if available)
-- Note: This requires pg_cron extension to be enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if any
    PERFORM cron.unschedule('cleanup-rate-limit-log');
    -- Schedule new job
    PERFORM cron.schedule(
      'cleanup-rate-limit-log',
      '0 * * * *', -- Every hour
      'SELECT public.cleanup_rate_limit_log()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available, skipping rate limit cleanup schedule';
END $$;

-- 7. Comment on table
COMMENT ON TABLE public.rate_limit_log IS 'Rate limiting log for Edge Functions - M1SSION™ Security';

