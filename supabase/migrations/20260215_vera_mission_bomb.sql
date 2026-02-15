-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- VERA MISSION: BOMBA/DISINNESCO - Tables + RPC (anti-cheat server-side)
-- Phase 1 MVP - Minimal schema for bomb mission only

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

-- RLS
ALTER TABLE public.vera_mission_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own runs"
  ON public.vera_mission_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runs"
  ON public.vera_mission_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update runs directly"
  ON public.vera_mission_runs FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete runs"
  ON public.vera_mission_runs FOR DELETE
  USING (false);

-- ═══════════════════════════════════════════════════════════════
-- 2) vera_mission_attempts (audit trail, optional but recommended)
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

CREATE POLICY "Users can read own attempts via run"
  ON public.vera_mission_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vera_mission_runs r
      WHERE r.id = run_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "No insert/update/delete by user"
  ON public.vera_mission_attempts FOR ALL
  USING (false)
  WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════════
-- 3) RPC: start_vera_mission_run
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.start_vera_mission_run(p_mission_id TEXT DEFAULT 'bomb')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_day_key TEXT;
  v_run RECORD;
  v_expires_at TIMESTAMPTZ;
  v_attempts_max INT := 2;
  v_attempts_left INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  v_day_key := TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_expires_at := (v_day_key::DATE + INTERVAL '1 day') AT TIME ZONE 'UTC';

  SELECT * INTO v_run
  FROM public.vera_mission_runs
  WHERE user_id = v_user_id AND mission_id = p_mission_id AND day_key = v_day_key;

  IF FOUND THEN
    v_attempts_left := GREATEST(0, v_attempts_max - v_run.attempts_used);
    RETURN jsonb_build_object(
      'run_id', v_run.id,
      'day_key', v_day_key,
      'expires_at', v_expires_at,
      'attempts_left', v_attempts_left,
      'status', v_run.status
    );
  END IF;

  INSERT INTO public.vera_mission_runs (user_id, mission_id, day_key, status)
  VALUES (v_user_id, p_mission_id, v_day_key, 'active');

  SELECT * INTO v_run FROM public.vera_mission_runs
  WHERE user_id = v_user_id AND mission_id = p_mission_id AND day_key = v_day_key;

  RETURN jsonb_build_object(
    'run_id', v_run.id,
    'day_key', v_day_key,
    'expires_at', v_expires_at,
    'attempts_left', v_attempts_max,
    'status', 'active'
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4) RPC: finalize_vera_mission_run
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.finalize_vera_mission_run(
  p_run_id UUID,
  p_outcome TEXT,
  p_elapsed_ms INT,
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run RECORD;
  v_delta_pe INT;
  v_pe_result JSONB;
  v_old_pe INT;
  v_new_pe INT;
  v_elapsed_limit_ms INT := 60000;
  v_pe_success INT := 25;
  v_pe_fail INT := -15;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_run FROM public.vera_mission_runs WHERE id = p_run_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Run not found');
  END IF;
  IF v_run.user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  IF v_run.status NOT IN ('active') THEN
    RETURN jsonb_build_object(
      'success', true,
      'delta_pe', 0,
      'old_pe', 0,
      'new_pe', 0,
      'run_status', v_run.status,
      'already_finalized', true
    );
  END IF;

  IF p_elapsed_ms > v_elapsed_limit_ms OR p_elapsed_ms < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid elapsed time');
  END IF;

  IF p_outcome = 'success' THEN
    v_delta_pe := v_pe_success;
  ELSIF p_outcome = 'fail' THEN
    v_delta_pe := v_pe_fail;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid outcome');
  END IF;

  v_pe_result := public.award_pulse_energy(
    v_run.user_id,
    v_delta_pe,
    'VERA_MISSION_BOMB',
    jsonb_build_object(
      'mission_id', 'bomb',
      'run_id', p_run_id,
      'outcome', p_outcome,
      'elapsed_ms', p_elapsed_ms,
      'payload', p_payload
    )
  );

  v_old_pe := (v_pe_result->>'old_pe')::INT;
  v_new_pe := (v_pe_result->>'new_pe')::INT;

  UPDATE public.vera_mission_runs
  SET status = CASE WHEN p_outcome = 'success' THEN 'completed' ELSE 'failed' END,
      finished_at = NOW(),
      attempts_used = attempts_used + 1,
      payload = payload || p_payload,
      updated_at = NOW()
  WHERE id = p_run_id;

  INSERT INTO public.vera_mission_attempts (run_id, attempt_num, step_data, elapsed_ms, outcome)
  VALUES (p_run_id, 1, p_payload, p_elapsed_ms, p_outcome);

  RETURN jsonb_build_object(
    'success', true,
    'delta_pe', v_delta_pe,
    'old_pe', v_old_pe,
    'new_pe', v_new_pe,
    'run_status', CASE WHEN p_outcome = 'success' THEN 'completed' ELSE 'failed' END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_vera_mission_run(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_vera_mission_run(UUID, TEXT, INT, JSONB) TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Test SQL (comment only - run manually)
-- ═══════════════════════════════════════════════════════════════
-- SELECT public.start_vera_mission_run('bomb');
-- SELECT public.finalize_vera_mission_run(
--   'RUN_UUID_HERE'::UUID,
--   'success',
--   12000,
--   '{"wire_cut": 1}'::jsonb
-- );
