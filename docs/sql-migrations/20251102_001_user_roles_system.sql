-- Migration: User Roles System (Security Hardening)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- Purpose: Implement secure role-based access control (RBAC) with:
-- - user_roles table (no recursive RLS)
-- - has_role() SECURITY DEFINER function
-- - admin_logs audit trail
-- - RLS policies for admin operations
--
-- SAFETY: Does NOT modify Buzz/Map/Push/Stripe/Norah functionality

-- ============================================================================
-- STEP 1: Create app_role enum
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'agent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 2: Create user_roles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (user_id, role)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create SECURITY DEFINER function (prevents recursive RLS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Overload for text role (backwards compatibility)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

-- ============================================================================
-- STEP 4: Helper function to get current user's role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role::text
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'agent' THEN 3
    END
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ============================================================================
-- STEP 5: RLS Policies for user_roles table
-- ============================================================================

-- Users can view their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert/update/delete roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- STEP 6: Create admin_logs table for audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_table TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;
CREATE POLICY "Admins can view logs"
  ON public.admin_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert logs
DROP POLICY IF EXISTS "Service can insert logs" ON public.admin_logs;
CREATE POLICY "Service can insert logs"
  ON public.admin_logs
  FOR INSERT
  WITH CHECK (true);  -- Service role bypasses RLS anyway

-- ============================================================================
-- STEP 7: Function to log admin actions
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action TEXT,
  _target_user_id UUID DEFAULT NULL,
  _target_table TEXT DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  -- Only admins can log actions
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can log actions';
  END IF;

  INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_user_id,
    target_table,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    _action,
    _target_user_id,
    _target_table,
    _details,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  )
  RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, UUID, TEXT, JSONB) TO authenticated;

-- ============================================================================
-- STEP 8: Trigger to log role changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.admin_logs (
      admin_id,
      action,
      target_user_id,
      target_table,
      details
    ) VALUES (
      COALESCE(NEW.assigned_by, auth.uid()),
      'ROLE_ASSIGNED',
      NEW.user_id,
      'user_roles',
      jsonb_build_object(
        'role', NEW.role,
        'metadata', NEW.metadata
      )
    );
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.admin_logs (
      admin_id,
      action,
      target_user_id,
      target_table,
      details
    ) VALUES (
      auth.uid(),
      'ROLE_REVOKED',
      OLD.user_id,
      'user_roles',
      jsonb_build_object('role', OLD.role)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_role_change();

-- ============================================================================
-- STEP 9: Migration helper - assign admin role to founder
-- ============================================================================
-- NOTE: Run this manually in Supabase SQL Editor with founder's user_id
-- 
-- Example:
-- INSERT INTO public.user_roles (user_id, role, assigned_by)
-- VALUES (
--   'YOUR_FOUNDER_USER_ID_HERE'::uuid,
--   'admin'::public.app_role,
--   'YOUR_FOUNDER_USER_ID_HERE'::uuid
-- )
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- STEP 10: Add comments for documentation
-- ============================================================================
COMMENT ON TABLE public.user_roles IS 'Secure role assignments - prevents privilege escalation';
COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS 'SECURITY DEFINER function to check roles without RLS recursion';
COMMENT ON TABLE public.admin_logs IS 'Audit trail for all admin operations';

-- ============================================================================
-- VERIFICATION QUERIES (run these to test)
-- ============================================================================
-- 1. Check if function works:
--    SELECT public.has_role(auth.uid(), 'admin');
--
-- 2. View your roles:
--    SELECT * FROM public.user_roles WHERE user_id = auth.uid();
--
-- 3. View admin logs:
--    SELECT * FROM public.admin_logs ORDER BY created_at DESC LIMIT 10;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
