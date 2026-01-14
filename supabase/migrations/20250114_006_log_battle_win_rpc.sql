-- ============================================================================
-- M1SSION™ FIX: RPC per registrare vittorie battaglie (bypassa battle_sessions)
-- PROBLEMA: battle_sessions ha foreign key su defender_id che blocca Fake Agents
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. RPC function per registrare una vittoria
CREATE OR REPLACE FUNCTION public.log_battle_win(
  p_winner_id UUID,
  p_opponent_id TEXT,  -- Può essere UUID o "fake-agent-X"
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_is_pvp BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code CHAR(2);
  v_battle_id UUID;
  v_is_valid_for_domination BOOLEAN;
BEGIN
  -- Verifica che winner sia l'utente corrente
  IF p_winner_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Genera battle_id unico
  v_battle_id := gen_random_uuid();
  
  -- Calcola country code dalle coordinate
  v_country_code := get_country_code_from_coords(COALESCE(p_lat, 0), COALESCE(p_lng, 0));
  
  -- Se coordinate non valide
  IF v_country_code = 'XX' OR p_lat IS NULL OR p_lng IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid coordinates',
      'lat', p_lat,
      'lng', p_lng
    );
  END IF;
  
  -- Vittorie vs Fake Agent sono valide per domination (winner è reale)
  v_is_valid_for_domination := true;
  
  -- Inserisci in country_battle_wins
  INSERT INTO country_battle_wins (
    battle_id, winner_id, loser_id, country_code,
    lat, lng, is_pvp, is_valid_for_domination, won_at
  ) VALUES (
    v_battle_id, p_winner_id, NULL, v_country_code,
    p_lat, p_lng, p_is_pvp, v_is_valid_for_domination, NOW()
  );
  
  -- Assicurati che il paese esista nella tabella domination
  INSERT INTO country_domination (country_code)
  VALUES (v_country_code)
  ON CONFLICT (country_code) DO NOTHING;
  
  -- Aggiorna progresso dominio
  UPDATE country_domination
  SET 
    win_progress = win_progress + 1,
    last_battle_id = v_battle_id,
    last_activity_at = NOW()
  WHERE country_code = v_country_code;
  
  RETURN jsonb_build_object(
    'success', true,
    'battle_id', v_battle_id,
    'country_code', v_country_code,
    'country_name', CASE v_country_code
      WHEN 'IT' THEN 'Italia'
      WHEN 'FR' THEN 'Francia'
      WHEN 'DE' THEN 'Germania'
      WHEN 'ES' THEN 'Spagna'
      WHEN 'GB' THEN 'Regno Unito'
      WHEN 'US' THEN 'Stati Uniti'
      WHEN 'CH' THEN 'Svizzera'
      WHEN 'AT' THEN 'Austria'
      WHEN 'BE' THEN 'Belgio'
      WHEN 'NL' THEN 'Paesi Bassi'
      WHEN 'MC' THEN 'Monaco'
      WHEN 'PT' THEN 'Portogallo'
      WHEN 'GR' THEN 'Grecia'
      WHEN 'PL' THEN 'Polonia'
      ELSE v_country_code
    END,
    'lat', p_lat,
    'lng', p_lng
  );
END;
$$;

-- 2. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.log_battle_win(UUID, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN) TO authenticated;

-- 3. Commento
COMMENT ON FUNCTION public.log_battle_win IS 
  'Registra una vittoria battaglia direttamente in country_battle_wins, bypassando battle_sessions (per supportare Fake Agents)';

-- ============================================================================

