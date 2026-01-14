-- ============================================================================
-- M1SSION™ FIX: RPC per registrare TUTTE le battaglie (vittorie E sconfitte)
-- PROBLEMA: log_battle_win registrava solo vittorie, sconfitte ignorate
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- RPC che registra QUALSIASI battaglia (vinta o persa)
CREATE OR REPLACE FUNCTION public.log_battle_result(
  p_user_id UUID,
  p_opponent_id TEXT,  -- Può essere UUID o "fake-agent-X" o "AG-NPC-XXXX"
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
BEGIN
  -- Verifica autorizzazione
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Genera ID battaglia
  v_battle_id := gen_random_uuid();
  
  -- Calcola paese dalle coordinate
  v_country_code := get_country_code_from_coords(COALESCE(p_lat, 0), COALESCE(p_lng, 0));
  
  -- Se non trovato, usa 'XX' per Unknown
  IF v_country_code IS NULL THEN
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
  
  -- REGISTRA IN country_battle_wins (per TUTTE le battaglie)
  INSERT INTO country_battle_wins (
    id,
    winner_id,  -- Chi ha combattuto (vincitore o perdente)
    loser_id,   -- NULL per sconfitte, l'ID per vittorie
    country_code,
    is_pvp,
    won_at,
    lat,
    lng,
    is_win      -- NUOVO: true = vittoria, false = sconfitta
  ) VALUES (
    v_battle_id,
    p_user_id,
    CASE WHEN p_won THEN p_opponent_id::TEXT ELSE NULL END,  -- loser_id solo per vittorie
    v_country_code,
    p_is_pvp,
    NOW(),
    p_lat,
    p_lng,
    p_won  -- Salva se è vittoria o sconfitta
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
    'country_code', v_country_code
  );
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.log_battle_result TO authenticated;

-- Aggiungi colonna is_win a country_battle_wins se non esiste
ALTER TABLE public.country_battle_wins 
ADD COLUMN IF NOT EXISTS is_win BOOLEAN DEFAULT true;

-- Commento
COMMENT ON COLUMN public.country_battle_wins.is_win IS 'true = vittoria, false = sconfitta';

-- Aggiorna RLS per permettere lettura di TUTTE le battaglie
DROP POLICY IF EXISTS "Users can view all battles" ON public.country_battle_wins;
CREATE POLICY "Users can view all battles"
  ON public.country_battle_wins FOR SELECT
  USING (true);

-- Verifica (dovrebbe ritornare 'FR' per Parigi)
-- SELECT get_country_code_from_coords(48.8566, 2.3522) AS test_paris;

