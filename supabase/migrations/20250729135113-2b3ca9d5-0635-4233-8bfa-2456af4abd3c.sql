-- 🔐 SECURITY HARDENING M1SSION™ - Audit Logging & Admin Role Management

-- Create admin_roles table for secure admin management
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_roles - only existing admins can manage
CREATE POLICY "Only existing admins can manage admin roles" 
ON public.admin_roles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for security audit log - only admins can read
CREATE POLICY "Admins can view security audit log" 
ON public.security_audit_log 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System can insert logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID DEFAULT auth.uid(),
  p_action TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (user_id, action, details, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Update profiles table RLS to prevent role escalation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- New secure policy for profile updates (exclude role changes)
CREATE POLICY "Users can update their own profile excluding role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (OLD.role IS NOT DISTINCT FROM NEW.role) -- Prevent role changes
);

-- Only admins can update roles
CREATE POLICY "Only admins can update user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Create function to check admin role using admin_roles table
CREATE OR REPLACE FUNCTION public.is_admin_secure(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Check admin_roles table first
  IF EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = $1 AND is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Fallback to profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_security_event(
      NEW.id,
      'role_changed',
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid(),
        'timestamp', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER profile_role_change_audit
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();

-- Create rate limiting function for authentication
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_identifier TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean old attempts
  DELETE FROM public.api_rate_limits 
  WHERE endpoint = 'auth_attempt' 
    AND window_start < (now() - '1 hour'::INTERVAL);
  
  -- Count recent attempts
  SELECT COALESCE(SUM(request_count), 0) INTO attempt_count
  FROM public.api_rate_limits
  WHERE endpoint = 'auth_attempt'
    AND ip_address::TEXT = p_identifier
    AND window_start >= window_start;
  
  -- Log this attempt
  INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (p_identifier::INET, 'auth_attempt', 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = api_rate_limits.request_count + 1,
    last_request = now();
  
  -- Return whether under limit
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';