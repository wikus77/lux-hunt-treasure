-- Security Enhancement Phase 4: Final 3 function fixes for search_path
-- Complete the security hardening by fixing the last missing functions

-- Fix execute_sql function (if it exists and is used)
-- Note: This function should ideally be removed for security, but fixing search path first
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY WARNING: This function should be removed in production
  -- Only keeping for compatibility with existing code
  RAISE EXCEPTION 'execute_sql function disabled for security reasons';
END;
$function$;

-- Fix handle_buzz_map_xp trigger function
CREATE OR REPLACE FUNCTION public.handle_buzz_map_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Award 10 XP for buzz map action with progress tracking
  PERFORM public.award_xp(NEW.user_id, 10, 'buzz_map');
  RETURN NEW;
END;
$function$;

-- Fix handle_buzz_xp trigger function
CREATE OR REPLACE FUNCTION public.handle_buzz_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Award 15 XP for buzz action with progress tracking
  PERFORM public.award_xp(NEW.user_id, 15, 'buzz');
  RETURN NEW;
END;
$function$;