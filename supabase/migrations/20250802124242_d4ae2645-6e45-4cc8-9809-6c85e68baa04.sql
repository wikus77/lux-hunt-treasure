-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
-- Fix RLS Admin policies to prevent infinite recursion

-- Create security definer function for admin check
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop and recreate admin policies using the security definer function
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- Create new admin policies using security definer function
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.get_current_user_role() = 'admin');