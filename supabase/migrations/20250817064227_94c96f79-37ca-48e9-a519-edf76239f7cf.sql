-- Security Enhancement Final: Drop and recreate problematic function, fix remaining functions

-- Drop the execute_sql function completely for security (it's dangerous anyway)
DROP FUNCTION IF EXISTS public.execute_sql(text);

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

-- Fix handle_referral_xp trigger function
CREATE OR REPLACE FUNCTION public.handle_referral_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Award 25 XP when referral is registered and XP not yet awarded
  IF NEW.status = 'registered' AND OLD.status = 'pending' AND NOT NEW.xp_awarded THEN
    PERFORM public.award_xp(NEW.inviter_id, 25);
    NEW.xp_awarded = true;
  END IF;
  RETURN NEW;
END;
$function$;