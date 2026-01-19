-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX DEFINITIVO: buy_lottery_tickets - ERRORE 400
-- Esegui questo SQL ADESSO in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Prima verifica la struttura della tabella lottery_purchases
SELECT column_name, is_generated, generation_expression
FROM information_schema.columns 
WHERE table_name = 'lottery_purchases' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop tutte le versioni esistenti della funzione
DROP FUNCTION IF EXISTS public.buy_lottery_tickets(UUID, INT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.buy_lottery_tickets(UUID, INT, UUID);
DROP FUNCTION IF EXISTS public.buy_lottery_tickets(UUID, INT);

-- Ricrea la funzione SENZA inserire total_m1u (è GENERATED)
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
  v_cycle RECORD;
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
  -- 1. AUTENTICAZIONE
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'NOT_AUTHENTICATED', 'message', 'Non autenticato');
  END IF;
  
  -- 2. VALIDAZIONE QUANTITÀ
  IF p_quantity IS NULL OR p_quantity <= 0 OR p_quantity > 100 THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'INVALID_QUANTITY', 'message', 'Quantità non valida (1-100)');
  END IF;
  
  -- 3. IDEMPOTENZA
  IF p_request_id IS NOT NULL THEN
    SELECT id INTO v_existing_purchase FROM public.lottery_purchases WHERE request_id = p_request_id;
    IF v_existing_purchase IS NOT NULL THEN
      RETURN jsonb_build_object('status', 'already_purchased', 'purchase_id', v_existing_purchase);
    END IF;
  END IF;
  
  -- 4. VERIFICA CICLO
  SELECT * INTO v_cycle FROM public.mission_cycles WHERE id = p_cycle_id FOR UPDATE;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'CYCLE_NOT_FOUND', 'message', 'Ciclo non trovato');
  END IF;
  
  IF v_cycle.status != 'active' THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'CYCLE_NOT_ACTIVE', 'message', 'Ciclo non attivo');
  END IF;
  
  -- 5. VERIFICA CAP UTENTE
  SELECT COUNT(*) INTO v_user_tickets_count
  FROM public.lottery_tickets
  WHERE cycle_id = p_cycle_id AND user_id = v_user_id AND status = 'active';
  
  IF v_user_tickets_count + p_quantity > v_cycle.max_tickets_per_user THEN
    RETURN jsonb_build_object(
      'status', 'error', 
      'code', 'MAX_TICKETS_EXCEEDED', 
      'message', format('Max %s biglietti. Ne hai già %s.', v_cycle.max_tickets_per_user, v_user_tickets_count)
    );
  END IF;
  
  -- 6. VERIFICA SALDO
  v_total_cost := p_quantity * v_cycle.ticket_price_m1u;
  SELECT m1_units INTO v_current_m1u FROM public.profiles WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL OR v_current_m1u < v_total_cost THEN
    RETURN jsonb_build_object(
      'status', 'error', 
      'code', 'INSUFFICIENT_BALANCE', 
      'message', format('Servono %s M1U, hai %s', v_total_cost, COALESCE(v_current_m1u, 0))
    );
  END IF;
  
  v_is_first_purchase := (v_user_tickets_count = 0);
  
  -- 7. ADDEBITA M1U
  UPDATE public.profiles SET m1_units = m1_units - v_total_cost, updated_at = now()
  WHERE id = v_user_id AND m1_units >= v_total_cost;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'DEBIT_FAILED', 'message', 'Errore addebito');
  END IF;
  
  -- 8. CREA PURCHASE (SENZA total_m1u se è GENERATED)
  BEGIN
    INSERT INTO public.lottery_purchases (cycle_id, user_id, tickets_count, unit_price_m1u, request_id, source, status)
    VALUES (p_cycle_id, v_user_id, p_quantity, v_cycle.ticket_price_m1u, p_request_id, p_source, 'completed')
    RETURNING id INTO v_purchase_id;
  EXCEPTION WHEN OTHERS THEN
    -- Se fallisce, prova con total_m1u (non è GENERATED)
    INSERT INTO public.lottery_purchases (cycle_id, user_id, tickets_count, unit_price_m1u, total_m1u, request_id, source, status)
    VALUES (p_cycle_id, v_user_id, p_quantity, v_cycle.ticket_price_m1u, v_total_cost, p_request_id, p_source, 'completed')
    RETURNING id INTO v_purchase_id;
  END;
  
  -- 9. CREA TICKETS
  FOR v_i IN 1..p_quantity LOOP
    INSERT INTO public.lottery_tickets (cycle_id, user_id, purchase_id, status)
    VALUES (p_cycle_id, v_user_id, v_purchase_id, 'active')
    RETURNING id INTO v_new_ticket_id;
    
    v_ticket_ids := array_append(v_ticket_ids, v_new_ticket_id);
  END LOOP;
  
  -- 10. AGGIORNA CONTATORI
  UPDATE public.mission_cycles
  SET 
    total_tickets = total_tickets + p_quantity,
    total_participants = CASE WHEN v_is_first_purchase THEN total_participants + 1 ELSE total_participants END,
    updated_at = now()
  WHERE id = p_cycle_id;
  
  -- SUCCESSO!
  RETURN jsonb_build_object(
    'status', 'success',
    'message', format('🎫 %s biglietti acquistati!', p_quantity),
    'purchase_id', v_purchase_id,
    'tickets_count', p_quantity,
    'total_cost', v_total_cost,
    'ticket_ids', v_ticket_ids,
    'new_balance', v_current_m1u - v_total_cost
  );
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.buy_lottery_tickets(UUID, INT, UUID, TEXT) TO authenticated;

-- Reload schema
NOTIFY pgrst, 'reload schema';

-- Test che la funzione esista
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'buy_lottery_tickets';

SELECT '✅ FIX COMPLETATO - Prova ad acquistare un biglietto!' AS status;

