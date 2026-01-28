-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ STORE COMPLIANCE — Scratch Deterministic Progress System
-- Date: 2026-01-28
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Convert Scratch & Win from RNG-based win/lose to deterministic
--          progress reveal system (Apple App Store / Google Play compliance)
--
-- CHANGE: NO random() for outcome decision
--         Scratch reveals deterministic progress based on user state
--         Every reveal = progress advancement (no "lose" state)
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: reveal_scratch_progress (REPLACES reveal_scratch_ticket)          │
-- │ DETERMINISTIC — No random(), no win/lose, only progress revelation          │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.reveal_scratch_progress(
  p_purchase_id UUID,
  p_client_nonce TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_purchase RECORD;
  v_progress RECORD;
  v_tier INT;
  v_progress_gain INT;
  v_milestone_reached BOOLEAN := false;
  v_milestone_level INT;
  v_reward_value INT := 0;
  v_current_m1u INT;
  
  -- Deterministic progress based on tier
  c_tier_10_base CONSTANT INT := 5;
  c_tier_30_base CONSTANT INT := 15;
  c_tier_50_base CONSTANT INT := 30;
  c_milestone_threshold CONSTANT INT := 100;
BEGIN
  -- 1. VERIFY AUTHENTICATION
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'User not authenticated');
  END IF;

  -- 2. VERIFY PURCHASE EXISTS AND BELONGS TO USER
  SELECT * INTO v_purchase
  FROM public.user_scratch_purchases
  WHERE id = p_purchase_id AND user_id = v_user_id
  FOR UPDATE;
  
  IF v_purchase IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Purchase not found');
  END IF;
  
  IF v_purchase.status = 'revealed' OR v_purchase.status = 'credited' THEN
    RETURN jsonb_build_object(
      'status', 'already_revealed',
      'message', 'Questo gratta già è stato rivelato',
      'reward_type', v_purchase.reward_type,
      'reward_value', v_purchase.reward_value
    );
  END IF;
  
  v_tier := v_purchase.tier;

  -- 3. CALCULATE DETERMINISTIC PROGRESS (NO RNG)
  -- Progress is determined by tier, not randomness
  v_progress_gain := CASE v_tier
    WHEN 10 THEN c_tier_10_base
    WHEN 30 THEN c_tier_30_base
    WHEN 50 THEN c_tier_50_base
    ELSE c_tier_10_base
  END;

  -- 4. GET OR CREATE USER PROGRESS METER
  SELECT * INTO v_progress
  FROM public.user_progress_meters
  WHERE user_id = v_user_id AND meter_type = 'scratch';
  
  IF v_progress IS NULL THEN
    v_milestone_level := 0;
  ELSE
    v_milestone_level := v_progress.milestone_level;
  END IF;

  -- 5. CHECK FOR MILESTONE (deterministic threshold)
  IF v_progress IS NOT NULL THEN
    IF (v_progress.progress_points + v_progress_gain) >= ((v_milestone_level + 1) * c_milestone_threshold) THEN
      v_milestone_reached := true;
      v_milestone_level := v_milestone_level + 1;
      v_reward_value := v_tier * v_milestone_level; -- Tier-scaled milestone reward
    END IF;
  END IF;

  -- 6. UPSERT PROGRESS METER
  INSERT INTO public.user_progress_meters (
    user_id, meter_type, progress_points, milestone_level, 
    last_interaction_date, total_interactions, updated_at
  ) VALUES (
    v_user_id, 'scratch',
    v_progress_gain,
    v_milestone_level,
    CURRENT_DATE,
    1,
    now()
  )
  ON CONFLICT (user_id, meter_type) 
  DO UPDATE SET
    progress_points = user_progress_meters.progress_points + v_progress_gain,
    milestone_level = v_milestone_level,
    last_interaction_date = CURRENT_DATE,
    total_interactions = user_progress_meters.total_interactions + 1,
    updated_at = now();

  -- 7. UPDATE PURCHASE RECORD
  UPDATE public.user_scratch_purchases
  SET 
    status = 'revealed',
    reward_type = CASE WHEN v_milestone_reached THEN 'm1u' ELSE 'progress' END,
    reward_value = CASE WHEN v_milestone_reached THEN v_reward_value ELSE v_progress_gain END,
    revealed_at = now()
  WHERE id = p_purchase_id;

  -- 8. AWARD M1U IF MILESTONE REACHED
  IF v_milestone_reached AND v_reward_value > 0 THEN
    SELECT COALESCE(m1_units, 0) INTO v_current_m1u
    FROM public.profiles WHERE id = v_user_id;
    
    UPDATE public.profiles
    SET m1_units = COALESCE(m1_units, 0) + v_reward_value
    WHERE id = v_user_id;
    
    -- Mark as credited
    UPDATE public.user_scratch_purchases
    SET status = 'credited', credited_at = now()
    WHERE id = p_purchase_id;
    
    -- Log award
    INSERT INTO public.prize_awards (
      award_type, prize_id, user_id, source, evidence, status
    ) VALUES (
      'progress_milestone',
      'scratch_milestone_' || v_milestone_level,
      v_user_id,
      'scratch_progress',
      jsonb_build_object(
        'purchase_id', p_purchase_id,
        'tier', v_tier,
        'milestone_level', v_milestone_level,
        'reward_value', v_reward_value
      ),
      'confirmed'
    );
  END IF;

  -- 9. RETURN PROGRESS RESULT (NO WIN/LOSE LANGUAGE)
  RETURN jsonb_build_object(
    'status', 'success',
    'purchase_id', p_purchase_id,
    'tier', v_tier,
    'progress_gain', v_progress_gain,
    'total_progress', COALESCE(v_progress.progress_points, 0) + v_progress_gain,
    'milestone_reached', v_milestone_reached,
    'milestone_level', v_milestone_level,
    'reward_type', CASE WHEN v_milestone_reached THEN 'm1u' ELSE 'progress' END,
    'reward_value', CASE WHEN v_milestone_reached THEN v_reward_value ELSE v_progress_gain END,
    'message', CASE 
      WHEN v_milestone_reached THEN 'Milestone ' || v_milestone_level || ' raggiunta! +' || v_reward_value || ' M1U'
      ELSE 'Rivelazione completata! +' || v_progress_gain || ' punti progressione'
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reveal_scratch_progress(UUID, TEXT) TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.reveal_scratch_progress(UUID, TEXT) IS 'STORE COMPLIANT: Deterministic scratch reveal. No random(), no win/lose.';
