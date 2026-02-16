-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- VERA MISSION: Creates vera_mission_runs + vera_mission_attempts if missing
-- Fix for "relation public.vera_mission_runs does not exist"
-- Idempotent: CREATE TABLE IF NOT EXISTS

-- ═══════════════════════════════════════════════════════════════
-- 1) vera_mission_runs
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vera_mission_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL DEFAULT 'bomb',
  day_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  attempts_used INT NOT NULL DEFAULT 0,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, mission_id, day_key)
);

CREATE INDEX IF NOT EXISTS idx_vera_mission_runs_user_day ON public.vera_mission_runs(user_id, day_key);
CREATE INDEX IF NOT EXISTS idx_vera_mission_runs_status ON public.vera_mission_runs(user_id, mission_id, status);

ALTER TABLE public.vera_mission_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own runs" ON public.vera_mission_runs;
CREATE POLICY "Users can read own runs"
  ON public.vera_mission_runs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own runs" ON public.vera_mission_runs;
CREATE POLICY "Users can insert own runs"
  ON public.vera_mission_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot update runs directly" ON public.vera_mission_runs;
CREATE POLICY "Users cannot update runs directly"
  ON public.vera_mission_runs FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Users cannot delete runs" ON public.vera_mission_runs;
CREATE POLICY "Users cannot delete runs"
  ON public.vera_mission_runs FOR DELETE
  USING (false);

-- ═══════════════════════════════════════════════════════════════
-- 2) vera_mission_attempts (audit trail)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vera_mission_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.vera_mission_runs(id) ON DELETE CASCADE,
  attempt_num INT NOT NULL,
  step_data JSONB DEFAULT '{}'::jsonb,
  elapsed_ms INT,
  outcome TEXT CHECK (outcome IN ('success', 'fail')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vera_mission_attempts_run ON public.vera_mission_attempts(run_id);

ALTER TABLE public.vera_mission_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own attempts via run" ON public.vera_mission_attempts;
CREATE POLICY "Users can read own attempts via run"
  ON public.vera_mission_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vera_mission_runs r
      WHERE r.id = run_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "No insert/update/delete by user" ON public.vera_mission_attempts;
CREATE POLICY "No insert/update/delete by user"
  ON public.vera_mission_attempts FOR ALL
  USING (false)
  WITH CHECK (false);
