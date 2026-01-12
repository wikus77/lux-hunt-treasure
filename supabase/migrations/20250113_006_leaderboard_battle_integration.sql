-- ============================================================================
-- RISIKO DOMINATION — Integrazione Battaglie in Leaderboard
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: Vittorie Tron Battle aumentano rank, sconfitte lo diminuiscono
-- PE: +25 PE vittoria, -10 PE sconfitta (configurabile)
-- ⚠️ NON MODIFICA LOGICA TRON BATTLE - SOLO TRIGGER REWARD POST-BATTAGLIA
-- ROLLBACK: DROP TRIGGER + DROP FUNCTION
-- ============================================================================

-- ============================================================================
-- 1. Configurazione PE per vittoria/sconfitta
-- ============================================================================
DO $$
BEGIN
  -- Inserisci config se non esiste
  INSERT INTO public.pricing_rules (key, value, description)
  VALUES 
    ('battle_win_pe', '25', 'PE awarded for winning a Tron Battle'),
    ('battle_lose_pe', '-10', 'PE deducted for losing a Tron Battle')
  ON CONFLICT (key) DO NOTHING;
EXCEPTION WHEN undefined_table THEN
  -- pricing_rules non esiste, usa valori hardcoded
  NULL;
END;
$$;

-- ============================================================================
-- 2. Funzione: Assegna PE per vittoria/sconfitta battaglia
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_battle_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_win_pe INTEGER := 25;   -- Default
  v_lose_pe INTEGER := -10; -- Default (negativo)
  v_loser_id UUID;
  v_is_pvp BOOLEAN;
