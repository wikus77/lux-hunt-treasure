-- Security Hardening Migration
-- Phase 1: Fix database security issues identified in audit

-- 1. Create secure admin check function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user has admin role in profiles table
  -- Using SECURITY DEFINER to bypass RLS but with controlled access
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Add trigger to prevent users from modifying their own role
CREATE OR REPLACE FUNCTION public.prevent_role_self_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent users from changing their own role unless they're already admin
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow role changes if current user is admin and not changing their own role
    IF NOT (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') 
      AND auth.uid() != NEW.id
    ) THEN
      RAISE EXCEPTION 'Unauthorized role modification attempt';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply the trigger to profiles table
DROP TRIGGER IF EXISTS prevent_role_self_modification_trigger ON public.profiles;
CREATE TRIGGER prevent_role_self_modification_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_self_modification();

-- 3. Restrict marker_rewards access (remove public read)
DROP POLICY IF EXISTS "Public can view marker rewards" ON public.marker_rewards;

-- Create restricted policy for marker_rewards
CREATE POLICY "Authenticated users can view active marker rewards"
ON public.marker_rewards
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.marker_claims 
    WHERE marker_id = marker_rewards.marker_id 
    AND user_id = auth.uid()
  )
);

-- 4. Add rate limiting for marker claims
CREATE TABLE IF NOT EXISTS public.marker_claim_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marker_id uuid NOT NULL,
  claim_attempts integer DEFAULT 1,
  last_attempt timestamptz DEFAULT now(),
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.marker_claim_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
ON public.marker_claim_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Enhanced security logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security events"
ON public.security_events
FOR SELECT
USING (is_admin_secure());

CREATE POLICY "System can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- 6. Fix security definer functions identified by linter
-- Add search_path to existing functions
ALTER FUNCTION public.has_mission_started() SET search_path TO 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path TO 'public';
ALTER FUNCTION public.generate_agent_code() SET search_path TO 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path TO 'public';
ALTER FUNCTION public.calculate_access_start_date(text) SET search_path TO 'public';