-- WARNING FIXES: Function Search Path Multiple
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Fix all database functions with secure search_path

-- 1. sync_subscription_tier
CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Aggiorna il tier nel profilo quando cambia la subscription
  UPDATE public.profiles 
  SET 
    subscription_tier = NEW.tier,
    tier = NEW.tier,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- 2. reset_user_mission
CREATE OR REPLACE FUNCTION public.reset_user_mission(user_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserisci o aggiorna lo stato della missione per l'utente
  INSERT INTO public.user_mission_status (
    user_id,
    clues_found,
    mission_progress_percent,
    mission_started_at,
    mission_days_remaining,
    buzz_counter,
    map_radius_km,
    map_area_generated,
    updated_at
  ) VALUES (
    user_id_input,
    0,
    0,
    NOW(),
    30,
    0,
    NULL,
    FALSE,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    clues_found = 0,
    mission_progress_percent = 0,
    mission_started_at = NOW(),
    mission_days_remaining = 30,
    buzz_counter = 0,
    map_radius_km = NULL,
    map_area_generated = FALSE,
    updated_at = NOW();
END;
$function$;

-- 3. get_active_subscription
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id uuid)
 RETURNS TABLE(tier text, status text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.tier,
    s.status,
    s.current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Se non trova subscription attiva, ritorna Base
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'Base'::TEXT, 'active'::TEXT, NULL::TIMESTAMPTZ;
  END IF;
END;
$function$;

-- 4. validate_buzz_user_id
CREATE OR REPLACE FUNCTION public.validate_buzz_user_id(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Allow developer fallback UUID
  IF p_user_id = '00000000-0000-4000-a000-000000000000'::uuid THEN
    RETURN true;
  END IF;
  
  -- Check if user exists in auth.users
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id);
END;
$function$;

-- 5. can_user_use_buzz
CREATE OR REPLACE FUNCTION public.can_user_use_buzz(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_week INTEGER;
  current_year INTEGER;
  user_allowance RECORD;
BEGIN
  -- Get current week and year
  SELECT week_num, year_num INTO current_week, current_year 
  FROM public.get_current_week_and_year();
  
  -- Get user's weekly allowance
  SELECT * INTO user_allowance
  FROM public.weekly_buzz_allowances
  WHERE user_id = p_user_id 
    AND week_number = current_week 
    AND year = current_year;
  
  -- If no allowance record exists, user can't use buzz
  IF user_allowance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has remaining buzz uses
  RETURN user_allowance.used_buzz_count < user_allowance.max_buzz_count;
END;
$function$;

-- 6. get_my_agent_code
CREATE OR REPLACE FUNCTION public.get_my_agent_code()
 RETURNS TABLE(agent_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT p.agent_code
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$function$;

-- 7. get_user_by_email
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_param text)
 RETURNS SETOF auth.users
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'auth'
AS $function$
  SELECT * FROM auth.users WHERE email = email_param LIMIT 1;
$function$;

-- 8. consume_buzz_usage
CREATE OR REPLACE FUNCTION public.consume_buzz_usage(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_week INTEGER;
  current_year INTEGER;
  updated_rows INTEGER;
BEGIN
  -- Get current week and year
  SELECT week_num, year_num INTO current_week, current_year 
  FROM public.get_current_week_and_year();
  
  -- Update used buzz count if within limits
  UPDATE public.weekly_buzz_allowances
  SET used_buzz_count = used_buzz_count + 1
  WHERE user_id = p_user_id 
    AND week_number = current_week 
    AND year = current_year
    AND used_buzz_count < max_buzz_count;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$function$;

-- 9. assign_area_radius
CREATE OR REPLACE FUNCTION public.assign_area_radius(p_mission_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_count INTEGER;
    calculated_radius INTEGER;
    mission_scope TEXT;
BEGIN
    -- Conta utenti registrati per questa missione
    SELECT COUNT(*) INTO user_count
    FROM public.user_mission_registrations
    WHERE mission_id = p_mission_id AND status = 'active';
    
    -- Ottieni scope della missione
    SELECT scope INTO mission_scope
    FROM public.monthly_missions
    WHERE id = p_mission_id;
    
    -- Calcola radius in base alle regole specificate
    IF mission_scope = 'local' OR mission_scope = 'italia' THEN
        calculated_radius := 500;
    ELSIF mission_scope = 'continental' OR mission_scope = 'europa' THEN
        calculated_radius := CASE 
            WHEN user_count < 5000 THEN 800
            WHEN user_count < 20000 THEN 1000
            ELSE 1200
        END;
    ELSE -- missione globale
        calculated_radius := CASE 
            WHEN user_count < 10000 THEN 1500
            WHEN user_count < 100000 THEN 2000
            ELSE 2500
        END;
    END IF;
    
    -- Aggiorna la missione con il radius calcolato
    UPDATE public.monthly_missions
    SET area_radius_km = calculated_radius,
        updated_at = now()
    WHERE id = p_mission_id;
    
    -- Log dell'operazione nel panel
    INSERT INTO public.panel_logs (
        event_type, 
        mission_id, 
        user_count, 
        area_radius_assigned,
        details
    ) VALUES (
        'area_radius_assigned',
        p_mission_id,
        user_count,
        calculated_radius,
        jsonb_build_object(
            'scope', mission_scope,
            'calculation_time', now(),
            'user_count', user_count,
            'radius_km', calculated_radius,
            'logic_version', '1.0'
        )
    );
    
    RETURN calculated_radius;
END;
$function$;

-- 10. register_user_to_active_mission
CREATE OR REPLACE FUNCTION public.register_user_to_active_mission(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    active_mission_id UUID;
    registration_success BOOLEAN := FALSE;
BEGIN
    -- Trova la missione attiva più recente
    SELECT id INTO active_mission_id
    FROM public.monthly_missions
    WHERE status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF active_mission_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Registra l'utente (ignora se già registrato)
    INSERT INTO public.user_mission_registrations (user_id, mission_id)
    VALUES (p_user_id, active_mission_id)
    ON CONFLICT (user_id, mission_id) DO NOTHING;
    
    -- Verifica se la registrazione è avvenuta
    IF FOUND THEN
        registration_success := TRUE;
        
        -- Ricalcola il radius se necessario (ogni 100 nuove registrazioni)
        IF (SELECT COUNT(*) FROM public.user_mission_registrations WHERE mission_id = active_mission_id) % 100 = 0 THEN
            PERFORM public.assign_area_radius(active_mission_id);
        END IF;
    END IF;
    
    RETURN registration_success;
END;
$function$;

-- 11. can_use_intelligence_tool
CREATE OR REPLACE FUNCTION public.can_use_intelligence_tool(p_user_id uuid, p_mission_id uuid, p_tool_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  mission_start_date DATE;
  current_week INTEGER;
  tool_week_requirement INTEGER;
  daily_usage_count INTEGER;
BEGIN
  -- Get mission start date
  SELECT start_date::DATE INTO mission_start_date
  FROM public.monthly_missions
  WHERE id = p_mission_id AND status = 'active';
  
  -- If no active mission, deny access
  IF mission_start_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate current week (starting from 1)
  current_week := GREATEST(1, CEIL((CURRENT_DATE - mission_start_date) / 7.0));
  
  -- Set week requirements for each tool
  CASE p_tool_name
    WHEN 'radar' THEN tool_week_requirement := 3;
    WHEN 'interceptor' THEN tool_week_requirement := 4;
    WHEN 'precision' THEN tool_week_requirement := 5;
    ELSE tool_week_requirement := 999; -- Invalid tool
  END CASE;
  
  -- Check if current week meets requirement
  IF current_week < tool_week_requirement THEN
    RETURN FALSE;
  END IF;
  
  -- Check daily usage limit (1 per day per tool)
  SELECT COUNT(*) INTO daily_usage_count
  FROM public.intelligence_tool_usage
  WHERE user_id = p_user_id
    AND mission_id = p_mission_id
    AND tool_name = p_tool_name
    AND used_on = CURRENT_DATE;
  
  -- Allow if not used today
  RETURN daily_usage_count = 0;
END;
$function$;

-- 12. record_intelligence_tool_usage
CREATE OR REPLACE FUNCTION public.record_intelligence_tool_usage(p_user_id uuid, p_mission_id uuid, p_tool_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user can use the tool
  IF NOT public.can_use_intelligence_tool(p_user_id, p_mission_id, p_tool_name) THEN
    RETURN FALSE;
  END IF;
  
  -- Record the usage
  INSERT INTO public.intelligence_tool_usage (user_id, mission_id, tool_name)
  VALUES (p_user_id, p_mission_id, p_tool_name)
  ON CONFLICT (user_id, mission_id, tool_name, used_on) DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

-- 13. release_clue_lines
CREATE OR REPLACE FUNCTION public.release_clue_lines(p_user_id uuid, p_plan_level text, p_week_number integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lines_to_release INTEGER;
  released_count INTEGER;
BEGIN
  -- Determine lines to release based on plan
  CASE p_plan_level
    WHEN 'free' THEN lines_to_release := 1;
    WHEN 'silver' THEN lines_to_release := 3;
    WHEN 'gold' THEN lines_to_release := 5;
    WHEN 'black' THEN lines_to_release := 10;
    WHEN 'titanium' THEN lines_to_release := 9999; -- All lines
    ELSE lines_to_release := 1; -- Default to free
  END CASE;
  
  -- Update clue lines to released status
  UPDATE public.user_clue_lines
  SET is_released = true, updated_at = now()
  WHERE user_id = p_user_id
    AND week_number = p_week_number
    AND is_released = false
    AND id IN (
      SELECT id FROM public.user_clue_lines
      WHERE user_id = p_user_id
        AND week_number = p_week_number
        AND is_released = false
      ORDER BY clue_index
      LIMIT lines_to_release
    );
  
  GET DIAGNOSTICS released_count = ROW_COUNT;
  
  RETURN released_count;
END;
$function$;

-- 14. validate_progressive_pricing
CREATE OR REPLACE FUNCTION public.validate_progressive_pricing(p_user_id uuid, p_price numeric, p_radius numeric, p_generation integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  expected_price numeric;
  expected_radius numeric;
  price_table numeric[][] := ARRAY[
    [0, 500, 4.99], [1, 450, 6.99], [2, 405, 8.99], [3, 365, 10.99], [4, 329, 12.99],
    [5, 295, 14.99], [6, 265, 16.99], [7, 240, 19.99], [8, 216, 21.99], [9, 195, 25.99],
    [10, 175, 29.99], [11, 155, 29.99], [12, 140, 29.99], [13, 126, 29.99], [14, 113, 29.99],
    [15, 102, 29.99], [16, 92, 44.99], [17, 83, 67.99], [18, 75, 101.99], [19, 67, 152.99],
    [20, 60, 229.99], [21, 54, 344.99], [22, 49, 517.99], [23, 44, 776.99], [24, 39, 1165.99],
    [25, 35, 1748.99], [26, 31, 2622.99], [27, 28, 2622.99], [28, 25, 2622.99], [29, 23, 2622.99],
    [30, 20, 2622.99], [31, 18, 2622.99], [32, 16, 2622.99], [33, 14.5, 2622.99], [34, 13.1, 2622.99],
    [35, 11.8, 3933.99], [36, 10.6, 3933.99], [37, 9.5, 4999.00], [38, 8.6, 4999.00],
    [39, 7.7, 4999.00], [40, 6.9, 4999.00], [41, 5, 4999.00]
  ];
  max_generation INTEGER := 41;
  actual_generation INTEGER;
BEGIN
  -- Use the smaller of provided generation or max generation
  actual_generation := LEAST(p_generation, max_generation);
  
  -- Get expected values from price table (generation + 1 because array is 1-indexed)
  expected_radius := price_table[actual_generation + 1][2];
  expected_price := price_table[actual_generation + 1][3];
  
  -- Validate with small tolerance for floating point precision
  RETURN (ABS(p_price - expected_price) < 0.01) AND (ABS(p_radius - expected_radius) < 1);
END;
$function$;

-- 15. submit_final_shot
CREATE OR REPLACE FUNCTION public.submit_final_shot(p_mission_id uuid, p_latitude double precision, p_longitude double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
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

-- 16. check_daily_final_shot_limit
CREATE OR REPLACE FUNCTION public.check_daily_final_shot_limit(p_user_id uuid, p_mission_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 17. increment_daily_final_shot_counter
CREATE OR REPLACE FUNCTION public.increment_daily_final_shot_counter(p_user_id uuid, p_mission_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.daily_final_shot_limits (user_id, mission_id, attempt_date, attempts_count)
  VALUES (p_user_id, p_mission_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, mission_id, attempt_date)
  DO UPDATE SET 
    attempts_count = daily_final_shot_limits.attempts_count + 1,
    updated_at = now();
END;
$function$;

-- 18. process_stripe_webhook_completed
CREATE OR REPLACE FUNCTION public.process_stripe_webhook_completed(p_session_id text, p_stripe_customer_id text, p_payment_status text, p_amount_total integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  session_record RECORD;
  subscription_id UUID;
BEGIN
  -- Trova la sessione checkout
  SELECT * INTO session_record
  FROM public.checkout_sessions
  WHERE session_id = p_session_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Aggiorna stato sessione
  UPDATE public.checkout_sessions
  SET 
    status = 'completed',
    payment_status = p_payment_status,
    stripe_customer_id = p_stripe_customer_id,
    amount_total = p_amount_total,
    completed_at = now(),
    updated_at = now()
  WHERE session_id = p_session_id;
  
  -- Crea o aggiorna subscription
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    stripe_customer_id,
    stripe_subscription_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  ) VALUES (
    session_record.user_id,
    session_record.tier,
    p_stripe_customer_id,
    p_session_id, -- Usiamo session_id come fallback
    'active',
    now(),
    now() + INTERVAL '1 month',
    false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = session_record.tier,
    stripe_customer_id = p_stripe_customer_id,
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + INTERVAL '1 month',
    cancel_at_period_end = false,
    updated_at = now();
  
  -- Aggiorna profilo utente
  UPDATE public.profiles
  SET 
    subscription_tier = session_record.tier,
    tier = session_record.tier,
    updated_at = now()
  WHERE id = session_record.user_id;
  
  RETURN true;
END;
$function$;

-- 19. force_subscription_sync
CREATE OR REPLACE FUNCTION public.force_subscription_sync(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  active_sub RECORD;
  final_tier TEXT := 'Base';
BEGIN
  -- Get most recent active subscription
  SELECT * INTO active_sub
  FROM public.subscriptions
  WHERE user_id = p_user_id 
    AND status = 'active'
    AND (end_date IS NULL OR end_date > now())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Determine final tier
  IF active_sub.id IS NOT NULL THEN
    final_tier := active_sub.tier;
  END IF;
  
  -- Developer override
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id AND email = 'wikus77@hotmail.it') THEN
    final_tier := 'Titanium';
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    subscription_tier = final_tier,
    tier = final_tier,
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$function$;

-- 20. reset_user_mission_full
CREATE OR REPLACE FUNCTION public.reset_user_mission_full(user_id_input uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  reset_date TIMESTAMP WITH TIME ZONE := NOW();
  result jsonb;
BEGIN
  -- 1. Reset base mission (counters, radius, etc.) with NEW START DATE
  INSERT INTO public.user_mission_status (
    user_id,
    clues_found,
    mission_progress_percent,
    mission_started_at,
    mission_days_remaining,
    buzz_counter,
    map_radius_km,
    map_area_generated,
    updated_at
  ) VALUES (
    user_id_input,
    0,
    0,
    reset_date, -- 🔥 CRITICAL: Set to current date for proper countdown
    30,
    0,
    NULL,
    FALSE,
    reset_date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    clues_found = 0,
    mission_progress_percent = 0,
    mission_started_at = reset_date, -- 🔥 CRITICAL: Update to current date
    mission_days_remaining = 30,
    buzz_counter = 0,
    map_radius_km = NULL,
    map_area_generated = FALSE,
    updated_at = reset_date;
  
  -- 2. Delete all user clues found
  DELETE FROM public.user_clues WHERE user_id = user_id_input;
  
  -- 3. Delete all user map areas generated
  DELETE FROM public.user_map_areas WHERE user_id = user_id_input;
  
  -- 4. Delete all BUZZ counters (daily and map)
  DELETE FROM public.user_buzz_counter WHERE user_id = user_id_input;
  DELETE FROM public.user_buzz_map_counter WHERE user_id = user_id_input;
  
  -- 5. Delete all notifications
  DELETE FROM public.user_notifications WHERE user_id = user_id_input;
  
  -- 6. Delete all final shot attempts
  DELETE FROM public.final_shots WHERE user_id = user_id_input;
  DELETE FROM public.daily_final_shot_limits WHERE user_id = user_id_input;
  
  -- 7. Delete all geo radar coordinates
  DELETE FROM public.geo_radar_coordinates WHERE user_id = user_id_input;
  
  -- 8. Delete all map click events
  DELETE FROM public.map_click_events WHERE user_id = user_id_input;
  
  -- 9. Delete all map points
  DELETE FROM public.map_points WHERE user_id = user_id_input;
  
  -- 10. Delete all intelligence tool usage
  DELETE FROM public.intelligence_tool_usage WHERE user_id = user_id_input;
  
  -- 11. Delete all buzz map actions
  DELETE FROM public.buzz_map_actions WHERE user_id = user_id_input;
  
  -- 12. Reset weekly buzz allowances (if exists)
  DELETE FROM public.weekly_buzz_allowances WHERE user_id = user_id_input;
  
  -- 13. Reset live activity state
  DELETE FROM public.live_activity_state WHERE user_id = user_id_input;
  
  -- Build success result
  result := jsonb_build_object(
    'success', true,
    'reset_date', reset_date,
    'mission_days_remaining', 30,
    'tables_reset', jsonb_build_array(
      'user_mission_status',
      'user_clues',
      'user_map_areas', 
      'user_buzz_counter',
      'user_buzz_map_counter',
      'user_notifications',
      'final_shots',
      'daily_final_shot_limits',
      'geo_radar_coordinates',
      'map_click_events',
      'map_points',
      'intelligence_tool_usage',
      'buzz_map_actions',
      'weekly_buzz_allowances',
      'live_activity_state'
    )
  );
  
  RETURN result;
END;
$function$;

-- 21. cleanup_duplicate_subscriptions
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_subscriptions()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  cleaned_count INTEGER := 0;
BEGIN
  -- For each user, keep only the most recent subscription of each tier
  WITH ranked_subs AS (
    SELECT 
      id,
      user_id,
      tier,
      status,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, tier 
        ORDER BY created_at DESC
      ) as rn,
      ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY 
          CASE WHEN status = 'active' THEN 1 ELSE 2 END,
          created_at DESC
      ) as global_rn
    FROM public.subscriptions
  ),
  to_cancel AS (
    SELECT id 
    FROM ranked_subs 
    WHERE rn > 1 OR (global_rn > 1 AND status = 'active')
  )
  UPDATE public.subscriptions 
  SET 
    status = 'canceled',
    updated_at = now()
  WHERE id IN (SELECT id FROM to_cancel)
    AND status != 'canceled';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  result := jsonb_build_object(
    'success', true,
    'duplicates_cleaned', cleaned_count,
    'timestamp', now()
  );
  
  -- Log cleanup action
  INSERT INTO public.panel_logs (event_type, details)
  VALUES ('aggressive_cleanup', result);
  
  RETURN result;
END;
$function$;

-- 22. force_user_to_base_tier
CREATE OR REPLACE FUNCTION public.force_user_to_base_tier(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  cleaned_subs INTEGER;
BEGIN
  -- Force cancel ALL subscriptions for user
  UPDATE public.subscriptions 
  SET 
    status = 'canceled',
    updated_at = now()
  WHERE user_id = p_user_id 
    AND status != 'canceled';
  
  GET DIAGNOSTICS cleaned_subs = ROW_COUNT;
  
  -- Force profile to Base (ignore developer override for this function)
  UPDATE public.profiles
  SET 
    subscription_tier = 'Base',
    tier = 'Base',
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Build result
  result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'subscriptions_canceled', cleaned_subs,
    'profile_reset', true,
    'timestamp', now()
  );
  
  -- Log the operation
  INSERT INTO public.panel_logs (event_type, details)
  VALUES ('force_base_tier', result);
  
  RETURN result;
END;
$function$;

-- 23. has_user_played_spin_today
CREATE OR REPLACE FUNCTION public.has_user_played_spin_today(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today_date TEXT;
BEGIN
  today_date := to_char(CURRENT_DATE, 'YYYY-MM-DD');
  
  RETURN EXISTS (
    SELECT 1 FROM public.daily_spin_logs
    WHERE user_id = p_user_id 
    AND date = today_date
  );
END;
$function$;

-- 24. check_abuse_limit
CREATE OR REPLACE FUNCTION public.check_abuse_limit(p_event_type text, p_user_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  event_count INTEGER;
BEGIN
  -- Conta gli eventi dello stesso tipo negli ultimi 30 secondi
  SELECT COUNT(*) INTO event_count
  FROM public.abuse_logs
  WHERE user_id = p_user_id
    AND event_type = p_event_type
    AND timestamp >= NOW() - INTERVAL '30 seconds';
  
  -- Restituisce true se superato il limite di 5 eventi
  RETURN event_count >= 5;
END;
$function$;

-- 25. log_potential_abuse
CREATE OR REPLACE FUNCTION public.log_potential_abuse(p_event_type text, p_user_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_abuse BOOLEAN;
  current_count INTEGER;
BEGIN
  -- Inserisci il log dell'evento
  INSERT INTO public.abuse_logs (user_id, event_type)
  VALUES (p_user_id, p_event_type);
  
  -- Verifica se è abuso
  SELECT public.check_abuse_limit(p_event_type, p_user_id) INTO is_abuse;
  
  -- Se è abuso, crea un alert
  IF is_abuse THEN
    -- Conta gli eventi attuali
    SELECT COUNT(*) INTO current_count
    FROM public.abuse_logs
    WHERE user_id = p_user_id
      AND event_type = p_event_type
      AND timestamp >= NOW() - INTERVAL '30 seconds';
    
    -- Inserisci alert solo se non esiste già uno recente
    INSERT INTO public.abuse_alerts (user_id, event_type, event_count)
    SELECT p_user_id, p_event_type, current_count
    WHERE NOT EXISTS (
      SELECT 1 FROM public.abuse_alerts
      WHERE user_id = p_user_id
        AND event_type = p_event_type
        AND alert_timestamp >= NOW() - INTERVAL '1 minute'
    );
  END IF;
  
  RETURN is_abuse;
END;
$function$;

-- 26. cleanup_old_abuse_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_abuse_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Rimuovi log più vecchi di 24 ore
  DELETE FROM public.abuse_logs
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Rimuovi alert più vecchi di 7 giorni
  DELETE FROM public.abuse_alerts
  WHERE alert_timestamp < NOW() - INTERVAL '7 days';
END;
$function$;