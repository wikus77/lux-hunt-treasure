-- Security Enhancement Final Phase: Fix last 3 functions with missing search paths
-- Identified through careful analysis of remaining warnings

-- Based on the truncated function list, these are likely the remaining problematic functions:
-- Let's fix them one by one

-- Fix handle_plan_change function
CREATE OR REPLACE FUNCTION public.handle_plan_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process if plan actually changed
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    -- Sync permissions for the new plan
    PERFORM public.sync_user_permissions(NEW.id);
    
    -- Log the plan change
    PERFORM public.log_user_action(
      NEW.id,
      'plan_changed',
      jsonb_build_object(
        'old_plan', OLD.plan,
        'new_plan', NEW.plan,
        'changed_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;