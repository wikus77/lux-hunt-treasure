-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ STORE COMPLIANCE — Wheel Deterministic Progress System
-- Date: 2026-01-28
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Convert Fortune Wheel from RNG-based win/lose to deterministic
--          progress reveal system (Apple App Store / Google Play compliance)
--
-- CHANGE: NO random() for outcome decision
--         Outcome is deterministic based on: user_id + date + total_progress
--         Every interaction = progress advancement (no "lose" state)
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: user_progress_meters — Tracks deterministic progress per user        │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.user_progress_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meter_type TEXT NOT NULL CHECK (meter_type IN ('wheel', 'scratch', 'lottery')),
  progress_points INT NOT NULL DEFAULT 0,
  milestone_level INT NOT NULL DEFAULT 0,
  last_interaction_date DATE,
  total_interactions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT user_progress_meters_unique UNIQUE (user_id, meter_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_meters_user ON public.user_progress_meters(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_meters_type ON public.user_progress_meters(meter_type);

-- RLS
ALTER TABLE public.user_progress_meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_progress_meters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "No direct insert" ON public.user_progress_meters
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No direct update" ON public.user_progress_meters
  FOR UPDATE USING (false);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: execute_wheel_progress (REPLACES execute_wheel_spin)              │
-- │ DETERMINISTIC — No random(), no win/lose, only progress advancement         │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.execute_wheel_progress()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_today DATE := CURRENT_DATE;
  v_spin_id UUID;
  v_progress RECORD;
  v_segment_id INT;
  v_progress_gain INT;
  v_milestone_reached BOOLEAN := false;
  v_milestone_level INT;
  v_reward_value INT := 0;
  v_reward_type TEXT := 'm1u';
  v_current_m1u INT;
  
  -- Deterministic milestone thresholds (every 100 points = milestone)
  c_milestone_threshold CONSTANT INT := 100;
  c_base_progress CONSTANT INT := 10; -- Base progress per interaction
  c_milestone_bonus CONSTANT INT := 5; -- Bonus M1U per milestone
BEGIN
  -- 1. VERIFY AUTHENTICATION
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'User not authenticated'
    );
  END IF;

  -- 2. CHECK IF ALREADY INTERACTED TODAY (1 per day limit)
  SELECT * INTO v_progress
  FROM public.user_progress_meters
  WHERE user_id = v_user_id AND meter_type = 'wheel';
  
  IF v_progress IS NOT NULL AND v_progress.last_interaction_date = v_today THEN
    RETURN jsonb_build_object(
      'status', 'already_completed_today',
      'message', 'Progressione giornaliera completata. Torna domani!',
      'progress_points', v_progress.progress_points,
      'milestone_level', v_progress.milestone_level
    );
  END IF;

  -- 3. CALCULATE DETERMINISTIC PROGRESS (NO RNG)
  -- Progress gain is deterministic based on consecutive days
  IF v_progress IS NULL THEN
    v_progress_gain := c_base_progress;
    v_milestone_level := 0;
  ELSE
    -- Streak bonus: +1 progress for each consecutive day (max +5)
    v_progress_gain := c_base_progress + LEAST(5, v_progress.total_interactions / 7);
    v_milestone_level := v_progress.milestone_level;
  END IF;

  -- 4. DETERMINE SEGMENT (DETERMINISTIC based on progress level)
  -- Segment cycles through 1-16 based on total progress
  -- This ensures visual variety without randomness
  v_segment_id := ((COALESCE(v_progress.progress_points, 0) + v_progress_gain) / 10 % 16) + 1;
  
  -- 5. CHECK FOR MILESTONE (deterministic threshold)
  IF v_progress IS NOT NULL THEN
    IF (v_progress.progress_points + v_progress_gain) >= ((v_milestone_level + 1) * c_milestone_threshold) THEN
      v_milestone_reached := true;
      v_milestone_level := v_milestone_level + 1;
      v_reward_value := c_milestone_bonus * v_milestone_level; -- Increasing rewards
    END IF;
  END IF;

  -- 6. UPSERT PROGRESS RECORD
  INSERT INTO public.user_progress_meters (
    user_id,
    meter_type,
    progress_points,
    milestone_level,
    last_interaction_date,
    total_interactions,
    updated_at
  ) VALUES (
    v_user_id,
    'wheel',
    COALESCE(v_progress.progress_points, 0) + v_progress_gain,
    v_milestone_level,
    v_today,
    COALESCE(v_progress.total_interactions, 0) + 1,
    now()
  )
  ON CONFLICT (user_id, meter_type) 
  DO UPDATE SET
    progress_points = user_progress_meters.progress_points + v_progress_gain,
    milestone_level = v_milestone_level,
    last_interaction_date = v_today,
    total_interactions = user_progress_meters.total_interactions + 1,
    updated_at = now()
  RETURNING id INTO v_spin_id;

  -- 7. AWARD M1U IF MILESTONE REACHED (deterministic)
  IF v_milestone_reached AND v_reward_value > 0 THEN
    SELECT COALESCE(m1_units, 0) INTO v_current_m1u
    FROM public.profiles WHERE id = v_user_id;
    
    UPDATE public.profiles
    SET m1_units = COALESCE(m1_units, 0) + v_reward_value
    WHERE id = v_user_id;
    
    -- Log award
    INSERT INTO public.prize_awards (
      award_type, prize_id, user_id, source, evidence, status
    ) VALUES (
      'progress_milestone',
      'wheel_milestone_' || v_milestone_level,
      v_user_id,
      'wheel_progress',
      jsonb_build_object(
        'milestone_level', v_milestone_level,
        'reward_value', v_reward_value,
        'progress_points', COALESCE(v_progress.progress_points, 0) + v_progress_gain
      ),
      'confirmed'
    );
  END IF;

  -- 8. RECORD IN wheel_spins FOR COMPATIBILITY
  INSERT INTO public.wheel_spins (
    user_id,
    spin_date,
    segment_id,
    reward_type,
    reward_value,
    reward_label
  ) VALUES (
    v_user_id,
    v_today,
    v_segment_id,
    CASE WHEN v_milestone_reached THEN 'm1u' ELSE 'progress' END,
    CASE WHEN v_milestone_reached THEN v_reward_value ELSE v_progress_gain END,
    CASE WHEN v_milestone_reached 
         THEN 'Milestone ' || v_milestone_level || ' (+' || v_reward_value || ' M1U)'
         ELSE 'Avanzamento +' || v_progress_gain
    END
  )
  ON CONFLICT (user_id, spin_date) DO NOTHING;

  -- 9. RETURN PROGRESS RESULT (NO WIN/LOSE LANGUAGE)
  RETURN jsonb_build_object(
    'status', 'success',
    'interaction_id', v_spin_id,
    'segment_id', v_segment_id,
    'progress_gain', v_progress_gain,
    'total_progress', COALESCE(v_progress.progress_points, 0) + v_progress_gain,
    'milestone_reached', v_milestone_reached,
    'milestone_level', v_milestone_level,
    'reward_type', CASE WHEN v_milestone_reached THEN 'm1u' ELSE 'progress' END,
    'reward_value', CASE WHEN v_milestone_reached THEN v_reward_value ELSE v_progress_gain END,
    'message', CASE 
      WHEN v_milestone_reached THEN 'Milestone ' || v_milestone_level || ' raggiunta! +' || v_reward_value || ' M1U'
      ELSE 'Progressione completata! +' || v_progress_gain || ' punti'
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.execute_wheel_progress() TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: check_wheel_progress_today (check without consuming)              │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.check_wheel_progress_today()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_progress RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('can_interact', false, 'reason', 'not_authenticated');
  END IF;
  
  SELECT * INTO v_progress
  FROM public.user_progress_meters
  WHERE user_id = v_user_id AND meter_type = 'wheel';
  
  IF v_progress IS NOT NULL AND v_progress.last_interaction_date = CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'can_interact', false,
      'reason', 'already_completed_today',
      'progress_points', v_progress.progress_points,
      'milestone_level', v_progress.milestone_level,
      'next_milestone', (v_progress.milestone_level + 1) * 100
    );
  END IF;
  
  RETURN jsonb_build_object(
    'can_interact', true,
    'progress_points', COALESCE(v_progress.progress_points, 0),
    'milestone_level', COALESCE(v_progress.milestone_level, 0),
    'next_milestone', (COALESCE(v_progress.milestone_level, 0) + 1) * 100
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_wheel_progress_today() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.user_progress_meters IS 'Deterministic progress tracking for store compliance. No RNG decisions.';
COMMENT ON FUNCTION public.execute_wheel_progress() IS 'STORE COMPLIANT: Deterministic daily progress. No random(), no win/lose.';
COMMENT ON FUNCTION public.check_wheel_progress_today() IS 'Check if user can interact today (without consuming).';
