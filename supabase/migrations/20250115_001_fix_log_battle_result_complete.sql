-- ============================================================================
-- M1SSION™ FIX COMPLETO: RPC log_battle_result con is_valid_for_domination
-- PROBLEMA: is_valid_for_domination non veniva settato, query filtrava per true
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. AGGIORNA RPC log_battle_result con is_valid_for_domination ESPLICITO
CREATE OR REPLACE FUNCTION public.log_battle_result(
  p_user_id UUID,
  p_opponent_id TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_is_pvp BOOLEAN DEFAULT false,
  p_won BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code CHAR(2);
  v_battle_id UUID;
  v_country_name TEXT;
  v_user_id UUID;
BEGIN
  -- 🔒 USA auth.uid() DIRETTAMENTE per sicurezza
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Genera ID battaglia
  v_battle_id := gen_random_uuid();
  
  -- Calcola paese dalle coordinate
  v_country_code := get_country_code_from_coords(COALESCE(p_lat, 0), COALESCE(p_lng, 0));
  
  -- Se non trovato, usa 'XX' per Unknown
  IF v_country_code IS NULL OR v_country_code = '' THEN
    v_country_code := 'XX';
  END IF;
  
  -- Nome paese per UI
  v_country_name := CASE v_country_code
    WHEN 'IT' THEN 'Italia'
    WHEN 'FR' THEN 'Francia'
    WHEN 'DE' THEN 'Germania'
    WHEN 'GB' THEN 'Regno Unito'
    WHEN 'US' THEN 'Stati Uniti'
    WHEN 'ES' THEN 'Spagna'
    WHEN 'CH' THEN 'Svizzera'
    WHEN 'AT' THEN 'Austria'
    WHEN 'BE' THEN 'Belgio'
    WHEN 'NL' THEN 'Paesi Bassi'
    WHEN 'MC' THEN 'Monaco'
    WHEN 'PT' THEN 'Portogallo'
    WHEN 'PL' THEN 'Polonia'
    WHEN 'CZ' THEN 'Repubblica Ceca'
    WHEN 'HU' THEN 'Ungheria'
    WHEN 'RO' THEN 'Romania'
    WHEN 'GR' THEN 'Grecia'
    WHEN 'HR' THEN 'Croazia'
    WHEN 'SI' THEN 'Slovenia'
    WHEN 'SK' THEN 'Slovacchia'
    WHEN 'DK' THEN 'Danimarca'
    WHEN 'SE' THEN 'Svezia'
    WHEN 'NO' THEN 'Norvegia'
    WHEN 'FI' THEN 'Finlandia'
    WHEN 'IE' THEN 'Irlanda'
    WHEN 'LU' THEN 'Lussemburgo'
    WHEN 'XX' THEN 'Sconosciuto'
    ELSE v_country_code
  END;
  
  -- 🔥 REGISTRA IN country_battle_wins con TUTTI i campi necessari
  INSERT INTO country_battle_wins (
    id,
    battle_id,
    winner_id,
    country_code,
    is_pvp,
    is_valid_for_domination,  -- 🔥 ESPLICITO!
    won_at,
    lat,
    lng,
    is_win
  ) VALUES (
    v_battle_id,
    v_battle_id,
    v_user_id,  -- Chi ha combattuto
    v_country_code,
    p_is_pvp,
    true,  -- 🔥 SEMPRE true per contare nelle conquiste!
    NOW(),
    p_lat,
    p_lng,
    p_won
  );
  
  -- AGGIORNA DOMINATION SOLO SE VITTORIA
  IF p_won THEN
    INSERT INTO country_domination (country_code, win_progress, last_battle_id, last_activity)
    VALUES (v_country_code, 1, v_battle_id, NOW())
    ON CONFLICT (country_code) DO UPDATE
    SET win_progress = country_domination.win_progress + 1,
        last_battle_id = v_battle_id,
        last_activity = NOW();
  END IF;
  
  -- Ritorna risultato
  RETURN jsonb_build_object(
    'success', true,
    'battle_id', v_battle_id,
    'country_code', v_country_code,
    'country_name', v_country_name,
    'is_win', p_won,
    'lat', p_lat,
    'lng', p_lng
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'sql_state', SQLSTATE,
    'country_code', v_country_code,
    'lat', p_lat,
    'lng', p_lng
  );
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.log_battle_result TO authenticated;

-- 2. FIX: Aggiorna tutti i record esistenti che hanno is_valid_for_domination = NULL o false
UPDATE country_battle_wins 
SET is_valid_for_domination = true 
WHERE is_valid_for_domination IS NULL OR is_valid_for_domination = false;

-- 3. Verifica funzione geocoding
-- SELECT get_country_code_from_coords(48.8566, 2.3522) AS paris_should_be_FR;
-- SELECT get_country_code_from_coords(50.85, 4.35) AS brussels_should_be_BE;
-- SELECT get_country_code_from_coords(52.37, 4.89) AS amsterdam_should_be_NL;

