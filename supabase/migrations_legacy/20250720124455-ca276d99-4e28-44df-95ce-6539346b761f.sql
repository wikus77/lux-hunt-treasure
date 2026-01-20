-- Fix submit_final_shot function to handle user_id correctly and improve error handling
CREATE OR REPLACE FUNCTION public.submit_final_shot(p_mission_id uuid, p_latitude double precision, p_longitude double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  attempt_count INTEGER;
  last_attempt_time TIMESTAMP WITH TIME ZONE;
  rules RECORD;
  target RECORD;
  distance_m DOUBLE PRECISION;
  direction_str TEXT;
  is_winner_check BOOLEAN := FALSE;
  result JSONB;
  can_attempt_today BOOLEAN;
  daily_attempts INTEGER;
BEGIN
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not authenticated');
  END IF;

  -- Get rules for this mission
  SELECT * INTO rules FROM public.final_shot_rules WHERE mission_id = p_mission_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Mission rules not found');
  END IF;
  
  -- Check total attempt count (max 5)
  SELECT COUNT(*), MAX(created_at) INTO attempt_count, last_attempt_time
  FROM public.final_shots 
  WHERE user_id = current_user_id AND mission_id = p_mission_id;
  
  IF attempt_count >= 5 THEN
    RETURN jsonb_build_object('error', 'Maximum attempts reached (5 total)');
  END IF;
  
  -- Check daily limit (max 2 per day) using direct query instead of function
  SELECT COALESCE(attempts_count, 0) INTO daily_attempts
  FROM public.daily_final_shot_limits
  WHERE user_id = current_user_id 
    AND mission_id = p_mission_id 
    AND attempt_date = CURRENT_DATE;
  
  IF COALESCE(daily_attempts, 0) >= 2 THEN
    RETURN jsonb_build_object('error', 'Daily limit reached (2 attempts per day)');
  END IF;
  
  -- Check cooldown (12h between attempts)
  IF last_attempt_time IS NOT NULL AND 
     last_attempt_time + (rules.cooldown_hours || ' hours')::INTERVAL > now() THEN
    RETURN jsonb_build_object('error', 'Cooldown period active (12h between attempts)');
  END IF;
  
  -- Get target coordinates
  SELECT * INTO target FROM public.mission_targets WHERE mission_id = p_mission_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Mission target not found');
  END IF;
  
  -- Calculate distance
  distance_m := public.calculate_distance_meters(p_latitude, p_longitude, target.latitude, target.longitude);
  direction_str := public.calculate_direction(p_latitude, p_longitude, target.latitude, target.longitude);
  
  -- Check if winner (within 5 meters tolerance)
  IF distance_m <= 5.0 THEN
    -- Check if no one has won yet
    SELECT COUNT(*) INTO attempt_count FROM public.final_shots 
    WHERE mission_id = p_mission_id AND is_winner = true;
    
    IF attempt_count = 0 THEN
      is_winner_check := TRUE;
      -- Reveal target
      UPDATE public.mission_targets 
      SET is_revealed = true 
      WHERE mission_id = p_mission_id;
    END IF;
  END IF;
  
  -- Increment daily counter directly
  INSERT INTO public.daily_final_shot_limits (user_id, mission_id, attempt_date, attempts_count)
  VALUES (current_user_id, p_mission_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, mission_id, attempt_date)
  DO UPDATE SET 
    attempts_count = daily_final_shot_limits.attempts_count + 1,
    updated_at = now();
  
  -- Insert final shot record
  INSERT INTO public.final_shots (
    user_id, mission_id, latitude, longitude, 
    distance_meters, is_winner, attempt_number,
    feedback_distance, feedback_direction
  ) VALUES (
    current_user_id, p_mission_id, p_latitude, p_longitude,
    distance_m, is_winner_check, attempt_count + 1,
    distance_m, direction_str
  );
  
  -- Build result
  result := jsonb_build_object(
    'success', true,
    'is_winner', is_winner_check,
    'distance_meters', distance_m,
    'direction', direction_str,
    'attempt_number', attempt_count + 1,
    'max_attempts', 5
  );
  
  IF is_winner_check THEN
    result := result || jsonb_build_object(
      'target_coordinates', jsonb_build_object('lat', target.latitude, 'lng', target.longitude)
    );
  END IF;
  
  RETURN result;
END;
$function$;