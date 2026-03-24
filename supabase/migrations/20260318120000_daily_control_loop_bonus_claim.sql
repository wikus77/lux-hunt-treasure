-- Daily Control Loop™ — Bonus 3/3 claim (server-side, idempotent)
-- Table + RPC for one claim per user per day. M1U reward via admin_credit_m1u.
-- © 2026 Joseph MULÉ – M1SSION™

-- Table: one row per user per calendar day (Europe/Rome)
CREATE TABLE IF NOT EXISTS public.daily_control_loop_bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_date)
);

CREATE INDEX IF NOT EXISTS idx_dcl_bonus_claims_user_date
  ON public.daily_control_loop_bonus_claims(user_id, claim_date DESC);

ALTER TABLE public.daily_control_loop_bonus_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own DCL bonus claims" ON public.daily_control_loop_bonus_claims;
CREATE POLICY "Users can read own DCL bonus claims"
  ON public.daily_control_loop_bonus_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Insert only via RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "No direct insert DCL bonus" ON public.daily_control_loop_bonus_claims;
CREATE POLICY "No direct insert DCL bonus"
  ON public.daily_control_loop_bonus_claims FOR INSERT WITH CHECK (false);

-- RPC: claim bonus (validates 3/3 server-side, credits M1U, records claim)
CREATE OR REPLACE FUNCTION public.claim_daily_control_loop_bonus()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today_rome DATE;
  v_day_key TEXT;
  v_commit_status JSONB;
  v_last_check DATE;
  v_mission_done BOOLEAN;
  v_already BOOLEAN;
  v_amount INT := 10;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  v_today_rome := (now() AT TIME ZONE 'Europe/Rome')::DATE;
  v_day_key := to_char(v_today_rome, 'YYYY-MM-DD');

  -- Already claimed today?
  SELECT EXISTS(SELECT 1 FROM daily_control_loop_bonus_claims WHERE user_id = v_user_id AND claim_date = v_today_rome) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'already_claimed', true);
  END IF;

  -- 1) Commit done today
  v_commit_status := check_commit_ritual_status();
  IF (v_commit_status->>'already_done_today') IS DISTINCT FROM 'true' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'commit_not_done');
  END IF;

  -- 2) Streak done today (last_check_in_date = today)
  SELECT last_check_in_date INTO v_last_check FROM profiles WHERE id = v_user_id;
  IF v_last_check IS NULL OR v_last_check <> v_today_rome THEN
    RETURN jsonb_build_object('ok', false, 'error', 'streak_not_done');
  END IF;

  -- 3) Daily mission completed today (any run with phase=3, status=completed for today)
  SELECT EXISTS(
    SELECT 1 FROM daily_mission_runs
    WHERE user_id = v_user_id AND day_key = v_day_key AND phase = 3 AND status = 'completed'
    LIMIT 1
  ) INTO v_mission_done;
  IF NOT v_mission_done THEN
    RETURN jsonb_build_object('ok', false, 'error', 'mission_not_done');
  END IF;

  -- Record claim then credit M1U
  INSERT INTO daily_control_loop_bonus_claims (user_id, claim_date)
  VALUES (v_user_id, v_today_rome);

  PERFORM admin_credit_m1u(v_user_id, v_amount, 'daily_control_loop_bonus');

  RETURN jsonb_build_object('ok', true, 'amount', v_amount);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'already_claimed', true);
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', 'claim_failed');
END;
$$;

-- RPC: get whether user already claimed today (for UI state)
CREATE OR REPLACE FUNCTION public.get_daily_control_loop_bonus_claimed()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today_rome DATE;
  v_claimed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('claimed', false);
  END IF;
  v_today_rome := (now() AT TIME ZONE 'Europe/Rome')::DATE;
  SELECT EXISTS(SELECT 1 FROM daily_control_loop_bonus_claims WHERE user_id = v_user_id AND claim_date = v_today_rome) INTO v_claimed;
  RETURN jsonb_build_object('claimed', v_claimed);
END;
$$;

-- RPC: weekly progress (count of days with 3/3 claim this week, Mon–Sun Europe/Rome)
CREATE OR REPLACE FUNCTION public.get_daily_control_loop_weekly_progress()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_week_start DATE;
  v_count INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('week_start', null, 'count', 0);
  END IF;
  -- Monday = start of week (ISO, Europe/Rome)
  v_week_start := date_trunc('week', (now() AT TIME ZONE 'Europe/Rome')::timestamp)::date;
  SELECT COUNT(*)::INT INTO v_count
  FROM daily_control_loop_bonus_claims
  WHERE user_id = v_user_id
    AND claim_date >= v_week_start
    AND claim_date <= (now() AT TIME ZONE 'Europe/Rome')::date;
  RETURN jsonb_build_object('week_start', to_char(v_week_start, 'YYYY-MM-DD'), 'count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_daily_control_loop_bonus() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_control_loop_bonus_claimed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_control_loop_weekly_progress() TO authenticated;

COMMENT ON TABLE public.daily_control_loop_bonus_claims IS 'Daily Control Loop 3/3 bonus claims — one per user per day.';
COMMENT ON FUNCTION public.claim_daily_control_loop_bonus IS 'Claim DCL bonus if 3/3 today; idempotent; credits 10 M1U.';
COMMENT ON FUNCTION public.get_daily_control_loop_bonus_claimed IS 'Returns whether current user already claimed DCL bonus today.';
COMMENT ON FUNCTION public.get_daily_control_loop_weekly_progress IS 'Returns count of days with DCL 3/3 claim in current week (Europe/Rome).';
