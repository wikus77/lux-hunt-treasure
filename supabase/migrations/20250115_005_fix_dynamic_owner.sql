-- ============================================================================
-- M1SSION™ FIX: Dynamic Owner - Chi ha più vittorie vince!
-- LOGICA: L'owner di un paese è SEMPRE chi ha più vittorie in quel paese
-- SICURO: Non modifica struttura DB, usa dati esistenti
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
  v_current_progress INTEGER;
  v_threshold INTEGER;
  v_current_owner UUID;
  v_new_status TEXT;
  -- 🆕 Per calcolo owner dinamico
  v_top_winner_id UUID;
  v_top_winner_wins INTEGER;
  v_user_wins INTEGER;
  v_owner_changed BOOLEAN := false;
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
    WHEN 'IT' THEN 'Italia' WHEN 'FR' THEN 'Francia' WHEN 'DE' THEN 'Germania'
    WHEN 'GB' THEN 'Regno Unito' WHEN 'ES' THEN 'Spagna' WHEN 'CH' THEN 'Svizzera'
    WHEN 'AT' THEN 'Austria' WHEN 'BE' THEN 'Belgio' WHEN 'NL' THEN 'Paesi Bassi'
    WHEN 'PT' THEN 'Portogallo' WHEN 'PL' THEN 'Polonia' WHEN 'GR' THEN 'Grecia'
    WHEN 'HR' THEN 'Croazia' WHEN 'SE' THEN 'Svezia' WHEN 'NO' THEN 'Norvegia'
    WHEN 'DK' THEN 'Danimarca' WHEN 'FI' THEN 'Finlandia' WHEN 'IE' THEN 'Irlanda'
    WHEN 'XX' THEN 'Sconosciuto' ELSE v_country_code
  END;
  
  -- 🔥 REGISTRA IN country_battle_wins
  INSERT INTO country_battle_wins (
    id, battle_id, winner_id, country_code, is_pvp,
    is_valid_for_domination, won_at, lat, lng, is_win
  ) VALUES (
    v_battle_id, v_battle_id, v_user_id, v_country_code, p_is_pvp,
    true, NOW(), p_lat, p_lng, p_won
  );
  
  -- 🏴 AGGIORNA DOMINATION SE VITTORIA
  IF p_won THEN
    -- Assicurati che il paese esista in country_domination
    INSERT INTO country_domination (country_code, conquest_threshold, win_progress, last_battle_id, last_activity)
    SELECT v_country_code, COALESCE(ct.threshold, 25), 0, v_battle_id, NOW()
    FROM (SELECT 1) AS dummy
    LEFT JOIN country_thresholds ct ON ct.country_code = v_country_code
    ON CONFLICT (country_code) DO UPDATE
    SET last_battle_id = v_battle_id, last_activity = NOW();
    
    -- 🆕 CALCOLA CHI HA PIÙ VITTORIE IN QUESTO PAESE
    SELECT winner_id, COUNT(*) as wins
    INTO v_top_winner_id, v_top_winner_wins
    FROM country_battle_wins
    WHERE country_code = v_country_code AND is_win = true
    GROUP BY winner_id
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Conta vittorie dell'utente corrente
    SELECT COUNT(*) INTO v_user_wins
    FROM country_battle_wins
    WHERE country_code = v_country_code 
      AND winner_id = v_user_id 
      AND is_win = true;
    
    -- Leggi stato attuale
    SELECT owner_id, conquest_threshold
    INTO v_current_owner, v_threshold
    FROM country_domination
    WHERE country_code = v_country_code;
    
    IF v_threshold IS NULL OR v_threshold = 0 THEN 
      v_threshold := 25; 
    END IF;
    
    -- 🏆 AGGIORNA win_progress con il MASSIMO tra tutti gli agenti
    UPDATE country_domination
    SET win_progress = v_top_winner_wins
    WHERE country_code = v_country_code;
    
    -- 🏆 CALCOLA NUOVO STATUS basato sul TOP WINNER
    IF v_top_winner_wins >= v_threshold THEN
      v_new_status := 'conquered';
    ELSIF v_top_winner_wins >= CEIL(v_threshold * 0.8) THEN
      v_new_status := 'contested';
    ELSE
      v_new_status := 'neutral';
    END IF;
    
    -- 🏆 AGGIORNA OWNER SE CAMBIA (chi ha più vittorie!)
    IF v_top_winner_id IS NOT NULL AND (v_current_owner IS NULL OR v_current_owner != v_top_winner_id) THEN
      -- L'owner cambia solo se il top winner ha raggiunto la soglia
      IF v_top_winner_wins >= v_threshold THEN
        UPDATE country_domination
        SET 
          owner_id = v_top_winner_id,
          status = 'conquered',
          conquered_at = CASE 
            WHEN v_current_owner IS NULL OR v_current_owner != v_top_winner_id 
            THEN NOW() 
            ELSE conquered_at 
          END
        WHERE country_code = v_country_code;
        
        v_owner_changed := (v_current_owner IS NOT NULL AND v_current_owner != v_top_winner_id);
        
        RAISE NOTICE '[RPC] 🏆 Country % - New owner: % with % wins (threshold: %)', 
          v_country_code, v_top_winner_id, v_top_winner_wins, v_threshold;
      ELSIF v_new_status = 'contested' THEN
        UPDATE country_domination
        SET status = 'contested'
        WHERE country_code = v_country_code;
      END IF;
    END IF;
  END IF;
  
  -- Ritorna risultato con info dettagliate
  RETURN jsonb_build_object(
    'success', true,
    'battle_id', v_battle_id,
    'country_code', v_country_code,
    'country_name', v_country_name,
    'is_win', p_won,
    'your_wins', v_user_wins,
    'top_winner_wins', v_top_winner_wins,
    'threshold', v_threshold,
    'status', v_new_status,
    'owner_changed', v_owner_changed
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
-- 🔧 FIX RETROATTIVO: Aggiorna owner per tutti i paesi conquistati
-- L'owner diventa chi ha più vittorie
-- ============================================================================

-- Aggiorna ogni paese con l'owner corretto (chi ha più vittorie)
UPDATE country_domination cd
SET 
  owner_id = top_winner.winner_id,
  win_progress = top_winner.wins
FROM (
  SELECT DISTINCT ON (country_code) 
    country_code,
    winner_id,
    COUNT(*) as wins
  FROM country_battle_wins
  WHERE is_win = true
  GROUP BY country_code, winner_id
  ORDER BY country_code, COUNT(*) DESC
) top_winner
WHERE cd.country_code = top_winner.country_code
  AND top_winner.wins >= cd.conquest_threshold;

-- Log risultato
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🏆 DYNAMIC OWNER - Stato attuale:';
  RAISE NOTICE '========================================';
  
  FOR r IN 
    SELECT 
      cd.country_code,
      cd.owner_id,
      cd.win_progress,
      cd.conquest_threshold,
      cd.status
    FROM country_domination cd
    WHERE cd.status IN ('conquered', 'contested')
    ORDER BY cd.win_progress DESC
  LOOP
    RAISE NOTICE '  % - Owner: %, Wins: %/%, Status: %', 
      r.country_code, r.owner_id, r.win_progress, r.conquest_threshold, r.status;
  END LOOP;
END;
$$;

