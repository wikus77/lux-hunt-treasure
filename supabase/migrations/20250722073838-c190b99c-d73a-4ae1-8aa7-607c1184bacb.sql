-- WARNING #19-20 FIXED: RLS Policy Recursion Prevention
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Fix recursive RLS policies by creating security definer functions

-- 1. Create security definer function for user role checking
CREATE OR REPLACE FUNCTION public.get_user_role_safe(p_user_id uuid)
RETURNS TEXT AS $$
BEGIN
  -- Use direct query to avoid recursion
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = p_user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Create security definer function for admin email checking  
CREATE OR REPLACE FUNCTION public.is_admin_email_safe(p_email text)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_email = 'wikus77@hotmail.it';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Create security definer function for current user profile access
CREATE OR REPLACE FUNCTION public.get_current_user_profile_safe()
RETURNS TABLE(role text, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.role, u.email::text
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. WARNING #21-22 FIXED: Helper function for safe user ID retrieval
CREATE OR REPLACE FUNCTION public.get_authenticated_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Comment explaining the fix
COMMENT ON FUNCTION public.get_user_role_safe IS 'WARNING #19-20 FIXED: Prevents RLS recursion by using security definer';
COMMENT ON FUNCTION public.is_admin_email_safe IS 'WARNING #19-20 FIXED: Safe admin check without recursion';
COMMENT ON FUNCTION public.get_current_user_profile_safe IS 'WARNING #19-20 FIXED: Safe profile access for RLS policies';
COMMENT ON FUNCTION public.get_authenticated_user_id IS 'WARNING #21-22 FIXED: Safe user ID for database inserts';