-- SECURITY FIX: Recreate view with correct column names
DROP VIEW IF EXISTS public.buzz_map_markers;

-- Create secure view using correct columns from qr_buzz_codes
CREATE VIEW public.buzz_map_markers AS
SELECT 
  id,
  location_name as title,
  lat as latitude,
  lng as longitude,
  (NOT is_used) as active
FROM public.qr_buzz_codes 
WHERE NOT is_used;

-- Add secure admin check function with proper search path
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;

-- Fix Function Search Path for generate_qr_code
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix Function Search Path for generate_agent_code
CREATE OR REPLACE FUNCTION public.generate_agent_code()
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
    -- Generate AG-XXXX format with random alphanumeric
    new_code := 'AG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if code exists in either table
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE agent_code = new_code
      UNION
      SELECT 1 FROM public.pre_registered_users WHERE agent_code = new_code
    ) INTO code_exists;
    
    -- If unique, return the code
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$function$;