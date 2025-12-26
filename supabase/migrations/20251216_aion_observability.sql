-- =====================================================================
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- AION OBSERVABILITY: Log DENIED cases + Daily aggregates view
-- MODULE 2: AION Usage Aggregate Metrics
-- =====================================================================

-- ============================================
-- 1) ADD OBSERVABILITY COLUMNS TO aion_usage_logs
-- ============================================
DO $$
BEGIN
  -- Add 'authorized' column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aion_usage_logs' 
    AND column_name = 'authorized'
  ) THEN
    ALTER TABLE public.aion_usage_logs 
    ADD COLUMN authorized BOOLEAN DEFAULT true;
    COMMENT ON COLUMN public.aion_usage_logs.authorized IS 'Whether the AION access was authorized';
  END IF;

  -- Add 'error_code' column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aion_usage_logs' 
    AND column_name = 'error_code'
  ) THEN
    ALTER TABLE public.aion_usage_logs 
    ADD COLUMN error_code TEXT DEFAULT NULL;
    COMMENT ON COLUMN public.aion_usage_logs.error_code IS 'Error code for denied requests (INSUFFICIENT_M1U_FOR_AION, AION_DAILY_CAP_EXCEEDED, etc)';
  END IF;

  -- Add 'request_id' column if not exists (for idempotency)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aion_usage_logs' 
    AND column_name = 'request_id'
  ) THEN
    ALTER TABLE public.aion_usage_logs 
    ADD COLUMN request_id TEXT DEFAULT NULL;
    COMMENT ON COLUMN public.aion_usage_logs.request_id IS 'Unique request ID for deduplication';
  END IF;
END $$;

