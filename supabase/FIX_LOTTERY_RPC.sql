-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: get_active_lottery_cycle - Versione semplificata che funziona
-- Esegui questo SQL per correggere l'errore 500
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Drop e ricrea la funzione get_active_lottery_cycle con versione semplificata
DROP FUNCTION IF EXISTS public.get_active_lottery_cycle();

CREATE OR REPLACE FUNCTION public.get_active_lottery_cycle()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_cycle_id UUID;
  v_cycle_status TEXT;
  v_starts_at TIMESTAMPTZ;
  v_ends_at TIMESTAMPTZ;
  v_ticket_price INT;
  v_min_tickets INT;
  v_max_per_user INT;
  v_total_tickets INT;
  v_total_participants INT;
  v_prizes_json JSONB;
  v_prize_multiplier NUMERIC;
  v_user_tickets_count INT := 0;
  v_progress_percent NUMERIC;
  v_time_remaining_seconds INT;
BEGIN
  v_user_id := auth.uid();
  
  -- Cerca ciclo attivo
  SELECT 
    id, status, starts_at, ends_at, 
    ticket_price_m1u, min_tickets_required, max_tickets_per_user,
    total_tickets, total_participants, prizes_json, prize_multiplier
  INTO 
    v_cycle_id, v_cycle_status, v_starts_at, v_ends_at,
    v_ticket_price, v_min_tickets, v_max_per_user,
    v_total_tickets, v_total_participants, v_prizes_json, v_prize_multiplier
  FROM public.mission_cycles
  WHERE status = 'active' AND now() BETWEEN starts_at AND ends_at
  ORDER BY starts_at DESC
  LIMIT 1;
  
  -- Se non trovato
  IF v_cycle_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'no_active_cycle',
      'message', 'Nessun ciclo lotteria attivo al momento'
    );
  END IF;
  
  -- Conta ticket utente (se autenticato)
  IF v_user_id IS NOT NULL THEN
    SELECT COALESCE(COUNT(*), 0) INTO v_user_tickets_count
    FROM public.lottery_tickets
    WHERE cycle_id = v_cycle_id AND user_id = v_user_id AND status = 'active';
  END IF;
  
  -- Calcola progresso
  v_progress_percent := ROUND(
    (v_total_tickets::numeric / NULLIF(v_min_tickets, 0)) * 100, 
    2
  );
  
  -- Calcola tempo rimanente
  v_time_remaining_seconds := GREATEST(0, EXTRACT(EPOCH FROM (v_ends_at - now()))::int);
  
  -- Ritorna risultato
  RETURN jsonb_build_object(
    'cycle_id', v_cycle_id,
    'status', v_cycle_status,
    'starts_at', v_starts_at,
    'ends_at', v_ends_at,
    'time_remaining_seconds', v_time_remaining_seconds,
    'ticket_price_m1u', v_ticket_price,
    'min_tickets_required', v_min_tickets,
    'max_tickets_per_user', v_max_per_user,
    'total_tickets', v_total_tickets,
    'total_participants', v_total_participants,
    'prize_pool_total', v_total_tickets * v_ticket_price,
    'progress_percent', COALESCE(LEAST(100, v_progress_percent), 0),
    'threshold_reached', v_total_tickets >= v_min_tickets,
    'prizes_json', v_prizes_json,
    'prize_multiplier', v_prize_multiplier,
    'user_tickets_count', v_user_tickets_count,
    'user_can_buy_more', v_user_tickets_count < v_max_per_user,
    'user_remaining_tickets', v_max_per_user - v_user_tickets_count,
    'narrative', CASE
      WHEN v_progress_percent < 25 THEN 'La Missione è appena iniziata!'
      WHEN v_progress_percent < 50 THEN 'La Missione sta prendendo forma!'
      WHEN v_progress_percent < 75 THEN 'Manca poco per raggiungere l''obiettivo!'
      WHEN v_progress_percent < 100 THEN 'Quasi al traguardo!'
      ELSE 'Obiettivo raggiunto! Premi al 100%!'
    END
  );
END;
$$;

-- 2. Grant permessi
GRANT EXECUTE ON FUNCTION public.get_active_lottery_cycle() TO authenticated, anon;

-- 3. Reload schema PostgREST
NOTIFY pgrst, 'reload schema';

-- 4. Test immediato
SELECT public.get_active_lottery_cycle();