BEGIN
  -- Solo quando resolved_at viene impostato
  IF NEW.resolved_at IS NULL OR NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Evita ri-processamento
  IF OLD.resolved_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Determina loser
  IF NEW.creator_id = NEW.winner_id THEN
    v_loser_id := NEW.opponent_id;
  ELSE
    v_loser_id := NEW.creator_id;
  END IF;
  
  -- Verifica PvP valido
  v_is_pvp := is_valid_pvp_battle(NEW.winner_id, v_loser_id);
  
  -- Se non è PvP, riduci reward (vs NPC è meno PE)
  IF NOT v_is_pvp THEN
    v_win_pe := 10;  -- Solo 10 PE vs NPC
    v_lose_pe := 0;  -- No penalty vs NPC
  END IF;
  
  -- Prova a leggere config da pricing_rules
  BEGIN
    SELECT (value)::INTEGER INTO v_win_pe
    FROM pricing_rules WHERE key = 'battle_win_pe';
    
    SELECT (value)::INTEGER INTO v_lose_pe
    FROM pricing_rules WHERE key = 'battle_lose_pe';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Usa default
  END;
  
  -- Assegna PE al vincitore
  IF NEW.winner_id IS NOT NULL THEN
    PERFORM award_pulse_energy(
      NEW.winner_id,
      v_win_pe,
      'battle_win',
      jsonb_build_object(
        'battle_id', NEW.id,
        'opponent_id', v_loser_id,
        'is_pvp', v_is_pvp
      )
    );
  END IF;
  
  -- Rimuovi PE al perdente (solo PvP)
  IF v_loser_id IS NOT NULL AND v_is_pvp AND v_lose_pe < 0 THEN
    PERFORM award_pulse_energy(
      v_loser_id,
      v_lose_pe,  -- Negativo
      'battle_lose',
      jsonb_build_object(
        'battle_id', NEW.id,
        'opponent_id', NEW.winner_id,
        'is_pvp', v_is_pvp
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. Crea trigger per PE su battles
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_battle_pe_award ON public.battles;

CREATE TRIGGER trigger_battle_pe_award
  AFTER UPDATE OF resolved_at ON public.battles
  FOR EACH ROW
  WHEN (NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL)
  EXECUTE FUNCTION award_battle_pe();

-- ============================================================================
-- 4. Trigger per battle_sessions (sistema quick-battle)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_battle_session_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_win_pe INTEGER := 25;
  v_lose_pe INTEGER := -10;
  v_loser_id UUID;
  v_is_pvp BOOLEAN;
BEGIN
  -- Solo quando resolved_at viene impostato
  IF NEW.resolved_at IS NULL OR NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Evita ri-processamento
  IF OLD.resolved_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Determina loser
  IF NEW.creator_id = NEW.winner_id THEN
    v_loser_id := NEW.defender_id;
  ELSE
    v_loser_id := NEW.creator_id;
  END IF;
  
  -- Verifica PvP valido
  v_is_pvp := is_valid_pvp_battle(NEW.winner_id, v_loser_id);
  
  IF NOT v_is_pvp THEN
    v_win_pe := 10;
    v_lose_pe := 0;
  END IF;
  
  -- Assegna PE al vincitore
  IF NEW.winner_id IS NOT NULL THEN
    PERFORM award_pulse_energy(
      NEW.winner_id,
      v_win_pe,
      'battle_session_win',
      jsonb_build_object(
        'battle_session_id', NEW.id,
        'opponent_id', v_loser_id,
        'is_pvp', v_is_pvp
      )
    );
  END IF;
  
  -- Rimuovi PE al perdente (solo PvP)
  IF v_loser_id IS NOT NULL AND v_is_pvp AND v_lose_pe < 0 THEN
    PERFORM award_pulse_energy(
      v_loser_id,
      v_lose_pe,
      'battle_session_lose',
      jsonb_build_object(
        'battle_session_id', NEW.id,
        'opponent_id', NEW.winner_id,
        'is_pvp', v_is_pvp
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger su battle_sessions
DROP TRIGGER IF EXISTS trigger_battle_session_pe_award ON public.battle_sessions;

CREATE TRIGGER trigger_battle_session_pe_award
  AFTER UPDATE OF resolved_at ON public.battle_sessions
  FOR EACH ROW
  WHEN (NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL)
  EXECUTE FUNCTION award_battle_session_pe();

-- ============================================================================
-- 5. View per statistiche battaglia-leaderboard
-- ============================================================================
CREATE OR REPLACE VIEW public.battle_leaderboard_stats AS
SELECT 
  p.id as user_id,
  p.agent_code,
  p.full_name,
  p.pulse_energy,
  COALESCE(wins.total_wins, 0) as battle_wins,
  COALESCE(losses.total_losses, 0) as battle_losses,
  COALESCE(dom.countries_owned, 0) as countries_owned,
  lr.global_rank
FROM profiles p
LEFT JOIN (
  SELECT winner_id, COUNT(*) as total_wins
  FROM battles WHERE resolved_at IS NOT NULL
  GROUP BY winner_id
) wins ON wins.winner_id = p.id
LEFT JOIN (
  SELECT 
    CASE WHEN creator_id != winner_id THEN creator_id ELSE opponent_id END as loser_id,
    COUNT(*) as total_losses
  FROM battles WHERE resolved_at IS NOT NULL AND winner_id IS NOT NULL
  GROUP BY loser_id
) losses ON losses.loser_id = p.id
LEFT JOIN (
  SELECT owner_id, COUNT(*) as countries_owned
  FROM country_domination WHERE status = 'conquered'
  GROUP BY owner_id
) dom ON dom.owner_id = p.id
LEFT JOIN leaderboard_rankings lr ON lr.id = p.id
WHERE p.agent_code IS NOT NULL
ORDER BY p.pulse_energy DESC;

-- ============================================================================
-- COMMENTI
-- ============================================================================
COMMENT ON FUNCTION public.award_battle_pe() IS 
  'Assegna PE per vittoria/sconfitta Tron Battle. +25 win, -10 lose (PvP)';

COMMENT ON FUNCTION public.award_battle_session_pe() IS 
  'Assegna PE per vittoria/sconfitta battle_sessions. +25 win, -10 lose (PvP)';

COMMENT ON VIEW public.battle_leaderboard_stats IS 
  'Statistiche battaglia integrate con leaderboard per visualizzazione';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- DROP VIEW IF EXISTS public.battle_leaderboard_stats;
-- DROP TRIGGER IF EXISTS trigger_battle_session_pe_award ON public.battle_sessions;
-- DROP TRIGGER IF EXISTS trigger_battle_pe_award ON public.battles;
-- DROP FUNCTION IF EXISTS public.award_battle_session_pe();
-- DROP FUNCTION IF EXISTS public.award_battle_pe();
-- DELETE FROM pricing_rules WHERE key IN ('battle_win_pe', 'battle_lose_pe');
-- ============================================================================