-- ============================================
-- 2) UPDATE check_aion_access RPC TO LOG DENIED CASES
-- ============================================
CREATE OR REPLACE FUNCTION public.check_aion_access(p_question_preview TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_plan TEXT;
  v_m1u_balance INTEGER;
  v_free_weekly_slots INTEGER;
  v_cost_after_free INTEGER;
  v_daily_cap INTEGER;
  v_free_uses_this_week INTEGER;
  v_daily_uses_today INTEGER;
  v_week_start DATE;
  v_current_week_start DATE;
  v_today DATE;
  v_can_use BOOLEAN := false;
  v_use_free_slot BOOLEAN := false;
  v_m1u_to_spend INTEGER := 0;
  v_error_code TEXT := NULL;
  v_remaining_free INTEGER := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    -- 🔍 OBSERVABILITY: Log denied - not authenticated
    INSERT INTO public.aion_usage_logs (user_id, plan, authorized, error_code, question_preview)
    VALUES (NULL, 'UNKNOWN', false, 'NOT_AUTHENTICATED', LEFT(p_question_preview, 100));
    
    RETURN jsonb_build_object('authorized', false, 'error_code', 'NOT_AUTHENTICATED');
  END IF;

  v_today := CURRENT_DATE;
  -- Calculate current week start (Monday)
  v_current_week_start := v_today - EXTRACT(DOW FROM v_today)::INTEGER + 1;
  IF EXTRACT(DOW FROM v_today) = 0 THEN
    v_current_week_start := v_today - 6;
  END IF;

  -- Get user plan from profiles
  SELECT COALESCE(UPPER(subscription_plan), 'FREE'), COALESCE(m1_units, 0)
  INTO v_plan, v_m1u_balance
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_plan IS NULL THEN
    v_plan := 'FREE';
  END IF;

  -- Normalize plan name
  IF v_plan NOT IN ('FREE', 'SILVER', 'GOLD', 'BLACK', 'TITANIUM') THEN
    v_plan := 'FREE';
  END IF;

  -- Get plan config
  SELECT free_weekly_slots, cost_after_free, daily_cap
  INTO v_free_weekly_slots, v_cost_after_free, v_daily_cap
  FROM public.aion_plan_config
  WHERE plan = v_plan;

  IF v_free_weekly_slots IS NULL THEN
    v_free_weekly_slots := 0;
    v_cost_after_free := 2;
  END IF;

  -- Get or create AION state
  SELECT free_uses_this_week, week_start_date, daily_uses_today, last_use_date
  INTO v_free_uses_this_week, v_week_start, v_daily_uses_today, v_today
  FROM public.user_aion_state
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_aion_state (user_id, free_uses_this_week, week_start_date, daily_uses_today, last_use_date)
    VALUES (v_user_id, 0, v_current_week_start, 0, v_today);
    v_free_uses_this_week := 0;
    v_week_start := v_current_week_start;
    v_daily_uses_today := 0;
  ELSE
    -- Reset weekly counter if new week
    IF v_week_start < v_current_week_start THEN
      v_free_uses_this_week := 0;
      UPDATE public.user_aion_state 
      SET free_uses_this_week = 0, week_start_date = v_current_week_start
      WHERE user_id = v_user_id;
    END IF;

    -- Reset daily counter if new day
    SELECT last_use_date, daily_uses_today INTO v_today, v_daily_uses_today
    FROM public.user_aion_state WHERE user_id = v_user_id;
    
    IF v_today < CURRENT_DATE THEN
      v_daily_uses_today := 0;
      UPDATE public.user_aion_state 
      SET daily_uses_today = 0, last_use_date = CURRENT_DATE
      WHERE user_id = v_user_id;
    END IF;
  END IF;

  -- Calculate remaining free slots
  v_remaining_free := GREATEST(0, v_free_weekly_slots - v_free_uses_this_week);

  -- Check TITANIUM daily cap
  IF v_plan = 'TITANIUM' AND v_daily_cap IS NOT NULL THEN
    IF v_daily_uses_today >= v_daily_cap THEN
      -- 🔍 OBSERVABILITY: Log denied - daily cap exceeded
      INSERT INTO public.aion_usage_logs (user_id, plan, authorized, error_code, question_preview)
      VALUES (v_user_id, v_plan, false, 'AION_DAILY_CAP_EXCEEDED', LEFT(p_question_preview, 100));
      
      RETURN jsonb_build_object(
        'authorized', false,
        'error_code', 'AION_DAILY_CAP_EXCEEDED',
        'plan', v_plan,
        'daily_uses', v_daily_uses_today,
        'daily_cap', v_daily_cap,
        'message', 'Limite giornaliero AION raggiunto. Riprova domani.'
      );
    END IF;
  END IF;

  -- Determine if can use and how
  IF v_remaining_free > 0 THEN
    -- Has free slot available
    v_can_use := true;
    v_use_free_slot := true;
    v_m1u_to_spend := 0;
  ELSE
    -- No free slots, check M1U
    IF v_m1u_balance >= v_cost_after_free THEN
      v_can_use := true;
      v_use_free_slot := false;
      v_m1u_to_spend := v_cost_after_free;
    ELSE
      v_can_use := false;
      v_error_code := 'INSUFFICIENT_M1U_FOR_AION';
    END IF;
  END IF;

  IF NOT v_can_use THEN
    -- 🔍 OBSERVABILITY: Log denied - insufficient M1U
    INSERT INTO public.aion_usage_logs (user_id, plan, authorized, error_code, m1u_spent, question_preview)
    VALUES (v_user_id, v_plan, false, v_error_code, 0, LEFT(p_question_preview, 100));
    
    RETURN jsonb_build_object(
      'authorized', false,
      'error_code', v_error_code,
      'plan', v_plan,
      'm1u_balance', v_m1u_balance,
      'm1u_required', v_cost_after_free,
      'free_remaining', v_remaining_free,
      'message', 'Energia M1U insufficiente per attivare il canale AION.'
    );
  END IF;

  -- AUTHORIZED - Execute transaction
  IF v_use_free_slot THEN
    -- Use free slot
    UPDATE public.user_aion_state
    SET 
      free_uses_this_week = free_uses_this_week + 1,
      daily_uses_today = daily_uses_today + 1,
      last_use_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = v_user_id;
  ELSE
    -- Deduct M1U
    UPDATE public.profiles
    SET m1_units = m1_units - v_m1u_to_spend, updated_at = NOW()
    WHERE id = v_user_id;

    -- Update daily counter
    UPDATE public.user_aion_state
    SET 
      daily_uses_today = daily_uses_today + 1,
      last_use_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = v_user_id;

    -- Log M1U transaction
    INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
    VALUES (v_user_id, -v_m1u_to_spend, 'AION_CONSULT', jsonb_build_object('plan', v_plan));
  END IF;

  -- 🔍 OBSERVABILITY: Log AION usage (authorized)
  INSERT INTO public.aion_usage_logs (user_id, plan, used_free_slot, m1u_spent, authorized, error_code, question_preview)
  VALUES (v_user_id, v_plan, v_use_free_slot, v_m1u_to_spend, true, NULL, LEFT(p_question_preview, 100));

  -- Get updated balance
  SELECT m1_units INTO v_m1u_balance FROM public.profiles WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'authorized', true,
    'plan', v_plan,
    'used_free_slot', v_use_free_slot,
    'm1u_spent', v_m1u_to_spend,
    'm1u_balance', v_m1u_balance,
    'free_remaining', CASE WHEN v_use_free_slot THEN v_remaining_free - 1 ELSE v_remaining_free END,
    'daily_uses', v_daily_uses_today + 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_aion_access(TEXT) TO authenticated;

-- ============================================
-- 3) CREATE DAILY AGGREGATE VIEW
-- ============================================
CREATE OR REPLACE VIEW public.aion_usage_daily AS
SELECT 
  DATE(created_at) as date,
  user_id,
  plan,
  COUNT(*) as calls_total,
  COUNT(*) FILTER (WHERE authorized = true) as calls_allowed,
  COUNT(*) FILTER (WHERE authorized = false) as calls_denied,
  SUM(CASE WHEN authorized = true THEN m1u_spent ELSE 0 END) as total_m1u_spent,
  COUNT(*) FILTER (WHERE used_free_slot = true) as free_slots_used,
  jsonb_object_agg(
    COALESCE(error_code, 'SUCCESS'), 
    COUNT(*) FILTER (WHERE error_code IS NOT NULL OR (error_code IS NULL AND authorized = true))
  ) FILTER (WHERE error_code IS NOT NULL OR authorized = true) as reason_counts
FROM public.aion_usage_logs
GROUP BY DATE(created_at), user_id, plan;

COMMENT ON VIEW public.aion_usage_daily IS 'Daily aggregate metrics for AION usage per user/plan';

-- Grant read access to the view
GRANT SELECT ON public.aion_usage_daily TO authenticated;

-- ============================================
-- 4) CREATE INDEX FOR EFFICIENT AGGREGATION
-- ============================================
CREATE INDEX IF NOT EXISTS idx_aion_usage_logs_daily 
ON public.aion_usage_logs (user_id, DATE(created_at), authorized);

-- =====================================================================
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================




