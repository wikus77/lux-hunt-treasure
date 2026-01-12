-- ============================================================================
-- RISIKO DOMINATION — COMPLETE SQL SETUP
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- ISTRUZIONI: Copia ed esegui TUTTO questo SQL nel Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: country_battle_wins (log vittorie)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.country_battle_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL UNIQUE,
  winner_id UUID NOT NULL,
  loser_id UUID,
  country_code CHAR(2) NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_pvp BOOLEAN NOT NULL DEFAULT true,
  is_valid_for_domination BOOLEAN NOT NULL DEFAULT true,
  won_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_country_battle_wins_winner ON public.country_battle_wins(winner_id);
CREATE INDEX IF NOT EXISTS idx_country_battle_wins_country ON public.country_battle_wins(country_code);
CREATE INDEX IF NOT EXISTS idx_country_battle_wins_won_at ON public.country_battle_wins(won_at DESC);

ALTER TABLE public.country_battle_wins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view battle wins" ON public.country_battle_wins;
CREATE POLICY "Anyone can view battle wins" ON public.country_battle_wins FOR SELECT USING (true);
DROP POLICY IF EXISTS "System can insert battle wins" ON public.country_battle_wins;
CREATE POLICY "System can insert battle wins" ON public.country_battle_wins FOR INSERT WITH CHECK (true);

