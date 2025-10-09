-- Fix get_user_flags RPC to return default value for new users
CREATE OR REPLACE FUNCTION public.get_user_flags()
RETURNS TABLE(hide_tutorial boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT uf.hide_tutorial FROM public.user_flags uf WHERE uf.user_id = auth.uid()),
    false
  ) as hide_tutorial;
$function$;

-- Activate M1SSION ONE
UPDATE public.missions 
SET status = 'active' 
WHERE title = 'M1SSION ONE' AND status = 'scheduled';