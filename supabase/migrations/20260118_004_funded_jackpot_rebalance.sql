-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ SCRATCH & WIN — FUNDED JACKPOT + ECONOMIA REBALANCE
-- Date: 2026-01-18
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- 
-- OBIETTIVI:
-- 1. Implementare "Funded Jackpot" (jackpot limitato dal fondo accumulato)
-- 2. Ribilanciare tier 30 e 50 per RTP target 60-70%
-- 3. Aggiungere audit logs per jackpot
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: scratch_jackpot_fund — Fondo accumulato per jackpot                   │
-- └──────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS public.scratch_jackpot_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INT NOT NULL UNIQUE CHECK (tier IN (10, 30, 50)),
  balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
  contribution_rate NUMERIC NOT NULL DEFAULT 0.10, -- 10% di ogni acquisto va al fund
  max_payout NUMERIC NOT NULL, -- Cap massimo del jackpot
  fallback_payout NUMERIC NOT NULL, -- Payout se fund insufficiente
  total_contributed NUMERIC NOT NULL DEFAULT 0,
  total_paid_out NUMERIC NOT NULL DEFAULT 0,
  last_jackpot_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inizializza i fondi per ogni tier
INSERT INTO public.scratch_jackpot_fund (tier, balance, contribution_rate, max_payout, fallback_payout)
VALUES 
  (10, 0, 0.15, 1000, 200),   -- Tier 10: max 1000, fallback 200
  (30, 0, 0.15, 5000, 1000),  -- Tier 30: max 5000, fallback 1000
  (50, 0, 0.15, 20000, 3000)  -- Tier 50: max 20000, fallback 3000
ON CONFLICT (tier) DO NOTHING;

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_jackpot_fund_tier ON public.scratch_jackpot_fund(tier);

