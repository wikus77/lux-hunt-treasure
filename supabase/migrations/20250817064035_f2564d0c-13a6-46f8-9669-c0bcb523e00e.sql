-- Security Enhancement Phase 2: Fix remaining functions with missing search_path
-- Complete the security hardening by adding search_path to all remaining functions

-- Fix update_qr_discoveries_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_qr_discoveries_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix log_contact_access security definer function
CREATE OR REPLACE FUNCTION public.log_contact_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log contact form submissions for security monitoring
  INSERT INTO public.admin_logs (
    event_type,
    user_id,
    details
  ) VALUES (
    'contact_form_submitted',
    auth.uid(),
    jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'has_phone', NEW.phone IS NOT NULL,
      'subject', NEW.subject,
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$function$;

-- Fix log_qr_access_attempt security definer function
CREATE OR REPLACE FUNCTION public.log_qr_access_attempt()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log legitimate access for security monitoring
  INSERT INTO public.admin_logs (
    event_type,
    user_id,
    details
  ) VALUES (
    'qr_code_accessed',
    auth.uid(),
    jsonb_build_object(
      'qr_code_id', NEW.id,
      'code', NEW.code,
      'access_time', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
  RETURN NEW;
END;
$function$;

-- Fix trigger_assign_area_radius function
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

-- Fix prevent_agent_code_modification trigger function
CREATE OR REPLACE FUNCTION public.prevent_agent_code_modification()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.agent_code IS DISTINCT FROM NEW.agent_code THEN
    RAISE EXCEPTION 'Modifica di agent_code non consentita';
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix alert_if_x0197_used function
CREATE OR REPLACE FUNCTION public.alert_if_x0197_used()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.referral_code = 'CODE AG-X0197' AND NEW.email <> 'wikus77@hotmail.it' THEN
    RAISE EXCEPTION 'CODE AG-X0197 è riservato all''amministratore.';
  END IF;
  RETURN NEW;
END;
$function$;