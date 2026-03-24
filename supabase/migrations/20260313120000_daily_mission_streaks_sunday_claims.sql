-- © 2025 Joseph MULÉ – M1SSION™ – Phase 3 Retention Layer
-- Tables: daily_mission_streaks (streak missioni), daily_sunday_reward_claims (Sunday Super Reward)
-- FK to auth.users ON DELETE CASCADE for delete-account compatibility

-- ═══════════════════════════════════════════════════════════════
-- 1) daily_mission_streaks — one row per user, updated by Edge on complete_phase2
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_mission_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_completed_day_key TEXT,
  current_streak INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.daily_mission_streaks IS 'Phase 3: Daily mission streak. Updated by claim-daily-phase on successful complete_phase2.';

ALTER TABLE public.daily_mission_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own streak" ON public.daily_mission_streaks;
CREATE POLICY "Users can read own streak"
  ON public.daily_mission_streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/update only via Edge (service_role)
DROP POLICY IF EXISTS "No insert update by user on streaks" ON public.daily_mission_streaks;
CREATE POLICY "No insert update by user on streaks"
  ON public.daily_mission_streaks FOR INSERT
  WITH CHECK (false);
DROP POLICY IF EXISTS "No update by user on streaks" ON public.daily_mission_streaks;
CREATE POLICY "No update by user on streaks"
  ON public.daily_mission_streaks FOR UPDATE
  USING (false);

-- ═══════════════════════════════════════════════════════════════
-- 2) daily_sunday_reward_claims — one row per user per Sunday when consumed
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_sunday_reward_claims (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day_key)
);

CREATE INDEX IF NOT EXISTS idx_daily_sunday_reward_claims_user ON public.daily_sunday_reward_claims(user_id);

COMMENT ON TABLE public.daily_sunday_reward_claims IS 'Phase 3: Sunday Super Reward consumption. One row per user per Sunday when modal was opened/consumed.';

ALTER TABLE public.daily_sunday_reward_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own sunday claims" ON public.daily_sunday_reward_claims;
CREATE POLICY "Users can read own sunday claims"
  ON public.daily_sunday_reward_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Insert only via Edge (consume-sunday-reward)
DROP POLICY IF EXISTS "No insert by user on sunday claims" ON public.daily_sunday_reward_claims;
CREATE POLICY "No insert by user on sunday claims"
  ON public.daily_sunday_reward_claims FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "No update delete sunday claims" ON public.daily_sunday_reward_claims;
CREATE POLICY "No update delete sunday claims"
  ON public.daily_sunday_reward_claims FOR ALL
  USING (false)
  WITH CHECK (false);
