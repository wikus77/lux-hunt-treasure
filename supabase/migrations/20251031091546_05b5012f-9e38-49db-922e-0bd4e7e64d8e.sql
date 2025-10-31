-- Integrazione award_xp → award_pulse_energy (mantieni entrambi sincronizzati)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_xp_amount integer, p_source text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_xp INTEGER;
  v_new_total_xp INTEGER;
  v_buzz_progress INTEGER;
  v_map_progress INTEGER;
BEGIN
  -- Get current XP status
  SELECT 
    COALESCE(total_xp, 0),
    COALESCE(buzz_xp_progress, 0),
    COALESCE(map_xp_progress, 0)
  INTO v_current_xp, v_buzz_progress, v_map_progress
  FROM public.user_xp
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist in user_xp, create entry
  IF NOT FOUND THEN
    INSERT INTO public.user_xp (user_id, total_xp, buzz_xp_progress, map_xp_progress)
    VALUES (p_user_id, 0, 0, 0);
    v_current_xp := 0;
    v_buzz_progress := 0;
    v_map_progress := 0;
  END IF;
  
  -- Calculate new totals
  v_new_total_xp := v_current_xp + p_xp_amount;
  
  -- Update based on source
  IF p_source = 'buzz' THEN
    v_buzz_progress := v_buzz_progress + p_xp_amount;
  ELSIF p_source = 'buzz_map' THEN
    v_map_progress := v_map_progress + p_xp_amount;
  ELSIF p_source IN ('daily_checkin', 'weekly_podium', 'mission_complete') THEN
    -- These sources add to both progress bars
    v_buzz_progress := v_buzz_progress + p_xp_amount;
    v_map_progress := v_map_progress + p_xp_amount;
  END IF;
  
  -- Check if user earned free buzz credit (every 100 XP)
  IF v_buzz_progress >= 100 THEN
    -- Award free buzz credits
    INSERT INTO public.user_credits (user_id, free_buzz_credit)
    VALUES (p_user_id, v_buzz_progress / 100)
    ON CONFLICT (user_id) DO UPDATE
    SET free_buzz_credit = user_credits.free_buzz_credit + (v_buzz_progress / 100);
    
    -- Reset progress, keeping remainder
    v_buzz_progress := v_buzz_progress % 100;
  END IF;
  
  -- Check if user earned free buzz map credit (every 250 XP)
  IF v_map_progress >= 250 THEN
    -- Award free buzz map credits
    INSERT INTO public.user_credits (user_id, free_buzz_map_credit)
    VALUES (p_user_id, v_map_progress / 250)
    ON CONFLICT (user_id) DO UPDATE
    SET free_buzz_map_credit = user_credits.free_buzz_map_credit + (v_map_progress / 250);
    
    -- Reset progress, keeping remainder
    v_map_progress := v_map_progress % 250;
  END IF;
  
  -- Update user_xp
  UPDATE public.user_xp
  SET 
    total_xp = v_new_total_xp,
    buzz_xp_progress = v_buzz_progress,
    map_xp_progress = v_map_progress,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 🆕 SYNC PULSE ENERGY + RANK (Bridge XP→PE)
  PERFORM award_pulse_energy(p_user_id, p_xp_amount, p_source, jsonb_build_object('xp_sync', true));
  
  -- Log XP transaction
  INSERT INTO public.xp_transactions (user_id, xp_amount, source, description)
  VALUES (p_user_id, p_xp_amount, p_source, 'XP awarded via ' || p_source);
END;
$function$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™