-- ============================================================================
-- STEP 2: country_domination (stato dominio)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.country_domination (
  country_code CHAR(2) PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  win_progress INTEGER NOT NULL DEFAULT 0,
  conquest_threshold INTEGER NOT NULL DEFAULT 21,
  status TEXT NOT NULL DEFAULT 'neutral' CHECK (status IN ('neutral', 'contested', 'conquered')),
  last_battle_id UUID,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  conquered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_country_domination_owner ON public.country_domination(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_country_domination_status ON public.country_domination(status);

ALTER TABLE public.country_domination ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view country domination" ON public.country_domination;
CREATE POLICY "Anyone can view country domination" ON public.country_domination FOR SELECT USING (true);
DROP POLICY IF EXISTS "System can update domination" ON public.country_domination;
CREATE POLICY "System can update domination" ON public.country_domination FOR UPDATE USING (true);
DROP POLICY IF EXISTS "System can insert domination" ON public.country_domination;
CREATE POLICY "System can insert domination" ON public.country_domination FOR INSERT WITH CHECK (true);

-- Trigger auto-update
CREATE OR REPLACE FUNCTION update_country_domination_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS country_domination_updated_at ON public.country_domination;
CREATE TRIGGER country_domination_updated_at
  BEFORE UPDATE ON public.country_domination
  FOR EACH ROW EXECUTE FUNCTION update_country_domination_timestamp();

-- Funzione status
CREATE OR REPLACE FUNCTION calculate_domination_status(p_win_progress INTEGER, p_threshold INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_win_progress >= p_threshold THEN RETURN 'conquered';
  ELSIF p_win_progress >= CEIL(p_threshold * 0.8) THEN RETURN 'contested';
  ELSE RETURN 'neutral';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Inizializza paesi
INSERT INTO public.country_domination (country_code, conquest_threshold) VALUES
  ('IT', 21), ('FR', 21), ('DE', 21), ('ES', 21), ('PT', 15),
  ('GB', 21), ('NL', 15), ('BE', 12), ('AT', 15), ('CH', 15),
  ('PL', 18), ('CZ', 12), ('SK', 10), ('HU', 12), ('RO', 15),
  ('BG', 12), ('GR', 15), ('HR', 10), ('SI', 8), ('SE', 15),
  ('NO', 12), ('DK', 10), ('FI', 12), ('IE', 12),
  ('CN', 30), ('JP', 25), ('KR', 20), ('IN', 30), ('ID', 20),
  ('TH', 15), ('VN', 15), ('MY', 12), ('PH', 15), ('SG', 10),
  ('AE', 12), ('SA', 15), ('TR', 20), ('IL', 12),
  ('US', 30), ('CA', 25), ('MX', 20),
  ('BR', 25), ('AR', 20), ('CL', 15), ('CO', 15), ('PE', 12),
  ('ZA', 18), ('EG', 18), ('NG', 15), ('KE', 12), ('MA', 12),
  ('AU', 20), ('NZ', 12)
ON CONFLICT (country_code) DO NOTHING;

-- ============================================================================
-- STEP 3: domination_rewards (rewards idempotenti)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.domination_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('country', 'three_countries', 'continent')),
  country_code CHAR(2),
  continent_code TEXT,
  pe_amount INTEGER NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_domination_rewards_country_unique
  ON public.domination_rewards(user_id, reward_type, country_code, DATE_TRUNC('day', awarded_at))
  WHERE reward_type = 'country' AND country_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_domination_rewards_three_unique
  ON public.domination_rewards(user_id, reward_type, DATE_TRUNC('day', awarded_at))
  WHERE reward_type = 'three_countries';

CREATE UNIQUE INDEX IF NOT EXISTS idx_domination_rewards_continent_unique
  ON public.domination_rewards(user_id, reward_type, continent_code, DATE_TRUNC('day', awarded_at))
  WHERE reward_type = 'continent' AND continent_code IS NOT NULL;

ALTER TABLE public.domination_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own rewards" ON public.domination_rewards;
CREATE POLICY "Users can view own rewards" ON public.domination_rewards FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert rewards" ON public.domination_rewards;
CREATE POLICY "System can insert rewards" ON public.domination_rewards FOR INSERT WITH CHECK (true);

-- ============================================================================
-- STEP 4: continent_countries (mapping continenti)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.continent_countries (
  continent_code TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  PRIMARY KEY (continent_code, country_code)
);

INSERT INTO public.continent_countries (continent_code, country_code) VALUES
  ('EUROPE', 'IT'), ('EUROPE', 'FR'), ('EUROPE', 'DE'), ('EUROPE', 'ES'),
  ('EUROPE', 'PT'), ('EUROPE', 'GB'), ('EUROPE', 'NL'), ('EUROPE', 'BE'),
  ('EUROPE', 'AT'), ('EUROPE', 'CH'), ('EUROPE', 'PL'), ('EUROPE', 'CZ'),
  ('EUROPE', 'SK'), ('EUROPE', 'HU'), ('EUROPE', 'RO'), ('EUROPE', 'BG'),
  ('EUROPE', 'GR'), ('EUROPE', 'HR'), ('EUROPE', 'SI'), ('EUROPE', 'SE'),
  ('EUROPE', 'NO'), ('EUROPE', 'DK'), ('EUROPE', 'FI'), ('EUROPE', 'IE'),
  ('ASIA', 'CN'), ('ASIA', 'JP'), ('ASIA', 'KR'), ('ASIA', 'IN'),
  ('ASIA', 'ID'), ('ASIA', 'TH'), ('ASIA', 'VN'), ('ASIA', 'MY'),
  ('ASIA', 'PH'), ('ASIA', 'SG'), ('ASIA', 'AE'), ('ASIA', 'SA'),
  ('ASIA', 'TR'), ('ASIA', 'IL'),
  ('NORTH_AMERICA', 'US'), ('NORTH_AMERICA', 'CA'), ('NORTH_AMERICA', 'MX'),
  ('SOUTH_AMERICA', 'BR'), ('SOUTH_AMERICA', 'AR'), ('SOUTH_AMERICA', 'CL'),
  ('SOUTH_AMERICA', 'CO'), ('SOUTH_AMERICA', 'PE'),
  ('AFRICA', 'ZA'), ('AFRICA', 'EG'), ('AFRICA', 'NG'), ('AFRICA', 'KE'),
  ('AFRICA', 'MA'),
  ('OCEANIA', 'AU'), ('OCEANIA', 'NZ')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: RPC Functions
-- ============================================================================

-- RPC: get_country_domination_state
CREATE OR REPLACE FUNCTION public.get_country_domination_state()
RETURNS TABLE (
  country_code CHAR(2),
  owner_id UUID,
  owner_name TEXT,
  owner_agent_code TEXT,
  win_progress INTEGER,
  conquest_threshold INTEGER,
  status TEXT,
  conquered_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT cd.country_code, cd.owner_id,
    COALESCE(p.full_name, p.username, p.agent_code, 'Agent') as owner_name,
    p.agent_code as owner_agent_code,
    cd.win_progress, cd.conquest_threshold, cd.status, cd.conquered_at
  FROM country_domination cd
  LEFT JOIN profiles p ON p.id = cd.owner_id
  WHERE cd.status IN ('contested', 'conquered')
  ORDER BY cd.status DESC, cd.win_progress DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_country_domination_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_country_domination_state() TO anon;

-- RPC: get_user_domination_stats
CREATE OR REPLACE FUNCTION public.get_user_domination_stats(p_user_id UUID)
RETURNS TABLE (
  countries_owned INTEGER,
  countries_contested INTEGER,
  total_wins INTEGER,
  continents_owned TEXT[]
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_continents TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT cc.continent_code) INTO v_continents
  FROM continent_countries cc
  WHERE NOT EXISTS (
    SELECT 1 FROM continent_countries cc2
    WHERE cc2.continent_code = cc.continent_code
    AND cc2.country_code NOT IN (
      SELECT cd.country_code FROM country_domination cd 
      WHERE cd.owner_id = p_user_id AND cd.status = 'conquered'
    )
  );
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM country_domination WHERE owner_id = p_user_id AND status = 'conquered'),
    (SELECT COUNT(*)::INTEGER FROM country_domination WHERE owner_id = p_user_id AND status = 'contested'),
    (SELECT COUNT(*)::INTEGER FROM country_battle_wins WHERE winner_id = p_user_id AND is_valid_for_domination = true),
    COALESCE(v_continents, ARRAY[]::TEXT[]);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_domination_stats(UUID) TO authenticated;

-- ============================================================================
-- STEP 6: Helper functions per trigger
-- ============================================================================

-- Reverse geocode
CREATE OR REPLACE FUNCTION public.get_country_code_from_coords(p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS CHAR(2) LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF p_lat BETWEEN 35.5 AND 47.1 AND p_lng BETWEEN 6.6 AND 18.5 THEN RETURN 'IT'; END IF;
  IF p_lat BETWEEN 41.3 AND 51.1 AND p_lng BETWEEN -5.1 AND 9.6 THEN RETURN 'FR'; END IF;
  IF p_lat BETWEEN 47.3 AND 55.1 AND p_lng BETWEEN 5.9 AND 15.0 THEN RETURN 'DE'; END IF;
  IF p_lat BETWEEN 36.0 AND 43.8 AND p_lng BETWEEN -9.3 AND 3.3 THEN RETURN 'ES'; END IF;
  IF p_lat BETWEEN 49.9 AND 60.9 AND p_lng BETWEEN -8.2 AND 1.8 THEN RETURN 'GB'; END IF;
  IF p_lat BETWEEN 24.5 AND 49.4 AND p_lng BETWEEN -125.0 AND -66.9 THEN RETURN 'US'; END IF;
  IF p_lat BETWEEN -33.8 AND 5.3 AND p_lng BETWEEN -73.9 AND -34.8 THEN RETURN 'BR'; END IF;
  IF p_lat BETWEEN 24.0 AND 46.0 AND p_lng BETWEEN 123.0 AND 146.0 THEN RETURN 'JP'; END IF;
  IF p_lat BETWEEN 18.0 AND 54.0 AND p_lng BETWEEN 73.0 AND 135.0 THEN RETURN 'CN'; END IF;
  IF p_lat BETWEEN -44.0 AND -10.0 AND p_lng BETWEEN 113.0 AND 154.0 THEN RETURN 'AU'; END IF;
  RETURN 'XX';
END;
$$;

-- Verifica PvP valido
CREATE OR REPLACE FUNCTION public.is_valid_pvp_battle(p_winner_id UUID, p_opponent_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM profiles WHERE id = p_winner_id)
     AND EXISTS(SELECT 1 FROM profiles WHERE id = p_opponent_id);
END;
$$;

-- ============================================================================
-- STEP 7: Abilita realtime
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE country_domination;

-- ============================================================================
-- ✅ SETUP COMPLETATO!
-- ============================================================================

SELECT 'Risiko Domination setup completed!' AS status;

