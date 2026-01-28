-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ STORE COMPLIANCE — Lottery Deterministic Progress System
-- Date: 2026-01-28
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Convert Lottery from RNG-based winner drawing to deterministic
--          threshold-based progression (Apple App Store / Google Play compliance)
--
-- CHANGE: NO random() for winner selection
--         Tickets represent progress points toward milestones
--         Every purchase = progress advancement (no "lose" state)
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: buy_lottery_progress (REPLACES buy_lottery_tickets)               │
-- │ DETERMINISTIC — Tickets = progress points, no random drawing                │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.buy_lottery_progress(
  p_ticket_count INT,
  p_mission_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_cost INT;
  v_current_m1u INT;
  v_progress RECORD;
  v_progress_gain INT;
  v_milestone_reached BOOLEAN := false;
  v_milestone_level INT;
  v_reward_value INT := 0;
  
  -- Deterministic progress thresholds
  c_cost_per_ticket CONSTANT INT := 5; -- M1U cost per ticket
  c_progress_per_ticket CONSTANT INT := 10; -- Progress points per ticket
  c_milestone_threshold CONSTANT INT := 100; -- Points per milestone
  c_milestone_bonus CONSTANT INT := 20; -- M1U bonus per milestone
BEGIN
  -- 1. VERIFY AUTHENTICATION
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'User not authenticated');
  END IF;

  -- 2. VALIDATE INPUT
  IF p_ticket_count < 1 OR p_ticket_count > 10 THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Numero biglietti non valido (1-10)');
  END IF;

  -- 3. CALCULATE COST AND CHECK BALANCE
  v_cost := p_ticket_count * c_cost_per_ticket;
  
  SELECT COALESCE(m1_units, 0) INTO v_current_m1u
  FROM public.profiles WHERE id = v_user_id;
  
  IF v_current_m1u < v_cost THEN
    RETURN jsonb_build_object(
      'status', 'insufficient_funds',
      'message', 'M1U insufficienti',
      'required', v_cost,
      'available', v_current_m1u
    );
  END IF;

  -- 4. DEDUCT M1U
  UPDATE public.profiles
  SET m1_units = m1_units - v_cost
  WHERE id = v_user_id;

  -- 5. CALCULATE DETERMINISTIC PROGRESS
  v_progress_gain := p_ticket_count * c_progress_per_ticket;

  -- 6. GET OR CREATE USER PROGRESS METER
  SELECT * INTO v_progress
  FROM public.user_progress_meters
  WHERE user_id = v_user_id AND meter_type = 'lottery';
  
  IF v_progress IS NULL THEN
    v_milestone_level := 0;
  ELSE
    v_milestone_level := v_progress.milestone_level;
  END IF;

  -- 7. CHECK FOR MILESTONE (deterministic threshold)
  IF v_progress IS NOT NULL THEN
    IF (v_progress.progress_points + v_progress_gain) >= ((v_milestone_level + 1) * c_milestone_threshold) THEN
      v_milestone_reached := true;
      v_milestone_level := v_milestone_level + 1;
      v_reward_value := c_milestone_bonus * v_milestone_level;
    END IF;
  ELSE
    -- First purchase might reach first milestone
    IF v_progress_gain >= c_milestone_threshold THEN
      v_milestone_reached := true;
      v_milestone_level := 1;
      v_reward_value := c_milestone_bonus;
    END IF;
  END IF;

  -- 8. UPSERT PROGRESS METER
  INSERT INTO public.user_progress_meters (
    user_id, meter_type, progress_points, milestone_level,
    last_interaction_date, total_interactions, updated_at
  ) VALUES (
    v_user_id, 'lottery',
    v_progress_gain,
    v_milestone_level,
    CURRENT_DATE,
    p_ticket_count,
    now()
  )
  ON CONFLICT (user_id, meter_type)
  DO UPDATE SET
    progress_points = user_progress_meters.progress_points + v_progress_gain,
    milestone_level = v_milestone_level,
    last_interaction_date = CURRENT_DATE,
    total_interactions = user_progress_meters.total_interactions + p_ticket_count,
    updated_at = now();

  -- 9. AWARD MILESTONE BONUS IF REACHED
  IF v_milestone_reached AND v_reward_value > 0 THEN
    UPDATE public.profiles
    SET m1_units = m1_units + v_reward_value
    WHERE id = v_user_id;
    
    -- Log award
    INSERT INTO public.prize_awards (
      award_type, prize_id, user_id, source, evidence, status
    ) VALUES (
      'progress_milestone',
      'lottery_milestone_' || v_milestone_level,
      v_user_id,
      'lottery_progress',
      jsonb_build_object(
        'ticket_count', p_ticket_count,
        'milestone_level', v_milestone_level,
        'reward_value', v_reward_value,
        'total_progress', COALESCE(v_progress.progress_points, 0) + v_progress_gain
      ),
      'confirmed'
    );
  END IF;

  -- 10. RETURN PROGRESS RESULT (NO WIN/LOSE LANGUAGE)
  RETURN jsonb_build_object(
    'status', 'success',
    'tickets_purchased', p_ticket_count,
    'cost', v_cost,
    'progress_gain', v_progress_gain,
    'total_progress', COALESCE(v_progress.progress_points, 0) + v_progress_gain,
    'milestone_reached', v_milestone_reached,
    'milestone_level', v_milestone_level,
    'milestone_reward', CASE WHEN v_milestone_reached THEN v_reward_value ELSE 0 END,
    'message', CASE
      WHEN v_milestone_reached THEN 'Milestone ' || v_milestone_level || ' raggiunta! +' || v_reward_value || ' M1U'
      ELSE 'Progressione attivata! +' || v_progress_gain || ' punti'
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.buy_lottery_progress(INT, UUID) TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: get_lottery_progress (Check user's lottery progress)              │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.get_lottery_progress()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_progress RECORD;
  v_next_milestone INT;
  v_points_to_next INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_progress
  FROM public.user_progress_meters
  WHERE user_id = v_user_id AND meter_type = 'lottery';
  
  IF v_progress IS NULL THEN
    RETURN jsonb_build_object(
      'progress_points', 0,
      'milestone_level', 0,
      'next_milestone', 100,
      'points_to_next', 100,
      'total_tickets', 0
    );
  END IF;
  
  v_next_milestone := (v_progress.milestone_level + 1) * 100;
  v_points_to_next := v_next_milestone - v_progress.progress_points;
  
  RETURN jsonb_build_object(
    'progress_points', v_progress.progress_points,
    'milestone_level', v_progress.milestone_level,
    'next_milestone', v_next_milestone,
    'points_to_next', GREATEST(0, v_points_to_next),
    'total_tickets', v_progress.total_interactions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lottery_progress() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.buy_lottery_progress(INT, UUID) IS 'STORE COMPLIANT: Lottery tickets as progress points. No random drawing.';
COMMENT ON FUNCTION public.get_lottery_progress() IS 'Get user lottery progress status.';
