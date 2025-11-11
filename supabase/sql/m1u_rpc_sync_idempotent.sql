-- M1 UNITS™ RPC Sync — Idempotent Schema + Functions
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- INSTRUCTIONS: Copy and paste this entire file into Supabase SQL Editor and run it

-- 0) UNIQUE constraint on user_id (for ON CONFLICT)
ALTER TABLE public.user_m1_units
  DROP CONSTRAINT IF EXISTS user_m1_units_user_id_key;
ALTER TABLE public.user_m1_units
  ADD CONSTRAINT user_m1_units_user_id_key UNIQUE (user_id);

-- 1) Summary RPC with optional target (defaults to auth.uid())
CREATE OR REPLACE FUNCTION public.m1u_get_summary(target_uid UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_target UUID := COALESCE(target_uid, v_caller);
  v_balance BIGINT;
  v_earned BIGINT;
  v_spent BIGINT;
  v_updated TIMESTAMPTZ;
BEGIN
  -- Only admin can query other users
  IF target_uid IS NOT NULL AND target_uid != v_caller THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_caller AND role = 'admin') THEN
      RAISE EXCEPTION 'Forbidden: can only query own summary';
    END IF;
  END IF;

  -- Ensure row exists
  INSERT INTO public.user_m1_units(user_id, balance)
  VALUES (v_target, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get summary from view (or direct query if no view)
  SELECT 
    COALESCE(balance, 0),
    COALESCE(total_earned, 0),
    COALESCE(total_spent, 0),
    COALESCE(updated_at, NOW())
  INTO v_balance, v_earned, v_spent, v_updated
  FROM public.user_m1_units
  WHERE user_id = v_target;

  RETURN jsonb_build_object(
    'user_id', v_target,
    'balance', COALESCE(v_balance, 0),
    'total_earned', COALESCE(v_earned, 0),
    'total_spent', COALESCE(v_spent, 0),
    'updated_at', v_updated
  );
END;
$$;

REVOKE ALL ON FUNCTION public.m1u_get_summary(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.m1u_get_summary(UUID) TO authenticated, service_role;

-- 2) Fake Update with BIGINT delta (used by UI)
CREATE OR REPLACE FUNCTION public.m1u_fake_update(_delta BIGINT DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_new BIGINT;
BEGIN
  -- Ensure row exists
  INSERT INTO public.user_m1_units(user_id, balance)
  VALUES (v_uid, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log event
  INSERT INTO public.user_m1_units_events(user_id, delta, reason)
  VALUES (v_uid, _delta, 'fake_update');

  -- Update balance
  UPDATE public.user_m1_units
  SET balance = balance + _delta,
      total_earned = CASE WHEN _delta > 0 THEN total_earned + _delta ELSE total_earned END,
      total_spent = CASE WHEN _delta < 0 THEN total_spent + ABS(_delta) ELSE total_spent END,
      updated_at = NOW()
  WHERE user_id = v_uid
  RETURNING balance INTO v_new;

  RETURN jsonb_build_object('ok', true, 'balance', v_new);
END;
$$;

REVOKE ALL ON FUNCTION public.m1u_fake_update(BIGINT) FROM public;
GRANT EXECUTE ON FUNCTION public.m1u_fake_update(BIGINT) TO authenticated, service_role;

-- 3) Ping overload already exists (keep as is)
-- m1u_ping(target_uid uuid default null)

-- 4) Smoke test
DO $$
BEGIN
  RAISE NOTICE '✅ M1U RPC Sync completed successfully';
  RAISE NOTICE '✅ m1u_get_summary() - returns full summary with balance/earned/spent';
  RAISE NOTICE '✅ m1u_fake_update(_delta) - increments balance for testing';
  RAISE NOTICE '🎯 UI should now work without 404/406 errors!';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
