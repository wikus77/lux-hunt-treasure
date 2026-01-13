-- ============================================================================
-- FIX: Trigger su battle_sessions + Migrazione vittorie esistenti
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- PROBLEMA: Il trigger era su "battles" ma le battaglie sono in "battle_sessions"
-- SOLUZIONE: Creare trigger corretto + migrare dati esistenti
-- 
-- ⚠️ SICURO: Solo operazioni additive, nessuna cancellazione
-- ============================================================================

-- ============================================================================
-- STEP 1: Trigger su battle_sessions (CORRETTO)
-- ============================================================================

-- Funzione per processare battaglie da battle_sessions
CREATE OR REPLACE FUNCTION public.process_battle_session_for_domination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code CHAR(2) := 'IT';  -- Default Italia (battle_sessions non ha coordinate)
  v_is_pvp BOOLEAN;
  v_current_owner UUID;
  v_current_progress INTEGER;
  v_threshold INTEGER;
  v_new_status TEXT;
  v_loser_id UUID;
BEGIN
  -- Solo quando resolved_at viene impostato E c'è un winner
  IF NEW.resolved_at IS NULL OR NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Evita ri-processamento (idempotenza)
  IF OLD.resolved_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Determina loser
  IF NEW.creator_id = NEW.winner_id THEN
    v_loser_id := NEW.defender_id;
  ELSE
    v_loser_id := NEW.creator_id;
  END IF;
  
  -- Log per debug
  RAISE NOTICE '[DOMINATION] Processing battle % - Winner: %, Loser: %', NEW.id, NEW.winner_id, v_loser_id;
  
  -- Verifica se è PvP valido (entrambi utenti reali)
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = NEW.winner_id)
     AND EXISTS(SELECT 1 FROM profiles WHERE id = v_loser_id)
  INTO v_is_pvp;
  
  -- Inserisci in log vittorie (idempotente via battle_id UNIQUE)
  INSERT INTO country_battle_wins (
    battle_id, winner_id, loser_id, country_code,
    lat, lng, is_pvp, is_valid_for_domination, won_at
  ) VALUES (
    NEW.id, NEW.winner_id, v_loser_id, v_country_code,
    NULL, NULL, v_is_pvp, v_is_pvp, NEW.resolved_at
  )
  ON CONFLICT (battle_id) DO NOTHING;
  
  -- Se non è PvP valido, non aggiornare dominio (ma log comunque)
  IF NOT v_is_pvp THEN
    RAISE NOTICE '[DOMINATION] Not valid PvP, skipping domination update';
    RETURN NEW;
  END IF;
  
  -- Assicurati che il paese esista nella tabella domination
  INSERT INTO country_domination (country_code, conquest_threshold)
  VALUES (v_country_code, 21)  -- Italia default 21
  ON CONFLICT (country_code) DO NOTHING;
  
  -- Aggiorna progresso dominio per il VINCITORE
  UPDATE country_domination
  SET 
    win_progress = win_progress + 1,
    last_battle_id = NEW.id,
    last_activity_at = NOW()
  WHERE country_code = v_country_code
  RETURNING owner_id, win_progress, conquest_threshold INTO v_current_owner, v_current_progress, v_threshold;
  
  RAISE NOTICE '[DOMINATION] Country % progress: %/%', v_country_code, v_current_progress, v_threshold;
  
  -- Calcola nuovo status
  IF v_current_progress >= v_threshold THEN
    v_new_status := 'conquered';
  ELSIF v_current_progress >= CEIL(v_threshold * 0.8) THEN
    v_new_status := 'contested';
  ELSE
    v_new_status := 'neutral';
  END IF;
  
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
    
  ELSIF v_new_status = 'contested' AND v_current_owner IS NULL THEN
    RAISE NOTICE '[DOMINATION] ⚔️ Country % now CONTESTED', v_country_code;
    
    UPDATE country_domination
    SET 
      status = 'contested',
      owner_id = NEW.winner_id  -- Chi sta conquistando
    WHERE country_code = v_country_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crea trigger su battle_sessions
DROP TRIGGER IF EXISTS trigger_battle_session_domination ON public.battle_sessions;

CREATE TRIGGER trigger_battle_session_domination
  AFTER UPDATE OF resolved_at ON public.battle_sessions
  FOR EACH ROW
  WHEN (NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL AND NEW.winner_id IS NOT NULL)
  EXECUTE FUNCTION process_battle_session_for_domination();

-- ============================================================================
-- STEP 2: Migrare vittorie esistenti da battle_sessions a country_battle_wins
-- ============================================================================

-- Inserisci tutte le battaglie risolte esistenti (che non sono già state migrate)
INSERT INTO country_battle_wins (battle_id, winner_id, loser_id, country_code, is_pvp, is_valid_for_domination, won_at)
SELECT 
  bs.id as battle_id,
  bs.winner_id,
  CASE WHEN bs.creator_id = bs.winner_id THEN bs.defender_id ELSE bs.creator_id END as loser_id,
  'IT' as country_code,  -- Default Italia
  true as is_pvp,
  true as is_valid_for_domination,
  bs.resolved_at as won_at
FROM battle_sessions bs
WHERE bs.status = 'resolved'
  AND bs.winner_id IS NOT NULL
  AND bs.resolved_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM country_battle_wins cbw WHERE cbw.battle_id = bs.id
  )
ON CONFLICT (battle_id) DO NOTHING;

-- ============================================================================
-- STEP 3: Aggiornare country_domination con i conteggi corretti
-- ============================================================================

-- Conta vittorie per utente per paese e aggiorna win_progress
-- Prima trova chi ha più vittorie in Italia
WITH winner_counts AS (
  SELECT 
    winner_id,
    country_code,
    COUNT(*) as wins
  FROM country_battle_wins
  WHERE is_valid_for_domination = true
  GROUP BY winner_id, country_code
),
top_winner AS (
  SELECT 
    country_code,
    winner_id,
    wins
  FROM winner_counts
  WHERE (country_code, wins) IN (
    SELECT country_code, MAX(wins) FROM winner_counts GROUP BY country_code
  )
)
UPDATE country_domination cd
SET 
  win_progress = tw.wins,
  owner_id = CASE 
    WHEN tw.wins >= cd.conquest_threshold THEN tw.winner_id 
    WHEN tw.wins >= CEIL(cd.conquest_threshold * 0.8) THEN tw.winner_id
    ELSE cd.owner_id 
  END,
  status = CASE 
    WHEN tw.wins >= cd.conquest_threshold THEN 'conquered'
    WHEN tw.wins >= CEIL(cd.conquest_threshold * 0.8) THEN 'contested'
    ELSE 'neutral'
  END,
  conquered_at = CASE 
    WHEN tw.wins >= cd.conquest_threshold THEN NOW()
    ELSE cd.conquered_at
  END,
  last_activity_at = NOW()
FROM top_winner tw
WHERE cd.country_code = tw.country_code;

-- ============================================================================
-- STEP 4: Verifica risultato
-- ============================================================================

SELECT 
  'country_battle_wins' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT winner_id) as unique_winners
FROM country_battle_wins
UNION ALL
SELECT 
  'country_domination (non-neutral)',
  COUNT(*),
  COUNT(DISTINCT owner_id)
FROM country_domination
WHERE status != 'neutral';

-- Mostra stato Italia
SELECT 
  country_code,
  win_progress,
  conquest_threshold,
  status,
  owner_id
FROM country_domination
WHERE country_code = 'IT';

-- ============================================================================
-- ✅ FIX COMPLETATO!
-- ============================================================================
SELECT 'Trigger fix + migration completed!' as status;

