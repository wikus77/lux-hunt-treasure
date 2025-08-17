-- Strong fix for contacts table security vulnerability
-- This completely blocks unauthorized access

-- Drop all existing policies first
DROP POLICY IF EXISTS "admin_only_contact_access" ON public.contacts;
DROP POLICY IF EXISTS "admin_only_contact_update" ON public.contacts;
DROP POLICY IF EXISTS "admin_only_contact_delete" ON public.contacts;
DROP POLICY IF EXISTS "secure_contact_submission" ON public.contacts;

-- Create maximally restrictive policies

-- 1. Anonymous users can ONLY insert (submit contact forms)
CREATE POLICY "anon_can_only_insert_contacts" 
ON public.contacts 
FOR INSERT 
TO anon
WITH CHECK (true);

-- 2. Authenticated non-admin users can ONLY insert (submit contact forms)
CREATE POLICY "auth_non_admin_can_only_insert_contacts" 
ON public.contacts 
FOR INSERT 
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 3. Only authenticated admin users can read contacts
CREATE POLICY "only_admin_can_read_contacts" 
ON public.contacts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 4. Only authenticated admin users can update contacts
CREATE POLICY "only_admin_can_update_contacts" 
ON public.contacts 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 5. Only authenticated admin users can delete contacts
CREATE POLICY "only_admin_can_delete_contacts" 
ON public.contacts 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Remove all default table permissions and grant minimal required access
REVOKE ALL ON public.contacts FROM PUBLIC;
GRANT INSERT ON public.contacts TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.contacts TO authenticated;

-- Add security logging trigger
CREATE OR REPLACE FUNCTION public.log_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log contact form submissions for security monitoring
  INSERT INTO public.admin_logs (
    event_type,
    user_id,
    details
  ) VALUES (
    'contact_form_submitted',
    auth.uid(),
    jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'has_phone', NEW.phone IS NOT NULL,
      'subject', NEW.subject,
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER log_contact_submissions
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_access();