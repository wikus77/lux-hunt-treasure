-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — ADMIN/DRAW FUNCTIONS
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- FUNZIONI ADMIN:
-- 1. create_lottery_cycle(...) — Crea nuovo ciclo
-- 2. finalize_cycle_and_draw(cycle_id) — Estrazione finale con prize_multiplier
-- 3. cancel_lottery_cycle(cycle_id) — Annulla ciclo con refund
-- 4. admin_get_lottery_analytics() — Analytics per admin
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 1: create_lottery_cycle
-- Crea un nuovo ciclo lotteria (solo admin)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_lottery_cycle(
  p_starts_at TIMESTAMPTZ DEFAULT now(),
  p_duration_days INT DEFAULT 30,
  p_ticket_price_m1u INT DEFAULT 10,
  p_min_tickets_required INT DEFAULT 4000,
  p_max_tickets_per_user INT DEFAULT 100,
  p_prizes_json JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_cycle_id UUID;
  v_ends_at TIMESTAMPTZ;
  v_default_prizes JSONB := '[
    {"rank": 1, "percent": 50, "label": "1° Premio"},
    {"rank": 2, "percent": 30, "label": "2° Premio"},
    {"rank": 3, "percent": 20, "label": "3° Premio"}
  ]'::jsonb;
BEGIN
  -- Verifica admin
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono creare cicli lotteria'
    );
  END IF;
  
  -- Verifica no cicli attivi sovrapposti
  IF EXISTS (
    SELECT 1 FROM public.mission_cycles
    WHERE status = 'active'
    AND (p_starts_at, p_starts_at + (p_duration_days || ' days')::interval) 
        OVERLAPS (starts_at, ends_at)
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'OVERLAPPING_CYCLE',
      'message', 'Esiste già un ciclo attivo che si sovrappone a queste date'
    );
  END IF;
  
  v_ends_at := p_starts_at + (p_duration_days || ' days')::interval;
  
  -- Crea ciclo
  INSERT INTO public.mission_cycles (
    starts_at,
    ends_at,
    status,
    ticket_price_m1u,
    min_tickets_required,
    max_tickets_per_user,
    prizes_json,
    created_by
  )
  VALUES (
    p_starts_at,
    v_ends_at,
    CASE WHEN p_starts_at <= now() THEN 'active' ELSE 'active' END,
    p_ticket_price_m1u,
    p_min_tickets_required,
    p_max_tickets_per_user,
    COALESCE(p_prizes_json, v_default_prizes),
    v_user_id
  )
  RETURNING id INTO v_cycle_id;
  
  -- Audit log
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    v_cycle_id,
    v_user_id,
    'cycle_created',
    jsonb_build_object(
      'starts_at', p_starts_at,
      'ends_at', v_ends_at,
      'duration_days', p_duration_days,
      'ticket_price_m1u', p_ticket_price_m1u,
      'min_tickets_required', p_min_tickets_required,
      'max_tickets_per_user', p_max_tickets_per_user
    )
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'cycle_id', v_cycle_id,
    'starts_at', p_starts_at,
    'ends_at', v_ends_at,
    'message', 'Ciclo lotteria creato con successo'
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 2: finalize_cycle_and_draw
-- Esegue l'estrazione finale con calcolo prize_multiplier
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.finalize_cycle_and_draw(
  p_cycle_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_cycle RECORD;
  v_draw_id UUID;
  v_public_seed TEXT;
  v_prize_multiplier NUMERIC(5,4);
  v_threshold_reached BOOLEAN;
  v_total_prize_pool INT;
  v_winners JSONB := '[]'::jsonb;
  v_ranked_tickets RECORD;
  v_prize_config RECORD;
  v_rank_counter INT := 0;
  v_prize_amount INT;
  v_winner_user_id UUID;
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. VERIFICA AUTORIZZAZIONE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono eseguire l''estrazione'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. RECUPERA E BLOCCA CICLO
  -- ═══════════════════════════════════════════════════════════════════════════
  
  SELECT * INTO v_cycle
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo non trovato'
    );
  END IF;
  
  IF v_cycle.status NOT IN ('active', 'locking') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INVALID_STATUS',
      'message', format('Il ciclo è in stato "%s", non può essere estratto', v_cycle.status)
    );
  END IF;
  
  -- Verifica almeno 1 ticket
  IF v_cycle.total_tickets = 0 THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NO_TICKETS',
      'message', 'Nessun biglietto venduto, estrazione non possibile'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. LOCK CICLO (no nuovi acquisti)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  UPDATE public.mission_cycles
  SET status = 'drawing', updated_at = now()
  WHERE id = p_cycle_id;
  
  -- Audit
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    p_cycle_id, v_user_id, 'draw_started',
    jsonb_build_object('total_tickets', v_cycle.total_tickets)
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. GENERA PUBLIC SEED (verifiable randomness)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_public_seed := encode(
    sha256(
      (
        p_cycle_id::text || 
        now()::text || 
        gen_random_uuid()::text || 
        v_cycle.total_tickets::text ||
        (SELECT string_agg(id::text, '') FROM public.lottery_tickets WHERE cycle_id = p_cycle_id ORDER BY created_at LIMIT 10)
      )::bytea
    ),
    'hex'
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 5. CALCOLA PRIZE MULTIPLIER (CONTROMISURA SOGLIA)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_threshold_reached := v_cycle.total_tickets >= v_cycle.min_tickets_required;
  
  IF v_threshold_reached THEN
    v_prize_multiplier := 1.0000;
  ELSE
    -- Multiplier proporzionale, con minimo 0.25 (25%)
    v_prize_multiplier := GREATEST(
      0.2500,
      ROUND(v_cycle.total_tickets::numeric / v_cycle.min_tickets_required, 4)
    );
  END IF;
  
  -- Prize pool effettivo
  v_total_prize_pool := v_cycle.prize_pool_total;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 6. ESTRAZIONE VINCITORI (ranking deterministico basato su seed)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Per ogni ticket, calcola un rank_score = hash(public_seed + ticket_seed)
  -- Ordina per rank_score, i primi N sono i vincitori
  
  FOR v_ranked_tickets IN (
    SELECT 
      lt.id AS ticket_id,
      lt.user_id,
      lt.ticket_seed,
      encode(
        sha256((v_public_seed || lt.ticket_seed::text || lt.id::text)::bytea),
        'hex'
      ) AS rank_score
    FROM public.lottery_tickets lt
    WHERE lt.cycle_id = p_cycle_id AND lt.status = 'active'
    ORDER BY rank_score ASC
    LIMIT 3 -- Top 3
  ) LOOP
    v_rank_counter := v_rank_counter + 1;
    
    -- Calcola premio per questo rank
    SELECT 
      (elem->>'percent')::numeric / 100 * v_total_prize_pool * v_prize_multiplier
    INTO v_prize_amount
    FROM jsonb_array_elements(v_cycle.prizes_json) elem
    WHERE (elem->>'rank')::int = v_rank_counter;
    
    v_prize_amount := COALESCE(FLOOR(v_prize_amount), 0);
    
    -- Aggiorna ticket come vincitore
    UPDATE public.lottery_tickets
    SET status = 'winner',
        draw_rank = v_rank_counter,
        prize_amount = v_prize_amount
    WHERE id = v_ranked_tickets.ticket_id;
    
    -- Accredita M1U al vincitore
    IF v_prize_amount > 0 THEN
      UPDATE public.profiles
      SET m1_units = m1_units + v_prize_amount,
          updated_at = now()
      WHERE id = v_ranked_tickets.user_id;
      
      -- Registra in prize_awards
      INSERT INTO public.prize_awards (
        award_type, prize_id, user_id, source, evidence
      )
      VALUES (
        'event',
        'lottery_' || p_cycle_id::text || '_rank_' || v_rank_counter,
        v_ranked_tickets.user_id,
        'lottery_draw',
        jsonb_build_object(
          'cycle_id', p_cycle_id,
          'ticket_id', v_ranked_tickets.ticket_id,
          'rank', v_rank_counter,
          'prize_amount', v_prize_amount,
          'prize_multiplier', v_prize_multiplier
        )
      );
      
      -- Analytics
      INSERT INTO public.analytics_events (
        event_name, user_id, session_id, platform, props, event_version
      )
      VALUES (
        'lottery_prize_awarded',
        v_ranked_tickets.user_id,
        'server',
        'web',
        jsonb_build_object(
          'cycle_id', p_cycle_id,
          'rank', v_rank_counter,
          'prize_amount', v_prize_amount
        ),
        1
      );
    END IF;
    
    -- Aggiungi a winners JSON
    v_winners := v_winners || jsonb_build_object(
      'rank', v_rank_counter,
      'user_id', v_ranked_tickets.user_id,
      'ticket_id', v_ranked_tickets.ticket_id,
      'prize_m1u', v_prize_amount
    );
  END LOOP;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 7. CREA RECORD DRAW (immutabile)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  INSERT INTO public.lottery_draws (
    cycle_id,
    draw_started_at,
    draw_completed_at,
    public_seed,
    algorithm_version,
    winners,
    total_tickets_at_draw,
    total_participants_at_draw,
    prize_multiplier,
    threshold_reached
  )
  VALUES (
    p_cycle_id,
    now() - interval '1 second', -- started appena prima
    now(),
    v_public_seed,
    'v1.0.0',
    v_winners,
    v_cycle.total_tickets,
    v_cycle.total_participants,
    v_prize_multiplier,
    v_threshold_reached
  )
  RETURNING id INTO v_draw_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. AGGIORNA CICLO COME COMPLETATO
  -- ═══════════════════════════════════════════════════════════════════════════
  
  UPDATE public.mission_cycles
  SET status = 'completed',
      prize_multiplier = v_prize_multiplier,
      prizes_effective_json = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'rank', (elem->>'rank')::int,
            'percent', (elem->>'percent')::numeric,
            'label', elem->>'label',
            'amount_m1u', FLOOR(
              (elem->>'percent')::numeric / 100 * v_total_prize_pool * v_prize_multiplier
            )
          )
        )
        FROM jsonb_array_elements(v_cycle.prizes_json) elem
      ),
      updated_at = now()
  WHERE id = p_cycle_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 9. AUDIT FINALE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    p_cycle_id, v_user_id, 'draw_completed',
    jsonb_build_object(
      'draw_id', v_draw_id,
      'winners', v_winners,
      'prize_multiplier', v_prize_multiplier,
      'threshold_reached', v_threshold_reached,
      'public_seed', v_public_seed
    )
  );
  
  -- Analytics globale
  INSERT INTO public.analytics_events (
    event_name, user_id, session_id, platform, props, event_version
  )
  VALUES (
    'lottery_draw_complete',
    v_user_id,
    'server',
    'web',
    jsonb_build_object(
      'cycle_id', p_cycle_id,
      'draw_id', v_draw_id,
      'total_tickets', v_cycle.total_tickets,
      'winners_count', jsonb_array_length(v_winners),
      'prize_multiplier', v_prize_multiplier,
      'threshold_reached', v_threshold_reached
    ),
    1
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 10. RETURN SUCCESS
  -- ═══════════════════════════════════════════════════════════════════════════
  
  RETURN jsonb_build_object(
    'status', 'success',
    'draw_id', v_draw_id,
    'cycle_id', p_cycle_id,
    'total_tickets', v_cycle.total_tickets,
    'total_participants', v_cycle.total_participants,
    'prize_pool_total', v_total_prize_pool,
    'prize_multiplier', v_prize_multiplier,
    'threshold_reached', v_threshold_reached,
    'winners', v_winners,
    'public_seed', v_public_seed,
    'message', CASE 
      WHEN v_threshold_reached THEN 
        'Estrazione completata! Soglia raggiunta, premi al 100%!'
      ELSE 
        format('Estrazione completata! Soglia non raggiunta (%.0f%%), premi ridotti.', v_prize_multiplier * 100)
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback status
    UPDATE public.mission_cycles
    SET status = 'active', updated_at = now()
    WHERE id = p_cycle_id AND status = 'drawing';
    
    -- Log errore
    INSERT INTO public.lottery_audit_logs (
      cycle_id, user_id, event_type, event_details
    )
    VALUES (
      p_cycle_id, v_user_id, 'error',
      jsonb_build_object('error', SQLERRM, 'phase', 'draw')
    );
    
    RAISE LOG 'Error in finalize_cycle_and_draw: %', SQLERRM;
    
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'DRAW_FAILED',
      'message', 'Errore durante l''estrazione. Il ciclo è stato ripristinato.',
      'error', SQLERRM
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 3: cancel_lottery_cycle
-- Annulla un ciclo e rimborsa tutti i partecipanti
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cancel_lottery_cycle(
  p_cycle_id UUID,
  p_reason TEXT DEFAULT 'Admin cancellation'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_cycle RECORD;
  v_refund_count INT := 0;
  v_total_refunded INT := 0;
  v_purchase RECORD;
BEGIN
  -- Verifica admin
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono annullare cicli'
    );
  END IF;
  
  -- Recupera ciclo
  SELECT * INTO v_cycle
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo non trovato'
    );
  END IF;
  
  IF v_cycle.status = 'completed' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'ALREADY_COMPLETED',
      'message', 'Il ciclo è già completato, non può essere annullato'
    );
  END IF;
  
  IF v_cycle.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'ALREADY_CANCELLED',
      'message', 'Il ciclo è già stato annullato'
    );
  END IF;
  
  -- Rimborsa tutti gli acquisti
  FOR v_purchase IN (
    SELECT * FROM public.lottery_purchases
    WHERE cycle_id = p_cycle_id AND status = 'completed'
  ) LOOP
    -- Accredita M1U
    UPDATE public.profiles
    SET m1_units = m1_units + v_purchase.total_m1u,
        updated_at = now()
    WHERE id = v_purchase.user_id;
    
    -- Marca come refunded
    UPDATE public.lottery_purchases
    SET status = 'refunded', refunded_at = now()
    WHERE id = v_purchase.id;
    
    -- Voida i ticket
    UPDATE public.lottery_tickets
    SET status = 'void'
    WHERE purchase_id = v_purchase.id;
    
    v_refund_count := v_refund_count + 1;
    v_total_refunded := v_total_refunded + v_purchase.total_m1u;
    
    -- Audit per singolo refund
    INSERT INTO public.lottery_audit_logs (
      cycle_id, user_id, purchase_id, event_type, event_details
    )
    VALUES (
      p_cycle_id, v_purchase.user_id, v_purchase.id, 'ticket_refunded',
      jsonb_build_object('amount', v_purchase.total_m1u, 'reason', p_reason)
    );
  END LOOP;
  
  -- Aggiorna ciclo come cancelled
  UPDATE public.mission_cycles
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_cycle_id;
  
  -- Audit finale
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    p_cycle_id, v_user_id, 'cycle_cancelled',
    jsonb_build_object(
      'reason', p_reason,
      'refunds_count', v_refund_count,
      'total_refunded', v_total_refunded
    )
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'cycle_id', p_cycle_id,
    'refunds_count', v_refund_count,
    'total_refunded', v_total_refunded,
    'message', format('Ciclo annullato. Rimborsati %s acquisti per un totale di %s M1U.', v_refund_count, v_total_refunded)
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 4: admin_get_lottery_analytics
-- Analytics dettagliate per admin
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.admin_get_lottery_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
BEGIN
  -- Verifica admin
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono vedere le analytics'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'success',
    
    -- Cicli totali
    'cycles', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled')
      )
      FROM public.mission_cycles
    ),
    
    -- Vendite totali
    'sales', (
      SELECT jsonb_build_object(
        'total_purchases', COUNT(*),
        'total_tickets', SUM(tickets_count),
        'total_m1u', SUM(total_m1u),
        'unique_users', COUNT(DISTINCT user_id)
      )
      FROM public.lottery_purchases
      WHERE status = 'completed'
    ),
    
    -- Premi distribuiti
    'prizes', (
      SELECT jsonb_build_object(
        'total_winners', COUNT(*),
        'total_m1u_awarded', SUM(prize_amount),
        'avg_prize', ROUND(AVG(prize_amount), 2)
      )
      FROM public.lottery_tickets
      WHERE status = 'winner' AND prize_amount > 0
    ),
    
    -- Ultimi 10 cicli
    'recent_cycles', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', mc.id,
        'status', mc.status,
        'starts_at', mc.starts_at,
        'ends_at', mc.ends_at,
        'total_tickets', mc.total_tickets,
        'total_participants', mc.total_participants,
        'prize_pool_total', mc.prize_pool_total,
        'prize_multiplier', mc.prize_multiplier
      ) ORDER BY mc.created_at DESC)
      FROM public.mission_cycles mc
      LIMIT 10
    ),
    
    -- Ultimi 20 acquisti
    'recent_purchases', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', lp.id,
        'user_id', lp.user_id,
        'tickets_count', lp.tickets_count,
        'total_m1u', lp.total_m1u,
        'created_at', lp.created_at
      ) ORDER BY lp.created_at DESC)
      FROM public.lottery_purchases lp
      WHERE lp.status = 'completed'
      LIMIT 20
    )
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ══════════════════════════════════════════════════════════════════════════════

-- Admin-only functions
GRANT EXECUTE ON FUNCTION public.create_lottery_cycle(TIMESTAMPTZ, INT, INT, INT, INT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_cycle_and_draw(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_lottery_cycle(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_lottery_analytics() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTI
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.create_lottery_cycle IS 
'M1SSION™ Lottery - Crea nuovo ciclo (solo admin). Verifica no overlap.';

COMMENT ON FUNCTION public.finalize_cycle_and_draw IS 
'M1SSION™ Lottery - Estrazione finale con prize_multiplier e assegnazione premi.';

COMMENT ON FUNCTION public.cancel_lottery_cycle IS 
'M1SSION™ Lottery - Annulla ciclo con refund completo (solo admin).';

COMMENT ON FUNCTION public.admin_get_lottery_analytics IS 
'M1SSION™ Lottery - Analytics complete per admin.';

-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – LOTTERY ADMIN/DRAW v1.0
-- ══════════════════════════════════════════════════════════════════════════════

