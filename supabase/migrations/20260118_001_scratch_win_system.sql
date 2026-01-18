-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ SCRATCH & WIN — Server-Side Secure System
-- Date: 2026-01-18
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- Features:
-- - 3 tier tickets (10, 30, 50 M1U)
-- - Global unique jackpots (1 per tier TOTAL)
-- - Server-side outcome determination (NO RNG client-side)
-- - Atomic locks to prevent double-claiming
-- - Full audit trail
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE 1: scratch_ticket_pools — Pool di biglietti per tier                   │
-- └──────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS public.scratch_ticket_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INT NOT NULL CHECK (tier IN (10, 30, 50)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'paused')),
  total_tickets INT NOT NULL DEFAULT 0,
  claimed_tickets INT NOT NULL DEFAULT 0,
  jackpot_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index per tier attivo
CREATE INDEX IF NOT EXISTS idx_scratch_pools_tier_status ON public.scratch_ticket_pools(tier, status);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE 2: scratch_tickets — Biglietti individuali pre-generati               │
-- └──────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS public.scratch_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.scratch_ticket_pools(id) ON DELETE CASCADE,
  tier INT NOT NULL CHECK (tier IN (10, 30, 50)),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('m1u', 'clue')),
  reward_value INT NOT NULL DEFAULT 0,
  is_jackpot BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_scratch_tickets_available ON public.scratch_tickets(tier, is_claimed) WHERE is_claimed = false;
CREATE INDEX IF NOT EXISTS idx_scratch_tickets_user ON public.scratch_tickets(claimed_by_user) WHERE claimed_by_user IS NOT NULL;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE 3: user_scratch_purchases — Acquisti utente                           │
-- └──────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS public.user_scratch_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier INT NOT NULL CHECK (tier IN (10, 30, 50)),
  ticket_id UUID REFERENCES public.scratch_tickets(id),
  status TEXT NOT NULL DEFAULT 'purchased' CHECK (status IN ('purchased', 'scratching', 'revealed', 'credited', 'failed')),
  reward_type TEXT,
  reward_value INT,
  client_nonce TEXT NOT NULL,
  scratch_progress INT NOT NULL DEFAULT 0,
  revealed_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Idempotency: stesso nonce = stesso acquisto
  CONSTRAINT unique_user_nonce UNIQUE (user_id, client_nonce)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scratch_purchases_user ON public.user_scratch_purchases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scratch_purchases_pending ON public.user_scratch_purchases(status) WHERE status IN ('purchased', 'scratching');

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE 4: scratch_abuse_logs — Anti-frode                                    │
-- └──────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS public.scratch_abuse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scratch_abuse_user ON public.scratch_abuse_logs(user_id, created_at DESC);

-- ══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — Nessuna write diretta, solo via RPC
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.scratch_ticket_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scratch_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_abuse_logs ENABLE ROW LEVEL SECURITY;

-- Pools: solo lettura pubblica
CREATE POLICY "Anyone can view scratch pools" ON public.scratch_ticket_pools FOR SELECT USING (true);
CREATE POLICY "No direct inserts on pools" ON public.scratch_ticket_pools FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct updates on pools" ON public.scratch_ticket_pools FOR UPDATE USING (false);
CREATE POLICY "No direct deletes on pools" ON public.scratch_ticket_pools FOR DELETE USING (false);

-- Tickets: solo lettura propri
CREATE POLICY "Users can view their own tickets" ON public.scratch_tickets FOR SELECT 
  USING (claimed_by_user = auth.uid() OR claimed_by_user IS NULL);
CREATE POLICY "No direct inserts on tickets" ON public.scratch_tickets FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct updates on tickets" ON public.scratch_tickets FOR UPDATE USING (false);
CREATE POLICY "No direct deletes on tickets" ON public.scratch_tickets FOR DELETE USING (false);

-- Purchases: utente vede solo i propri
CREATE POLICY "Users can view their own purchases" ON public.user_scratch_purchases FOR SELECT 
  USING (user_id = auth.uid());
CREATE POLICY "No direct inserts on purchases" ON public.user_scratch_purchases FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct updates on purchases" ON public.user_scratch_purchases FOR UPDATE USING (false);
CREATE POLICY "No direct deletes on purchases" ON public.user_scratch_purchases FOR DELETE USING (false);

