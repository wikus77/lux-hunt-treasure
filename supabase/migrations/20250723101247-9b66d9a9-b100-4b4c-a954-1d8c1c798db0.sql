-- Fix security warnings - Set search_path for functions
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Update log_user_action function with secure search_path
CREATE OR REPLACE FUNCTION public.log_user_action(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_logs (user_id, action, details, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Update sync_user_permissions function with secure search_path
CREATE OR REPLACE FUNCTION public.sync_user_permissions(p_user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_plan TEXT;
  early_hours INTEGER := 0;
  can_access BOOLEAN := FALSE;
BEGIN
  -- Get current user plan
  SELECT COALESCE(plan, 'base') INTO user_plan
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calculate early access hours based on plan
  CASE user_plan
    WHEN 'silver' THEN early_hours := 2;
    WHEN 'gold' THEN early_hours := 24;
    WHEN 'black' THEN early_hours := 48;
    WHEN 'titanium' THEN early_hours := 72;
    ELSE early_hours := 0;
  END CASE;
  
  -- Determine app access
  can_access := (user_plan != 'base');
  
  -- Update profile with calculated permissions
  UPDATE public.profiles
  SET 
    can_access_app = can_access,
    early_access_hours = early_hours,
    last_plan_change = NOW()
  WHERE id = p_user_id;
  
  -- Upsert permission records
  INSERT INTO public.user_permissions (user_id, permission_type, permission_value)
  VALUES 
    (p_user_id, 'early_access', (early_hours > 0)),
    (p_user_id, 'app_access', can_access),
    (p_user_id, 'premium_features', (user_plan != 'base'))
  ON CONFLICT (user_id, permission_type) 
  DO UPDATE SET 
    permission_value = EXCLUDED.permission_value,
    granted_at = NOW();
    
  -- Log the permission sync
  PERFORM public.log_user_action(
    p_user_id,
    'permissions_synced',
    jsonb_build_object(
      'plan', user_plan,
      'early_access_hours', early_hours,
      'can_access_app', can_access
    )
  );
END;
$$;

-- Update handle_plan_change function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_plan_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Update send_user_notification function with secure search_path
CREATE OR REPLACE FUNCTION public.send_user_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.user_notifications (
    user_id, notification_type, title, message, metadata
  )
  VALUES (p_user_id, p_notification_type, p_title, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Update get_user_sync_status function with secure search_path
CREATE OR REPLACE FUNCTION public.get_user_sync_status(p_user_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
  profile_data RECORD;
  permissions_data JSONB;
  recent_logs JSONB;
BEGIN
  -- Get profile data
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get permissions
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', permission_type,
      'value', permission_value,
      'granted_at', granted_at
    )
  ) INTO permissions_data
  FROM public.user_permissions
  WHERE user_id = p_user_id;
  
  -- Get recent logs (last 10)
  SELECT jsonb_agg(
    jsonb_build_object(
      'action', action,
      'details', details,
      'created_at', created_at
    )
  ) INTO recent_logs
  FROM (
    SELECT action, details, created_at
    FROM public.user_logs
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) recent;
  
  -- Build result
  result := jsonb_build_object(
    'user_id', p_user_id,
    'plan', profile_data.plan,
    'can_access_app', profile_data.can_access_app,
    'early_access_hours', profile_data.early_access_hours,
    'last_plan_change', profile_data.last_plan_change,
    'permissions', COALESCE(permissions_data, '[]'::jsonb),
    'recent_logs', COALESCE(recent_logs, '[]'::jsonb),
    'sync_timestamp', NOW()
  );
  
  RETURN result;
END;
$$;