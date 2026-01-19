-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: buy_lottery_tickets - Versione semplificata che funziona
-- Esegui questo SQL per correggere l'errore acquisto
-- ═══════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.buy_lottery_tickets(UUID, INT, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.buy_lottery_tickets(
  p_cycle_id UUID,
  p_quantity INT,
  p_request_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'app_web'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_cycle_id UUID;
  v_cycle_status TEXT;
  v_cycle_starts_at TIMESTAMPTZ;
  v_cycle_ends_at TIMESTAMPTZ;
  v_ticket_price INT;
  v_max_per_user INT;
  v_current_m1u NUMERIC;
  v_user_tickets_count INT;
  v_total_cost INT;
  v_purchase_id UUID;
  v_existing_purchase UUID;
  v_ticket_ids UUID[] := ARRAY[]::UUID[];
  v_i INT;
  v_new_ticket_id UUID;
  v_is_first_purchase BOOLEAN;
BEGIN
  -- 1. VALIDAZIONI BASE
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NOT_AUTHENTICATED',
      'message', 'Devi essere autenticato per acquistare biglietti'
    );
  END IF;
  
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INVALID_QUANTITY',
      'message', 'La quantità deve essere maggiore di 0'
    );
  END IF;
  
  -- 2. IDEMPOTENZA CHECK
  IF p_request_id IS NOT NULL THEN
    SELECT id INTO v_existing_purchase
    FROM public.lottery_purchases
    WHERE request_id = p_request_id;
    
    IF v_existing_purchase IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'already_purchased',
        'code', 'IDEMPOTENT_DUPLICATE',
        'purchase_id', v_existing_purchase,
        'message', 'Acquisto già completato'
      );
    END IF;
  END IF;
  
  -- 3. VERIFICA CICLO (senza SELECT *)
  SELECT id, status, starts_at, ends_at, ticket_price_m1u, max_tickets_per_user
  INTO v_cycle_id, v_cycle_status, v_cycle_starts_at, v_cycle_ends_at, v_ticket_price, v_max_per_user
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE;
  
  IF v_cycle_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo lotteria non trovato'
    );
  END IF;
  
  IF v_cycle_status != 'active' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_ACTIVE',
      'message', 'Ciclo non attivo'
    );
  END IF;
  
  IF now() < v_cycle_starts_at OR now() > v_cycle_ends_at THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_OUTSIDE_DATES',
      'message', 'Ciclo fuori dalle date attive'
    );
  END IF;
  
  -- 4. VERIFICA CAP UTENTE
  SELECT COUNT(*) INTO v_user_tickets_count
  FROM public.lottery_tickets
  WHERE cycle_id = p_cycle_id AND user_id = v_user_id AND status = 'active';
  
  IF v_user_tickets_count + p_quantity > v_max_per_user THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'MAX_TICKETS_EXCEEDED',
      'message', format('Max %s biglietti. Ne hai già %s.', v_max_per_user, v_user_tickets_count),
      'current_tickets', v_user_tickets_count,
      'max_tickets', v_max_per_user
    );
  END IF;
  
  -- 5. VERIFICA SALDO M1U
  v_total_cost := p_quantity * v_ticket_price;
  
  SELECT m1_units INTO v_current_m1u
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL OR v_current_m1u < v_total_cost THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INSUFFICIENT_BALANCE',
      'message', format('Saldo insufficiente. Servono %s M1U, hai %s M1U.', v_total_cost, COALESCE(v_current_m1u, 0))
    );
  END IF;
  
  -- Verifica se è il primo acquisto dell'utente in questo ciclo
  v_is_first_purchase := (v_user_tickets_count = 0);
  
  -- 6. TRANSAZIONE ATOMICA
  
  -- Addebita M1U
  UPDATE public.profiles
  SET m1_units = m1_units - v_total_cost, updated_at = now()
  WHERE id = v_user_id AND m1_units >= v_total_cost;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'DEBIT_FAILED',
      'message', 'Errore durante l''addebito'
    );
  END IF;
  
  -- Crea purchase record
  INSERT INTO public.lottery_purchases (
    cycle_id, user_id, tickets_count, unit_price_m1u, total_m1u, request_id, source, status
  )
  VALUES (
    p_cycle_id, v_user_id, p_quantity, v_ticket_price, v_total_cost, p_request_id, p_source, 'completed'
  )
  RETURNING id INTO v_purchase_id;
  
  -- Crea N ticket
  FOR v_i IN 1..p_quantity LOOP
    INSERT INTO public.lottery_tickets (cycle_id, user_id, purchase_id, status)
    VALUES (p_cycle_id, v_user_id, v_purchase_id, 'active')
    RETURNING id INTO v_new_ticket_id;
    
    v_ticket_ids := array_append(v_ticket_ids, v_new_ticket_id);
  END LOOP;
  
  -- Aggiorna contatori ciclo
  UPDATE public.mission_cycles
  SET 
    total_tickets = total_tickets + p_quantity,
    total_participants = CASE 
      WHEN v_is_first_purchase THEN total_participants + 1 
      ELSE total_participants 
    END,
    updated_at = now()
  WHERE id = p_cycle_id;
  
  -- Ritorna successo
  RETURN jsonb_build_object(
    'status', 'success',
    'message', format('Acquistati %s biglietti!', p_quantity),
    'purchase_id', v_purchase_id,
    'tickets_count', p_quantity,
    'total_cost', v_total_cost,
    'ticket_ids', v_ticket_ids,
    'new_balance', v_current_m1u - v_total_cost
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.buy_lottery_tickets(UUID, INT, UUID, TEXT) TO authenticated;
NOTIFY pgrst, 'reload schema';

SELECT 'buy_lottery_tickets FIX COMPLETATO ✅' AS status;

