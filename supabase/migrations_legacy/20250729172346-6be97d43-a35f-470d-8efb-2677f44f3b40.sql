-- 🚨 EMERGENCY FIX: Remove recursive RLS policies causing infinite loops

-- First, disable RLS temporarily to access profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles that could cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin access" ON public.profiles;

-- Create NON-RECURSIVE policies for profiles
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create ADMIN BYPASS policy that doesn't reference profiles table
CREATE POLICY "profiles_admin_bypass" 
ON public.profiles 
FOR ALL 
USING (
  auth.jwt() ->> 'email' = 'wikus77@hotmail.it'
);

-- Re-enable RLS with safe policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;