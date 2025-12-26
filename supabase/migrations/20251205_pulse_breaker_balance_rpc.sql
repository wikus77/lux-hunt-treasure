-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- RPC Function for secure balance updates (Pulse Breaker game)

-- Drop if exists
DROP FUNCTION IF EXISTS public.update_user_balance(UUID, TEXT, INTEGER);

-- Create secure RPC for balance updates
CREATE OR REPLACE FUNCTION public.update_user_balance(
  p_user_id UUID,
  p_field TEXT,
  p_value INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate user owns the record
  IF p_user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Validate field name
  IF p_field NOT IN ('m1_units', 'pulse_energy') THEN
    RETURN FALSE;
  END IF;
  
  -- Validate value is not negative
  IF p_value < 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Update the balance
  IF p_field = 'm1_units' THEN
    UPDATE public.profiles 
    SET m1_units = p_value, updated_at = NOW()
    WHERE id = p_user_id;
  ELSIF p_field = 'pulse_energy' THEN
    UPDATE public.profiles 
    SET pulse_energy = p_value, updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_balance(UUID, TEXT, INTEGER) TO authenticated;

-- Comment
COMMENT ON FUNCTION public.update_user_balance IS 
'Secure RPC for updating user balance (m1_units or pulse_energy) - used by Pulse Breaker game';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™







