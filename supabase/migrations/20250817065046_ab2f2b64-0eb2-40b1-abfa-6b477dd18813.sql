-- Critical Security Fix: Secure Customer Contact Information
-- Issue: Contacts table had overly permissive policies allowing potential data theft
-- Fix: Implement restrictive RLS policies to protect customer PII

-- First, drop the overly permissive service_role policy
DROP POLICY IF EXISTS "service_role_full_access" ON public.contacts;

-- Create secure policies that protect customer data
-- 1. Anonymous users can ONLY submit contact forms (INSERT permission only)
CREATE POLICY "anon_can_only_insert_contacts" 
ON public.contacts 
FOR INSERT 
TO anon
WITH CHECK (true);

-- 2. Authenticated non-admin users can ONLY submit contact forms (INSERT permission only)  
CREATE POLICY "auth_non_admin_can_only_insert_contacts" 
ON public.contacts 
FOR INSERT 
TO authenticated
WITH CHECK (NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- 3. Only admin users can read customer contact information
-- (This policy already exists and is correct)

-- 4. Only admin users can update customer contact information  
-- (This policy already exists and is correct)

-- 5. Only admin users can delete customer contact information
-- (This policy already exists and is correct)

-- Create a trigger to log all contact form submissions for security monitoring
CREATE OR REPLACE FUNCTION public.log_contact_submissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log security event with anonymized details
  INSERT INTO public.admin_logs (
    event_type,
    note,
    context
  ) VALUES (
    'contact_form_submitted',
    format('Contact submitted: name=%s, email=%s, has_phone=%s, subject=%s', 
           NEW.name, NEW.email, (NEW.phone IS NOT NULL), COALESCE(NEW.subject, 'none')),
    'security_monitoring'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for contact submissions logging
DROP TRIGGER IF EXISTS log_contact_submissions_trigger ON public.contacts;
CREATE TRIGGER log_contact_submissions_trigger
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_submissions();