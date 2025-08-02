-- 🚨 CRITICAL FIX: Complete RLS policies reset for profiles table
-- This completely removes all problematic recursive policies and creates clean, safe ones

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Safe admin view policy" ON public.profiles;
DROP POLICY IF EXISTS "Safe admin update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 2: Create a safe admin check function that doesn't reference profiles table
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'wikus77@hotmail.it'
  );
$$;

-- Step 3: Create completely safe, non-recursive RLS policies
CREATE POLICY "profiles_select_own" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" 
ON public.profiles
FOR SELECT 
USING (public.is_admin_secure());

CREATE POLICY "profiles_update_own" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_admin" 
ON public.profiles
FOR UPDATE 
USING (public.is_admin_secure());

CREATE POLICY "profiles_insert_own" 
ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_admin" 
ON public.profiles
FOR DELETE 
USING (public.is_admin_secure());