-- RLS
ALTER TABLE public.scratch_jackpot_fund ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view jackpot funds" ON public.scratch_jackpot_fund FOR SELECT USING (true);
CREATE POLICY "No direct writes on jackpot fund" ON public.scratch_jackpot_fund FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct updates on jackpot fund" ON public.scratch_jackpot_fund FOR UPDATE USING (false);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: scratch_jackpot_logs — Audit log per jackpot                          │
-- └──────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS public.scratch_jackpot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ticket_id UUID,
  purchase_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('contribution', 'jackpot_hit', 'fallback_hit')),
  amount NUMERIC NOT NULL,
  fund_balance_before NUMERIC,
  fund_balance_after NUMERIC,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jackpot_logs_tier ON public.scratch_jackpot_logs(tier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jackpot_logs_user ON public.scratch_jackpot_logs(user_id, created_at DESC);

-- RLS
ALTER TABLE public.scratch_jackpot_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admin can view jackpot logs" ON public.scratch_jackpot_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE: Alimenta il jackpot fund ad ogni acquisto
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.contribute_to_jackpot_fund(
  p_tier INT,
  p_purchase_amount NUMERIC,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_fund RECORD;
  v_contribution NUMERIC;
BEGIN
  -- Recupera il fund per questo tier
  SELECT * INTO v_fund FROM public.scratch_jackpot_fund WHERE tier = p_tier FOR UPDATE;
  
  IF v_fund IS NULL THEN
    RETURN; -- Nessun fund configurato per questo tier
  END IF;
  
  -- Calcola contributo
  v_contribution := p_purchase_amount * v_fund.contribution_rate;
  
  -- Aggiorna il fund
  UPDATE public.scratch_jackpot_fund
  SET balance = balance + v_contribution,
      total_contributed = total_contributed + v_contribution,
      updated_at = now()
  WHERE tier = p_tier;
  
  -- Log
  INSERT INTO public.scratch_jackpot_logs (tier, user_id, event_type, amount, fund_balance_before, fund_balance_after, details)
  VALUES (
    p_tier, 
    p_user_id, 
    'contribution', 
    v_contribution, 
    v_fund.balance, 
    v_fund.balance + v_contribution,
    jsonb_build_object('purchase_amount', p_purchase_amount, 'rate', v_fund.contribution_rate)
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE: Calcola il payout effettivo del jackpot (funded)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_funded_jackpot_payout(
  p_tier INT,
  p_user_id UUID,
  p_ticket_id UUID,
  p_purchase_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_fund RECORD;
  v_actual_payout NUMERIC;
  v_event_type TEXT;
BEGIN
  -- Recupera il fund per questo tier con lock
  SELECT * INTO v_fund FROM public.scratch_jackpot_fund WHERE tier = p_tier FOR UPDATE;
  
  IF v_fund IS NULL THEN
    RETURN 0; -- Nessun fund configurato
  END IF;
  
  -- Determina il payout
  IF v_fund.balance >= v_fund.max_payout THEN
    -- Fund ha abbastanza: paga il max
    v_actual_payout := v_fund.max_payout;
    v_event_type := 'jackpot_hit';
  ELSIF v_fund.balance >= v_fund.fallback_payout THEN
    -- Fund parziale: paga il balance disponibile
    v_actual_payout := v_fund.balance;
    v_event_type := 'jackpot_hit';
  ELSE
    -- Fund insufficiente: paga il fallback
    v_actual_payout := v_fund.fallback_payout;
    v_event_type := 'fallback_hit';
  END IF;
  
  -- Scala dal fund (ma non sotto zero)
  UPDATE public.scratch_jackpot_fund
  SET balance = GREATEST(0, balance - v_actual_payout),
      total_paid_out = total_paid_out + v_actual_payout,
      last_jackpot_at = now(),
      updated_at = now()
  WHERE tier = p_tier;
  
  -- Log
  INSERT INTO public.scratch_jackpot_logs (
    tier, user_id, ticket_id, purchase_id, event_type, amount, 
    fund_balance_before, fund_balance_after, details
  )
  VALUES (
    p_tier, 
    p_user_id, 
    p_ticket_id,
    p_purchase_id,
    v_event_type, 
    v_actual_payout, 
    v_fund.balance, 
    GREATEST(0, v_fund.balance - v_actual_payout),
    jsonb_build_object('max_payout', v_fund.max_payout, 'fallback', v_fund.fallback_payout)
  );
  
  RETURN v_actual_payout;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- AGGIORNA purchase_scratch_ticket PER CONTRIBUIRE AL FUND
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
  
  -- 3. Idempotency check
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
  
  -- 4. Rate limit: max 10 acquisti al giorno PER TIER
  SELECT COUNT(*) INTO v_daily_count
  FROM public.user_scratch_purchases
  WHERE user_id = v_user_id 
    AND tier = p_tier
    AND created_at > now() - interval '24 hours';
  
  IF v_daily_count >= 10 THEN
    INSERT INTO public.scratch_abuse_logs (user_id, event_type, details)
    VALUES (v_user_id, 'rate_limit_exceeded', jsonb_build_object('daily_count', v_daily_count, 'tier', p_tier));
    
    RETURN jsonb_build_object('status', 'error', 'message', 'Daily limit reached for this tier (max 10)');
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
  
  -- 7. Scala M1U
  UPDATE public.profiles 
  SET m1_units = m1_units - p_tier,
      updated_at = now()
  WHERE id = v_user_id AND m1_units >= p_tier;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Failed to deduct M1U');
  END IF;
  
  -- 8. Crea record purchase
  INSERT INTO public.user_scratch_purchases (user_id, tier, client_nonce, status)
  VALUES (v_user_id, p_tier, p_client_nonce, 'purchased')
  RETURNING id INTO v_purchase_id;
  
  -- 9. ⭐ NUOVO: Contribuisci al jackpot fund
  PERFORM public.contribute_to_jackpot_fund(p_tier, p_tier, v_user_id);
  
  -- 10. Log analytics
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
-- AGGIORNA reveal_scratch_ticket PER USARE FUNDED JACKPOT
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
  v_actual_payout NUMERIC;
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
  FOR UPDATE;
  
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
  
  -- 4. Verifica nonce
  IF v_purchase.client_nonce != p_client_nonce THEN
    INSERT INTO public.scratch_abuse_logs (user_id, event_type, details)
    VALUES (v_user_id, 'nonce_mismatch', jsonb_build_object(
      'purchase_id', p_purchase_id, 
      'expected_nonce', v_purchase.client_nonce,
      'provided_nonce', p_client_nonce
    ));
    
    RETURN jsonb_build_object('status', 'error', 'message', 'Invalid nonce');
  END IF;
  
  -- 5. Seleziona ticket disponibile
  SELECT * INTO v_ticket
  FROM public.scratch_tickets
  WHERE tier = v_purchase.tier 
    AND is_claimed = false
  ORDER BY 
    is_jackpot ASC, -- Jackpot alla fine
    random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_ticket IS NULL THEN
    UPDATE public.profiles SET m1_units = m1_units + v_purchase.tier WHERE id = v_user_id;
    UPDATE public.user_scratch_purchases SET status = 'failed' WHERE id = p_purchase_id;
    RETURN jsonb_build_object('status', 'error', 'message', 'No tickets available - refunded');
  END IF;
  
  -- 6. Assegna ticket
  UPDATE public.scratch_tickets
  SET is_claimed = true, claimed_by_user = v_user_id, claimed_at = now()
  WHERE id = v_ticket.id;
  
  -- 7. Aggiorna pool
  UPDATE public.scratch_ticket_pools
  SET claimed_tickets = claimed_tickets + 1,
      jackpot_claimed = CASE WHEN v_ticket.is_jackpot THEN true ELSE jackpot_claimed END,
      updated_at = now()
  WHERE id = v_ticket.pool_id;
  
  -- 8. ⭐ CALCOLA PAYOUT (FUNDED JACKPOT)
  IF v_ticket.is_jackpot THEN
    -- Jackpot: usa il funded payout
    v_actual_payout := public.get_funded_jackpot_payout(
      v_purchase.tier, v_user_id, v_ticket.id, p_purchase_id
    );
  ELSE
    -- Non jackpot: payout normale
    v_actual_payout := v_ticket.reward_value;
  END IF;
  
  -- 9. Accredita M1U se > 0
  IF v_ticket.reward_type = 'm1u' AND v_actual_payout > 0 THEN
    UPDATE public.profiles 
    SET m1_units = m1_units + v_actual_payout, updated_at = now()
    WHERE id = v_user_id;
    
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
        'original_value', v_ticket.reward_value,
        'actual_payout', v_actual_payout,
        'is_jackpot', v_ticket.is_jackpot,
        'was_funded', v_ticket.is_jackpot
      )
    );
  END IF;
  
  -- 10. CLUE
  IF v_ticket.reward_type = 'clue' THEN
    v_clue_text := v_random_clues[1 + floor(random() * array_length(v_random_clues, 1))::int];
  END IF;
  
  -- 11. Aggiorna purchase
  UPDATE public.user_scratch_purchases
  SET status = 'credited',
      ticket_id = v_ticket.id,
      reward_type = v_ticket.reward_type,
      reward_value = v_actual_payout, -- Usa payout effettivo
      revealed_at = now(),
      credited_at = now()
  WHERE id = p_purchase_id;
  
  -- 12. Analytics
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
      'original_value', v_ticket.reward_value,
      'actual_payout', v_actual_payout,
      'is_jackpot', v_ticket.is_jackpot
    ),
    1
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'purchase_id', p_purchase_id,
    'ticket_id', v_ticket.id,
    'reward_type', v_ticket.reward_type,
    'reward_value', v_actual_payout, -- Payout effettivo (funded)
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
-- REBALANCE TIER 30 e 50: Riduci payout per RTP ~65%
-- ══════════════════════════════════════════════════════════════════════════════

-- Prima rimuovi i ticket con payout troppo alto (non claimed)
-- TIER 30: Rimuovi tutti i ticket con payout > 200 (eccetto jackpot singolo)
DELETE FROM public.scratch_tickets 
WHERE tier = 30 
  AND is_claimed = false 
  AND reward_type = 'm1u'
  AND reward_value > 200
  AND is_jackpot = false;

-- TIER 30: Riduci il valore dei ticket rimanenti
UPDATE public.scratch_tickets
SET reward_value = CASE 
  WHEN reward_value = 200 THEN 100
  WHEN reward_value = 100 THEN 50
  WHEN reward_value = 50 THEN 30
  WHEN reward_value = 30 THEN 15
  ELSE reward_value
END
WHERE tier = 30 AND is_claimed = false AND reward_type = 'm1u' AND is_jackpot = false;

-- TIER 30: Aggiungi più perdenti per bilanciare
DO $$
DECLARE
  v_pool_30_id UUID;
  v_current_count INT;
  v_needed INT;
  v_i INT;
BEGIN
  SELECT id INTO v_pool_30_id FROM public.scratch_ticket_pools WHERE tier = 30 LIMIT 1;
  SELECT COUNT(*) INTO v_current_count FROM public.scratch_tickets WHERE tier = 30 AND is_claimed = false;
  
  -- Target: 60% perdenti
  v_needed := GREATEST(0, (v_current_count * 1.5)::int - v_current_count);
  
  FOR v_i IN 1..v_needed LOOP
    INSERT INTO public.scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
    VALUES (v_pool_30_id, 30, 'm1u', 0, false);
  END LOOP;
  
  UPDATE public.scratch_ticket_pools 
  SET total_tickets = total_tickets + v_needed, updated_at = now()
  WHERE id = v_pool_30_id;
END;
$$;

-- TIER 50: Stessa logica
DELETE FROM public.scratch_tickets 
WHERE tier = 50 
  AND is_claimed = false 
  AND reward_type = 'm1u'
  AND reward_value > 500
  AND is_jackpot = false;

UPDATE public.scratch_tickets
SET reward_value = CASE 
  WHEN reward_value = 500 THEN 200
  WHEN reward_value = 100 THEN 50
  WHEN reward_value = 50 THEN 25
  ELSE reward_value
END
WHERE tier = 50 AND is_claimed = false AND reward_type = 'm1u' AND is_jackpot = false;

DO $$
DECLARE
  v_pool_50_id UUID;
  v_current_count INT;
  v_needed INT;
  v_i INT;
BEGIN
  SELECT id INTO v_pool_50_id FROM public.scratch_ticket_pools WHERE tier = 50 LIMIT 1;
  SELECT COUNT(*) INTO v_current_count FROM public.scratch_tickets WHERE tier = 50 AND is_claimed = false;
  
  v_needed := GREATEST(0, (v_current_count * 1.5)::int - v_current_count);
  
  FOR v_i IN 1..v_needed LOOP
    INSERT INTO public.scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
    VALUES (v_pool_50_id, 50, 'm1u', 0, false);
  END LOOP;
  
  UPDATE public.scratch_ticket_pools 
  SET total_tickets = total_tickets + v_needed, updated_at = now()
  WHERE id = v_pool_50_id;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE: Ottieni stats jackpot fund (per UI)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_jackpot_fund_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT jsonb_object_agg(
      'tier_' || tier,
      jsonb_build_object(
        'balance', balance,
        'max_payout', max_payout,
        'fallback_payout', fallback_payout,
        'total_contributed', total_contributed,
        'total_paid_out', total_paid_out,
        'last_jackpot_at', last_jackpot_at
      )
    )
    FROM public.scratch_jackpot_fund
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_jackpot_fund_stats() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICA FINALE RTP (output semplificato)
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_tier INT;
  v_total INT;
  v_payout NUMERIC;
  v_intake NUMERIC;
  v_rtp NUMERIC;
  v_edge NUMERIC;
BEGIN
  FOR v_tier IN SELECT DISTINCT tier FROM public.scratch_tickets ORDER BY tier LOOP
    SELECT 
      COUNT(*),
      SUM(CASE WHEN reward_type = 'm1u' THEN reward_value ELSE 0 END)
    INTO v_total, v_payout
    FROM public.scratch_tickets
    WHERE tier = v_tier;
    
    v_intake := v_total * v_tier;
    v_rtp := ROUND(COALESCE(v_payout, 0) / NULLIF(v_intake, 0) * 100, 2);
    v_edge := 100 - COALESCE(v_rtp, 0);
    
    RAISE NOTICE 'TIER % - Tickets: %, Payout: %, Intake: %, RTP: %, Edge: %',
      v_tier, v_total, COALESCE(v_payout, 0), v_intake, COALESCE(v_rtp, 0), v_edge;
  END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';

-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – FUNDED JACKPOT + REBALANCE
-- ══════════════════════════════════════════════════════════════════════════════

