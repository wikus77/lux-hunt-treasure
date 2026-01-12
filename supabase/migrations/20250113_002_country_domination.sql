-- ============================================================================
-- RISIKO DOMINATION — Tabella Stato Dominio Paese
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: Stato corrente del dominio per ogni paese
-- STATI: neutral → contested (≥80%) → conquered (100%)
-- ROLLBACK: DROP TABLE country_domination CASCADE;
-- ============================================================================

-- 1. Creare tabella stato dominio
CREATE TABLE IF NOT EXISTS public.country_domination (
  -- Chiave primaria = codice paese ISO
  country_code CHAR(2) PRIMARY KEY,
  
  -- Proprietario attuale (NULL = neutral)
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Progresso conquista
  win_progress INTEGER NOT NULL DEFAULT 0,
  conquest_threshold INTEGER NOT NULL DEFAULT 21,  -- Soglia per conquista
  
  -- Stato dominio
  status TEXT NOT NULL DEFAULT 'neutral' 
    CHECK (status IN ('neutral', 'contested', 'conquered')),
  
  -- Tracking
  last_battle_id UUID,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  conquered_at TIMESTAMPTZ,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indici per performance
CREATE INDEX IF NOT EXISTS idx_country_domination_owner 
  ON public.country_domination(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_country_domination_status 
  ON public.country_domination(status);
CREATE INDEX IF NOT EXISTS idx_country_domination_conquered 
  ON public.country_domination(status) WHERE status = 'conquered';

-- 3. RLS Policies
ALTER TABLE public.country_domination ENABLE ROW LEVEL SECURITY;

-- Tutti possono leggere (per visualizzare mappa)
CREATE POLICY "Anyone can view country domination" 
  ON public.country_domination FOR SELECT 
  USING (true);

-- Solo sistema può modificare
CREATE POLICY "System can update domination" 
  ON public.country_domination FOR UPDATE 
  USING (true);

CREATE POLICY "System can insert domination" 
  ON public.country_domination FOR INSERT 
  WITH CHECK (true);

-- 4. Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_country_domination_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER country_domination_updated_at
  BEFORE UPDATE ON public.country_domination
  FOR EACH ROW
  EXECUTE FUNCTION update_country_domination_timestamp();

-- 5. Funzione per calcolare status da progress
CREATE OR REPLACE FUNCTION calculate_domination_status(
  p_win_progress INTEGER,
  p_threshold INTEGER
) RETURNS TEXT AS $$
BEGIN
  IF p_win_progress >= p_threshold THEN
    RETURN 'conquered';
  ELSIF p_win_progress >= CEIL(p_threshold * 0.8) THEN
    RETURN 'contested';
  ELSE
    RETURN 'neutral';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Inizializza paesi principali con threshold
INSERT INTO public.country_domination (country_code, conquest_threshold) VALUES
  -- Europa
  ('IT', 21), ('FR', 21), ('DE', 21), ('ES', 21), ('PT', 15),
  ('GB', 21), ('NL', 15), ('BE', 12), ('AT', 15), ('CH', 15),
  ('PL', 18), ('CZ', 12), ('SK', 10), ('HU', 12), ('RO', 15),
  ('BG', 12), ('GR', 15), ('HR', 10), ('SI', 8), ('SE', 15),
  ('NO', 12), ('DK', 10), ('FI', 12), ('IE', 12),
  -- Asia
  ('CN', 30), ('JP', 25), ('KR', 20), ('IN', 30), ('ID', 20),
  ('TH', 15), ('VN', 15), ('MY', 12), ('PH', 15), ('SG', 10),
  ('AE', 12), ('SA', 15), ('TR', 20), ('IL', 12),
  -- Nord America
  ('US', 30), ('CA', 25), ('MX', 20),
  -- Sud America
  ('BR', 25), ('AR', 20), ('CL', 15), ('CO', 15), ('PE', 12),
  -- Africa
  ('ZA', 18), ('EG', 18), ('NG', 15), ('KE', 12), ('MA', 12),
  -- Oceania
  ('AU', 20), ('NZ', 12)
ON CONFLICT (country_code) DO NOTHING;

-- 7. Commento documentazione
COMMENT ON TABLE public.country_domination IS 
  'Stato dominio Risiko per paese. Status: neutral→contested→conquered';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- DROP TRIGGER IF EXISTS country_domination_updated_at ON public.country_domination;
-- DROP FUNCTION IF EXISTS update_country_domination_timestamp();
-- DROP FUNCTION IF EXISTS calculate_domination_status(INTEGER, INTEGER);
-- DROP TABLE IF EXISTS public.country_domination CASCADE;
-- ============================================================================

