-- Create final_shots table for tracking user final shot attempts
CREATE TABLE IF NOT EXISTS public.final_shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  distance_meters DOUBLE PRECISION,
  is_winner BOOLEAN DEFAULT FALSE,
  attempt_number INTEGER DEFAULT 1,
  feedback_distance DOUBLE PRECISION,
  feedback_direction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mission_targets table for storing winning coordinates (hashed)
CREATE TABLE IF NOT EXISTS public.mission_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL UNIQUE,
  target_hash TEXT NOT NULL, -- SHA-256 hash of lat,lng
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create final_shot_rules table
CREATE TABLE IF NOT EXISTS public.final_shot_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  max_attempts INTEGER DEFAULT 3,
  cooldown_hours INTEGER DEFAULT 12,
  unlock_days_before_end INTEGER DEFAULT 7,
  tolerance_meters DOUBLE PRECISION DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.final_shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_shot_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for final_shots
CREATE POLICY "Users can view their own final shots" 
ON public.final_shots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own final shots" 
ON public.final_shots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all final shots" 
ON public.final_shots 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- RLS Policies for mission_targets
CREATE POLICY "Public can view revealed targets" 
ON public.mission_targets 
FOR SELECT 
USING (is_revealed = true);

CREATE POLICY "Admins can manage mission targets" 
ON public.mission_targets 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- RLS Policies for final_shot_rules  
CREATE POLICY "Public can view final shot rules" 
ON public.final_shot_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage final shot rules" 
ON public.final_shot_rules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Function to calculate distance between two coordinates
CREATE OR REPLACE FUNCTION public.calculate_distance_meters(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION, 
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
AS $$
DECLARE
  r DOUBLE PRECISION := 6371000; -- Earth radius in meters
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$;

-- Function to get direction between coordinates
CREATE OR REPLACE FUNCTION public.calculate_direction(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION, 
  lng2 DOUBLE PRECISION
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  dlng DOUBLE PRECISION;
  y DOUBLE PRECISION;
  x DOUBLE PRECISION;
  bearing DOUBLE PRECISION;
  directions TEXT[] := ARRAY['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
BEGIN
  dlng := radians(lng2 - lng1);
  y := sin(dlng) * cos(radians(lat2));
  x := cos(radians(lat1)) * sin(radians(lat2)) - sin(radians(lat1)) * cos(radians(lat2)) * cos(dlng);
  bearing := degrees(atan2(y, x));
  bearing := bearing + 360;
  bearing := bearing % 360;
  RETURN directions[floor((bearing + 22.5) / 45) % 8 + 1];
END;
$$;

-- Function to process final shot submission
CREATE OR REPLACE FUNCTION public.submit_final_shot(
  p_mission_id UUID,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION
) RETURNS JSONB
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
BEGIN
  -- Get rules for this mission
  SELECT * INTO rules FROM public.final_shot_rules WHERE mission_id = p_mission_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Mission rules not found');
  END IF;
  
  -- Check attempt count
  SELECT COUNT(*), MAX(created_at) INTO attempt_count, last_attempt_time
  FROM public.final_shots 
  WHERE user_id = current_user_id AND mission_id = p_mission_id;
  
  IF attempt_count >= rules.max_attempts THEN
    RETURN jsonb_build_object('error', 'Maximum attempts reached');
  END IF;
  
  -- Check cooldown
  IF last_attempt_time IS NOT NULL AND 
     last_attempt_time + (rules.cooldown_hours || ' hours')::INTERVAL > now() THEN
    RETURN jsonb_build_object('error', 'Cooldown period active');
  END IF;
  
  -- Get target coordinates
  SELECT * INTO target FROM public.mission_targets WHERE mission_id = p_mission_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Mission target not found');
  END IF;
  
  -- Calculate distance
  distance_m := public.calculate_distance_meters(p_latitude, p_longitude, target.latitude, target.longitude);
  direction_str := public.calculate_direction(p_latitude, p_longitude, target.latitude, target.longitude);
  
  -- Check if winner (first to get within tolerance)
  IF distance_m <= rules.tolerance_meters THEN
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
    'max_attempts', rules.max_attempts
  );
  
  IF is_winner_check THEN
    result := result || jsonb_build_object(
      'target_coordinates', jsonb_build_object('lat', target.latitude, 'lng', target.longitude)
    );
  END IF;
  
  RETURN result;
END;
$$;