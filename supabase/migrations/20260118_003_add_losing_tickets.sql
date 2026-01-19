-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ SCRATCH & WIN — Aggiunge 50% di biglietti PERDENTI
-- Date: 2026-01-18
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ OBIETTIVO: Aggiungere biglietti perdenti (reward_value = 0) per bilanciare  │
-- │ la distribuzione al 50% vincenti / 50% perdenti                              │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- TIER 10: Attualmente 1000 biglietti vincenti
-- Per avere 50% perdenti, aggiungo 1000 biglietti perdenti = 2000 totali
DO $$
DECLARE
  v_pool_10_id UUID;
  v_pool_30_id UUID;
  v_pool_50_id UUID;
  v_i INT;
BEGIN
  -- Trova i pool esistenti
  SELECT id INTO v_pool_10_id FROM public.scratch_ticket_pools WHERE tier = 10 LIMIT 1;
  SELECT id INTO v_pool_30_id FROM public.scratch_ticket_pools WHERE tier = 30 LIMIT 1;
  SELECT id INTO v_pool_50_id FROM public.scratch_ticket_pools WHERE tier = 50 LIMIT 1;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- TIER 10: Aggiungi 1000 biglietti PERDENTI (50% del totale finale)
  -- Totale finale: 2000 biglietti (1000 vincenti + 1000 perdenti)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF v_pool_10_id IS NOT NULL THEN
    FOR v_i IN 1..1000 LOOP
      INSERT INTO public.scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
      VALUES (v_pool_10_id, 10, 'm1u', 0, false);
    END LOOP;
    
    -- Aggiorna contatore pool
    UPDATE public.scratch_ticket_pools 
    SET total_tickets = total_tickets + 1000,
        updated_at = now()
    WHERE id = v_pool_10_id;
    
    RAISE NOTICE 'TIER 10: Aggiunti 1000 biglietti perdenti';
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- TIER 30: Aggiungi 500 biglietti PERDENTI (50% del totale finale)
  -- Totale finale: 1000 biglietti (500 vincenti + 500 perdenti)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF v_pool_30_id IS NOT NULL THEN
    FOR v_i IN 1..500 LOOP
      INSERT INTO public.scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
      VALUES (v_pool_30_id, 30, 'm1u', 0, false);
    END LOOP;
    
    -- Aggiorna contatore pool
    UPDATE public.scratch_ticket_pools 
    SET total_tickets = total_tickets + 500,
        updated_at = now()
    WHERE id = v_pool_30_id;
    
    RAISE NOTICE 'TIER 30: Aggiunti 500 biglietti perdenti';
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- TIER 50: Aggiungi 200 biglietti PERDENTI (50% del totale finale)
  -- Totale finale: 400 biglietti (200 vincenti + 200 perdenti)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF v_pool_50_id IS NOT NULL THEN
    FOR v_i IN 1..200 LOOP
      INSERT INTO public.scratch_tickets (pool_id, tier, reward_type, reward_value, is_jackpot)
      VALUES (v_pool_50_id, 50, 'm1u', 0, false);
    END LOOP;
    
    -- Aggiorna contatore pool
    UPDATE public.scratch_ticket_pools 
    SET total_tickets = total_tickets + 200,
        updated_at = now()
    WHERE id = v_pool_50_id;
    
    RAISE NOTICE 'TIER 50: Aggiunti 200 biglietti perdenti';
  END IF;
  
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'DISTRIBUZIONE FINALE:';
  RAISE NOTICE 'TIER 10: 1000 vincenti + 1000 perdenti = 2000 totali (50%% win rate)';
  RAISE NOTICE 'TIER 30: 500 vincenti + 500 perdenti = 1000 totali (50%% win rate)';
  RAISE NOTICE 'TIER 50: 200 vincenti + 200 perdenti = 400 totali (50%% win rate)';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END;
$$;

-- Verifica risultato
DO $$
DECLARE
  v_tier_10_total INT;
  v_tier_10_losing INT;
  v_tier_30_total INT;
  v_tier_30_losing INT;
  v_tier_50_total INT;
  v_tier_50_losing INT;
BEGIN
  SELECT COUNT(*) INTO v_tier_10_total FROM public.scratch_tickets WHERE tier = 10 AND is_claimed = false;
  SELECT COUNT(*) INTO v_tier_10_losing FROM public.scratch_tickets WHERE tier = 10 AND reward_value = 0 AND is_claimed = false;
  
  SELECT COUNT(*) INTO v_tier_30_total FROM public.scratch_tickets WHERE tier = 30 AND is_claimed = false;
  SELECT COUNT(*) INTO v_tier_30_losing FROM public.scratch_tickets WHERE tier = 30 AND reward_value = 0 AND is_claimed = false;
  
  SELECT COUNT(*) INTO v_tier_50_total FROM public.scratch_tickets WHERE tier = 50 AND is_claimed = false;
  SELECT COUNT(*) INTO v_tier_50_losing FROM public.scratch_tickets WHERE tier = 50 AND reward_value = 0 AND is_claimed = false;
  
  RAISE NOTICE 'VERIFICA POST-MIGRAZIONE:';
  RAISE NOTICE 'TIER 10: % totali, % perdenti (%.1f%%)', v_tier_10_total, v_tier_10_losing, (v_tier_10_losing::float / NULLIF(v_tier_10_total, 0) * 100);
  RAISE NOTICE 'TIER 30: % totali, % perdenti (%.1f%%)', v_tier_30_total, v_tier_30_losing, (v_tier_30_losing::float / NULLIF(v_tier_30_total, 0) * 100);
  RAISE NOTICE 'TIER 50: % totali, % perdenti (%.1f%%)', v_tier_50_total, v_tier_50_losing, (v_tier_50_losing::float / NULLIF(v_tier_50_total, 0) * 100);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – 50% LOSING TICKETS MIGRATION
-- ══════════════════════════════════════════════════════════════════════════════

