-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — RPC FUNCTIONS
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- FUNZIONI:
-- 1. buy_lottery_tickets(cycle_id, quantity, request_id) — Acquisto atomico
-- 2. get_lottery_status(cycle_id) — Status ciclo con stats utente
-- 3. get_active_lottery_cycle() — Ciclo attivo corrente
-- 4. get_user_lottery_tickets(cycle_id) — Lista ticket utente (senza seed)
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 1: buy_lottery_tickets
-- Acquisto atomico di N ticket per un ciclo
-- ══════════════════════════════════════════════════════════════════════════════

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
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. VALIDAZIONI BASE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Verifica autenticazione
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NOT_AUTHENTICATED',
      'message', 'Devi essere autenticato per acquistare biglietti'
    );
  END IF;
  
  -- Verifica quantità valida
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INVALID_QUANTITY',
      'message', 'La quantità deve essere maggiore di 0'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. IDEMPOTENZA CHECK
  -- ═══════════════════════════════════════════════════════════════════════════
  
  IF p_request_id IS NOT NULL THEN
    SELECT id INTO v_existing_purchase
    FROM public.lottery_purchases
    WHERE request_id = p_request_id;
    
    IF v_existing_purchase IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'already_purchased',
        'code', 'IDEMPOTENT_DUPLICATE',
        'purchase_id', v_existing_purchase,
        'message', 'Acquisto già completato con questo request_id'
      );
    END IF;
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. VERIFICA CICLO
  -- ═══════════════════════════════════════════════════════════════════════════
  
  SELECT * INTO v_cycle
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE; -- Lock per consistenza
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo lotteria non trovato'
    );
  END IF;
  
  -- Verifica stato ciclo
  IF v_cycle.status != 'active' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_ACTIVE',
      'message', CASE v_cycle.status
        WHEN 'locking' THEN 'La lotteria sta per chiudersi, riprova nel prossimo ciclo'
        WHEN 'drawing' THEN 'Estrazione in corso, riprova nel prossimo ciclo'
        WHEN 'completed' THEN 'Questo ciclo è già terminato'
        WHEN 'cancelled' THEN 'Questo ciclo è stato annullato'
        ELSE 'Ciclo non disponibile'
      END
    );
  END IF;
  
  -- Verifica date
  IF now() < v_cycle.starts_at THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_STARTED',
      'message', 'La lotteria non è ancora iniziata'
    );
  END IF;
  
  IF now() > v_cycle.ends_at THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_ENDED',
      'message', 'La lotteria è già terminata'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. VERIFICA CAP UTENTE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  SELECT COUNT(*) INTO v_user_tickets_count
  FROM public.lottery_tickets
  WHERE cycle_id = p_cycle_id AND user_id = v_user_id AND status = 'active';
  
  IF v_user_tickets_count + p_quantity > v_cycle.max_tickets_per_user THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'MAX_TICKETS_EXCEEDED',
      'message', format('Puoi acquistare massimo %s biglietti per questo ciclo. Ne hai già %s.', 
        v_cycle.max_tickets_per_user, v_user_tickets_count),
      'current_tickets', v_user_tickets_count,
      'max_tickets', v_cycle.max_tickets_per_user,
      'requested', p_quantity
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 5. VERIFICA SALDO M1U
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_total_cost := p_quantity * v_cycle.ticket_price_m1u;
  
  SELECT m1_units INTO v_current_m1u
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL OR v_current_m1u < v_total_cost THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INSUFFICIENT_BALANCE',
      'message', format('Saldo insufficiente. Servono %s M1U, hai %s M1U.', 
        v_total_cost, COALESCE(v_current_m1u, 0)),
      'required', v_total_cost,
      'current_balance', COALESCE(v_current_m1u, 0)
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 6. TRANSAZIONE ATOMICA: ADDEBITO + INSERT
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Addebita M1U
  UPDATE public.profiles
  SET m1_units = m1_units - v_total_cost,
      updated_at = now()
  WHERE id = v_user_id AND m1_units >= v_total_cost;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'DEBIT_FAILED',
      'message', 'Errore durante l''addebito. Riprova.'
    );
  END IF;
  
  -- Crea record purchase
  INSERT INTO public.lottery_purchases (
    cycle_id, user_id, tickets_count, unit_price_m1u, request_id, source, status
  )
  VALUES (
    p_cycle_id, v_user_id, p_quantity, v_cycle.ticket_price_m1u, p_request_id, p_source, 'completed'
  )
  RETURNING id INTO v_purchase_id;
  
  -- Crea N ticket
  FOR v_i IN 1..p_quantity LOOP
    INSERT INTO public.lottery_tickets (
      cycle_id, user_id, purchase_id, status
    )
    VALUES (
      p_cycle_id, v_user_id, v_purchase_id, 'active'
    )
    RETURNING id INTO v_new_ticket_id;
    
    v_ticket_ids := array_append(v_ticket_ids, v_new_ticket_id);
  END LOOP;
  
  -- Aggiorna contatori ciclo
  UPDATE public.mission_cycles
  SET total_tickets = total_tickets + p_quantity,
      total_participants = (
        SELECT COUNT(DISTINCT user_id) 
        FROM public.lottery_tickets 
        WHERE cycle_id = p_cycle_id AND status = 'active'
      ),
      updated_at = now()
  WHERE id = p_cycle_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 7. AUDIT LOG
  -- ═══════════════════════════════════════════════════════════════════════════
  
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, purchase_id, event_type, event_details
  )
  VALUES (
    p_cycle_id,
    v_user_id,
    v_purchase_id,
    'ticket_purchased',
    jsonb_build_object(
      'tickets_count', p_quantity,
      'total_m1u', v_total_cost,
      'unit_price', v_cycle.ticket_price_m1u,
      'ticket_ids', v_ticket_ids,
      'source', p_source,
      'request_id', p_request_id
    )
  );
  
  -- Log su analytics_events (esistente)
  INSERT INTO public.analytics_events (
    event_name, user_id, session_id, platform, props, event_version
  )
  VALUES (
    'lottery_buy_success',
    v_user_id,
    'server',
    COALESCE(p_source, 'web'),
    jsonb_build_object(
      'cycle_id', p_cycle_id,
      'purchase_id', v_purchase_id,
      'tickets_count', p_quantity,
      'total_m1u', v_total_cost
    ),
    1
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. RETURN SUCCESS
  -- ═══════════════════════════════════════════════════════════════════════════
  
  RETURN jsonb_build_object(
    'status', 'success',
    'purchase_id', v_purchase_id,
    'tickets_count', p_quantity,
    'ticket_ids', v_ticket_ids,
    'total_m1u', v_total_cost,
    'new_balance', v_current_m1u - v_total_cost,
    'user_total_tickets', v_user_tickets_count + p_quantity,
    'message', format('Acquistati %s biglietti per %s M1U!', p_quantity, v_total_cost)
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Idempotency: request_id duplicato
    SELECT id INTO v_existing_purchase
    FROM public.lottery_purchases
    WHERE request_id = p_request_id;
    
    RETURN jsonb_build_object(
      'status', 'already_purchased',
      'code', 'IDEMPOTENT_DUPLICATE',
      'purchase_id', v_existing_purchase,
      'message', 'Acquisto già completato'
    );
  WHEN OTHERS THEN
    -- Log errore
    INSERT INTO public.lottery_audit_logs (
      cycle_id, user_id, event_type, event_details
    )
    VALUES (
      p_cycle_id,
      v_user_id,
      'error',
      jsonb_build_object(
        'error', SQLERRM,
        'quantity', p_quantity,
        'request_id', p_request_id
      )
    );
    
    RAISE LOG 'Error in buy_lottery_tickets: %', SQLERRM;
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INTERNAL_ERROR',
      'message', 'Errore interno. Riprova.'
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 2: get_lottery_status
-- Status completo di un ciclo con statistiche utente
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_lottery_status(
  p_cycle_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_cycle RECORD;
  v_user_tickets_count INT;
  v_user_purchases JSONB;
  v_draw RECORD;
  v_progress_percent NUMERIC;
  v_time_remaining INTERVAL;
BEGIN
  v_user_id := auth.uid();
  
  -- Se non specificato, prende il ciclo attivo
  IF p_cycle_id IS NULL THEN
    SELECT * INTO v_cycle
    FROM public.mission_cycles
    WHERE status = 'active' AND now() BETWEEN starts_at AND ends_at
    ORDER BY starts_at DESC
    LIMIT 1;
  ELSE
    SELECT * INTO v_cycle
    FROM public.mission_cycles
    WHERE id = p_cycle_id;
  END IF;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'no_active_cycle',
      'message', 'Nessun ciclo lotteria attivo al momento'
    );
  END IF;
  
  -- Calcola statistiche utente (se autenticato)
  IF v_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_tickets_count
    FROM public.lottery_tickets
    WHERE cycle_id = v_cycle.id AND user_id = v_user_id AND status = 'active';
    
    SELECT jsonb_agg(jsonb_build_object(
      'id', lp.id,
      'tickets_count', lp.tickets_count,
      'total_m1u', lp.total_m1u,
      'created_at', lp.created_at
    ) ORDER BY lp.created_at DESC)
    INTO v_user_purchases
    FROM public.lottery_purchases lp
    WHERE lp.cycle_id = v_cycle.id AND lp.user_id = v_user_id AND lp.status = 'completed';
  ELSE
    v_user_tickets_count := 0;
    v_user_purchases := '[]'::jsonb;
  END IF;
  
  -- Calcola progresso soglia
  v_progress_percent := ROUND(
    (v_cycle.total_tickets::numeric / NULLIF(v_cycle.min_tickets_required, 0)) * 100, 
    2
  );
  
  -- Calcola tempo rimanente
  v_time_remaining := v_cycle.ends_at - now();
  
  -- Recupera draw se completato
  IF v_cycle.status = 'completed' THEN
    SELECT * INTO v_draw
    FROM public.lottery_draws
    WHERE cycle_id = v_cycle.id;
  END IF;
  
  RETURN jsonb_build_object(
    -- Ciclo
    'cycle_id', v_cycle.id,
    'status', v_cycle.status,
    'starts_at', v_cycle.starts_at,
    'ends_at', v_cycle.ends_at,
    'time_remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM v_time_remaining)::int),
    
    -- Configurazione
    'ticket_price_m1u', v_cycle.ticket_price_m1u,
    'min_tickets_required', v_cycle.min_tickets_required,
    'max_tickets_per_user', v_cycle.max_tickets_per_user,
    
    -- Statistiche globali
    'total_tickets', v_cycle.total_tickets,
    'total_participants', v_cycle.total_participants,
    'prize_pool_total', v_cycle.prize_pool_total,
    'progress_percent', LEAST(100, v_progress_percent),
    'threshold_reached', v_cycle.total_tickets >= v_cycle.min_tickets_required,
    
    -- Premi
    'prizes_json', v_cycle.prizes_json,
    'prizes_effective_json', v_cycle.prizes_effective_json,
    'prize_multiplier', v_cycle.prize_multiplier,
    
    -- User stats
    'user_tickets_count', v_user_tickets_count,
    'user_can_buy_more', v_user_tickets_count < v_cycle.max_tickets_per_user,
    'user_remaining_tickets', v_cycle.max_tickets_per_user - v_user_tickets_count,
    'user_purchases', COALESCE(v_user_purchases, '[]'::jsonb),
    
    -- Draw (se completato)
    'draw', CASE 
      WHEN v_draw IS NOT NULL THEN jsonb_build_object(
        'id', v_draw.id,
        'completed_at', v_draw.draw_completed_at,
        'winners', v_draw.winners,
        'public_seed', v_draw.public_seed,
        'draw_proof_hash', v_draw.draw_proof_hash,
        'threshold_reached', v_draw.threshold_reached,
        'prize_multiplier', v_draw.prize_multiplier
      )
      ELSE NULL
    END,
    
    -- Messaggi narrativi
    'narrative', CASE
      WHEN v_cycle.status = 'active' AND v_progress_percent < 25 THEN 
        'La Missione è appena iniziata. Ogni biglietto conta!'
      WHEN v_cycle.status = 'active' AND v_progress_percent < 50 THEN 
        'La Missione sta prendendo forma. Partecipa per aumentare il montepremi!'
      WHEN v_cycle.status = 'active' AND v_progress_percent < 75 THEN 
        'La Missione è a buon punto! Manca poco per raggiungere l''obiettivo.'
      WHEN v_cycle.status = 'active' AND v_progress_percent < 100 THEN 
        'La Missione è quasi completa! Ultimi biglietti disponibili.'
      WHEN v_cycle.status = 'active' AND v_progress_percent >= 100 THEN 
        'Obiettivo raggiunto! Premi al 100%. La Missione è un successo!'
      WHEN v_cycle.status = 'locking' THEN 
        'La Missione sta per concludersi. Estrazione imminente.'
      WHEN v_cycle.status = 'drawing' THEN 
        'Estrazione in corso...'
      WHEN v_cycle.status = 'completed' THEN 
        'La Missione è conclusa. Verifica i risultati!'
      ELSE 'Stato sconosciuto'
    END
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 3: get_active_lottery_cycle
-- Restituisce il ciclo attivo corrente (shortcut)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_active_lottery_cycle()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.get_lottery_status(NULL);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 4: get_user_lottery_tickets
-- Lista ticket utente (senza esporre seed)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_lottery_tickets(
  p_cycle_id UUID
)
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
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Non autenticato'
    );
  END IF;
  
  SELECT jsonb_agg(jsonb_build_object(
    'id', lt.id,
    'status', lt.status,
    'created_at', lt.created_at,
    'ticket_hash', lt.ticket_hash, -- Solo hash, mai seed
    'draw_rank', lt.draw_rank,
    'prize_amount', lt.prize_amount
  ) ORDER BY lt.created_at DESC)
  INTO v_tickets
  FROM public.lottery_tickets lt
  WHERE lt.cycle_id = p_cycle_id AND lt.user_id = v_user_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'cycle_id', p_cycle_id,
    'tickets', COALESCE(v_tickets, '[]'::jsonb),
    'count', (SELECT COUNT(*) FROM public.lottery_tickets WHERE cycle_id = p_cycle_id AND user_id = v_user_id)
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ══════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.buy_lottery_tickets(UUID, INT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lottery_status(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_active_lottery_cycle() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_lottery_tickets(UUID) TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTI
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.buy_lottery_tickets IS 
'M1SSION™ Lottery - Acquisto atomico di N biglietti con idempotenza e cap utente.';

COMMENT ON FUNCTION public.get_lottery_status IS 
'M1SSION™ Lottery - Status completo ciclo con statistiche utente.';

COMMENT ON FUNCTION public.get_active_lottery_cycle IS 
'M1SSION™ Lottery - Shortcut per ciclo attivo corrente.';

COMMENT ON FUNCTION public.get_user_lottery_tickets IS 
'M1SSION™ Lottery - Lista ticket utente (senza seed esposto).';

-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – LOTTERY RPC v1.0
-- ══════════════════════════════════════════════════════════════════════════════

