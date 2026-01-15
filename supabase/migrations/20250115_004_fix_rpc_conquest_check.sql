-- ============================================================================
-- M1SSION™ FIX: Add conquest check to log_battle_result RPC
-- PROBLEMA: La RPC incrementa win_progress ma NON aggiorna status='conquered'
-- SOLUZIONE: Aggiungere la stessa logica del trigger battle_sessions
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

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
  -- 🆕 Variabili per check conquista
  v_current_progress INTEGER;
  v_threshold INTEGER;
  v_current_owner UUID;
  v_new_status TEXT;
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
  
  -- 🔥 REGISTRA IN country_battle_wins
  INSERT INTO country_battle_wins (
    id, battle_id, winner_id, country_code, is_pvp,
    is_valid_for_domination, won_at, lat, lng, is_win
  ) VALUES (
    v_battle_id, v_battle_id, v_user_id, v_country_code, p_is_pvp,
    true, NOW(), p_lat, p_lng, p_won
  );
  
  -- 🏴 AGGIORNA DOMINATION SOLO SE VITTORIA
  IF p_won THEN
    -- Assicurati che il paese esista in country_domination
    -- Usa la soglia dalla tabella country_thresholds se esiste
    INSERT INTO country_domination (country_code, conquest_threshold, win_progress, last_battle_id, last_activity)
    SELECT 
      v_country_code,
      COALESCE(ct.threshold, 25),  -- Default 25 se non specificato
      1,
      v_battle_id,
      NOW()
    FROM (SELECT 1) AS dummy
    LEFT JOIN country_thresholds ct ON ct.country_code = v_country_code
    ON CONFLICT (country_code) DO UPDATE
    SET 
      win_progress = country_domination.win_progress + 1,
      last_battle_id = v_battle_id,
      last_activity = NOW();
    
    -- 🆕 LEGGI STATO ATTUALE PER CHECK CONQUISTA
    SELECT owner_id, win_progress, conquest_threshold
    INTO v_current_owner, v_current_progress, v_threshold
    FROM country_domination
    WHERE country_code = v_country_code;
    
    -- Fallback threshold se NULL
    IF v_threshold IS NULL OR v_threshold = 0 THEN
      v_threshold := 25;
    END IF;
    
    -- 🏆 CALCOLA NUOVO STATUS (stessa logica del trigger!)
    IF v_current_progress >= v_threshold THEN
      v_new_status := 'conquered';
    ELSIF v_current_progress >= CEIL(v_threshold * 0.8) THEN
      v_new_status := 'contested';
    ELSE
      v_new_status := 'neutral';
    END IF;
    
    -- 🏆 SE DIVENTA CONQUERED E NON C'ERA OWNER (o owner diverso)
    IF v_new_status = 'conquered' AND (v_current_owner IS NULL OR v_current_owner != v_user_id) THEN
      UPDATE country_domination
      SET 
        owner_id = v_user_id,
        status = 'conquered',
        conquered_at = NOW()
      WHERE country_code = v_country_code;
      
      RAISE NOTICE '[RPC] 🏆 Country % CONQUERED by %! Progress: %/%', 
        v_country_code, v_user_id, v_current_progress, v_threshold;
    
    -- ⚔️ SE DIVENTA CONTESTED
    ELSIF v_new_status = 'contested' AND v_current_owner IS NULL THEN
      UPDATE country_domination
      SET 
        status = 'contested',
        owner_id = v_user_id
      WHERE country_code = v_country_code;
      
      RAISE NOTICE '[RPC] ⚔️ Country % now CONTESTED by %. Progress: %/%', 
        v_country_code, v_user_id, v_current_progress, v_threshold;
    END IF;
  END IF;
  
  -- Ritorna risultato con info conquista
  RETURN jsonb_build_object(
    'success', true,
    'battle_id', v_battle_id,
    'country_code', v_country_code,
    'country_name', v_country_name,
    'is_win', p_won,
    'lat', p_lat,
    'lng', p_lng,
    'progress', v_current_progress,
    'threshold', v_threshold,
    'status', v_new_status
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'sql_state', SQLSTATE,
    'country_code', v_country_code
  );
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.log_battle_result TO authenticated;

-- ============================================================================
-- 🔧 FIX RETROATTIVO: Aggiorna status per paesi già conquistati ma senza status
-- ============================================================================

-- Per ogni paese dove win_progress >= conquest_threshold ma status != 'conquered'
UPDATE country_domination cd
SET 
  status = 'conquered',
  conquered_at = COALESCE(conquered_at, NOW())
WHERE 
  win_progress >= conquest_threshold
  AND (status IS NULL OR status != 'conquered');

-- Imposta owner per paesi conquistati senza owner (prendi chi ha più vittorie)
UPDATE country_domination cd
SET owner_id = (
  SELECT winner_id 
  FROM country_battle_wins cbw
  WHERE cbw.country_code = cd.country_code AND cbw.is_win = true
  GROUP BY winner_id
  ORDER BY COUNT(*) DESC
  LIMIT 1
)
WHERE 
  status = 'conquered' 
  AND owner_id IS NULL;

-- Log paesi conquistati
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT country_code, owner_id, win_progress, conquest_threshold, status
    FROM country_domination 
    WHERE status = 'conquered'
  LOOP
    RAISE NOTICE '🏆 [FIX] Country % is CONQUERED. Owner: %, Progress: %/%', 
      r.country_code, r.owner_id, r.win_progress, r.conquest_threshold;
  END LOOP;
END;
$$;

