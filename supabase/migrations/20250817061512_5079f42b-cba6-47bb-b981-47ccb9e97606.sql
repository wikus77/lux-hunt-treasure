-- Fix QR codes security vulnerability - remove public access and require authentication
-- This addresses: QR Code System Could Be Exploited by Hackers

-- Drop all conflicting and overly permissive RLS policies
DROP POLICY IF EXISTS "qr_codes_all_select" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_anon_select" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_auth_select" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_select_anon" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_select_auth" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_select_public" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_insert_auth" ON public.qr_codes;

-- Keep only secure policies that require proper authentication and discovery
-- Policy 1: Admins can manage all QR codes
CREATE POLICY "secure_admin_qr_access" 
ON public.qr_codes 
FOR ALL 
TO authenticated
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

-- Policy 2: Authenticated users can only see QR codes they've legitimately discovered
CREATE POLICY "secure_discovered_qr_access" 
ON public.qr_codes 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.qr_code_discoveries d 
    WHERE d.qr_code_id = qr_codes.id 
    AND d.user_id = auth.uid()
    AND d.discovered_at IS NOT NULL
  )
);

-- Policy 3: Allow authenticated users to discover new QR codes via scanning (INSERT to discoveries)
-- This will be handled by a separate edge function for security

-- Policy 4: Block all anonymous access completely
-- (No policy for anon role = no access)

-- Add logging trigger for QR code access attempts
CREATE OR REPLACE FUNCTION public.log_qr_access_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Log legitimate access for security monitoring
  INSERT INTO public.admin_logs (
    event_type,
    user_id,
    details
  ) VALUES (
    'qr_code_accessed',
    auth.uid(),
    jsonb_build_object(
      'qr_code_id', NEW.id,
      'code', NEW.code,
      'access_time', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;