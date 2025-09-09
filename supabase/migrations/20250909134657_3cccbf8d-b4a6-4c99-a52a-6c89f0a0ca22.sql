-- Fix Remaining Security Issues - M1SSION™ Database Hardening Phase 2
-- Complete fix for all remaining functions with search_path issues

-- Get the list of remaining functions and fix them
-- Based on the security linter, we still have functions without proper search_path

-- Check and fix any views with SECURITY DEFINER
-- First, let's identify views with SECURITY DEFINER (this is typically the issue)
-- We'll convert them to SECURITY INVOKER or add proper RLS

-- Fix any remaining functions that might not have been covered
-- Let's ensure all public functions have proper search_path

-- Function: get_user_roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
 RETURNS TABLE(role text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$function$;

-- Function: generate_qr_code
CREATE OR REPLACE FUNCTION public.generate_qr_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Function: set_push_endpoint_type
CREATE OR REPLACE FUNCTION public.set_push_endpoint_type()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.endpoint LIKE 'https://web.push.apple.com/%' THEN 
    NEW.endpoint_type := 'apns';
  ELSIF NEW.endpoint LIKE 'https://fcm.googleapis.com/%' OR NEW.endpoint LIKE 'https://fcm.googleapis.com/wp/%' THEN 
    NEW.endpoint_type := 'fcm';
  ELSE 
    NEW.endpoint_type := COALESCE(NEW.endpoint_type, 'unknown');
  END IF;
  RETURN NEW;
END; 
$function$;

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND user_roles.role = $2
    );
$function$;

-- Function: upsert_fcm_subscription
CREATE OR REPLACE FUNCTION public.upsert_fcm_subscription(p_user_id uuid, p_token text, p_platform text, p_device_info jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  result_record RECORD;
BEGIN
  -- Validazione base - no pattern troppo rigidi
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id è richiesto');
  END IF;
  
  IF p_token IS NULL OR length(trim(p_token)) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'token deve essere almeno 10 caratteri');
  END IF;
  
  -- Normalizza platform - accetta più valori
  p_platform := lower(trim(coalesce(p_platform, 'web')));
  IF p_platform NOT IN ('ios', 'android', 'desktop', 'web', 'unknown') THEN
    p_platform := 'web';
  END IF;
  
  -- Upsert semplice senza validazioni pattern
  INSERT INTO public.fcm_subscriptions (user_id, token, platform, device_info, is_active, created_at, updated_at)
  VALUES (p_user_id, p_token, p_platform, COALESCE(p_device_info, '{}'::jsonb), true, now(), now())
  ON CONFLICT (token) 
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    platform = EXCLUDED.platform,
    device_info = EXCLUDED.device_info,
    is_active = true,
    updated_at = now()
  RETURNING * INTO result_record;
  
  RETURN jsonb_build_object(
    'success', true, 
    'id', result_record.id,
    'token_prefix', left(result_record.token, 30) || '...',
    'platform', result_record.platform,
    'created_at', result_record.created_at,
    'message', 'Token salvato con successo'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'sqlstate', SQLSTATE,
    'detail', CASE 
      WHEN SQLSTATE = '23505' THEN 'Token già esistente - aggiornato'
      WHEN SQLSTATE = '23502' THEN 'Campo obbligatorio mancante'
      WHEN SQLSTATE = '23514' THEN 'Errore validazione: ' || SQLERRM
      ELSE 'Errore database: ' || SQLERRM
    END
  );
END;
$function$;