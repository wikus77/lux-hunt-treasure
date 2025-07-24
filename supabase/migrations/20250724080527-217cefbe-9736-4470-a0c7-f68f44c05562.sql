-- Fix function search path security warnings
-- © 2025 Joseph MULÉ – M1SSION™ – Security Fix for Weekly BUZZ Functions

-- Fix get_current_game_week function
CREATE OR REPLACE FUNCTION public.get_current_game_week()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  game_start_date DATE := '2025-01-20'::DATE; -- Fixed start date for M1SSION™
  current_week INTEGER;
BEGIN
  -- Calculate weeks since game start (1-indexed)
  current_week := CEIL((CURRENT_DATE - game_start_date) / 7.0);
  
  -- Ensure we're in a valid range (1-4, cycle repeats)
  current_week := ((current_week - 1) % 4) + 1;
  
  RETURN current_week;
END;
$$;

-- Fix get_max_buzz_for_week function
CREATE OR REPLACE FUNCTION public.get_max_buzz_for_week(week_num INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  CASE week_num
    WHEN 1, 2, 3 THEN RETURN 10;
    WHEN 4 THEN RETURN 11;
    ELSE RETURN 10; -- Default
  END CASE;
END;
$$;

-- Fix get_week_start_date function
CREATE OR REPLACE FUNCTION public.get_week_start_date()
RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_day_of_week INTEGER;
  week_start DATE;
BEGIN
  -- Get day of week (1=Monday, 7=Sunday)
  current_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);
  -- Adjust for PostgreSQL DOW (0=Sunday)
  IF current_day_of_week = 0 THEN
    current_day_of_week := 7;
  END IF;
  
  -- Calculate Monday of current week
  week_start := CURRENT_DATE - (current_day_of_week - 1);
  
  RETURN week_start;
END;
$$;

-- Fix can_user_buzz_mappa function
CREATE OR REPLACE FUNCTION public.can_user_buzz_mappa(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  week_start DATE;
  current_week INTEGER;
  max_allowed INTEGER;
  user_record RECORD;
BEGIN
  -- Get current week info
  week_start := public.get_week_start_date();
  current_week := public.get_current_game_week();
  max_allowed := public.get_max_buzz_for_week(current_week);
  
  -- Get or create user's weekly record
  SELECT * INTO user_record
  FROM public.user_weekly_buzz_limits
  WHERE user_id = p_user_id AND week_start_date = week_start;
  
  -- If no record exists, user can buzz (first time this week)
  IF user_record IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has remaining buzzes
  RETURN user_record.buzz_map_count < max_allowed;
END;
$$;

-- Fix consume_buzz_mappa function
CREATE OR REPLACE FUNCTION public.consume_buzz_mappa(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  week_start DATE;
  current_week INTEGER;
  max_allowed INTEGER;
  next_reset TIMESTAMP WITH TIME ZONE;
  result JSONB;
BEGIN
  -- Get current week info
  week_start := public.get_week_start_date();
  current_week := public.get_current_game_week();
  max_allowed := public.get_max_buzz_for_week(current_week);
  
  -- Calculate next reset (next Monday at 00:00)
  next_reset := (week_start + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE;
  
  -- Insert or update user's weekly record
  INSERT INTO public.user_weekly_buzz_limits (
    user_id, week_start_date, week_number, buzz_map_count, 
    max_buzz_map_allowed, last_buzz_at, next_reset_at
  )
  VALUES (
    p_user_id, week_start, current_week, 1, 
    max_allowed, NOW(), next_reset
  )
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    buzz_map_count = user_weekly_buzz_limits.buzz_map_count + 1,
    last_buzz_at = NOW(),
    updated_at = NOW()
  RETURNING 
    buzz_map_count, 
    max_buzz_map_allowed,
    week_number,
    next_reset_at
  INTO result;
  
  -- Return status info
  RETURN jsonb_build_object(
    'success', TRUE,
    'buzz_count', (result->>'buzz_map_count')::INTEGER,
    'max_allowed', (result->>'max_buzz_map_allowed')::INTEGER,
    'week_number', (result->>'week_number')::INTEGER,
    'next_reset', result->>'next_reset_at',
    'remaining', (result->>'max_buzz_map_allowed')::INTEGER - (result->>'buzz_map_count')::INTEGER
  );
END;
$$;

-- Fix get_user_weekly_buzz_status function
CREATE OR REPLACE FUNCTION public.get_user_weekly_buzz_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  week_start DATE;
  current_week INTEGER;
  max_allowed INTEGER;
  user_record RECORD;
  next_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current week info
  week_start := public.get_week_start_date();
  current_week := public.get_current_game_week();
  max_allowed := public.get_max_buzz_for_week(current_week);
  next_reset := (week_start + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE;
  
  -- Get user's current weekly record
  SELECT * INTO user_record
  FROM public.user_weekly_buzz_limits
  WHERE user_id = p_user_id AND week_start_date = week_start;
  
  -- If no record, user hasn't used any buzzes this week
  IF user_record IS NULL THEN
    RETURN jsonb_build_object(
      'buzz_count', 0,
      'max_allowed', max_allowed,
      'week_number', current_week,
      'next_reset', next_reset,
      'remaining', max_allowed,
      'can_buzz', TRUE,
      'week_start', week_start
    );
  END IF;
  
  -- Return current status
  RETURN jsonb_build_object(
    'buzz_count', user_record.buzz_map_count,
    'max_allowed', user_record.max_buzz_map_allowed,
    'week_number', user_record.week_number,
    'next_reset', user_record.next_reset_at,
    'remaining', user_record.max_buzz_map_allowed - user_record.buzz_map_count,
    'can_buzz', user_record.buzz_map_count < user_record.max_buzz_map_allowed,
    'week_start', week_start,
    'last_buzz_at', user_record.last_buzz_at
  );
END;
$$;

-- Fix update_weekly_buzz_limits_updated_at function
CREATE OR REPLACE FUNCTION public.update_weekly_buzz_limits_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;