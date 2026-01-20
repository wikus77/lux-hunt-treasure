-- 🔐 FIX SECURITY LINTER WARNINGS - Function Search Path
-- Set secure search paths for all newly created functions

-- Fix 1: is_admin_secure function
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Fix 2: has_admin_role_secure function
CREATE OR REPLACE FUNCTION public.has_admin_role_secure(user_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_id_param AND is_active = true
  );
END;
$$;

-- Fix 3: log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param TEXT,
  user_id_param UUID DEFAULT NULL,
  event_data_param JSONB DEFAULT NULL,
  severity_param TEXT DEFAULT 'info'
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    event_type, user_id, event_data, severity
  ) VALUES (
    event_type_param, 
    COALESCE(user_id_param, auth.uid()), 
    event_data_param, 
    severity_param
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fix 4: audit_role_changes function
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_security_event(
      'role_changed',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      ),
      'high'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 5: check_security_rate_limit function
CREATE OR REPLACE FUNCTION public.check_security_rate_limit(
  endpoint_param TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  current_attempts INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*) INTO current_attempts
  FROM public.security_audit_log
  WHERE event_type = 'rate_limit_check'
    AND event_data->>'endpoint' = endpoint_param
    AND user_id = auth.uid()
    AND created_at >= window_start;
  
  -- Log this check
  PERFORM public.log_security_event(
    'rate_limit_check',
    auth.uid(),
    jsonb_build_object('endpoint', endpoint_param, 'current_attempts', current_attempts)
  );
  
  RETURN current_attempts < max_attempts;
END;
$$;