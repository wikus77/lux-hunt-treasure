-- 🔒 SECURITY FIX: Fix critical RLS vulnerability in pre_registered_users table
-- Issue: Current policy allows any authenticated user to see ALL pre-registration data
-- Solution: Restrict access to only admin users and user's own data

-- Drop the vulnerable policy
DROP POLICY IF EXISTS "Users can view their own pre-registration" ON public.pre_registered_users;

-- Create secure policies for pre_registered_users table
CREATE POLICY "Users can only view their own pre_registered_users data"
ON public.pre_registered_users
FOR SELECT
TO authenticated
USING (email = auth.email());

CREATE POLICY "Admins can view all pre_registered_users"
ON public.pre_registered_users  
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can manage pre_registered_users"
ON public.pre_registered_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Fix pre_registrations table policies - remove conflicting policies and ensure security
DROP POLICY IF EXISTS "block all - pre_registrations" ON public.pre_registrations;
DROP POLICY IF EXISTS "Allow access to creator" ON public.pre_registrations;
DROP POLICY IF EXISTS "Allow delete by record owner" ON public.pre_registrations;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.pre_registrations;
DROP POLICY IF EXISTS "User can pre-register" ON public.pre_registrations;
DROP POLICY IF EXISTS "Chiunque può inserire pre-registrazioni" ON public.pre_registrations;
DROP POLICY IF EXISTS "Solo gli admin possono visualizzare tutte le pre-registrazioni" ON public.pre_registrations;
DROP POLICY IF EXISTS "Gli utenti possono vedere solo la propria pre-registrazione" ON public.pre_registrations;
DROP POLICY IF EXISTS "Users can view their own pre-registrations" ON public.pre_registrations;

-- Create clean, secure policies for pre_registrations
CREATE POLICY "Anyone can submit pre_registrations"
ON public.pre_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own pre_registrations"
ON public.pre_registrations
FOR SELECT  
TO authenticated
USING (email = auth.email());

CREATE POLICY "Admins can view all pre_registrations"
ON public.pre_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all pre_registrations"
ON public.pre_registrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);