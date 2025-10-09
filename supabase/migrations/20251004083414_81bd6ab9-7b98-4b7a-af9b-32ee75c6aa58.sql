-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Drop and recreate get_user_xp_status RPC function

DROP FUNCTION IF EXISTS public.get_user_xp_status(uuid);

CREATE OR REPLACE FUNCTION public.get_user_xp_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_row user_xp%ROWTYPE;
  v_credits_row user_credits%ROWTYPE;
  v_result JSON;
BEGIN
  -- Get XP data
  SELECT * INTO v_xp_row FROM public.user_xp WHERE user_id = p_user_id;
  
  -- Get credits data
  SELECT * INTO v_credits_row FROM public.user_credits WHERE user_id = p_user_id;
  
  -- If no XP record exists, create one
  IF NOT FOUND OR v_xp_row IS NULL THEN
    INSERT INTO public.user_xp (user_id, total_xp, buzz_xp_progress, map_xp_progress)
    VALUES (p_user_id, 0, 0, 0)
    RETURNING * INTO v_xp_row;
  END IF;
  
  -- If no credits record exists, create one
  IF v_credits_row IS NULL THEN
    INSERT INTO public.user_credits (user_id, free_buzz_credit, free_buzz_map_credit)
    VALUES (p_user_id, 0, 0)
    RETURNING * INTO v_credits_row;
  END IF;
  
  -- Build result JSON
  v_result := json_build_object(
    'total_xp', COALESCE(v_xp_row.total_xp, 0),
    'buzz_xp_progress', COALESCE(v_xp_row.buzz_xp_progress, 0),
    'map_xp_progress', COALESCE(v_xp_row.map_xp_progress, 0),
    'free_buzz_credit', COALESCE(v_credits_row.free_buzz_credit, 0),
    'free_buzz_map_credit', COALESCE(v_credits_row.free_buzz_map_credit, 0),
    'next_buzz_reward', 100 - COALESCE(v_xp_row.buzz_xp_progress, 0),
    'next_map_reward', 250 - COALESCE(v_xp_row.map_xp_progress, 0)
  );
  
  RETURN v_result;
END;
$$;

-- Create consume_credit RPC function
CREATE OR REPLACE FUNCTION public.consume_credit(
  p_user_id UUID,
  p_credit_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits_available INTEGER;
BEGIN
  -- Check available credits
  IF p_credit_type = 'buzz' THEN
    SELECT free_buzz_credit INTO v_credits_available
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    IF v_credits_available > 0 THEN
      UPDATE public.user_credits
      SET free_buzz_credit = free_buzz_credit - 1
      WHERE user_id = p_user_id;
      RETURN TRUE;
    END IF;
  ELSIF p_credit_type = 'buzz_map' THEN
    SELECT free_buzz_map_credit INTO v_credits_available
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    IF v_credits_available > 0 THEN
      UPDATE public.user_credits
      SET free_buzz_map_credit = free_buzz_map_credit - 1
      WHERE user_id = p_user_id;
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;