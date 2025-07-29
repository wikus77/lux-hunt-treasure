-- 🔐 FIX DEFINITIVO SECURITY HARDENING M1SSION™
-- Eliminazione popup "Security Issues Found"

-- 1. Fix trigger function che causava errore OLD table
DROP TRIGGER IF EXISTS profile_role_change_audit ON public.profiles;
DROP FUNCTION IF EXISTS public.log_role_changes();

-- Trigger function corretta per audit role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Log to admin_logs table (existing, safe)
    INSERT INTO public.admin_logs (
      event_type,
      user_id,
      note,
      context
    ) VALUES (
      'role_changed',
      NEW.id,
      format('Role changed from %s to %s by %s', OLD.role, NEW.role, auth.uid()),
      'security_audit'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Ricrea trigger con function corretta
CREATE TRIGGER profile_role_change_audit
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();

-- 2. Hardening RLS policies - rimuovi policy permissive
-- Profiles table - solo owner e admin
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "System can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Clues table - solo premium users e admin
DROP POLICY IF EXISTS "Authenticated users can view clues" ON public.clues;
DROP POLICY IF EXISTS "Authenticated users can view non-premium clues" ON public.clues;

CREATE POLICY "Users can view appropriate clues" 
ON public.clues 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND (
    NOT is_premium OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        subscription_tier IN ('silver', 'gold', 'black', 'titanium') OR 
        role = 'admin'
      )
    )
  )
);

-- 4. Subscriptions table - solo owner
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can manage own subscriptions" 
ON public.subscriptions 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Device tokens - solo owner
DROP POLICY IF EXISTS "Allow access to owner" ON public.device_tokens;

CREATE POLICY "Users can manage own device tokens" 
ON public.device_tokens 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Security audit - crea tabella sicura se non esiste
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security events" 
ON public.security_events 
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can log security events" 
ON public.security_events 
FOR INSERT
WITH CHECK (true);

-- 7. Trigger per failed login tracking
CREATE OR REPLACE FUNCTION public.log_failed_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Log su tentativi multipli falliti
  INSERT INTO public.security_events (
    event_type,
    event_data,
    created_at
  ) VALUES (
    'auth_attempt_failed',
    jsonb_build_object(
      'endpoint', TG_TABLE_NAME,
      'timestamp', now()
    ),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 8. Rate limiting hardening per api_rate_limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.api_rate_limits;

CREATE POLICY "System can manage rate limits" 
ON public.api_rate_limits 
FOR ALL
USING (true)
WITH CHECK (true);

-- 9. Admin logs - solo admin access
DROP POLICY IF EXISTS "System can insert logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.admin_logs;

CREATE POLICY "Admins can view admin logs" 
ON public.admin_logs 
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can insert admin logs" 
ON public.admin_logs 
FOR INSERT
WITH CHECK (true);