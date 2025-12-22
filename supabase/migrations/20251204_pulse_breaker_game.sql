-- =====================================================
-- PULSE BREAKER MINI-GAME
-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- =====================================================

-- 1. Rounds table
CREATE TABLE IF NOT EXISTS public.pulse_breaker_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_amount NUMERIC(10,2) NOT NULL CHECK (bet_amount >= 1 AND bet_amount <= 1000),
  bet_currency TEXT NOT NULL CHECK (bet_currency IN ('PE', 'M1U')),
  server_seed TEXT NOT NULL,
  seed_hash TEXT NOT NULL,
  crash_point NUMERIC(6,2) NOT NULL CHECK (crash_point >= 1.00),
  cashout_multiplier NUMERIC(6,2),
  payout NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'cashed_out', 'crashed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_pulse_breaker_user ON public.pulse_breaker_rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_breaker_status ON public.pulse_breaker_rounds(status);
CREATE INDEX IF NOT EXISTS idx_pulse_breaker_created ON public.pulse_breaker_rounds(created_at DESC);

-- 3. User stats view
CREATE OR REPLACE VIEW public.pulse_breaker_user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_rounds,
  COUNT(*) FILTER (WHERE status = 'cashed_out') as wins,
  COUNT(*) FILTER (WHERE status = 'crashed') as losses,
  SUM(bet_amount) as total_bet,
  SUM(payout) as total_payout,
  SUM(payout) - SUM(bet_amount) as net_profit,
  MAX(cashout_multiplier) as best_multiplier,
  MAX(crash_point) as highest_crash_seen
FROM public.pulse_breaker_rounds
WHERE status != 'running'
GROUP BY user_id;

-- 4. RLS
ALTER TABLE public.pulse_breaker_rounds ENABLE ROW LEVEL SECURITY;

-- Users can see their own rounds
CREATE POLICY "users_own_rounds" ON public.pulse_breaker_rounds
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update (via Edge Function)
CREATE POLICY "service_insert" ON public.pulse_breaker_rounds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update" ON public.pulse_breaker_rounds
  FOR UPDATE USING (true);

-- 5. Grants
GRANT SELECT ON public.pulse_breaker_rounds TO authenticated;
GRANT SELECT ON public.pulse_breaker_user_stats TO authenticated;
GRANT INSERT, UPDATE ON public.pulse_breaker_rounds TO service_role;

-- 6. Add pulse_energy column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'pulse_energy'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN pulse_energy NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™






