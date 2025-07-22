-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix remaining security warnings: Add search_path to functions missing it

-- Fix calculate_direction function
CREATE OR REPLACE FUNCTION public.calculate_direction(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
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
  bearing := bearing - 360 * floor(bearing / 360); -- Fix: use floor division instead of modulo
  RETURN directions[floor((bearing + 22.5) / 45)::int % 8 + 1];
END;
$$;

-- Fix check_rate_limit function  
CREATE OR REPLACE FUNCTION public.check_rate_limit(ip_addr inet, api_endpoint text, max_requests integer DEFAULT 3, window_minutes integer DEFAULT 1)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $$
DECLARE
    current_count INTEGER;
    window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
    
    -- Clean old entries
    DELETE FROM public.api_rate_limits 
    WHERE window_start < window_start_time;
    
    -- Get current count for this IP and endpoint
    SELECT request_count INTO current_count
    FROM public.api_rate_limits
    WHERE ip_address = ip_addr 
    AND endpoint = api_endpoint
    AND window_start >= window_start_time;
    
    IF current_count IS NULL THEN
        -- First request in this window
        INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
        VALUES (ip_addr, api_endpoint, 1, now());
        RETURN TRUE;
    ELSIF current_count < max_requests THEN
        -- Update count
        UPDATE public.api_rate_limits 
        SET request_count = request_count + 1, last_request = now()
        WHERE ip_address = ip_addr AND endpoint = api_endpoint;
        RETURN TRUE;
    ELSE
        -- Rate limit exceeded
        RETURN FALSE;
    END IF;
END;
$$;

-- Fix setup_developer_user function - also make it SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.setup_developer_user(uid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path = 'public', 'auth'
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{developer}', 'true')
  WHERE id = uid;

  UPDATE public.profiles
  SET role = 'developer'
  WHERE id = uid;
END;
$$;