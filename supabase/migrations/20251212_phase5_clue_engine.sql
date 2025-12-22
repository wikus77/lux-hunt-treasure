-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- PHASE 5: Mission-Bound Clue Engine - Schema

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: mission_features_cache
-- Cache delle features estratte dalla missione (location + prize)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mission_features_cache (
  mission_id UUID PRIMARY KEY,
  
  -- Location features (estratte da lat/lng)
  hemisphere TEXT,                       -- 'north' | 'south'
  lat_band TEXT,                         -- 'polar' | 'temperate' | 'subtropical' | 'tropical'
  climate_hint TEXT,                     -- 'continental' | 'mediterranean' | 'oceanic' | 'arid'
  coastal_proximity TEXT,                -- 'coastal' | 'inland' | 'island'
  urban_density TEXT,                    -- 'metro' | 'urban' | 'suburban' | 'rural'
  timezone_band TEXT,                    -- 'west' | 'central' | 'east'
  
  -- Prize features (estratte da final_prize_profile)
  prize_materials JSONB DEFAULT '[]',    -- ["gold", "leather", "ceramic"]
  prize_origin_style TEXT,               -- 'european' | 'asian' | 'american' | 'african'
  prize_use_context TEXT,                -- 'luxury' | 'utility' | 'art' | 'collectible'
  prize_history_tone TEXT,               -- 'ancient' | 'vintage' | 'modern' | 'futuristic'
  prize_value_tier TEXT,                 -- 'entry' | 'mid' | 'high' | 'ultra'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: mission_clue_metadata
-- Metadata per ogni indizio generato (per cooldown e anti-duplication)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mission_clue_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL,
  user_id UUID NOT NULL,
  clue_index INTEGER NOT NULL,           -- 1-250
  day_index INTEGER NOT NULL,            -- 1-30 (giorno missione)
  
  -- Binding info
  domain TEXT NOT NULL,                  -- 'location' | 'prize'
  category TEXT NOT NULL,                -- es: 'luogo', 'clima', 'storia', 'materiale'
  is_fake BOOLEAN DEFAULT FALSE,
  
  -- Features used (per cooldown)
  location_features_used JSONB DEFAULT '[]',
  prize_features_used JSONB DEFAULT '[]',
  bridge_metaphor_id TEXT,
  
  -- Anti-duplication
  structure_hash TEXT,
  opening_type TEXT,
  
  -- Scoring
  clarity_score NUMERIC(4,3),            -- 0.100-0.850
  leak_risk_score NUMERIC(4,3),          -- 0.000-1.000
  
  -- Generated clue text (for reference)
  clue_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_clue_per_user_mission UNIQUE(mission_id, user_id, clue_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clue_metadata_mission_user 
  ON mission_clue_metadata(mission_id, user_id);
  
CREATE INDEX IF NOT EXISTS idx_clue_metadata_recent 
  ON mission_clue_metadata(mission_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clue_metadata_day 
  ON mission_clue_metadata(mission_id, day_index);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: clue_templates
-- Template base per generazione indizi (categorie + strutture)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clue_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  domain TEXT NOT NULL,                  -- 'location' | 'prize'
  category TEXT NOT NULL,                -- 'luogo', 'clima', 'storia', etc.
  
  -- Template structure
  template_text TEXT NOT NULL,           -- "Nel {climate} dove {bridge}, {prize_hint} attende"
  opening_type TEXT NOT NULL,            -- 'question', 'statement', 'metaphor', 'riddle'
  
  -- Clarity range this template is suitable for
  min_clarity NUMERIC(3,2) DEFAULT 0.10,
  max_clarity NUMERIC(3,2) DEFAULT 0.85,
  
  -- Feature placeholders this template uses
  required_features JSONB DEFAULT '[]',  -- ["climate", "material"]
  
  is_fake_template BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clue_templates_domain_category 
  ON clue_templates(domain, category, is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: bridge_metaphors
-- Metafore ponte che collegano location e prize features
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bridge_metaphors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  metaphor_text TEXT NOT NULL,           -- "dove il sole bacia la terra"
  
  -- Compatible features
  location_features JSONB DEFAULT '[]',  -- ["mediterranean", "coastal"]
  prize_features JSONB DEFAULT '[]',     -- ["gold", "luxury"]
  
  -- Clarity range
  min_clarity NUMERIC(3,2) DEFAULT 0.10,
  max_clarity NUMERIC(3,2) DEFAULT 0.85,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Initial clue templates
-- ═══════════════════════════════════════════════════════════════════════════

-- Location templates
INSERT INTO clue_templates (domain, category, template_text, opening_type, min_clarity, max_clarity, required_features) VALUES
-- LUOGO (vago)
('location', 'luogo', 'In terre dove {climate_metaphor}, qualcosa di prezioso riposa.', 'statement', 0.10, 0.30, '["climate"]'),
('location', 'luogo', 'Dove {hemisphere_hint} governa i cieli, un segreto attende chi cerca.', 'statement', 0.10, 0.25, '["hemisphere"]'),
('location', 'luogo', 'Tra {coastal_hint} e orizzonti lontani, il destino ha nascosto un tesoro.', 'metaphor', 0.15, 0.35, '["coastal"]'),

-- LUOGO (medio)
('location', 'luogo', 'Le {climate_detail} di questa regione custodiscono antichi segreti.', 'statement', 0.30, 0.55, '["climate"]'),
('location', 'luogo', 'Nella fascia dove {lat_band_hint}, la ricerca porta frutti.', 'riddle', 0.35, 0.55, '["lat_band"]'),

-- LUOGO (chiaro)
('location', 'luogo', 'Il {timezone_hint} segna il tempo dove il premio attende.', 'statement', 0.55, 0.75, '["timezone"]'),
('location', 'luogo', 'Zone {urban_hint} nascondono ciò che cerchi.', 'statement', 0.60, 0.80, '["urban"]'),

-- CLIMA
('location', 'clima', 'Sotto cieli {climate_sky}, il vento porta sussurri di fortuna.', 'metaphor', 0.10, 0.35, '["climate"]'),
('location', 'clima', 'Dove le stagioni {season_behavior}, qualcosa attende di essere trovato.', 'statement', 0.25, 0.50, '["climate"]'),
('location', 'clima', 'Il {climate_type} domina questa terra di misteri.', 'statement', 0.45, 0.70, '["climate"]'),

-- STORIA
('location', 'storia', 'Echi di {history_era} risuonano dove il premio riposa.', 'metaphor', 0.15, 0.40, '["history"]'),
('location', 'storia', 'Antiche vie {history_path} conducono al tesoro nascosto.', 'riddle', 0.30, 0.55, '["history"]'),

-- CULTURA
('location', 'cultura', 'Tradizioni {culture_type} avvolgono il luogo del premio.', 'statement', 0.20, 0.45, '["culture"]'),
('location', 'cultura', 'Dove {culture_practice} è costume, il tesoro attende.', 'metaphor', 0.35, 0.60, '["culture"]'),

-- MISTERO
('location', 'mistero', 'Ombre e luce danzano dove il segreto dimora.', 'metaphor', 0.10, 0.30, '[]'),
('location', 'mistero', 'Non tutto è come sembra nel luogo della ricompensa.', 'riddle', 0.25, 0.50, '[]'),

-- Prize templates
-- STORIA (premio)
('prize', 'storia', 'La sua storia parla di {prize_era} e {prize_context}.', 'statement', 0.20, 0.50, '["history_tone", "use_context"]'),
('prize', 'storia', 'Generazioni di {prize_origin} hanno forgiato questo tesoro.', 'statement', 0.35, 0.65, '["origin_style"]'),

-- MATERIALE
('prize', 'materiale', 'Composto da {material_hint}, il premio attende il suo nuovo custode.', 'statement', 0.25, 0.55, '["materials"]'),
('prize', 'materiale', '{material_quality} e {material_type} ne definiscono l''essenza.', 'statement', 0.40, 0.70, '["materials"]'),

-- CURIOSITÀ
('prize', 'curiosita', 'Un oggetto di {value_hint} valore nasconde una storia unica.', 'statement', 0.20, 0.45, '["value_tier"]'),
('prize', 'curiosita', 'Chi lo possiede, possiede un pezzo di {context_hint}.', 'metaphor', 0.30, 0.60, '["use_context"]'),

-- FAKE templates (plausibili ma fuorvianti)
('location', 'fake', 'Le correnti {fake_water} portano verso il premio.', 'metaphor', 0.10, 0.85, '[]'),
('location', 'fake', 'Dove {fake_landmark} si erge, il tesoro attende.', 'statement', 0.15, 0.85, '[]'),
('location', 'fake', 'Antichi {fake_history} segnano il cammino.', 'riddle', 0.20, 0.85, '[]'),
('prize', 'fake', 'Realizzato con {fake_material}, splende di luce propria.', 'statement', 0.15, 0.85, '[]'),
('prize', 'fake', 'La sua {fake_origin} racconta storie di terre lontane.', 'metaphor', 0.20, 0.85, '[]')

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Bridge metaphors
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO bridge_metaphors (metaphor_text, location_features, prize_features, min_clarity, max_clarity) VALUES
-- Climate + Materials
('dove il sole bacia la terra dorata', '["mediterranean", "coastal"]', '["gold", "luxury"]', 0.15, 0.45),
('tra brume e riflessi argentei', '["oceanic", "temperate"]', '["silver", "metal"]', 0.10, 0.40),
('sotto cieli che forgiano leggende', '["continental"]', '["ancient", "vintage"]', 0.20, 0.50),

-- Hemisphere + Origin
('nell''emisfero dove le stelle guidano', '["north"]', '["european"]', 0.15, 0.45),
('dove il vento del sud racconta storie', '["south"]', '["art", "collectible"]', 0.20, 0.50),

-- Coastal + Use Context
('tra onde e segreti sepolti', '["coastal", "island"]', '["luxury", "collectible"]', 0.10, 0.40),
('dove mare e terra si incontrano', '["coastal"]', '["utility", "modern"]', 0.25, 0.55),

-- Urban + Value
('nel cuore pulsante della civiltà', '["metro", "urban"]', '["high", "ultra"]', 0.30, 0.60),
('tra vie silenziose e tesori nascosti', '["suburban", "rural"]', '["mid", "entry"]', 0.20, 0.50),

-- Generic bridges (work with any features)
('dove passato e presente si fondono', '[]', '[]', 0.15, 0.85),
('nel punto dove i destini convergono', '[]', '[]', 0.10, 0.85),
('tra ombre e rivelazioni', '[]', '[]', 0.20, 0.70),
('dove il tempo ha depositato i suoi doni', '[]', '[]', 0.25, 0.65)

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: extract_location_features
-- Estrae features dalla location (lat/lng)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION extract_location_features(
  p_lat NUMERIC,
  p_lng NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_hemisphere TEXT;
  v_lat_band TEXT;
  v_climate_hint TEXT;
  v_coastal_proximity TEXT;
  v_timezone_band TEXT;
  v_abs_lat NUMERIC;
BEGIN
  v_abs_lat := ABS(p_lat);
  
  -- Hemisphere
  v_hemisphere := CASE WHEN p_lat >= 0 THEN 'north' ELSE 'south' END;
  
  -- Latitude band
  v_lat_band := CASE
    WHEN v_abs_lat > 66.5 THEN 'polar'
    WHEN v_abs_lat > 35 THEN 'temperate'
    WHEN v_abs_lat > 23.5 THEN 'subtropical'
    ELSE 'tropical'
  END;
  
  -- Climate hint (simplified inference)
  v_climate_hint := CASE
    WHEN v_abs_lat > 60 THEN 'continental'
    WHEN v_abs_lat BETWEEN 30 AND 45 AND p_lng BETWEEN -10 AND 35 THEN 'mediterranean'
    WHEN v_abs_lat < 25 THEN 'tropical'
    WHEN p_lng BETWEEN -130 AND -60 OR p_lng BETWEEN 100 AND 180 THEN 'oceanic'
    ELSE 'continental'
  END;
  
  -- Coastal proximity (simplified - would need coastline data for accuracy)
  -- Default to 'inland', can be enhanced with actual coastline distance
  v_coastal_proximity := 'inland';
  
  -- Timezone band
  v_timezone_band := CASE
    WHEN p_lng < -30 THEN 'west'
    WHEN p_lng < 30 THEN 'central'
    ELSE 'east'
  END;
  
  RETURN jsonb_build_object(
    'hemisphere', v_hemisphere,
    'lat_band', v_lat_band,
    'climate_hint', v_climate_hint,
    'coastal_proximity', v_coastal_proximity,
    'urban_density', 'urban',  -- Default, can be enhanced
    'timezone_band', v_timezone_band
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: calculate_day_clarity
-- Calcola il livello di chiarezza basato sul giorno (1-30)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION calculate_day_clarity(p_day_index INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  v_min_clarity NUMERIC;
  v_max_clarity NUMERIC;
  v_day_in_band INTEGER;
  v_band_size INTEGER;
BEGIN
  -- Day 1-7: 0.10-0.25 (molto vago)
  IF p_day_index <= 7 THEN
    v_min_clarity := 0.10;
    v_max_clarity := 0.25;
    v_day_in_band := p_day_index;
    v_band_size := 7;
  -- Day 8-15: 0.25-0.45 (comprensibile)
  ELSIF p_day_index <= 15 THEN
    v_min_clarity := 0.25;
    v_max_clarity := 0.45;
    v_day_in_band := p_day_index - 7;
    v_band_size := 8;
  -- Day 16-23: 0.45-0.70 (chiaro)
  ELSIF p_day_index <= 23 THEN
    v_min_clarity := 0.45;
    v_max_clarity := 0.70;
    v_day_in_band := p_day_index - 15;
    v_band_size := 8;
  -- Day 24-30: 0.70-0.85 (molto chiaro, mai certo)
  ELSE
    v_min_clarity := 0.70;
    v_max_clarity := 0.85;
    v_day_in_band := p_day_index - 23;
    v_band_size := 7;
  END IF;
  
  -- Linear interpolation within band
  RETURN v_min_clarity + (v_max_clarity - v_min_clarity) * (v_day_in_band::NUMERIC / v_band_size);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: determine_is_fake
-- Determina se un indizio deve essere fake (25% deterministico)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION determine_is_fake(
  p_mission_id UUID,
  p_clue_index INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_seed BIGINT;
  v_hash TEXT;
BEGIN
  -- Create deterministic seed from mission_id + clue_index
  v_hash := md5(p_mission_id::TEXT || ':' || p_clue_index::TEXT);
  v_seed := ('x' || substr(v_hash, 1, 8))::bit(32)::bigint;
  
  -- 25% fake = every 4th clue on average (seed mod 4 == 0)
  RETURN (v_seed % 4) = 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: get_max_leak_risk
-- Ritorna il massimo leak risk consentito per il giorno
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_max_leak_risk(p_day_index INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE
    WHEN p_day_index <= 7 THEN 0.20
    WHEN p_day_index <= 15 THEN 0.30
    WHEN p_day_index <= 23 THEN 0.40
    ELSE 0.45
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON mission_features_cache TO authenticated;
GRANT SELECT, INSERT ON mission_clue_metadata TO authenticated;
GRANT SELECT ON clue_templates TO authenticated;
GRANT SELECT ON bridge_metaphors TO authenticated;
GRANT EXECUTE ON FUNCTION extract_location_features TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_day_clarity TO authenticated;
GRANT EXECUTE ON FUNCTION determine_is_fake TO authenticated;
GRANT EXECUTE ON FUNCTION get_max_leak_risk TO authenticated;

-- Enable RLS
ALTER TABLE mission_features_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_clue_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE clue_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridge_metaphors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read mission features cache"
  ON mission_features_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage mission features cache"
  ON mission_features_cache FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can read their own clue metadata"
  ON mission_clue_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage clue metadata"
  ON mission_clue_metadata FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read clue templates"
  ON clue_templates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read bridge metaphors"
  ON bridge_metaphors FOR SELECT
  USING (true);



