-- Fix contacts table security - ensure RLS policies are properly restrictive
-- This addresses: Customer Contact Information Could Be Stolen

-- First, let's check what's allowing public access by testing the function
DO $$
BEGIN
  -- Test if is_admin_secure() function works correctly
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin_secure') THEN
    RAISE EXCEPTION 'is_admin_secure function not found';
  END IF;
END $$;

-- Drop existing policies to recreate them with correct logic
DROP POLICY IF EXISTS "admin_only_read_contacts" ON public.contacts;
DROP POLICY IF EXISTS "admin_only_update_contacts" ON public.contacts;
DROP POLICY IF EXISTS "admin_only_delete_contacts" ON public.contacts;
DROP POLICY IF EXISTS "public_can_submit_contacts" ON public.contacts;

-- Recreate secure policies with explicit role targeting
-- Policy 1: Allow anyone to submit contact forms (INSERT only)
CREATE POLICY "secure_contact_submission" 
ON public.contacts 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Only authenticated admins can read contact data
CREATE POLICY "admin_only_contact_access" 
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

-- Policy 3: Only authenticated admins can update contacts
CREATE POLICY "admin_only_contact_update" 
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

-- Policy 4: Only authenticated admins can delete contacts
CREATE POLICY "admin_only_contact_delete" 
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

-- Revoke any default permissions
REVOKE ALL ON public.contacts FROM anon;
REVOKE ALL ON public.contacts FROM authenticated;

-- Grant only necessary permissions
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;