-- Fix contacts table security - remove conflicting policies and secure access
-- This addresses the security issue: Customer Contact Information Could Be Stolen by Hackers

-- Drop all existing conflicting RLS policies
DROP POLICY IF EXISTS "Admin read access" ON public.contacts;
DROP POLICY IF EXISTS "Allow insert for all" ON public.contacts;
DROP POLICY IF EXISTS "Only admins can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Permetti inserimento a chiunque" ON public.contacts;
DROP POLICY IF EXISTS "Solo gli admin possono leggere i contatti" ON public.contacts;
DROP POLICY IF EXISTS "Users can submit contact forms" ON public.contacts;

-- Create secure RLS policies using the is_admin_secure function
-- Allow anyone to submit contact forms (INSERT)
CREATE POLICY "public_can_submit_contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Only secure admins can read contact data (SELECT)
CREATE POLICY "admin_only_read_contacts" 
ON public.contacts 
FOR SELECT 
USING (is_admin_secure());

-- Only secure admins can update contact data (UPDATE)
CREATE POLICY "admin_only_update_contacts" 
ON public.contacts 
FOR UPDATE 
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

-- Only secure admins can delete contact data (DELETE)
CREATE POLICY "admin_only_delete_contacts" 
ON public.contacts 
FOR DELETE 
USING (is_admin_secure());