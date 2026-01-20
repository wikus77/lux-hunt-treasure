-- 🔐 SECURITY HARDENING FINALE M1SSION™ 
-- Rimozione definitiva developer bypass + RLS policies securizzate

-- 1. Create secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Create secure admin role check function
CREATE OR REPLACE FUNCTION public.has_admin_role_secure(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_id_param AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Fix admin_prizes - remove hardcoded email
DROP POLICY IF EXISTS "Only admins can access admin_prizes" ON public.admin_prizes;
CREATE POLICY "Only secure admins can access admin_prizes" 
ON public.admin_prizes 
FOR ALL
USING (public.is_admin_secure())
WITH CHECK (public.is_admin_secure());

-- 4. Fix api_rate_limits - remove hardcoded email  
DROP POLICY IF EXISTS "Authorized user can view rate limits" ON public.api_rate_limits;
CREATE POLICY "Admins can view rate limits" 
ON public.api_rate_limits 
FOR SELECT
USING (public.is_admin_secure());

-- 5. Fix blocked_ips - remove hardcoded email
DROP POLICY IF EXISTS "Authorized user can view blocked IPs" ON public.blocked_ips;
CREATE POLICY "Admins can view blocked IPs" 
ON public.blocked_ips 
FOR SELECT
USING (public.is_admin_secure());

-- 6. Fix current_mission_data - remove hardcoded email SHA  
DROP POLICY IF EXISTS "Admin can manage mission data" ON public.current_mission_data;
CREATE POLICY "Secure admins can manage mission data" 
ON public.current_mission_data 
FOR ALL
USING (public.is_admin_secure())
WITH CHECK (public.is_admin_secure());

-- 7. Strengthen profiles policies - remove overly permissive ones
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
CREATE POLICY "Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 8. Strengthen subscriptions policies 
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can manage own subscriptions secure" 
ON public.subscriptions 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Create security event logging table for monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security audit log" 
ON public.security_audit_log 
FOR SELECT
USING (public.is_admin_secure());

CREATE POLICY "System can insert security events" 
ON public.security_audit_log 
FOR INSERT
WITH CHECK (true);

-- 10. Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param TEXT,
  user_id_param UUID DEFAULT NULL,
  event_data_param JSONB DEFAULT NULL,
  severity_param TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add audit trigger to profiles for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 12. Rate limiting enhancement
CREATE OR REPLACE FUNCTION public.check_security_rate_limit(
  endpoint_param TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;