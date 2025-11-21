-- M1 UNITS™ BUZZ Spend RPC — Gestione pagamento M1U per BUZZ normale
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- RPC per spendere M1U per BUZZ normale (simile a buzz_map_spend_m1u ma per BUZZ)
CREATE OR REPLACE FUNCTION public.buzz_spend_m1u(p_cost_m1u INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Verifica autenticazione
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'unauthorized',
      'message', 'User not authenticated'
    );
  END IF;

  -- Verifica costo valido
  IF p_cost_m1u IS NULL OR p_cost_m1u <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_cost',
      'message', 'Cost must be greater than 0'
    );
  END IF;

  -- Ottieni saldo corrente M1U
  SELECT m1_units INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

  -- Verifica saldo sufficiente
  IF v_current_balance IS NULL OR v_current_balance < p_cost_m1u THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_m1u',
      'current_balance', COALESCE(v_current_balance, 0),
      'required', p_cost_m1u,
      'message', 'Insufficient M1U balance'
    );
  END IF;

  -- Decurta M1U dal saldo
  UPDATE public.profiles
  SET m1_units = m1_units - p_cost_m1u,
      updated_at = NOW()
  WHERE id = v_user_id
  RETURNING m1_units INTO v_new_balance;

  -- Log della transazione nella tabella user_m1_units_events se esiste
  BEGIN
    INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
    VALUES (
      v_user_id,
      -p_cost_m1u,
      'buzz_payment',
      jsonb_build_object(
        'cost_m1u', p_cost_m1u,
        'old_balance', v_current_balance,
        'new_balance', v_new_balance,
        'timestamp', NOW()
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Se la tabella non esiste, ignora l'errore
      NULL;
  END;

  -- Ritorna successo con dettagli
  RETURN jsonb_build_object(
    'success', true,
    'spent', p_cost_m1u,
    'new_balance', v_new_balance,
    'old_balance', v_current_balance,
    'timestamp', NOW()
  );
END;
$$;

-- Permessi
REVOKE ALL ON FUNCTION public.buzz_spend_m1u(INTEGER) FROM public;
GRANT EXECUTE ON FUNCTION public.buzz_spend_m1u(INTEGER) TO authenticated, service_role;

-- Commento
COMMENT ON FUNCTION public.buzz_spend_m1u(INTEGER) IS 
'Decurta M1U dal saldo utente per pagamento BUZZ normale. Verifica saldo e ritorna successo/errore con nuovo saldo.';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™