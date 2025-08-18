-- CRITICAL SECURITY FIX 1: Fix Security Definer View
-- Drop and recreate buzz_map_markers view with proper security
DROP VIEW IF EXISTS public.buzz_map_markers;

-- Create secure view without SECURITY DEFINER
CREATE VIEW public.buzz_map_markers AS
SELECT 
  id,
  title,
  latitude,
  longitude,
  active
FROM public.qr_buzz_codes 
WHERE active = true;

-- Enable RLS on the view's underlying table if not already enabled
ALTER TABLE public.qr_buzz_codes ENABLE ROW LEVEL SECURITY;

-- CRITICAL SECURITY FIX 2: Fix Function Search Path Mutable for generate_qr_code
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

-- CRITICAL SECURITY FIX 3: Fix Function Search Path for generate_agent_code
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

-- CRITICAL SECURITY FIX 4: Fix Function Search Path for generate_unique_agent_code
CREATE OR REPLACE FUNCTION public.generate_unique_agent_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    -- Genera codice nel formato AGT-XXXXX (5 cifre)
    new_code := 'AGT-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    -- Verifica se il codice esiste già
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE agent_code = new_code
    ) INTO code_exists;
    
    -- Incrementa tentativi per evitare loop infiniti
    attempts := attempts + 1;
    
    -- Se il codice è unico o abbiamo raggiunto il massimo dei tentativi, esci
    IF NOT code_exists OR attempts >= max_attempts THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$function$;

-- CRITICAL SECURITY FIX 5: Add missing RLS policies for qr_buzz_codes
CREATE POLICY "Public can view active QR codes" 
ON public.qr_buzz_codes 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admin can manage QR codes" 
ON public.qr_buzz_codes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create secure admin check function
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