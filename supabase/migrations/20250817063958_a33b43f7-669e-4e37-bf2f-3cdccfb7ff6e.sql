-- Security Enhancement: Add explicit search_path to database functions
-- This prevents potential security issues from search_path manipulation

-- Fix generate_referral_code function
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

-- Fix ensure_referral_code trigger function
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

-- Fix update_user_plan_events_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_user_plan_events_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_checkout_sessions_updated_at trigger function
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

-- Fix update_current_mission_data_updated_at trigger function
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

-- Fix log_role_changes security definer function
CREATE OR REPLACE FUNCTION public.log_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Log to admin_logs table (existing, safe)
    INSERT INTO public.admin_logs (
      event_type,
      user_id,
      note,
      context
    ) VALUES (
      'role_changed',
      NEW.id,
      format('Role changed from %s to %s by %s', OLD.role, NEW.role, auth.uid()),
      'security_audit'
    );
  END IF;
  RETURN NEW;
END;
$function$;