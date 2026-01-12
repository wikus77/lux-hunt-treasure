-- ============================================================================
-- RISIKO DOMINATION — Tabella Log Vittorie per Paese
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: Log append-only delle vittorie Tron Battle per paese
-- IDEMPOTENZA: battle_id UNIQUE previene duplicazioni
-- ROLLBACK: DROP TABLE country_battle_wins CASCADE;
-- ============================================================================

-- 1. Creare tabella log vittorie
CREATE TABLE IF NOT EXISTS public.country_battle_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimento battaglia (IDEMPOTENZA)
  battle_id UUID NOT NULL UNIQUE,
  
  -- Partecipanti
  winner_id UUID NOT NULL,
  loser_id UUID,
  
  -- Geolocalizzazione
  country_code CHAR(2) NOT NULL,  -- ISO 3166-1 alpha-2
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  
  -- Validazione
  is_pvp BOOLEAN NOT NULL DEFAULT true,  -- false = vs NPC/fake
  is_valid_for_domination BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamp
  won_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indici per performance
CREATE INDEX IF NOT EXISTS idx_country_battle_wins_winner 
  ON public.country_battle_wins(winner_id);
CREATE INDEX IF NOT EXISTS idx_country_battle_wins_country 
  ON public.country_battle_wins(country_code);
CREATE INDEX IF NOT EXISTS idx_country_battle_wins_won_at 
  ON public.country_battle_wins(won_at DESC);
CREATE INDEX IF NOT EXISTS idx_country_battle_wins_valid 
  ON public.country_battle_wins(is_valid_for_domination) 
  WHERE is_valid_for_domination = true;

-- 3. RLS Policies
ALTER TABLE public.country_battle_wins ENABLE ROW LEVEL SECURITY;

-- Tutti possono leggere (per visualizzare dominio)
CREATE POLICY "Anyone can view battle wins" 
  ON public.country_battle_wins FOR SELECT 
  USING (true);

-- Solo sistema può inserire (via trigger)
CREATE POLICY "System can insert battle wins" 
  ON public.country_battle_wins FOR INSERT 
  WITH CHECK (true);

-- 4. Commento documentazione
COMMENT ON TABLE public.country_battle_wins IS 
  'Log append-only delle vittorie Tron Battle per sistema Risiko Domination. NON modifica Tron Battle.';

COMMENT ON COLUMN public.country_battle_wins.is_pvp IS 
  'true = PvP reale, false = vs NPC/fake agent (non conta per dominio)';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- DROP TABLE IF EXISTS public.country_battle_wins CASCADE;
-- ============================================================================

