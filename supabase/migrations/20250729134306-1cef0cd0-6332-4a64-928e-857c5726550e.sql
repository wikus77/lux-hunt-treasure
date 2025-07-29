-- ===============================
-- 🔐 M1SSION™ SECURITY FIX - HIGH PRIORITY (CORRECTED)
-- ===============================

-- 1️⃣ FIX PRIVILEGE ESCALATION: Remove user ability to update their own role
-- Drop existing policies that allow users to update their own profiles with role changes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to update their own profile data (except role)
CREATE POLICY "Users can update own profile data (not role)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes - role must remain the same unless admin
  (profiles.role = COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), profiles.role) OR 
   EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'))
);

-- Only admins can update any profile with role changes
CREATE POLICY "Only admins can update profiles with role changes"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);

-- 2️⃣ CREATE AUDIT LOG FOR ROLE CHANGES
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view role audit logs"
ON public.role_change_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.role_change_audit
FOR INSERT
WITH CHECK (true);

-- 3️⃣ SECURE ADMIN MANAGEMENT - Remove hardcoded email dependencies
-- Create proper admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS on admin roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin roles
CREATE POLICY "Only existing admins can manage admin roles"
ON public.admin_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4️⃣ TIGHTEN RLS POLICIES - Remove overly permissive policies

-- Update clues policies
DROP POLICY IF EXISTS "Everyone can view clues" ON public.clues;
DROP POLICY IF EXISTS "Public read access" ON public.clues;

-- More secure clues access
CREATE POLICY "Authenticated users can view non-premium clues"
ON public.clues
FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  (NOT is_premium OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (
      subscription_tier IN ('silver', 'gold', 'black', 'titanium') OR
      role = 'admin'
    )
  ))
);

-- Update buzz_logs policies - remove overly permissive INSERT
DROP POLICY IF EXISTS "Allow buzz log insertion" ON public.buzz_logs;

CREATE POLICY "Users can insert their own buzz logs"
ON public.buzz_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5️⃣ CREATE SECURE ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;