-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- MPE Real Data v1 — Tables + RPC (server authoritative)
-- READ-ONLY preflight must PASS before applying.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABLES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.mpe_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  score_total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_mpe_daily_snapshots_user_date
  ON public.mpe_daily_snapshots(user_id, snapshot_date DESC);

CREATE TABLE IF NOT EXISTS public.mpe_run_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  m1u_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One free run per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_mpe_run_log_free_once_per_day
  ON public.mpe_run_log(user_id, run_date) WHERE is_paid = false;

CREATE INDEX IF NOT EXISTS idx_mpe_run_log_user_date
  ON public.mpe_run_log(user_id, run_date);

CREATE TABLE IF NOT EXISTS public.mpe_daily_commit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, commit_date)
);

CREATE INDEX IF NOT EXISTS idx_mpe_daily_commit_log_user_date
  ON public.mpe_daily_commit_log(user_id, commit_date);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. RLS (SELECT own; INSERT only via RPC)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.mpe_daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpe_run_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpe_daily_commit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mpe_snapshots_select_own" ON public.mpe_daily_snapshots;
CREATE POLICY "mpe_snapshots_select_own" ON public.mpe_daily_snapshots
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mpe_run_log_select_own" ON public.mpe_run_log;
CREATE POLICY "mpe_run_log_select_own" ON public.mpe_run_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mpe_commit_log_select_own" ON public.mpe_daily_commit_log;
CREATE POLICY "mpe_commit_log_select_own" ON public.mpe_daily_commit_log
  FOR SELECT USING (auth.uid() = user_id);

-- No direct INSERT/UPDATE/DELETE from client; only via SECURITY DEFINER RPCs

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. RPC: mpe_get_inputs_snapshot()
-- ═══════════════════════════════════════════════════════════════════════════

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

  -- clues count (user_clues)
  SELECT COUNT(*) INTO v_clues_count FROM public.user_clues WHERE user_id = v_uid;

  -- buzz map: latest radius + count this week (user_map_areas, source='buzz_map')
  SELECT radius_km INTO v_buzz_radius_km
  FROM public.user_map_areas
  WHERE user_id = v_uid AND source = 'buzz_map' AND week = v_current_week
  ORDER BY created_at DESC LIMIT 1;

  SELECT COUNT(*)::INT INTO v_buzz_map_count_week
  FROM public.user_map_areas
  WHERE user_id = v_uid AND source = 'buzz_map' AND week = v_current_week;

  -- streak (profiles)
  SELECT COALESCE(p.current_streak_days, 0), COALESCE(p.longest_streak_days, 0), p.last_check_in_date
  INTO v_streak_days, v_longest_streak, v_last_check
  FROM public.profiles p WHERE p.id = v_uid;

  -- activity (user_activity_stats, own row)
  SELECT to_jsonb(t) INTO v_activity
  FROM (SELECT * FROM public.user_activity_stats WHERE user_id = v_uid LIMIT 1) t;

  -- wallet: profiles.m1_units + user_cashback_wallet
  SELECT COALESCE(p.m1_units, 0), COALESCE(p.pulse_energy, 0)
  INTO v_m1u, v_pe FROM public.profiles p WHERE p.id = v_uid;

  SELECT COALESCE(c.accumulated_m1u, 0), COALESCE(c.lifetime_earned_m1u, 0), c.last_claim_at
  INTO v_cashback_accum, v_cashback_lifetime, v_cashback_last_claim
  FROM public.user_cashback_wallet c WHERE c.user_id = v_uid LIMIT 1;

  -- daily commit completed today
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

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. RPC: mpe_check_and_consume_run(p_is_paid boolean)
-- Returns: { "allowed": true } or { "allowed": false, "reason": "..." }
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.mpe_check_and_consume_run(p_is_paid BOOLEAN DEFAULT false)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_already_free BOOLEAN;
  v_balance INT;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  END IF;

  IF p_is_paid = false THEN
    -- Free run: at most one per day
    SELECT EXISTS(
      SELECT 1 FROM public.mpe_run_log
      WHERE user_id = v_uid AND run_date = v_today AND is_paid = false
    ) INTO v_already_free;
    IF v_already_free THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'free_run_used_today');
    END IF;
    INSERT INTO public.mpe_run_log (user_id, run_date, is_paid, m1u_cost)
    VALUES (v_uid, v_today, false, 0);
    RETURN jsonb_build_object('allowed', true);
  END IF;

  -- Paid run: consume 5 M1U atomically
  SELECT COALESCE(m1_units, 0) INTO v_balance FROM public.profiles WHERE id = v_uid;
  IF v_balance IS NULL OR v_balance < 5 THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'insufficient_m1u', 'required', 5);
  END IF;

  UPDATE public.profiles SET m1_units = m1_units - 5 WHERE id = v_uid AND m1_units >= 5;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'insufficient_m1u', 'required', 5);
  END IF;

  INSERT INTO public.mpe_run_log (user_id, run_date, is_paid, m1u_cost)
  VALUES (v_uid, v_today, true, 5);
  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. RPC: mpe_record_daily_commit() — idempotent
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.mpe_record_daily_commit()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  INSERT INTO public.mpe_daily_commit_log (user_id, commit_date, completed_at)
  VALUES (v_uid, CURRENT_DATE, NOW())
  ON CONFLICT (user_id, commit_date) DO NOTHING;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. RPC: mpe_save_daily_snapshot(p_payload jsonb, p_score_total int)
