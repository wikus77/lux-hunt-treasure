-- =====================================================
-- 🔒 PULSE BREAKER SECURITY FIX
-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- =====================================================

-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "service_insert" ON public.pulse_breaker_rounds;
DROP POLICY IF EXISTS "service_update" ON public.pulse_breaker_rounds;

-- 2. Create secure policies - ONLY service_role can insert/update
-- This prevents ANY client-side manipulation of game rounds

-- Service role can insert new rounds
CREATE POLICY "service_role_insert" ON public.pulse_breaker_rounds
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Service role can update rounds
CREATE POLICY "service_role_update" ON public.pulse_breaker_rounds
  FOR UPDATE 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Revoke direct access from authenticated users
REVOKE INSERT, UPDATE, DELETE ON public.pulse_breaker_rounds FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.pulse_breaker_rounds FROM anon;

-- 4. Grant only SELECT to authenticated (they can view their own rounds)
GRANT SELECT ON public.pulse_breaker_rounds TO authenticated;

-- 5. Update bet_amount constraint to 1-100 (not 1-1000)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'pulse_breaker_rounds_bet_amount_check'
    AND table_name = 'pulse_breaker_rounds'
  ) THEN
    ALTER TABLE public.pulse_breaker_rounds DROP CONSTRAINT pulse_breaker_rounds_bet_amount_check;
  END IF;
  
  ALTER TABLE public.pulse_breaker_rounds 
    ADD CONSTRAINT pulse_breaker_rounds_bet_amount_check 
    CHECK (bet_amount >= 1 AND bet_amount <= 100);
EXCEPTION WHEN OTHERS THEN
  -- Constraint might not exist or be named differently
  RAISE NOTICE 'Bet amount constraint update skipped: %', SQLERRM;
END $$;

-- 6. Add index for fraud detection (rapid rounds from same user)
CREATE INDEX IF NOT EXISTS idx_pulse_breaker_user_time 
  ON public.pulse_breaker_rounds(user_id, started_at DESC);

-- 7. Create function to detect rapid-fire gaming (anti-bot)
CREATE OR REPLACE FUNCTION public.check_pulse_breaker_rate(
  p_user_id UUID,
  p_max_rounds_per_minute INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.pulse_breaker_rounds
  WHERE user_id = p_user_id
    AND started_at > NOW() - INTERVAL '1 minute';
  
  RETURN recent_count < p_max_rounds_per_minute;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute to service role
GRANT EXECUTE ON FUNCTION public.check_pulse_breaker_rate(UUID, INTEGER) TO service_role;

-- 9. Audit log for suspicious activity
CREATE TABLE IF NOT EXISTS public.pulse_breaker_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'suspicious_rate', 'large_win', 'exploit_attempt'
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pulse_breaker_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service_role can write to audit log
CREATE POLICY "service_role_audit" ON public.pulse_breaker_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- No one else can read or write audit logs
REVOKE ALL ON public.pulse_breaker_audit_log FROM authenticated, anon;

-- 10. Create view for admin monitoring
CREATE OR REPLACE VIEW public.pulse_breaker_suspicious_activity AS
SELECT 
  r.user_id,
  p.username,
  COUNT(*) as total_rounds_last_hour,
  SUM(r.payout) as total_payout_last_hour,
  MAX(r.payout) as max_single_payout,
  AVG(r.cashout_multiplier) as avg_cashout_mult
FROM public.pulse_breaker_rounds r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.created_at > NOW() - INTERVAL '1 hour'
GROUP BY r.user_id, p.username
HAVING COUNT(*) > 20 OR SUM(r.payout) > 500
ORDER BY total_payout_last_hour DESC;

GRANT SELECT ON public.pulse_breaker_suspicious_activity TO service_role;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™






