-- ============================================================================
-- RISIKO DOMINATION — Tabella Rewards Idempotenti
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: Tracciamento rewards PE per evitare duplicazioni
-- IDEMPOTENZA: Vincoli UNIQUE per tipo + paese/continente + giorno
-- ROLLBACK: DROP TABLE domination_rewards CASCADE;
-- ============================================================================

-- 1. Creare tabella rewards
CREATE TABLE IF NOT EXISTS public.domination_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Beneficiario
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo reward
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'country',           -- +1000 PE per paese conquistato
    'three_countries',   -- +3000 PE per ≥3 paesi
    'continent'          -- +10000 PE per continente completo
  )),
  
  -- Riferimento geografico
  country_code CHAR(2),      -- Per reward 'country'
  continent_code TEXT,       -- Per reward 'continent'
  
  -- Importo PE assegnato
  pe_amount INTEGER NOT NULL,
  
  -- Tracking
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Vincoli UNIQUE per idempotenza (uno per tipo)

-- Per country: max 1 reward per paese per giorno per utente
CREATE UNIQUE INDEX IF NOT EXISTS idx_domination_rewards_country_unique
  ON public.domination_rewards(user_id, reward_type, country_code, DATE_TRUNC('day', awarded_at))
  WHERE reward_type = 'country' AND country_code IS NOT NULL;

-- Per three_countries: max 1 reward per giorno per utente
CREATE UNIQUE INDEX IF NOT EXISTS idx_domination_rewards_three_unique
  ON public.domination_rewards(user_id, reward_type, DATE_TRUNC('day', awarded_at))
  WHERE reward_type = 'three_countries';

-- Per continent: max 1 reward per continente per giorno per utente
CREATE UNIQUE INDEX IF NOT EXISTS idx_domination_rewards_continent_unique
  ON public.domination_rewards(user_id, reward_type, continent_code, DATE_TRUNC('day', awarded_at))
  WHERE reward_type = 'continent' AND continent_code IS NOT NULL;

-- 3. Indici per query
CREATE INDEX IF NOT EXISTS idx_domination_rewards_user 
  ON public.domination_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_domination_rewards_date 
  ON public.domination_rewards(awarded_at DESC);

-- 4. RLS Policies
ALTER TABLE public.domination_rewards ENABLE ROW LEVEL SECURITY;

-- Utenti possono vedere i propri rewards
CREATE POLICY "Users can view own rewards" 
  ON public.domination_rewards FOR SELECT 
  USING (auth.uid() = user_id);

-- Sistema può inserire
CREATE POLICY "System can insert rewards" 
  ON public.domination_rewards FOR INSERT 
  WITH CHECK (true);

-- 5. Mapping Continenti
CREATE TABLE IF NOT EXISTS public.continent_countries (
  continent_code TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  PRIMARY KEY (continent_code, country_code)
);

INSERT INTO public.continent_countries (continent_code, country_code) VALUES
  -- EUROPE (27 paesi)
  ('EUROPE', 'IT'), ('EUROPE', 'FR'), ('EUROPE', 'DE'), ('EUROPE', 'ES'),
  ('EUROPE', 'PT'), ('EUROPE', 'GB'), ('EUROPE', 'NL'), ('EUROPE', 'BE'),
  ('EUROPE', 'AT'), ('EUROPE', 'CH'), ('EUROPE', 'PL'), ('EUROPE', 'CZ'),
  ('EUROPE', 'SK'), ('EUROPE', 'HU'), ('EUROPE', 'RO'), ('EUROPE', 'BG'),
  ('EUROPE', 'GR'), ('EUROPE', 'HR'), ('EUROPE', 'SI'), ('EUROPE', 'SE'),
  ('EUROPE', 'NO'), ('EUROPE', 'DK'), ('EUROPE', 'FI'), ('EUROPE', 'IE'),
  -- ASIA (14 paesi)
  ('ASIA', 'CN'), ('ASIA', 'JP'), ('ASIA', 'KR'), ('ASIA', 'IN'),
  ('ASIA', 'ID'), ('ASIA', 'TH'), ('ASIA', 'VN'), ('ASIA', 'MY'),
  ('ASIA', 'PH'), ('ASIA', 'SG'), ('ASIA', 'AE'), ('ASIA', 'SA'),
  ('ASIA', 'TR'), ('ASIA', 'IL'),
  -- NORTH_AMERICA (3 paesi)
  ('NORTH_AMERICA', 'US'), ('NORTH_AMERICA', 'CA'), ('NORTH_AMERICA', 'MX'),
  -- SOUTH_AMERICA (5 paesi)
  ('SOUTH_AMERICA', 'BR'), ('SOUTH_AMERICA', 'AR'), ('SOUTH_AMERICA', 'CL'),
  ('SOUTH_AMERICA', 'CO'), ('SOUTH_AMERICA', 'PE'),
  -- AFRICA (5 paesi)
  ('AFRICA', 'ZA'), ('AFRICA', 'EG'), ('AFRICA', 'NG'), ('AFRICA', 'KE'),
  ('AFRICA', 'MA'),
  -- OCEANIA (2 paesi)
  ('OCEANIA', 'AU'), ('OCEANIA', 'NZ')
ON CONFLICT DO NOTHING;

-- 6. Commento documentazione
COMMENT ON TABLE public.domination_rewards IS 
  'Rewards PE per Risiko Domination. Idempotente: max 1 reward per tipo/giorno';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- DROP TABLE IF EXISTS public.continent_countries CASCADE;
-- DROP TABLE IF EXISTS public.domination_rewards CASCADE;
-- ============================================================================

