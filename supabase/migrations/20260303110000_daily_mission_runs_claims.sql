-- © 2025 Joseph MULÉ – M1SSION™ – Daily Missions Server-Real
-- Tables: daily_mission_runs, daily_mission_claims
-- FK to auth.users ON DELETE CASCADE so delete-account-v2 is not blocked

-- ═══════════════════════════════════════════════════════════════
-- 1) daily_mission_runs
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_mission_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  phase INT NOT NULL DEFAULT 0,
  phase1_started_at TIMESTAMPTZ,
  phase1_completed_at TIMESTAMPTZ,
  phase2_started_at TIMESTAMPTZ,
  phase2_completed_at TIMESTAMPTZ,
  progress_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day_key, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_mission_runs_user_day ON public.daily_mission_runs(user_id, day_key);
CREATE INDEX IF NOT EXISTS idx_daily_mission_runs_user_mission ON public.daily_mission_runs(user_id, mission_id);

ALTER TABLE public.daily_mission_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own runs" ON public.daily_mission_runs;
CREATE POLICY "Users can read own runs"
  ON public.daily_mission_runs FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/update only via Edge (service_role)
DROP POLICY IF EXISTS "Users cannot insert runs" ON public.daily_mission_runs;
CREATE POLICY "Users cannot insert runs"
  ON public.daily_mission_runs FOR INSERT
  WITH CHECK (false);

-- Updates only via service_role (Edge Function)
DROP POLICY IF EXISTS "Users cannot update runs directly" ON public.daily_mission_runs;
CREATE POLICY "Users cannot update runs directly"
  ON public.daily_mission_runs FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Users cannot delete runs" ON public.daily_mission_runs;
CREATE POLICY "Users cannot delete runs"
  ON public.daily_mission_runs FOR DELETE
  USING (false);

-- ═══════════════════════════════════════════════════════════════
-- 2) daily_mission_claims
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_mission_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  phase INT NOT NULL CHECK (phase IN (1, 2)),
  amount_m1u INT NOT NULL,
  idempotency_key TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_daily_mission_claims_user ON public.daily_mission_claims(user_id, day_key, mission_id);

ALTER TABLE public.daily_mission_claims ENABLE ROW LEVEL SECURITY;

-- Owner can read own claims
DROP POLICY IF EXISTS "Users can read own claims" ON public.daily_mission_claims;
CREATE POLICY "Users can read own claims"
  ON public.daily_mission_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Insert only via Edge (service_role)
DROP POLICY IF EXISTS "No insert by user" ON public.daily_mission_claims;
CREATE POLICY "No insert by user"
  ON public.daily_mission_claims FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "No update delete claims" ON public.daily_mission_claims;
CREATE POLICY "No update delete claims"
  ON public.daily_mission_claims FOR ALL
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.daily_mission_runs IS 'Daily mission runs (server-real). One row per user per day per mission.';
COMMENT ON TABLE public.daily_mission_claims IS 'Daily mission M1U claims (idempotent). Insert only via Edge claim-daily-phase.';
