-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Award Wheel M1U RPC Function
-- Date: 2026-02-07
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Simple RPC to award M1U from Fortune Wheel spin
--          Awards based on the winning segment, not milestones
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.award_wheel_m1u(p_amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_current_m1u INT;
  v_new_m1u INT;
BEGIN
  -- 1. VERIFY AUTHENTICATION
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;
  
  -- 2. VALIDATE AMOUNT
  IF p_amount <= 0 OR p_amount > 1000 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid amount'
    );
  END IF;
  
  -- 3. GET CURRENT BALANCE
  SELECT COALESCE(m1_units, 0) INTO v_current_m1u
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;
  
  -- 4. UPDATE BALANCE
  v_new_m1u := v_current_m1u + p_amount;
  
  UPDATE public.profiles
  SET m1_units = v_new_m1u,
      updated_at = now()
  WHERE id = v_user_id;
  
  -- 5. LOG THE AWARD (optional - for audit trail)
  INSERT INTO public.m1u_transactions (
    user_id,
    amount,
    transaction_type,
    source,
    description,
    balance_after,
    created_at
  ) VALUES (
    v_user_id,
    p_amount,
    'credit',
    'fortune_wheel',
    'Premio ruota della fortuna',
    v_new_m1u,
    now()
  )
  ON CONFLICT DO NOTHING; -- Ignore if table doesn't exist or constraint fails
  
  -- 6. RETURN SUCCESS
  RETURN jsonb_build_object(
    'success', true,
    'amount', p_amount,
    'new_balance', v_new_m1u,
    'previous_balance', v_current_m1u
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.award_wheel_m1u(INT) TO authenticated;

-- Comment
COMMENT ON FUNCTION public.award_wheel_m1u(INT) IS 'Awards M1U from Fortune Wheel spin based on winning segment';
