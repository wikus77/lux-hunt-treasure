-- ============================================================================
-- RISIKO DOMINATION — Trigger su Battles (LISTENER ONLY)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: Ascolta resolved_at su battles e aggiorna dominio
-- ⚠️ NON MODIFICA LA TABELLA BATTLES - SOLO TRIGGER LISTENER
-- ROLLBACK: DROP TRIGGER + DROP FUNCTION
-- ============================================================================

-- ============================================================================
-- 1. Funzione helper: Reverse geocode lat/lng → country_code
-- Versione semplificata con bounding boxes dei paesi principali
-- ============================================================================
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
  -- In produzione si può usare PostGIS per precisione migliore
  
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

-- ============================================================================
-- 2. Funzione helper: Verifica se è PvP reale (esclude NPC/fake)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_valid_pvp_battle(
  p_winner_id UUID,
  p_opponent_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_winner_is_real BOOLEAN;
  v_opponent_is_real BOOLEAN;
BEGIN
  -- Verifica winner esiste in profiles (non è fake)
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_winner_id
  ) INTO v_winner_is_real;
  
  -- Verifica opponent esiste in profiles (non è fake)
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_opponent_id
  ) INTO v_opponent_is_real;
  
  RETURN v_winner_is_real AND v_opponent_is_real;
END;
$$;

-- ============================================================================
-- 3. Trigger function: Processa battaglia risolta
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_battle_for_domination()
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
  
  -- Determina loser
  IF NEW.creator_id = NEW.winner_id THEN
    v_loser_id := NEW.opponent_id;
  ELSE
    v_loser_id := NEW.creator_id;
  END IF;
  
  -- Calcola country code dalle coordinate
  v_country_code := get_country_code_from_coords(
    COALESCE(NEW.arena_lat, 0),
    COALESCE(NEW.arena_lng, 0)
  );
  
  -- Se coordinate non valide, skip
  IF v_country_code = 'XX' THEN
    RETURN NEW;
  END IF;
  
  -- Verifica se è PvP valido
  v_is_pvp := is_valid_pvp_battle(NEW.winner_id, v_loser_id);
  
  -- Inserisci in log vittorie (idempotente via battle_id UNIQUE)
  INSERT INTO country_battle_wins (
    battle_id, winner_id, loser_id, country_code,
    lat, lng, is_pvp, is_valid_for_domination, won_at
  ) VALUES (
    NEW.id, NEW.winner_id, v_loser_id, v_country_code,
    NEW.arena_lat, NEW.arena_lng, v_is_pvp, v_is_pvp, NEW.resolved_at
  )
  ON CONFLICT (battle_id) DO NOTHING;
  
  -- Se non è PvP valido, non aggiornare dominio
  IF NOT v_is_pvp THEN
    RETURN NEW;
  END IF;
  
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
    -- Aggiorna owner
    UPDATE country_domination
    SET 
      owner_id = NEW.winner_id,
      status = 'conquered',
      conquered_at = NOW()
    WHERE country_code = v_country_code;
    
    -- Assegna reward +1000 PE (idempotente)
    PERFORM award_domination_reward(NEW.winner_id, 'country', v_country_code);
    
    -- Verifica bonus aggiuntivi (3 paesi, continente)
    PERFORM check_and_award_domination_bonuses(NEW.winner_id);
    
  ELSIF v_new_status = 'contested' THEN
    -- Aggiorna solo status
    UPDATE country_domination
    SET status = 'contested'
    WHERE country_code = v_country_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. Crea trigger su tabella battles
-- ⚠️ QUESTO È UN TRIGGER LISTENER - NON MODIFICA LA STRUTTURA DI BATTLES
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_battle_domination ON public.battles;

CREATE TRIGGER trigger_battle_domination
  AFTER UPDATE OF resolved_at ON public.battles
  FOR EACH ROW
  WHEN (NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL)
  EXECUTE FUNCTION process_battle_for_domination();

-- ============================================================================
-- 5. Trigger anche per battle_sessions (sistema alternativo)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_battle_session_for_domination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code CHAR(2);
  v_is_pvp BOOLEAN;
  v_current_progress INTEGER;
  v_threshold INTEGER;
  v_new_status TEXT;
BEGIN
  -- Solo quando resolved_at viene impostato
  IF NEW.resolved_at IS NULL OR NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Evita ri-processamento
  IF OLD.resolved_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Per battle_sessions non abbiamo arena_lat/lng, skip domination
  -- Oppure potremmo usare la posizione dell'attaccante se disponibile
  -- Per ora: skip se non ci sono coordinate
  RETURN NEW;
END;
$$;

-- ============================================================================
-- COMMENTI
-- ============================================================================
COMMENT ON FUNCTION public.get_country_code_from_coords(DOUBLE PRECISION, DOUBLE PRECISION) IS 
  'Reverse geocode semplificato: lat/lng → ISO country code';

COMMENT ON FUNCTION public.is_valid_pvp_battle(UUID, UUID) IS 
  'Verifica se entrambi i partecipanti sono utenti reali (no NPC/fake)';

COMMENT ON FUNCTION public.process_battle_for_domination() IS 
  'Trigger function: processa battaglia per Risiko Domination';

COMMENT ON TRIGGER trigger_battle_domination ON public.battles IS 
  '⚠️ LISTENER ONLY - Non modifica battles, solo ascolta resolved_at';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- DROP TRIGGER IF EXISTS trigger_battle_domination ON public.battles;
-- DROP FUNCTION IF EXISTS public.process_battle_session_for_domination();
-- DROP FUNCTION IF EXISTS public.process_battle_for_domination();
-- DROP FUNCTION IF EXISTS public.is_valid_pvp_battle(UUID, UUID);
-- DROP FUNCTION IF EXISTS public.get_country_code_from_coords(DOUBLE PRECISION, DOUBLE PRECISION);
-- ============================================================================

