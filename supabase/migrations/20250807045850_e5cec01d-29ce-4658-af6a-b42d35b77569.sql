-- Fix security warning: Function Search Path Mutable
-- Update functions with proper search_path setting

CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.qr_buzz_codes WHERE code = new_code) INTO code_exists;
    
    attempts := attempts + 1;
    
    -- If unique or too many attempts, return
    IF NOT code_exists OR attempts >= 50 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_qr_distance(
  lat1 DOUBLE PRECISION, 
  lng1 DOUBLE PRECISION, 
  lat2 DOUBLE PRECISION, 
  lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION 
LANGUAGE plpgsql 
IMMUTABLE
SET search_path = 'public'
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