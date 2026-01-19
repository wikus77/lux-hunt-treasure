-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ SCRATCH & WIN — AUDIT QUERY (READ-ONLY)
-- Esegui in Supabase SQL Editor per ottenere metriche reali
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. DISTRIBUZIONE TICKET PER TIER (DISPONIBILI)
SELECT 
  '1. TICKET DISPONIBILI PER TIER' as report_section;

SELECT 
  tier,
  COUNT(*) as totale_disponibili,
  COUNT(*) FILTER (WHERE reward_value = 0) as perdenti,
  COUNT(*) FILTER (WHERE reward_value > 0 AND reward_type = 'm1u') as vincenti_m1u,
  COUNT(*) FILTER (WHERE reward_type = 'clue') as indizi,
  ROUND(COUNT(*) FILTER (WHERE reward_value = 0)::numeric / COUNT(*) * 100, 1) as perc_perdenti,
  SUM(CASE WHEN reward_type = 'm1u' THEN reward_value ELSE 0 END) as payout_potenziale_m1u
FROM public.scratch_tickets
WHERE is_claimed = false
GROUP BY tier
ORDER BY tier;

-- 2. TICKET CLAIMED (GIÀ VENDUTI)
SELECT 
  '2. TICKET CLAIMED (VENDUTI)' as report_section;

SELECT 
  tier,
  COUNT(*) as totale_claimed,
  COUNT(*) FILTER (WHERE reward_value = 0) as perdenti_usciti,
  COUNT(*) FILTER (WHERE reward_value > 0 AND reward_type = 'm1u') as vincenti_m1u_usciti,
  COUNT(*) FILTER (WHERE reward_type = 'clue') as indizi_usciti,
  SUM(CASE WHEN reward_type = 'm1u' THEN reward_value ELSE 0 END) as payout_erogato_m1u
FROM public.scratch_tickets
WHERE is_claimed = true
GROUP BY tier
ORDER BY tier;

-- 3. ACQUISTI UTENTE E RTP REALE
SELECT 
  '3. RTP REALE (DA ACQUISTI)' as report_section;

SELECT 
  tier,
  COUNT(*) as num_acquisti,
  SUM(tier) as intake_totale_m1u,
  SUM(CASE WHEN reward_type = 'm1u' THEN COALESCE(reward_value, 0) ELSE 0 END) as payout_m1u_erogato,
  COUNT(*) FILTER (WHERE reward_type = 'clue') as indizi_vinti,
  COUNT(*) FILTER (WHERE reward_value = 0 OR reward_value IS NULL) as perdite,
  ROUND(
    SUM(CASE WHEN reward_type = 'm1u' THEN COALESCE(reward_value, 0) ELSE 0 END)::numeric 
    / NULLIF(SUM(tier), 0) * 100, 
    2
  ) as rtp_percentuale,
  ROUND(
    100 - (SUM(CASE WHEN reward_type = 'm1u' THEN COALESCE(reward_value, 0) ELSE 0 END)::numeric 
    / NULLIF(SUM(tier), 0) * 100),
    2
  ) as house_edge_percentuale
FROM public.user_scratch_purchases
WHERE status = 'credited'
GROUP BY tier
ORDER BY tier;

-- 4. RTP GLOBALE
SELECT 
  '4. RTP GLOBALE' as report_section;

SELECT 
  COUNT(*) as totale_acquisti,
  SUM(tier) as intake_globale,
  SUM(CASE WHEN reward_type = 'm1u' THEN COALESCE(reward_value, 0) ELSE 0 END) as payout_globale,
  ROUND(
    SUM(CASE WHEN reward_type = 'm1u' THEN COALESCE(reward_value, 0) ELSE 0 END)::numeric 
    / NULLIF(SUM(tier), 0) * 100, 
    2
  ) as rtp_globale,
  COUNT(*) FILTER (WHERE reward_type = 'clue') as indizi_totali,
  COUNT(*) FILTER (WHERE reward_value = 0 OR reward_value IS NULL) as perdite_totali
FROM public.user_scratch_purchases
WHERE status = 'credited';

-- 5. VERIFICA JACKPOT UNICI
SELECT 
  '5. VERIFICA JACKPOT UNICI' as report_section;

SELECT 
  tier,
  COUNT(*) FILTER (WHERE is_jackpot = true) as jackpot_totali_nel_pool,
  COUNT(*) FILTER (WHERE is_jackpot = true AND is_claimed = true) as jackpot_già_vinti,
  COUNT(*) FILTER (WHERE is_jackpot = true AND is_claimed = false) as jackpot_ancora_disponibili,
  MAX(CASE WHEN is_jackpot = true THEN reward_value ELSE 0 END) as valore_jackpot
FROM public.scratch_tickets
GROUP BY tier
ORDER BY tier;

-- 6. STATO POOL
SELECT 
  '6. STATO POOL' as report_section;

SELECT 
  tier,
  status,
  total_tickets,
  claimed_tickets,
  total_tickets - claimed_tickets as remaining,
  jackpot_claimed,
  ROUND(claimed_tickets::numeric / NULLIF(total_tickets, 0) * 100, 1) as perc_consumato
FROM public.scratch_ticket_pools
ORDER BY tier;

-- 7. RTP TEORICO (CALCOLO SU POOL COMPLETO)
SELECT 
  '7. RTP TEORICO (TUTTO IL POOL)' as report_section;

WITH pool_stats AS (
  SELECT 
    tier,
    COUNT(*) as total_tickets,
    SUM(CASE WHEN reward_type = 'm1u' THEN reward_value ELSE 0 END) as total_payout
  FROM public.scratch_tickets
  GROUP BY tier
)
SELECT 
  tier,
  total_tickets,
  total_payout as payout_totale_pool,
  total_tickets * tier as intake_totale_pool,
  ROUND(total_payout::numeric / NULLIF(total_tickets * tier, 0) * 100, 2) as rtp_teorico,
  ROUND(100 - (total_payout::numeric / NULLIF(total_tickets * tier, 0) * 100), 2) as house_edge_teorico
FROM pool_stats
ORDER BY tier;

-- ══════════════════════════════════════════════════════════════════════════════
-- FINE AUDIT
-- ══════════════════════════════════════════════════════════════════════════════

