-- Fix admin_credit_m1u per permettere Edge Functions
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
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_amount');
  END IF;
  
  -- Get current balance
  SELECT m1_units INTO v_old_balance FROM public.profiles WHERE id = p_user_id;
  
  IF v_old_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;
  
  -- Update balance (SECURITY DEFINER bypasses RLS)
  v_new_balance := v_old_balance + p_amount;
  
  UPDATE public.profiles
  SET m1_units = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the credit (ignore errors)
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Ignore log errors
    NULL;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'old_balance', v_old_balance,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant to service_role only
REVOKE ALL ON FUNCTION public.admin_credit_m1u(UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_credit_m1u(UUID, INTEGER, TEXT) TO service_role;
