-- =====================================================
-- 🔒 PROFILES SECURITY HARDENING
-- CRITICAL FIX: Prevent direct balance manipulation
-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- =====================================================

-- 🚨 CRITICAL VULNERABILITY FIX
-- Users should NOT be able to directly update m1_units or pulse_energy
-- These columns must only be modified via SECURITY DEFINER functions

-- 1. Create a secure trigger to prevent direct m1_units/pulse_energy updates
CREATE OR REPLACE FUNCTION public.protect_balance_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the change is coming from a SECURITY DEFINER function
  -- by checking if calling user has service_role or if it's an RPC call
  
  -- Allow if session user is not the same as auth.uid() (means it's SECURITY DEFINER)
  -- Or if the change is from service_role
  IF session_user = 'service_role' OR session_user = 'postgres' THEN
    RETURN NEW;
  END IF;
  
  -- Check if balance columns are being modified
  IF (OLD.m1_units IS DISTINCT FROM NEW.m1_units) THEN
    -- Only allow decrease (spending), not increase (cheating)
    IF NEW.m1_units > OLD.m1_units THEN
      RAISE EXCEPTION 'Direct m1_units increase not allowed. Use authorized RPC functions.';
    END IF;
  END IF;
  
  IF (OLD.pulse_energy IS DISTINCT FROM NEW.pulse_energy) THEN
    IF NEW.pulse_energy > OLD.pulse_energy THEN
      RAISE EXCEPTION 'Direct pulse_energy increase not allowed. Use authorized RPC functions.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on profiles
DROP TRIGGER IF EXISTS protect_profiles_balance ON public.profiles;
CREATE TRIGGER protect_profiles_balance
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_balance_columns();

-- 3. Create secure RPC for adding M1U (only callable by Edge Functions with service_role)
CREATE OR REPLACE FUNCTION public.admin_credit_m1u(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_old_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Only service_role can call this
  IF session_user != 'service_role' AND session_user != 'postgres' THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_amount');
  END IF;
  
  -- Get current balance
  SELECT m1_units INTO v_old_balance FROM public.profiles WHERE id = p_user_id;
  
  IF v_old_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;
  
  -- Update balance (bypass trigger since we're service_role)
  v_new_balance := v_old_balance + p_amount;
  
  UPDATE public.profiles
  SET m1_units = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the credit
  INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
  VALUES (
    p_user_id,
    p_amount,
    p_reason,
    jsonb_build_object(
      'old_balance', v_old_balance,
      'new_balance', v_new_balance,
      'credited_by', 'admin_credit_m1u',
      'timestamp', NOW()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'old_balance', v_old_balance,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create secure RPC for adding Pulse Energy
CREATE OR REPLACE FUNCTION public.admin_credit_pulse_energy(
  p_user_id UUID,
  p_amount NUMERIC,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_old_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Only service_role can call this
  IF session_user != 'service_role' AND session_user != 'postgres' THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_amount');
  END IF;
  
  -- Get current balance
  SELECT pulse_energy INTO v_old_balance FROM public.profiles WHERE id = p_user_id;
  
  IF v_old_balance IS NULL THEN
    v_old_balance := 0;
  END IF;
  
  -- Update balance
  v_new_balance := v_old_balance + p_amount;
  
  UPDATE public.profiles
  SET pulse_energy = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'old_balance', v_old_balance,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute to service_role only
GRANT EXECUTE ON FUNCTION public.admin_credit_m1u(UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_credit_pulse_energy(UUID, NUMERIC, TEXT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.admin_credit_m1u(UUID, INTEGER, TEXT) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.admin_credit_pulse_energy(UUID, NUMERIC, TEXT) FROM authenticated, anon;

-- 6. Create audit log for balance changes
CREATE TABLE IF NOT EXISTS public.balance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  old_value NUMERIC,
  new_value NUMERIC,
  change_reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.balance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_audit_balance" ON public.balance_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.balance_audit_log FROM authenticated, anon;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

