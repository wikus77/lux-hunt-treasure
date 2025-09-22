-- Fix Critical Security Issues - M1SSION™ Database Hardening
-- Phase 1: Fix Security Definer View Issue

-- First, identify the problematic view (this query will help identify it)
-- Note: This is for documentation, actual fix will follow

-- Fix Search Path for all remaining 11 functions
-- Function 1: update_updated_at_column (already fixed)

-- Function 2: update_push_notifications_log_updated_at
CREATE OR REPLACE FUNCTION public.update_push_notifications_log_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function 3: get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- Function 4: update_user_mission_status_updated_at
CREATE OR REPLACE FUNCTION public.update_user_mission_status_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function 5: exec_sql
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
declare
  result json;
begin
  execute sql;
  return json_build_object('ok', true);
exception when others then
  return json_build_object('ok', false, 'error', SQLERRM);
end;
$function$;

-- Function 6: has_mission_started
CREATE OR REPLACE FUNCTION public.has_mission_started()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT now() >= '2025-08-19T05:00:00Z'::timestamptz;
$function$;

-- Function 7: tg_set_updated_at
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END 
$function$;

-- Function 8: update_fcm_tokens_updated_at
CREATE OR REPLACE FUNCTION public.update_fcm_tokens_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function 9: touch_push_subscriptions_updated_at
CREATE OR REPLACE FUNCTION public.touch_push_subscriptions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END 
$function$;

-- Function 10: set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END 
$function$;

-- Function 11: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$function$;

-- Function 12: get_current_week_and_year
CREATE OR REPLACE FUNCTION public.get_current_week_and_year()
 RETURNS TABLE(week_num integer, year_num integer)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY SELECT 
    EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER as week_num,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as year_num;
END;
$function$;