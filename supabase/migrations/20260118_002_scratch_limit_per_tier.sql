-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ SCRATCH & WIN — Limite 10 per OGNI tier al giorno
-- Date: 2026-01-18
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- Modifica: L'utente può acquistare:
-- - 10 biglietti da 10 M1U al giorno
-- - 10 biglietti da 30 M1U al giorno
-- - 10 biglietti da 50 M1U al giorno
-- = 30 biglietti totali al giorno
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC 1: purchase_scratch_ticket — AGGIORNATO con limite PER TIER
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
  v_daily_count_this_tier INT;
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
  
  -- 4. Rate limit: max 10 acquisti PER TIER al giorno (non totale!)
  SELECT COUNT(*) INTO v_daily_count_this_tier
  FROM public.user_scratch_purchases
  WHERE user_id = v_user_id 
    AND tier = p_tier  -- IMPORTANTE: Filtro per tier specifico!
    AND created_at > now() - interval '24 hours';
  
  IF v_daily_count_this_tier >= 10 THEN
    -- Log abuse
    INSERT INTO public.scratch_abuse_logs (user_id, event_type, details)
    VALUES (v_user_id, 'tier_rate_limit_exceeded', jsonb_build_object(
      'tier', p_tier,
      'daily_count_this_tier', v_daily_count_this_tier
    ));
    
    RETURN jsonb_build_object(
      'status', 'error', 
      'message', 'Limite giornaliero raggiunto per il tier ' || p_tier || ' M1U (max 10 al giorno)',
      'tier', p_tier,
      'daily_count', v_daily_count_this_tier
    );
  END IF;
  
  -- 5. Verifica saldo M1U
  SELECT m1_units INTO v_current_m1u FROM public.profiles WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL OR v_current_m1u < p_tier THEN
    RETURN jsonb_build_object(
      'status', 'insufficient_balance', 
      'message', 'Saldo M1U insufficiente. Hai ' || COALESCE(v_current_m1u, 0) || ' M1U, servono ' || p_tier || ' M1U.',
      'current_balance', COALESCE(v_current_m1u, 0),
      'required', p_tier
    );
  END IF;
  
  -- 6. Verifica disponibilità ticket nel pool
  IF NOT EXISTS (
    SELECT 1 FROM public.scratch_tickets 
    WHERE tier = p_tier AND is_claimed = false
  ) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Biglietti esauriti per questo tier. Riprova più tardi.');
  END IF;
  
  -- 7. Scala M1U (atomico)
  UPDATE public.profiles 
  SET m1_units = m1_units - p_tier,
      updated_at = now()
  WHERE id = v_user_id AND m1_units >= p_tier;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Errore durante il pagamento - saldo insufficiente');
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
    'new_balance', v_current_m1u - p_tier,
    'remaining_today_this_tier', 10 - v_daily_count_this_tier - 1
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
    RETURN jsonb_build_object('status', 'error', 'message', 'Errore interno del server');
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC 3: get_scratch_stats — AGGIORNATO con conteggio PER TIER
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_scratch_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_m1u_balance NUMERIC;
  v_stats JSONB;
BEGIN
  v_user_id := auth.uid();
  
  -- Recupera saldo M1U
  SELECT COALESCE(m1_units, 0) INTO v_m1u_balance FROM public.profiles WHERE id = v_user_id;
  
  SELECT jsonb_build_object(
    'tier_10', jsonb_build_object(
      'available', (SELECT COUNT(*) FROM scratch_tickets WHERE tier = 10 AND is_claimed = false),
      'jackpot_available', NOT COALESCE((SELECT jackpot_claimed FROM scratch_ticket_pools WHERE tier = 10 LIMIT 1), false),
      'user_purchases_today', (
        SELECT COUNT(*) FROM user_scratch_purchases 
        WHERE user_id = v_user_id AND tier = 10 AND created_at > now() - interval '24 hours'
      ),
      'daily_limit', 10
    ),
    'tier_30', jsonb_build_object(
      'available', (SELECT COUNT(*) FROM scratch_tickets WHERE tier = 30 AND is_claimed = false),
      'jackpot_available', NOT COALESCE((SELECT jackpot_claimed FROM scratch_ticket_pools WHERE tier = 30 LIMIT 1), false),
      'user_purchases_today', (
        SELECT COUNT(*) FROM user_scratch_purchases 
        WHERE user_id = v_user_id AND tier = 30 AND created_at > now() - interval '24 hours'
      ),
      'daily_limit', 10
    ),
    'tier_50', jsonb_build_object(
      'available', (SELECT COUNT(*) FROM scratch_tickets WHERE tier = 50 AND is_claimed = false),
      'jackpot_available', NOT COALESCE((SELECT jackpot_claimed FROM scratch_ticket_pools WHERE tier = 50 LIMIT 1), false),
      'user_purchases_today', (
        SELECT COUNT(*) FROM user_scratch_purchases 
        WHERE user_id = v_user_id AND tier = 50 AND created_at > now() - interval '24 hours'
      ),
      'daily_limit', 10
    ),
    'user_m1u_balance', v_m1u_balance,
    'user_total_purchases_today', (
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
-- NOTIFY PostgREST
-- ══════════════════════════════════════════════════════════════════════════════

NOTIFY pgrst, 'reload schema';

-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – SCRATCH LIMIT PER TIER – ALL RIGHTS RESERVED
-- ══════════════════════════════════════════════════════════════════════════════

