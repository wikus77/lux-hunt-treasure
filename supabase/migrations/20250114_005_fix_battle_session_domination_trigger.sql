-- ============================================================================
-- M1SSION™ FIX: Trigger per battle_sessions con coordinate GPS
-- PROBLEMA: Il trigger era vuoto e non processava le battaglie
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. Aggiorna la funzione di geocoding per includere più paesi (Monaco, Svizzera, ecc.)
CREATE OR REPLACE FUNCTION public.get_country_code_from_coords(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS CHAR(2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Bounding boxes approssimati per i paesi principali
  -- ORDINE IMPORTANTE: microstati prima dei paesi grandi per evitare overlap
  
  -- MONACO (microstato - check first!)
  IF p_lat BETWEEN 43.72 AND 43.75 AND p_lng BETWEEN 7.40 AND 7.44 THEN RETURN 'MC'; END IF;
  
  -- SAN MARINO (microstato)
  IF p_lat BETWEEN 43.89 AND 43.99 AND p_lng BETWEEN 12.40 AND 12.52 THEN RETURN 'SM'; END IF;
  
  -- VATICANO (microstato)
  IF p_lat BETWEEN 41.90 AND 41.91 AND p_lng BETWEEN 12.45 AND 12.46 THEN RETURN 'VA'; END IF;
  
  -- LUSSEMBURGO
  IF p_lat BETWEEN 49.45 AND 50.18 AND p_lng BETWEEN 5.73 AND 6.53 THEN RETURN 'LU'; END IF;
  
  -- BELGIO
  IF p_lat BETWEEN 49.5 AND 51.5 AND p_lng BETWEEN 2.5 AND 6.4 THEN RETURN 'BE'; END IF;
  
  -- PAESI BASSI
  IF p_lat BETWEEN 50.75 AND 53.5 AND p_lng BETWEEN 3.36 AND 7.21 THEN RETURN 'NL'; END IF;
  
  -- SVIZZERA
  IF p_lat BETWEEN 45.8 AND 47.8 AND p_lng BETWEEN 5.9 AND 10.5 THEN RETURN 'CH'; END IF;
  
  -- AUSTRIA
  IF p_lat BETWEEN 46.4 AND 49.0 AND p_lng BETWEEN 9.5 AND 17.2 THEN RETURN 'AT'; END IF;
  
  -- PORTOGALLO
  IF p_lat BETWEEN 36.9 AND 42.2 AND p_lng BETWEEN -9.5 AND -6.2 THEN RETURN 'PT'; END IF;
  
  -- GRECIA
  IF p_lat BETWEEN 34.8 AND 41.8 AND p_lng BETWEEN 19.3 AND 29.6 THEN RETURN 'GR'; END IF;
  
  -- POLONIA
  IF p_lat BETWEEN 49.0 AND 54.8 AND p_lng BETWEEN 14.1 AND 24.1 THEN RETURN 'PL'; END IF;
  
  -- ITALIA
  IF p_lat BETWEEN 35.5 AND 47.1 AND p_lng BETWEEN 6.6 AND 18.5 THEN RETURN 'IT'; END IF;
  
  -- FRANCIA
  IF p_lat BETWEEN 41.3 AND 51.1 AND p_lng BETWEEN -5.1 AND 9.6 THEN RETURN 'FR'; END IF;
  
  -- GERMANIA
  IF p_lat BETWEEN 47.3 AND 55.1 AND p_lng BETWEEN 5.9 AND 15.0 THEN RETURN 'DE'; END IF;
  
  -- SPAGNA
  IF p_lat BETWEEN 36.0 AND 43.8 AND p_lng BETWEEN -9.3 AND 3.3 THEN RETURN 'ES'; END IF;
  
  -- REGNO UNITO
  IF p_lat BETWEEN 49.9 AND 60.9 AND p_lng BETWEEN -8.2 AND 1.8 THEN RETURN 'GB'; END IF;
  
  -- USA (continental)
  IF p_lat BETWEEN 24.5 AND 49.4 AND p_lng BETWEEN -125.0 AND -66.9 THEN RETURN 'US'; END IF;
  
  -- BRASILE
  IF p_lat BETWEEN -33.8 AND 5.3 AND p_lng BETWEEN -73.9 AND -34.8 THEN RETURN 'BR'; END IF;
  
  -- GIAPPONE
  IF p_lat BETWEEN 24.0 AND 46.0 AND p_lng BETWEEN 123.0 AND 146.0 THEN RETURN 'JP'; END IF;
  
  -- CINA
  IF p_lat BETWEEN 18.0 AND 54.0 AND p_lng BETWEEN 73.0 AND 135.0 THEN RETURN 'CN'; END IF;
  
  -- AUSTRALIA
  IF p_lat BETWEEN -44.0 AND -10.0 AND p_lng BETWEEN 113.0 AND 154.0 THEN RETURN 'AU'; END IF;
  
  -- INDIA
  IF p_lat BETWEEN 6.7 AND 35.5 AND p_lng BETWEEN 68.1 AND 97.4 THEN RETURN 'IN'; END IF;
  
  -- RUSSIA (parte europea)
  IF p_lat BETWEEN 41.2 AND 82.0 AND p_lng BETWEEN 19.6 AND 180.0 THEN RETURN 'RU'; END IF;
  
  -- CANADA
  IF p_lat BETWEEN 41.7 AND 83.1 AND p_lng BETWEEN -141.0 AND -52.6 THEN RETURN 'CA'; END IF;
  
  -- MESSICO
  IF p_lat BETWEEN 14.5 AND 32.7 AND p_lng BETWEEN -118.4 AND -86.7 THEN RETURN 'MX'; END IF;
  
  -- ARGENTINA
  IF p_lat BETWEEN -55.1 AND -21.8 AND p_lng BETWEEN -73.6 AND -53.6 THEN RETURN 'AR'; END IF;
  
  -- Default: Unknown
  RETURN 'XX';
END;
$$;

-- 2. Aggiorna il trigger per battle_sessions per usare arena_lat/arena_lng
CREATE OR REPLACE FUNCTION public.process_battle_session_for_domination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code CHAR(2);
  v_is_pvp BOOLEAN;
  v_current_owner UUID;
  v_current_progress INTEGER;
  v_threshold INTEGER;
  v_new_status TEXT;
  v_loser_id UUID;
BEGIN
  -- Solo quando resolved_at viene impostato (battaglia conclusa)
  IF NEW.resolved_at IS NULL OR NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Evita ri-processamento (idempotenza)
  IF OLD.resolved_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- 🆕 Se non ci sono coordinate, skip
  IF NEW.arena_lat IS NULL OR NEW.arena_lng IS NULL THEN
    RAISE NOTICE '[DOMINATION] battle_session % skipped: no coordinates', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Determina loser
  IF NEW.creator_id = NEW.winner_id THEN
    v_loser_id := NEW.defender_id;
  ELSE
    v_loser_id := NEW.creator_id;
  END IF;
  
  -- Calcola country code dalle coordinate
  v_country_code := get_country_code_from_coords(NEW.arena_lat, NEW.arena_lng);
  
  RAISE NOTICE '[DOMINATION] battle_session % - coords (%, %) -> country %', 
    NEW.id, NEW.arena_lat, NEW.arena_lng, v_country_code;
  
  -- Se coordinate non valide (XX), skip
  IF v_country_code = 'XX' THEN
    RAISE NOTICE '[DOMINATION] battle_session % skipped: unknown country for coords (%, %)', 
      NEW.id, NEW.arena_lat, NEW.arena_lng;
    RETURN NEW;
  END IF;
  
  -- Verifica se è PvP valido (entrambi utenti reali in profiles)
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = NEW.winner_id)
     AND EXISTS(SELECT 1 FROM profiles WHERE id = v_loser_id)
  INTO v_is_pvp;
  
  -- 🆕 NUOVO: Anche vs Fake Agents conta per domination se winner è reale
  -- Verifica solo se winner è reale
  IF NOT EXISTS(SELECT 1 FROM profiles WHERE id = NEW.winner_id) THEN
    RAISE NOTICE '[DOMINATION] battle_session % skipped: winner not real', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Inserisci in log vittorie (idempotente via battle_id UNIQUE)
  INSERT INTO country_battle_wins (
    battle_id, winner_id, loser_id, country_code,
    lat, lng, is_pvp, is_valid_for_domination, won_at
  ) VALUES (
    NEW.id, NEW.winner_id, v_loser_id, v_country_code,
    NEW.arena_lat, NEW.arena_lng, v_is_pvp, true, NEW.resolved_at
  )
  ON CONFLICT (battle_id) DO NOTHING;
  
  RAISE NOTICE '[DOMINATION] ✅ battle_session % logged for country %', NEW.id, v_country_code;
  
  -- Assicurati che il paese esista nella tabella domination
  INSERT INTO country_domination (country_code)
  VALUES (v_country_code)
  ON CONFLICT (country_code) DO NOTHING;
  
  -- Aggiorna progresso dominio
  UPDATE country_domination
  SET 
    win_progress = win_progress + 1,
    last_battle_id = NEW.id,
    last_activity_at = NOW()
  WHERE country_code = v_country_code
  RETURNING owner_id, win_progress, conquest_threshold INTO v_current_owner, v_current_progress, v_threshold;
  
  -- Calcola nuovo status
  v_new_status := calculate_domination_status(v_current_progress, v_threshold);
  
  -- Se diventa conquered e non c'era owner (o owner diverso)
  IF v_new_status = 'conquered' AND (v_current_owner IS NULL OR v_current_owner != NEW.winner_id) THEN
    RAISE NOTICE '[DOMINATION] 🏆 Country % CONQUERED by %!', v_country_code, NEW.winner_id;
    
    -- Aggiorna owner
    UPDATE country_domination
    SET 
      owner_id = NEW.winner_id,
      status = 'conquered',
      conquered_at = NOW()
    WHERE country_code = v_country_code;
    
    -- Assegna reward (se esiste la funzione)
    BEGIN
      PERFORM award_domination_reward(NEW.winner_id, 'country', v_country_code);
      PERFORM check_and_award_domination_bonuses(NEW.winner_id);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE '[DOMINATION] Reward functions not found, skipping';
    END;
    
  ELSIF v_new_status = 'contested' THEN
    UPDATE country_domination
    SET 
      status = 'contested',
      owner_id = NEW.winner_id
    WHERE country_code = v_country_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Drop e ricrea il trigger su battle_sessions
DROP TRIGGER IF EXISTS trigger_battle_session_domination ON public.battle_sessions;

CREATE TRIGGER trigger_battle_session_domination
  AFTER UPDATE OF resolved_at ON public.battle_sessions
  FOR EACH ROW
  WHEN (NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL AND NEW.winner_id IS NOT NULL)
  EXECUTE FUNCTION process_battle_session_for_domination();

-- ============================================================================
COMMENT ON FUNCTION public.process_battle_session_for_domination() IS 
  'Trigger function: processa battle_session per Risiko Domination usando arena_lat/arena_lng';
-- ============================================================================