-- One per user per day (upsert by date)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.mpe_save_daily_snapshot(p_payload JSONB DEFAULT '{}'::jsonb, p_score_total INT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  INSERT INTO public.mpe_daily_snapshots (user_id, snapshot_date, payload, score_total)
  VALUES (v_uid, CURRENT_DATE, COALESCE(p_payload, '{}'::jsonb), p_score_total)
  ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
    payload = EXCLUDED.payload,
    score_total = EXCLUDED.score_total,
    created_at = NOW();
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. RPC: mpe_get_daily_delta()
-- Returns delta vs yesterday (today score - yesterday score, and per-dimension if in payload)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.mpe_get_daily_delta()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_today RECORD;
  v_yesterday RECORD;
  v_delta_total INT;
  v_bars_today JSONB;
  v_bars_yesterday JSONB;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated', 'delta_total', NULL, 'insufficient_history', true);
  END IF;

  SELECT payload, score_total INTO v_today
  FROM public.mpe_daily_snapshots
  WHERE user_id = v_uid AND snapshot_date = CURRENT_DATE LIMIT 1;

  SELECT payload, score_total INTO v_yesterday
  FROM public.mpe_daily_snapshots
  WHERE user_id = v_uid AND snapshot_date = CURRENT_DATE - INTERVAL '1 day' LIMIT 1;

  IF v_yesterday.score_total IS NULL OR v_today.score_total IS NULL THEN
    RETURN jsonb_build_object(
      'delta_total', NULL,
      'insufficient_history', true,
      'today_score', v_today.score_total,
      'yesterday_score', v_yesterday.score_total
    );
  END IF;

  v_delta_total := COALESCE(v_today.score_total, 0) - COALESCE(v_yesterday.score_total, 0);
  v_bars_today := v_today.payload->'bars';
  v_bars_yesterday := v_yesterday.payload->'bars';

  v_result := jsonb_build_object(
    'delta_total', v_delta_total,
    'insufficient_history', false,
    'today_score', v_today.score_total,
    'yesterday_score', v_yesterday.score_total,
    'bars_delta', CASE
      WHEN v_bars_today IS NOT NULL AND v_bars_yesterday IS NOT NULL THEN jsonb_build_object(
        'intelligence', (COALESCE((v_bars_today->>'intelligence')::numeric, 0) - COALESCE((v_bars_yesterday->>'intelligence')::numeric, 0)),
        'geo', (COALESCE((v_bars_today->>'geo')::numeric, 0) - COALESCE((v_bars_yesterday->>'geo')::numeric, 0)),
        'discipline', (COALESCE((v_bars_today->>'discipline')::numeric, 0) - COALESCE((v_bars_yesterday->>'discipline')::numeric, 0)),
        'operational', (COALESCE((v_bars_today->>'operational')::numeric, 0) - COALESCE((v_bars_yesterday->>'operational')::numeric, 0))
      )
      ELSE NULL
    END
  );
  RETURN v_result;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.mpe_daily_snapshots TO authenticated;
GRANT SELECT ON public.mpe_run_log TO authenticated;
GRANT SELECT ON public.mpe_daily_commit_log TO authenticated;

GRANT EXECUTE ON FUNCTION public.mpe_get_inputs_snapshot() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mpe_check_and_consume_run(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mpe_record_daily_commit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mpe_save_daily_snapshot(JSONB, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mpe_get_daily_delta() TO authenticated;

COMMENT ON TABLE public.mpe_daily_snapshots IS 'MPE Real Data v1: one snapshot per user per day for delta vs yesterday';
COMMENT ON TABLE public.mpe_run_log IS 'MPE Real Data v1: 1 free run/day + paid runs (5 M1U each)';
COMMENT ON TABLE public.mpe_daily_commit_log IS 'MPE Real Data v1: daily commit completed (idempotent)';
