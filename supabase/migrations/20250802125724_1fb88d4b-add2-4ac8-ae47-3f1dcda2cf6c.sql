-- Fix infinite recursion RLS policy on profiles table
-- Drop all existing problematic policies and recreate them safely

-- Drop all existing admin policies that may cause recursion
DROP POLICY IF EXISTS "Only admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Ensure the security definer function exists
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create new safe admin policies using the security definer function
CREATE POLICY "Safe admin view policy" 
ON public.profiles
FOR SELECT 
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Safe admin update policy" 
ON public.profiles
FOR UPDATE 
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

-- Add missing policies for insert and delete
CREATE POLICY "Users can insert their own profile" 
ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete profiles" 
ON public.profiles
FOR DELETE 
USING (public.get_current_user_role() = 'admin');