-- Abuse logs: solo admin
CREATE POLICY "Only admin can view abuse logs" ON public.scratch_abuse_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC 1: purchase_scratch_ticket — Acquista un biglietto (scala M1U)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.purchase_scratch_ticket(
  p_tier INT,
  p_client_nonce TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_current_m1u NUMERIC;
  v_purchase_id UUID;
  v_existing_purchase UUID;
  v_daily_count INT;
BEGIN
  -- 1. Verifica autenticazione
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'User not authenticated');
  END IF;
  
  -- 2. Verifica tier valido
  IF p_tier NOT IN (10, 30, 50) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Invalid tier');
  END IF;
  
  -- 3. Idempotency check: stesso nonce = ritorna purchase esistente
  SELECT id INTO v_existing_purchase 
  FROM public.user_scratch_purchases 
  WHERE user_id = v_user_id AND client_nonce = p_client_nonce;
  
  IF v_existing_purchase IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'already_purchased', 
      'purchase_id', v_existing_purchase,
      'message', 'Purchase already exists for this nonce'
    );
  END IF;
  
  -- 4. Rate limit: max 10 acquisti al giorno
  SELECT COUNT(*) INTO v_daily_count
  FROM public.user_scratch_purchases
  WHERE user_id = v_user_id 
    AND created_at > now() - interval '24 hours';
  
  IF v_daily_count >= 10 THEN
    -- Log abuse
    INSERT INTO public.scratch_abuse_logs (user_id, event_type, details)
    VALUES (v_user_id, 'rate_limit_exceeded', jsonb_build_object('daily_count', v_daily_count, 'tier', p_tier));
    
    RETURN jsonb_build_object('status', 'error', 'message', 'Daily purchase limit reached (max 10)');
  END IF;
  
  -- 5. Verifica saldo M1U
  SELECT m1_units INTO v_current_m1u FROM public.profiles WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL OR v_current_m1u < p_tier THEN
    RETURN jsonb_build_object(
      'status', 'insufficient_balance', 
      'current_balance', COALESCE(v_current_m1u, 0),
      'required', p_tier
    );
  END IF;
  
  -- 6. Verifica disponibilità ticket nel pool
  IF NOT EXISTS (
    SELECT 1 FROM public.scratch_tickets 
    WHERE tier = p_tier AND is_claimed = false
  ) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'No tickets available for this tier');
  END IF;
  
  -- 7. Scala M1U (atomico)
  UPDATE public.profiles 
  SET m1_units = m1_units - p_tier,
      updated_at = now()
  WHERE id = v_user_id AND m1_units >= p_tier;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Failed to deduct M1U - insufficient balance');
  END IF;
  
  -- 8. Crea record purchase
  INSERT INTO public.user_scratch_purchases (user_id, tier, client_nonce, status)
  VALUES (v_user_id, p_tier, p_client_nonce, 'purchased')
  RETURNING id INTO v_purchase_id;
  
  -- 9. Log analytics event
  INSERT INTO public.analytics_events (event_name, user_id, session_id, platform, props, event_version)
  VALUES (
    'scratch_ticket_purchased',
    v_user_id,
    'server',
    'web',
    jsonb_build_object('tier', p_tier, 'purchase_id', v_purchase_id, 'cost', p_tier),
    1
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'purchase_id', v_purchase_id,
    'tier', p_tier,
    'new_balance', v_current_m1u - p_tier
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Nonce già usato (race condition)
    SELECT id INTO v_existing_purchase 
    FROM public.user_scratch_purchases 
    WHERE user_id = v_user_id AND client_nonce = p_client_nonce;
    
    RETURN jsonb_build_object(
      'status', 'already_purchased', 
      'purchase_id', v_existing_purchase
    );
  WHEN OTHERS THEN
    RAISE LOG 'Error in purchase_scratch_ticket: %', SQLERRM;
    RETURN jsonb_build_object('status', 'error', 'message', 'Internal server error');
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC 2: reveal_scratch_ticket — Rivela il premio (assegna ticket server-side)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.reveal_scratch_ticket(
  p_purchase_id UUID,
  p_client_nonce TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_purchase RECORD;
  v_ticket RECORD;
  v_clue_text TEXT;
  v_random_clues TEXT[] := ARRAY[
    'Il premio finale si trova in un luogo dove l''acqua incontra la terra.',
    'Cerca dove il sole tramonta sull''orizzonte europeo.',
    'La risposta è nascosta dove le montagne toccano il cielo.',
    'Un antico porto custodisce il segreto che cerchi.',
    'Segui la via delle stelle verso nord-ovest.',
    'Il tesoro riposa dove la storia incontra il presente.',
    'Cerca nell''ombra della torre più famosa.',
    'La chiave si trova dove i fiumi si incontrano.',
    'Un giardino nascosto contiene la verità.',
    'La risposta è scritta nelle pietre millenarie.'
  ];
BEGIN
  -- 1. Verifica autenticazione
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'User not authenticated');
  END IF;
  
  -- 2. Recupera e valida purchase
  SELECT * INTO v_purchase 
  FROM public.user_scratch_purchases 
  WHERE id = p_purchase_id AND user_id = v_user_id
  FOR UPDATE; -- Lock per prevenire race condition
  
  IF v_purchase IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Purchase not found or not owned by user');
  END IF;
  
  -- 3. Idempotency: se già rivelato, ritorna risultato esistente
  IF v_purchase.status IN ('revealed', 'credited') THEN
    RETURN jsonb_build_object(
      'status', 'already_revealed',
      'purchase_id', v_purchase.id,
      'reward_type', v_purchase.reward_type,
      'reward_value', v_purchase.reward_value,
      'is_jackpot', (v_purchase.reward_value >= 1000)
    );
  END IF;
  
  -- 4. Verifica nonce corretto
  IF v_purchase.client_nonce != p_client_nonce THEN
    -- Log tentativo sospetto
    INSERT INTO public.scratch_abuse_logs (user_id, event_type, details)
    VALUES (v_user_id, 'nonce_mismatch', jsonb_build_object(
      'purchase_id', p_purchase_id, 
      'expected_nonce', v_purchase.client_nonce,
      'provided_nonce', p_client_nonce
    ));
    
    RETURN jsonb_build_object('status', 'error', 'message', 'Invalid nonce');
  END IF;
  
  -- 5. Seleziona un ticket disponibile (atomic lock)
  SELECT * INTO v_ticket
  FROM public.scratch_tickets
  WHERE tier = v_purchase.tier 
    AND is_claimed = false
  ORDER BY 
    -- Priorità: NON jackpot prima (jackpot solo alla fine del pool)
    is_jackpot ASC,
    random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_ticket IS NULL THEN
    -- Nessun ticket disponibile - rimborsa
    UPDATE public.profiles 
    SET m1_units = m1_units + v_purchase.tier
    WHERE id = v_user_id;
    
    UPDATE public.user_scratch_purchases 
    SET status = 'failed'
    WHERE id = p_purchase_id;
    
    RETURN jsonb_build_object('status', 'error', 'message', 'No tickets available - refunded');
  END IF;
  
  -- 6. Assegna ticket all'utente
  UPDATE public.scratch_tickets
  SET is_claimed = true,
      claimed_by_user = v_user_id,
      claimed_at = now()
  WHERE id = v_ticket.id;
  
  -- 7. Aggiorna contatore pool
  UPDATE public.scratch_ticket_pools
  SET claimed_tickets = claimed_tickets + 1,
      jackpot_claimed = CASE WHEN v_ticket.is_jackpot THEN true ELSE jackpot_claimed END,
      updated_at = now()
  WHERE id = v_ticket.pool_id;
  
  -- 8. Se reward è M1U, accredita
  IF v_ticket.reward_type = 'm1u' AND v_ticket.reward_value > 0 THEN
    UPDATE public.profiles 
    SET m1_units = m1_units + v_ticket.reward_value,
        updated_at = now()
    WHERE id = v_user_id;
    
    -- Log in prize_awards
    INSERT INTO public.prize_awards (award_type, prize_id, user_id, source, evidence)
    VALUES (
      'scratch',
      'scratch_' || v_ticket.id::text,
      v_user_id,
      'scratch_win_tier_' || v_purchase.tier,
      jsonb_build_object(
        'ticket_id', v_ticket.id,
        'purchase_id', p_purchase_id,
        'tier', v_purchase.tier,
        'reward_value', v_ticket.reward_value,
        'is_jackpot', v_ticket.is_jackpot
      )
    );
  END IF;
  
  -- 9. Se reward è CLUE, genera testo random
  IF v_ticket.reward_type = 'clue' THEN
    v_clue_text := v_random_clues[1 + floor(random() * array_length(v_random_clues, 1))::int];
  END IF;
  
  -- 10. Aggiorna purchase con risultato
  UPDATE public.user_scratch_purchases
  SET status = 'credited',
      ticket_id = v_ticket.id,
      reward_type = v_ticket.reward_type,
      reward_value = v_ticket.reward_value,
      revealed_at = now(),
      credited_at = now()
  WHERE id = p_purchase_id;
  
  -- 11. Log analytics event
  INSERT INTO public.analytics_events (event_name, user_id, session_id, platform, props, event_version)
  VALUES (
    'scratch_ticket_revealed',
    v_user_id,
    'server',
    'web',
    jsonb_build_object(
      'tier', v_purchase.tier,
      'purchase_id', p_purchase_id,
      'ticket_id', v_ticket.id,
      'reward_type', v_ticket.reward_type,
      'reward_value', v_ticket.reward_value,
      'is_jackpot', v_ticket.is_jackpot
    ),
    1
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'purchase_id', p_purchase_id,
    'ticket_id', v_ticket.id,
    'reward_type', v_ticket.reward_type,
    'reward_value', v_ticket.reward_value,
    'is_jackpot', v_ticket.is_jackpot,
    'clue_text', v_clue_text
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in reveal_scratch_ticket: %', SQLERRM;
    RETURN jsonb_build_object('status', 'error', 'message', 'Internal server error');
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC 3: get_scratch_stats — Statistiche per UI
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_scratch_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_stats JSONB;
BEGIN
  v_user_id := auth.uid();
  
  SELECT jsonb_build_object(
    'tier_10', jsonb_build_object(
      'available', (SELECT COUNT(*) FROM scratch_tickets WHERE tier = 10 AND is_claimed = false),
      'jackpot_available', NOT (SELECT jackpot_claimed FROM scratch_ticket_pools WHERE tier = 10 LIMIT 1)
    ),
    'tier_30', jsonb_build_object(
      'available', (SELECT COUNT(*) FROM scratch_tickets WHERE tier = 30 AND is_claimed = false),
      'jackpot_available', NOT (SELECT jackpot_claimed FROM scratch_ticket_pools WHERE tier = 30 LIMIT 1)
    ),
    'tier_50', jsonb_build_object(
      'available', (SELECT COUNT(*) FROM scratch_tickets WHERE tier = 50 AND is_claimed = false),
      'jackpot_available', NOT (SELECT jackpot_claimed FROM scratch_ticket_pools WHERE tier = 50 LIMIT 1)
    ),
    'user_purchases_today', (
      SELECT COUNT(*) FROM user_scratch_purchases 
      WHERE user_id = v_user_id AND created_at > now() - interval '24 hours'
    ),
    'user_total_wins', (
      SELECT COALESCE(SUM(reward_value), 0) FROM user_scratch_purchases 
      WHERE user_id = v_user_id AND status = 'credited' AND reward_type = 'm1u'
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ══════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.purchase_scratch_ticket(INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_scratch_ticket(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_scratch_stats() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- IMMUTABILITY TRIGGER (come altre tabelle audit)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER no_update_delete_scratch_tickets 
  BEFORE UPDATE OR DELETE ON public.scratch_tickets 
  FOR EACH ROW 
  WHEN (OLD.is_claimed = true)
  EXECUTE FUNCTION forbid_update_delete();

CREATE TRIGGER no_update_delete_scratch_purchases
  BEFORE DELETE ON public.user_scratch_purchases 
  FOR EACH ROW 
  EXECUTE FUNCTION forbid_update_delete();

-- ══════════════════════════════════════════════════════════════════════════════
-- UPDATE prize_awards constraint to include 'scratch'
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.prize_awards 
DROP CONSTRAINT IF EXISTS prize_awards_award_type_check;

ALTER TABLE public.prize_awards 
ADD CONSTRAINT prize_awards_award_type_check 
CHECK (award_type IN ('secondary', 'final', 'marker', 'qr', 'event', 'referral', 'wheel', 'streak', 'minigame', 'scratch'));

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED: Popola i pool con biglietti iniziali
-- Nota: Eseguire separatamente con seed_scratch_pools()
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.seed_scratch_pools()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pool_10 UUID;
  v_pool_30 UUID;
  v_pool_50 UUID;
  v_i INT;
BEGIN
  -- Verifica che i pool non esistano già
  IF EXISTS (SELECT 1 FROM scratch_ticket_pools) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Pools already seeded');
  END IF;

  -- Crea pool tier 10
  INSERT INTO scratch_ticket_pools (tier, status, total_tickets)
  VALUES (10, 'active', 1000)
  RETURNING id INTO v_pool_10;
  
  -- Crea pool tier 30
  INSERT INTO scratch_ticket_pools (tier, status, total_tickets)
  VALUES (30, 'active', 500)
  RETURNING id INTO v_pool_30;
  
  -- Crea pool tier 50
  INSERT INTO scratch_ticket_pools (tier, status, total_tickets)
  VALUES (50, 'active', 200)
  RETURNING id INTO v_pool_50;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- TIER 10 M1U — Jackpot max 1000 M1U (1 solo biglietto)
  -- Distribuzione: 60% clue, 40% M1U piccoli
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- 1 JACKPOT da 1000 M1U
  INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
  VALUES (v_pool_10, 10, 'm1u', 1000, true);
  
  -- 10 biglietti da 100 M1U
  FOR v_i IN 1..10 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_10, 10, 'm1u', 100);
  END LOOP;
  
  -- 50 biglietti da 50 M1U
  FOR v_i IN 1..50 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_10, 10, 'm1u', 50);
  END LOOP;
  
  -- 100 biglietti da 20 M1U
  FOR v_i IN 1..100 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_10, 10, 'm1u', 20);
  END LOOP;
  
  -- 200 biglietti da 10 M1U (pareggio)
  FOR v_i IN 1..200 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_10, 10, 'm1u', 10);
  END LOOP;
  
  -- 639 biglietti CLUE (indizio)
  FOR v_i IN 1..639 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_10, 10, 'clue', 1);
  END LOOP;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- TIER 30 M1U — Jackpot max 10000 M1U (1 solo biglietto)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- 1 JACKPOT da 10000 M1U
  INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
  VALUES (v_pool_30, 30, 'm1u', 10000, true);
  
  -- 5 biglietti da 500 M1U
  FOR v_i IN 1..5 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_30, 30, 'm1u', 500);
  END LOOP;
  
  -- 20 biglietti da 200 M1U
  FOR v_i IN 1..20 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_30, 30, 'm1u', 200);
  END LOOP;
  
  -- 50 biglietti da 100 M1U
  FOR v_i IN 1..50 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_30, 30, 'm1u', 100);
  END LOOP;
  
  -- 100 biglietti da 50 M1U
  FOR v_i IN 1..100 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_30, 30, 'm1u', 50);
  END LOOP;
  
  -- 100 biglietti da 30 M1U (pareggio)
  FOR v_i IN 1..100 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_30, 30, 'm1u', 30);
  END LOOP;
  
  -- 224 biglietti CLUE
  FOR v_i IN 1..224 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_30, 30, 'clue', 1);
  END LOOP;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- TIER 50 M1U — Jackpot max 100000 M1U (1 solo biglietto)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- 1 JACKPOT da 100000 M1U
  INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
  VALUES (v_pool_50, 50, 'm1u', 100000, true);
  
  -- 2 biglietti da 5000 M1U
  FOR v_i IN 1..2 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_50, 50, 'm1u', 5000);
  END LOOP;
  
  -- 5 biglietti da 1000 M1U
  FOR v_i IN 1..5 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_50, 50, 'm1u', 1000);
  END LOOP;
  
  -- 20 biglietti da 500 M1U
  FOR v_i IN 1..20 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_50, 50, 'm1u', 500);
  END LOOP;
  
  -- 50 biglietti da 100 M1U
  FOR v_i IN 1..50 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_50, 50, 'm1u', 100);
  END LOOP;
  
  -- 50 biglietti da 50 M1U (pareggio)
  FOR v_i IN 1..50 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_50, 50, 'm1u', 50);
  END LOOP;
  
  -- 72 biglietti CLUE
  FOR v_i IN 1..72 LOOP
    INSERT INTO scratch_tickets (pool_id, tier, reward_type, reward_value)
    VALUES (v_pool_50, 50, 'clue', 1);
  END LOOP;

  RETURN jsonb_build_object(
    'status', 'success',
    'pools_created', 3,
    'tier_10_tickets', 1000,
    'tier_30_tickets', 500,
    'tier_50_tickets', 200
  );
END;
$$;

-- Grant per admin
GRANT EXECUTE ON FUNCTION public.seed_scratch_pools() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- NOTIFY PostgREST
-- ══════════════════════════════════════════════════════════════════════════════

NOTIFY pgrst, 'reload schema';

-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – SCRATCH & WIN SYSTEM – ALL RIGHTS RESERVED
-- ══════════════════════════════════════════════════════════════════════════════

