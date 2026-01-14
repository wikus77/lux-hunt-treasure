-- ============================================================================
-- RISIKO DOMINATION — Fake Agent Battles Count for Domination
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: Le vittorie contro Fake Agent ora contano per la conquista paesi
-- MODIFICA: La funzione is_valid_pvp_battle ritorna true anche per Fake Agent
-- ROLLBACK: Eseguire lo script di rollback in fondo
-- ============================================================================

-- ============================================================================
-- 1. Modifica is_valid_pvp_battle per includere Fake Agents
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
BEGIN
  -- Verifica SOLO che il winner esista in profiles (è un utente reale)
  -- L'opponent può essere fake (non in profiles) e la vittoria conta comunque
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_winner_id
  ) INTO v_winner_is_real;
  
  -- Se il winner è reale, la battaglia è valida per la conquista
  -- Non importa se l'opponent è un Fake Agent
  RETURN v_winner_is_real;
END;
$$;

COMMENT ON FUNCTION public.is_valid_pvp_battle(UUID, UUID) IS 
  'Verifica se il vincitore è un utente reale. Vittorie vs Fake Agent ora contano per dominio.';

-- ============================================================================
-- 2. Aggiorna il trigger per loggare correttamente is_pvp
-- Le vittorie vs Fake Agent avranno is_pvp = false ma is_valid_for_domination = true
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_battle_for_domination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code CHAR(2);
  v_winner_is_real BOOLEAN;
  v_opponent_is_real BOOLEAN;
  v_is_pvp BOOLEAN;
  v_is_valid_for_domination BOOLEAN;
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
  
  -- Verifica se winner è reale
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = NEW.winner_id
  ) INTO v_winner_is_real;
  
  -- Verifica se opponent è reale (per flag is_pvp)
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = v_loser_id
  ) INTO v_opponent_is_real;
  
  -- is_pvp = entrambi reali
  v_is_pvp := v_winner_is_real AND v_opponent_is_real;
  
  -- is_valid_for_domination = winner reale (anche se opponent è fake)
  v_is_valid_for_domination := v_winner_is_real;
  
  -- Inserisci in log vittorie (idempotente via battle_id UNIQUE)
  INSERT INTO country_battle_wins (
    battle_id, winner_id, loser_id, country_code,
    lat, lng, is_pvp, is_valid_for_domination, won_at
  ) VALUES (
    NEW.id, NEW.winner_id, v_loser_id, v_country_code,
    NEW.arena_lat, NEW.arena_lng, v_is_pvp, v_is_valid_for_domination, NEW.resolved_at
  )
  ON CONFLICT (battle_id) DO NOTHING;
  
  -- Se winner non è reale, skip aggiornamento dominio
  IF NOT v_winner_is_real THEN
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

COMMENT ON FUNCTION public.process_battle_for_domination() IS 
  'Trigger function: processa battaglia per Risiko Domination. Vittorie vs Fake Agent ora contano.';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- Per tornare alla versione precedente (solo PvP reale conta):
-- 
-- CREATE OR REPLACE FUNCTION public.is_valid_pvp_battle(
--   p_winner_id UUID,
--   p_opponent_id UUID
-- )
-- RETURNS BOOLEAN
-- LANGUAGE plpgsql
-- STABLE
-- AS $$
-- DECLARE
--   v_winner_is_real BOOLEAN;
--   v_opponent_is_real BOOLEAN;
-- BEGIN
--   SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_winner_id) INTO v_winner_is_real;
--   SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_opponent_id) INTO v_opponent_is_real;
--   RETURN v_winner_is_real AND v_opponent_is_real;
-- END;
-- $$;
-- ============================================================================

