-- Update final_shot_rules to support 5 attempts and 2 per day limits
UPDATE public.final_shot_rules 
SET max_attempts = 5 
WHERE max_attempts = 3;

-- Create table for daily attempt tracking
CREATE TABLE IF NOT EXISTS public.daily_final_shot_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL,
  attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id, attempt_date)
);

-- Enable RLS
ALTER TABLE public.daily_final_shot_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for daily limits
CREATE POLICY "Users can view their own daily limits" 
ON public.daily_final_shot_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily limits" 
ON public.daily_final_shot_limits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily limits" 
ON public.daily_final_shot_limits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to check daily limits (max 2 per day)
CREATE OR REPLACE FUNCTION public.check_daily_final_shot_limit(p_user_id uuid, p_mission_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  daily_attempts INTEGER;
BEGIN
  -- Get attempts for today
  SELECT COALESCE(attempts_count, 0) INTO daily_attempts
  FROM public.daily_final_shot_limits
  WHERE user_id = p_user_id 
    AND mission_id = p_mission_id 
    AND attempt_date = CURRENT_DATE;
  
  -- Return true if user can still attempt (less than 2 attempts today)
  RETURN COALESCE(daily_attempts, 0) < 2;
END;
$$;

-- Create function to increment daily counter
CREATE OR REPLACE FUNCTION public.increment_daily_final_shot_counter(p_user_id uuid, p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_final_shot_limits (user_id, mission_id, attempt_date, attempts_count)
  VALUES (p_user_id, p_mission_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, mission_id, attempt_date)
  DO UPDATE SET 
    attempts_count = daily_final_shot_limits.attempts_count + 1,
    updated_at = now();
END;
$$;

-- Update submit_final_shot function to include daily limits check
CREATE OR REPLACE FUNCTION public.submit_final_shot(p_mission_id uuid, p_latitude double precision, p_longitude double precision)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
BEGIN
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
  
  -- Check daily limit (max 2 per day)
  SELECT public.check_daily_final_shot_limit(current_user_id, p_mission_id) INTO can_attempt_today;
  IF NOT can_attempt_today THEN
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
  
  -- Increment daily counter
  PERFORM public.increment_daily_final_shot_counter(current_user_id, p_mission_id);
  
  -- Insert final shot record
  INSERT INTO public.final_shots (
    user_id, mission_id, latitude, longitude, 
    distance_meters, is_winner, attempt_number,
    feedback_distance, feedback_direction
  ) VALUES (
    current_user_id, p_mission_id, p_latitude, p_longitude,
    distance_m, is_winner_check, (SELECT COUNT(*) FROM public.final_shots WHERE user_id = current_user_id AND mission_id = p_mission_id) + 1,
    distance_m, direction_str
  );
  
  -- Build result
  result := jsonb_build_object(
    'success', true,
    'is_winner', is_winner_check,
    'distance_meters', distance_m,
    'direction', direction_str,
    'attempt_number', (SELECT COUNT(*) FROM public.final_shots WHERE user_id = current_user_id AND mission_id = p_mission_id),
    'max_attempts', 5
  );
  
  IF is_winner_check THEN
    result := result || jsonb_build_object(
      'target_coordinates', jsonb_build_object('lat', target.latitude, 'lng', target.longitude)
    );
  END IF;
  
  RETURN result;
END;
$$;