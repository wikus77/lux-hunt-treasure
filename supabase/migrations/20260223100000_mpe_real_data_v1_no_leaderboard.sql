-- © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- MPE Real Data v1 — NO LEADERBOARD variant
-- Replaces mpe_get_inputs_snapshot to remove leaderboard_rankings dependency.
-- Run after 20260222100000_mpe_real_data_v1.sql (or on clean DB with tables from incident report Phase 2).

CREATE OR REPLACE FUNCTION public.mpe_get_inputs_snapshot()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_clues_count BIGINT;
  v_buzz_radius_km DOUBLE PRECISION;
  v_buzz_map_count_week INT;
  v_streak_days INT;
  v_longest_streak INT;
  v_last_check DATE;
  v_activity JSONB;
  v_m1u INT;
  v_pe INT;
  v_cashback_accum INT;
  v_cashback_lifetime INT;
  v_cashback_last_claim TIMESTAMPTZ;
  v_daily_commit BOOLEAN;
  v_current_week INT := EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  SELECT COUNT(*) INTO v_clues_count FROM public.user_clues WHERE user_id = v_uid;

  SELECT radius_km INTO v_buzz_radius_km
  FROM public.user_map_areas
  WHERE user_id = v_uid AND source = 'buzz_map' AND week = v_current_week
  ORDER BY created_at DESC LIMIT 1;

  SELECT COUNT(*)::INT INTO v_buzz_map_count_week
  FROM public.user_map_areas
  WHERE user_id = v_uid AND source = 'buzz_map' AND week = v_current_week;

  SELECT COALESCE(p.current_streak_days, 0), COALESCE(p.longest_streak_days, 0), p.last_check_in_date
  INTO v_streak_days, v_longest_streak, v_last_check
  FROM public.profiles p WHERE p.id = v_uid;

  SELECT to_jsonb(t) INTO v_activity
  FROM (SELECT * FROM public.user_activity_stats WHERE user_id = v_uid LIMIT 1) t;

  SELECT COALESCE(p.m1_units, 0), COALESCE(p.pulse_energy, 0)
  INTO v_m1u, v_pe FROM public.profiles p WHERE p.id = v_uid;

  SELECT COALESCE(c.accumulated_m1u, 0), COALESCE(c.lifetime_earned_m1u, 0), c.last_claim_at
  INTO v_cashback_accum, v_cashback_lifetime, v_cashback_last_claim
  FROM public.user_cashback_wallet c WHERE c.user_id = v_uid LIMIT 1;

  SELECT EXISTS(
    SELECT 1 FROM public.mpe_daily_commit_log
    WHERE user_id = v_uid AND commit_date = CURRENT_DATE
  ) INTO v_daily_commit;

  v_result := jsonb_build_object(
    'clues_count', COALESCE(v_clues_count, 0),
    'buzz_map_radius_km', v_buzz_radius_km,
    'buzz_map_count_this_week', COALESCE(v_buzz_map_count_week, 0),
    'current_streak_days', COALESCE(v_streak_days, 0),
    'longest_streak_days', COALESCE(v_longest_streak, 0),
    'last_check_in_date', v_last_check,
    'activity', COALESCE(v_activity, '{}'::jsonb),
    'm1_units', COALESCE(v_m1u, 0),
    'pulse_energy', COALESCE(v_pe, 0),
    'cashback_accumulated_m1u', COALESCE(v_cashback_accum, 0),
    'cashback_lifetime_earned_m1u', COALESCE(v_cashback_lifetime, 0),
    'cashback_last_claim_at', v_cashback_last_claim,
    'daily_commit_completed_today', COALESCE(v_daily_commit, false)
  );
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.mpe_get_inputs_snapshot() IS 'MPE Real Data v1 NO LEADERBOARD: snapshot inputs without rank';
