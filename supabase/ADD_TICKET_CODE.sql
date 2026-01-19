-- ═══════════════════════════════════════════════════════════════════════════════
-- ADD TICKET CODE - Codice visuale biglietto (9 numeri + 1 lettera)
-- Esegui questo SQL in Supabase
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Aggiungi colonna ticket_code
ALTER TABLE public.lottery_tickets 
ADD COLUMN IF NOT EXISTS ticket_code TEXT;

-- 2. Funzione per generare codice unico (9 numeri + 1 lettera)
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_numbers TEXT;
  v_letter TEXT;
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Genera 9 numeri random
    v_numbers := LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
    
    -- Genera 1 lettera random (A-Z)
    v_letter := CHR(65 + FLOOR(RANDOM() * 26)::INT);
    
    -- Combina
    v_code := v_numbers || v_letter;
    
    -- Verifica unicità
    SELECT EXISTS(SELECT 1 FROM public.lottery_tickets WHERE ticket_code = v_code) INTO v_exists;
    
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$;

-- 3. Aggiorna i biglietti esistenti senza codice
UPDATE public.lottery_tickets 
SET ticket_code = public.generate_ticket_code()
WHERE ticket_code IS NULL;

-- 4. Rendi la colonna NOT NULL con default
ALTER TABLE public.lottery_tickets 
ALTER COLUMN ticket_code SET DEFAULT public.generate_ticket_code();

-- 5. Aggiungi indice per performance
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_code ON public.lottery_tickets(ticket_code);

-- 6. Aggiorna buy_lottery_tickets per generare il codice
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
  v_cycle RECORD;
  v_current_m1u NUMERIC;
  v_user_tickets_count INT;
  v_total_cost INT;
  v_purchase_id UUID;
  v_existing_purchase UUID;
  v_ticket_ids UUID[] := ARRAY[]::UUID[];
  v_ticket_codes TEXT[] := ARRAY[]::TEXT[];
  v_i INT;
  v_new_ticket_id UUID;
  v_new_ticket_code TEXT;
  v_is_first_purchase BOOLEAN;
BEGIN
  -- 1. AUTENTICAZIONE
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'NOT_AUTHENTICATED', 'message', 'Non autenticato');
  END IF;
  
  -- 2. VALIDAZIONE
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
  
  -- 5. VERIFICA CAP
  SELECT COUNT(*) INTO v_user_tickets_count
  FROM public.lottery_tickets WHERE cycle_id = p_cycle_id AND user_id = v_user_id AND status = 'active';
  
  IF v_user_tickets_count + p_quantity > v_cycle.max_tickets_per_user THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'MAX_TICKETS_EXCEEDED', 
      'message', format('Max %s biglietti', v_cycle.max_tickets_per_user));
  END IF;
  
  -- 6. VERIFICA SALDO
  v_total_cost := p_quantity * v_cycle.ticket_price_m1u;
  SELECT m1_units INTO v_current_m1u FROM public.profiles WHERE id = v_user_id;
  IF v_current_m1u IS NULL OR v_current_m1u < v_total_cost THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_BALANCE', 
      'message', format('Servono %s M1U', v_total_cost));
  END IF;
  
  v_is_first_purchase := (v_user_tickets_count = 0);
  
  -- 7. ADDEBITA
  UPDATE public.profiles SET m1_units = m1_units - v_total_cost, updated_at = now()
  WHERE id = v_user_id AND m1_units >= v_total_cost;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'code', 'DEBIT_FAILED', 'message', 'Errore addebito');
  END IF;
  
  -- 8. CREA PURCHASE
  INSERT INTO public.lottery_purchases (cycle_id, user_id, tickets_count, unit_price_m1u, request_id, source, status)
  VALUES (p_cycle_id, v_user_id, p_quantity, v_cycle.ticket_price_m1u, p_request_id, p_source, 'completed')
  RETURNING id INTO v_purchase_id;
  
  -- 9. CREA TICKETS CON CODICE
  FOR v_i IN 1..p_quantity LOOP
    v_new_ticket_code := public.generate_ticket_code();
    
    INSERT INTO public.lottery_tickets (cycle_id, user_id, purchase_id, ticket_code, status)
    VALUES (p_cycle_id, v_user_id, v_purchase_id, v_new_ticket_code, 'active')
    RETURNING id INTO v_new_ticket_id;
    
    v_ticket_ids := array_append(v_ticket_ids, v_new_ticket_id);
    v_ticket_codes := array_append(v_ticket_codes, v_new_ticket_code);
  END LOOP;
  
  -- 10. AGGIORNA CONTATORI
  UPDATE public.mission_cycles SET 
    total_tickets = total_tickets + p_quantity,
    total_participants = CASE WHEN v_is_first_purchase THEN total_participants + 1 ELSE total_participants END,
    updated_at = now()
  WHERE id = p_cycle_id;
  
  -- SUCCESSO con codici biglietto!
  RETURN jsonb_build_object(
    'status', 'success',
    'message', format('🎫 %s biglietti acquistati!', p_quantity),
    'purchase_id', v_purchase_id,
    'tickets_count', p_quantity,
    'total_cost', v_total_cost,
    'ticket_ids', v_ticket_ids,
    'ticket_codes', v_ticket_codes,
    'new_balance', v_current_m1u - v_total_cost
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.buy_lottery_tickets(UUID, INT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_ticket_code() TO authenticated;

-- 7. Aggiorna get_user_lottery_tickets per includere il codice
DROP FUNCTION IF EXISTS public.get_user_lottery_tickets(UUID);

CREATE OR REPLACE FUNCTION public.get_user_lottery_tickets(p_cycle_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_tickets JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Non autenticato');
  END IF;
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'ticket_code', t.ticket_code,
      'status', t.status,
      'created_at', t.created_at,
      'draw_rank', t.draw_rank,
      'prize_amount', t.prize_amount,
      'cycle_id', t.cycle_id
    ) ORDER BY t.created_at DESC
  )
  INTO v_tickets
  FROM public.lottery_tickets t
  WHERE t.user_id = v_user_id 
    AND t.status = 'active'
    AND (p_cycle_id IS NULL OR t.cycle_id = p_cycle_id);
  
  RETURN jsonb_build_object(
    'status', 'success',
    'tickets', COALESCE(v_tickets, '[]'::jsonb),
    'count', COALESCE(jsonb_array_length(v_tickets), 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_lottery_tickets(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';

SELECT '✅ TICKET CODE SYSTEM READY!' AS status;

