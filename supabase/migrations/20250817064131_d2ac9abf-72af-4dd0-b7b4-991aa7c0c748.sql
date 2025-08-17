-- Security Enhancement Phase 3: Final database function security hardening
-- Complete all remaining function search path settings

-- Fix ensure_single_active_target trigger function
CREATE OR REPLACE FUNCTION public.ensure_single_active_target()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.buzz_game_targets 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix assign_agent_code_on_insert trigger function
CREATE OR REPLACE FUNCTION public.assign_agent_code_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.agent_code IS NULL THEN
    NEW.agent_code := public.generate_agent_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_access_date_on_plan_change function
CREATE OR REPLACE FUNCTION public.update_access_date_on_plan_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Se il piano è cambiato, ricalcola access_start_date
  IF OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan THEN
    NEW.access_start_date := public.calculate_access_start_date(NEW.subscription_plan);
    
    -- Se è un piano premium, abilita l'accesso anticipato
    IF NEW.subscription_plan IN ('SILVER', 'GOLD', 'BLACK', 'TITANIUM') THEN
      NEW.access_enabled := true;
      NEW.status := 'premium_access_enabled';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;