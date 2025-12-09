-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- M1SSION™ Subscription Tier Limits - BUZZ Weekly & BUZZ MAP Monthly

-- ============================================================================
-- 1. TABELLA: user_buzz_weekly
-- Traccia i BUZZ gratuiti settimanali usati per tier
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_buzz_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Lunedì della settimana (es. 2025-12-02)
  free_buzz_used INTEGER NOT NULL DEFAULT 0,
  tier_snapshot TEXT, -- Tier al momento dell'uso (per audit)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: un solo record per utente per settimana
  CONSTRAINT user_buzz_weekly_unique UNIQUE (user_id, week_start)
);

-- Indice per lookup veloce
CREATE INDEX IF NOT EXISTS idx_user_buzz_weekly_lookup 
  ON public.user_buzz_weekly (user_id, week_start DESC);

-- RLS
ALTER TABLE public.user_buzz_weekly ENABLE ROW LEVEL SECURITY;

-- Policy: utenti possono vedere/modificare solo i propri record
CREATE POLICY "Users can view own buzz weekly" ON public.user_buzz_weekly
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own buzz weekly" ON public.user_buzz_weekly
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buzz weekly" ON public.user_buzz_weekly
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Service role ha accesso completo
CREATE POLICY "Service role full access buzz weekly" ON public.user_buzz_weekly
  FOR ALL TO service_role
  USING (true);

-- ============================================================================
-- 2. TABELLA: user_buzzmap_monthly
-- Traccia i BUZZ MAP mensili usati per tier
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_buzzmap_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL, -- Primo del mese (es. 2025-12-01)
  buzzmap_used INTEGER NOT NULL DEFAULT 0,
  tier_snapshot TEXT, -- Tier al momento dell'uso (per audit)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: un solo record per utente per mese
  CONSTRAINT user_buzzmap_monthly_unique UNIQUE (user_id, month_start)
);

-- Indice per lookup veloce
CREATE INDEX IF NOT EXISTS idx_user_buzzmap_monthly_lookup 
  ON public.user_buzzmap_monthly (user_id, month_start DESC);

-- RLS
ALTER TABLE public.user_buzzmap_monthly ENABLE ROW LEVEL SECURITY;

-- Policy: utenti possono vedere/modificare solo i propri record
CREATE POLICY "Users can view own buzzmap monthly" ON public.user_buzzmap_monthly
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own buzzmap monthly" ON public.user_buzzmap_monthly
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buzzmap monthly" ON public.user_buzzmap_monthly
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Service role ha accesso completo
CREATE POLICY "Service role full access buzzmap monthly" ON public.user_buzzmap_monthly
  FOR ALL TO service_role
  USING (true);

-- ============================================================================
-- 3. FUNZIONE HELPER: Calcola inizio settimana (Lunedì)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_week_start(d DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  -- Restituisce il Lunedì della settimana contenente la data
  RETURN d - ((EXTRACT(ISODOW FROM d) - 1)::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 4. FUNZIONE HELPER: Calcola inizio mese
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_month_start(d DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  RETURN DATE_TRUNC('month', d)::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 5. COMMENTI TABELLE
-- ============================================================================

COMMENT ON TABLE public.user_buzz_weekly IS 'M1SSION™ - Traccia BUZZ gratuiti settimanali per tier abbonamento';
COMMENT ON TABLE public.user_buzzmap_monthly IS 'M1SSION™ - Traccia BUZZ MAP mensili per tier abbonamento';

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================


