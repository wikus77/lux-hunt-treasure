-- =====================================================================
-- AION ORACLE LOGIC - M1U & Subscription Management
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

-- ============================================
-- 1) AION STATE TABLE (per-user weekly tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_aion_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_uses_this_week INTEGER DEFAULT 0,
  week_start_date DATE DEFAULT CURRENT_DATE,
  daily_uses_today INTEGER DEFAULT 0,
  last_use_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_aion_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aion_state_own ON public.user_aion_state;
CREATE POLICY aion_state_own ON public.user_aion_state 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.user_aion_state TO authenticated;

-- ============================================
-- 2) AION USAGE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.aion_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  used_free_slot BOOLEAN DEFAULT false,
  m1u_spent INTEGER DEFAULT 0,
  question_type TEXT DEFAULT 'generic',
  question_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.aion_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aion_logs_own ON public.aion_usage_logs;
CREATE POLICY aion_logs_own ON public.aion_usage_logs 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.aion_usage_logs TO authenticated;

-- ============================================
-- 3) PLAN CONFIGURATION (constants)
-- ============================================
CREATE TABLE IF NOT EXISTS public.aion_plan_config (
  plan TEXT PRIMARY KEY,
  free_weekly_slots INTEGER NOT NULL,
  cost_after_free INTEGER NOT NULL,
  daily_cap INTEGER DEFAULT NULL,
  description TEXT
);

-- Insert plan configurations
INSERT INTO public.aion_plan_config (plan, free_weekly_slots, cost_after_free, daily_cap, description)
VALUES 
  ('FREE', 0, 2, NULL, 'No free slots, 2 M1U per consult'),
  ('SILVER', 1, 1, NULL, '1 free weekly, then 1 M1U'),
  ('GOLD', 3, 1, NULL, '3 free weekly, then 1 M1U'),
  ('BLACK', 10, 1, NULL, '10 free weekly, then 1 M1U'),
  ('TITANIUM', 9999, 0, 50, 'Unlimited free, 50 daily cap')
ON CONFLICT (plan) DO UPDATE SET
  free_weekly_slots = EXCLUDED.free_weekly_slots,
  cost_after_free = EXCLUDED.cost_after_free,
  daily_cap = EXCLUDED.daily_cap,
  description = EXCLUDED.description;

GRANT SELECT ON public.aion_plan_config TO authenticated;

-- ============================================
-- 4) MAIN RPC: check_aion_access
-- Returns authorization status and handles M1U deduction
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

  -- Log AION usage
  INSERT INTO public.aion_usage_logs (user_id, plan, used_free_slot, m1u_spent, question_preview)
  VALUES (v_user_id, v_plan, v_use_free_slot, v_m1u_to_spend, LEFT(p_question_preview, 100));

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
-- 5) Helper: Get AION status (read-only)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_aion_status()
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
  v_current_week_start DATE;
  v_remaining_free INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'NOT_AUTHENTICATED');
  END IF;

  v_current_week_start := CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1;

  -- Get user info
  SELECT COALESCE(UPPER(subscription_plan), 'FREE'), COALESCE(m1_units, 0)
  INTO v_plan, v_m1u_balance
  FROM public.profiles WHERE id = v_user_id;

  IF v_plan NOT IN ('FREE', 'SILVER', 'GOLD', 'BLACK', 'TITANIUM') THEN
    v_plan := 'FREE';
  END IF;

  -- Get plan config
  SELECT free_weekly_slots, cost_after_free, daily_cap
  INTO v_free_weekly_slots, v_cost_after_free, v_daily_cap
  FROM public.aion_plan_config WHERE plan = v_plan;

  -- Get state
  SELECT 
    CASE WHEN week_start_date < v_current_week_start THEN 0 ELSE free_uses_this_week END,
    CASE WHEN last_use_date < CURRENT_DATE THEN 0 ELSE daily_uses_today END
  INTO v_free_uses_this_week, v_daily_uses_today
  FROM public.user_aion_state WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    v_free_uses_this_week := 0;
    v_daily_uses_today := 0;
  END IF;

  v_remaining_free := GREATEST(0, COALESCE(v_free_weekly_slots, 0) - v_free_uses_this_week);

  RETURN jsonb_build_object(
    'plan', v_plan,
    'm1u_balance', v_m1u_balance,
    'free_weekly_slots', COALESCE(v_free_weekly_slots, 0),
    'free_remaining', v_remaining_free,
    'cost_per_consult', CASE WHEN v_remaining_free > 0 THEN 0 ELSE COALESCE(v_cost_after_free, 2) END,
    'daily_uses', v_daily_uses_today,
    'daily_cap', v_daily_cap
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_aion_status() TO authenticated;

-- =====================================================================
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

