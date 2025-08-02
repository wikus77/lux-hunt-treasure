-- 🚨 FINAL SECURE RLS POLICIES: Create completely safe, non-recursive policies

-- Create ultimate safe admin check function using only auth.users (no profiles reference)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = 'wikus77@hotmail.it',
    false
  );
$$;

-- Policy 1: Users can view their own profile
CREATE POLICY "secure_profiles_select_own" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Admin can view all profiles (using safe function)
CREATE POLICY "secure_profiles_select_admin" 
ON public.profiles
FOR SELECT 
USING (public.is_admin_user());

-- Policy 3: Users can update their own profile
CREATE POLICY "secure_profiles_update_own" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 4: Admin can update all profiles (using safe function)
CREATE POLICY "secure_profiles_update_admin" 
ON public.profiles
FOR UPDATE 
USING (public.is_admin_user());

-- Policy 5: System can insert profiles (for new user registration)
CREATE POLICY "secure_profiles_insert_system" 
ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id OR public.is_admin_user());

-- Policy 6: Admin can delete profiles
CREATE POLICY "secure_profiles_delete_admin" 
ON public.profiles
FOR DELETE 
USING (public.is_admin_user());