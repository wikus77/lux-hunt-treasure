-- M1 UNITS™ RPC Overload Fix — Compatible Signatures
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- INSTRUCTIONS: Copy and paste this entire file into Supabase SQL Editor and run it

-- Overload compatible: m1u_ping(target_uid uuid default null)
CREATE OR REPLACE FUNCTION public.m1u_ping(target_uid UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_target UUID := COALESCE(target_uid, v_caller);
BEGIN
  -- Only admin can "ping" other users
  IF target_uid IS NOT NULL AND target_uid != v_caller THEN
    -- For now, allow self-ping only (remove role check for simplicity)
    RAISE EXCEPTION 'Forbidden: can only ping own account';
  END IF;

  -- Ensure target row exists
  INSERT INTO public.user_m1_units(user_id, balance)
  VALUES (v_target, 0)
  ON CONFLICT (user_id) DO UPDATE
  SET last_updated = NOW();

  RETURN jsonb_build_object(
    'ok', true, 
    'uid', v_target, 
    'ts', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.m1u_ping(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.m1u_ping(UUID) TO authenticated, service_role;

-- Variant get_balance with optional target (self by default)
CREATE OR REPLACE FUNCTION public.m1u_get_balance(target_uid UUID DEFAULT NULL)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_target UUID := COALESCE(target_uid, v_caller);
BEGIN
  -- Only allow self-query for now
  IF target_uid IS NOT NULL AND target_uid != v_caller THEN
    RAISE EXCEPTION 'Forbidden: can only query own balance';
  END IF;

  -- Ensure row exists
  INSERT INTO public.user_m1_units(user_id, balance)
  VALUES (v_target, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN COALESCE(
    (SELECT balance FROM public.user_m1_units WHERE user_id = v_target), 
    0
  );
END;
$$;

REVOKE ALL ON FUNCTION public.m1u_get_balance(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.m1u_get_balance(UUID) TO authenticated, service_role;

-- Harden RLS: enforce insert/update self only
DROP POLICY IF EXISTS "write own units (upsert self)" ON public.user_m1_units;
CREATE POLICY "write own units (upsert self)"
  ON public.user_m1_units FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update own units" ON public.user_m1_units;
CREATE POLICY "update own units"
  ON public.user_m1_units FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '✅ M1U RPC overload applied successfully';
  RAISE NOTICE '✅ m1u_ping() now accepts optional target_uid (defaults to auth.uid())';
  RAISE NOTICE '✅ m1u_get_balance() created for consistent balance queries';
  RAISE NOTICE '🎯 Debug panel should now work without errors!';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
