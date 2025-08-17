-- CRITICAL FIX: Remove dangerous frontend database permissions
-- This completely eliminates the security vulnerability

-- Revoke ALL permissions from anon and authenticated users
REVOKE ALL ON public.contacts FROM anon;
REVOKE ALL ON public.contacts FROM authenticated;

-- Only allow service_role (edge functions) to access the table
GRANT INSERT ON public.contacts TO service_role;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO service_role;

-- Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "anon_can_only_insert_contacts" ON public.contacts;
DROP POLICY IF EXISTS "auth_non_admin_can_only_insert_contacts" ON public.contacts;

-- Only allow service_role and admin access
CREATE POLICY "service_role_full_access" 
ON public.contacts 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can access via authenticated role but must be verified admin
CREATE POLICY "verified_admin_full_access" 
ON public.contacts 
FOR ALL 
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