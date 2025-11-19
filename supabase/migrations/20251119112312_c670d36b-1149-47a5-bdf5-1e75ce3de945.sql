-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix RPC buzz_map_spend_m1u per allineare output con edge function

-- Drop funzione esistente
DROP FUNCTION IF EXISTS public.buzz_map_spend_m1u(UUID, INT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);

-- Ricrea con nuovo return type
CREATE OR REPLACE FUNCTION public.buzz_map_spend_m1u(
  p_user_id UUID,
  p_cost_m1u INT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION
)
RETURNS TABLE(success BOOLEAN, spent INT, new_balance INT, error TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
BEGIN
  -- Verifica saldo M1U
  SELECT m1_units INTO v_balance FROM public.profiles WHERE id = p_user_id;
  
  IF v_balance IS NULL OR v_balance < p_cost_m1u THEN
    RETURN QUERY SELECT FALSE, 0, COALESCE(v_balance, 0), 'insufficient_balance';
    RETURN;
  END IF;
  
  -- Sottrai M1U (l'INSERT lo fa l'edge function)
  UPDATE public.profiles 
  SET m1_units = m1_units - p_cost_m1u 
  WHERE id = p_user_id
  RETURNING m1_units INTO v_balance;
  
  -- Ritorna successo con spent e new_balance
  RETURN QUERY SELECT TRUE, p_cost_m1u, v_balance, NULL::TEXT;
END;
$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™