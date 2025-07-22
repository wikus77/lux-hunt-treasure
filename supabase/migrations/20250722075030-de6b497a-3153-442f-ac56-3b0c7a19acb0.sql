-- Fix remaining Function Search Path Multiple warnings
-- Update all remaining functions with proper search_path

-- 1. update_user_mission_status_updated_at
CREATE OR REPLACE FUNCTION public.update_user_mission_status_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. trigger_assign_area_radius
CREATE OR REPLACE FUNCTION public.trigger_assign_area_radius()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Quando una missione viene attivata e non ha ancora un radius
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') AND NEW.area_radius_km IS NULL THEN
        PERFORM public.assign_area_radius(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 3. update_monthly_missions_updated_at
CREATE OR REPLACE FUNCTION public.update_monthly_missions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 4. calculate_distance_meters
CREATE OR REPLACE FUNCTION public.calculate_distance_meters(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
 RETURNS double precision
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 5. is_ip_blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(ip_addr inet)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.blocked_ips 
        WHERE ip_address = ip_addr 
        AND unblock_at > now()
    );
END;
$function$;

-- 6. block_ip
CREATE OR REPLACE FUNCTION public.block_ip(ip_addr inet, block_duration_minutes integer DEFAULT 30, block_reason text DEFAULT 'rate_limit_exceeded'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.blocked_ips (ip_address, unblock_at, reason)
    VALUES (ip_addr, now() + (block_duration_minutes || ' minutes')::INTERVAL, block_reason)
    ON CONFLICT (ip_address) DO UPDATE SET
        unblock_at = now() + (block_duration_minutes || ' minutes')::INTERVAL,
        attempts = blocked_ips.attempts + 1,
        reason = block_reason;
END;
$function$;

-- 7. cleanup_security_tables
CREATE OR REPLACE FUNCTION public.cleanup_security_tables()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Remove expired IP blocks
    DELETE FROM public.blocked_ips WHERE unblock_at < now();
    
    -- Remove old rate limit entries (older than 1 hour)
    DELETE FROM public.api_rate_limits WHERE window_start < now() - INTERVAL '1 hour';
    
    -- Remove old admin logs (older than 30 days)
    DELETE FROM public.admin_logs WHERE created_at < now() - INTERVAL '30 days';
END;
$function$;

-- 8. update_current_mission_data_updated_at
CREATE OR REPLACE FUNCTION public.update_current_mission_data_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 9. update_checkout_sessions_updated_at
CREATE OR REPLACE FUNCTION public.update_checkout_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 10. generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Genera codice nel formato CODE AG-XXXX
    new_code := 'CODE AG-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verifica se il codice esiste già
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = new_code
    ) INTO code_exists;
    
    -- Se non esiste, lo restituisce
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$function$;

-- 11. ensure_referral_code
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- 12. update_scheduled_notifications_updated_at
CREATE OR REPLACE FUNCTION public.update_scheduled_notifications_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 13. get_user_role_safe
CREATE OR REPLACE FUNCTION public.get_user_role_safe(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use direct query to avoid recursion
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = p_user_id
    LIMIT 1
  );
END;
$function$;

-- 14. is_admin_email_safe
CREATE OR REPLACE FUNCTION public.is_admin_email_safe(p_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN p_email = 'wikus77@hotmail.it';
END;
$function$;

-- 15. get_current_user_profile_safe
CREATE OR REPLACE FUNCTION public.get_current_user_profile_safe()
 RETURNS TABLE(role text, email text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.role, u.email::text
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = auth.uid()
  LIMIT 1;
END;
$function$;

-- 16. get_authenticated_user_id
CREATE OR REPLACE FUNCTION public.get_authenticated_user_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN auth.uid();
END;
$function$;

-- 17. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user(new_user_id uuid, user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new_user_id, user_email)
  ON CONFLICT (id) DO NOTHING;
END;
$function$;

-- 18. update_user_subscription_tier
CREATE OR REPLACE FUNCTION public.update_user_subscription_tier(target_user_id uuid, new_tier text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.subscriptions
  SET tier = new_tier
  WHERE user_id = target_user_id;
END;
$function$;

-- 19. execute_sql
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  EXECUTE sql;
END;
$function$;

-- 20. increment_buzz_map_counter
CREATE OR REPLACE FUNCTION public.increment_buzz_map_counter(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert or update the counter for today
  INSERT INTO public.user_buzz_map_counter (user_id, date, buzz_map_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    buzz_map_count = user_buzz_map_counter.buzz_map_count + 1,
    updated_at = now()
  RETURNING buzz_map_count INTO new_count;
  
  RETURN new_count;
END;
$function$;