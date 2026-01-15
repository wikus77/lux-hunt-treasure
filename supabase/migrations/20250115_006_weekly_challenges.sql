-- ============================================================================
-- M1SSION™ WEEKLY CHALLENGES - Sfide Settimanali per Retention
-- SICURO: Non modifica tabelle esistenti, aggiunge solo nuove
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. Tabella per tracciare sfide settimanali completate
CREATE TABLE IF NOT EXISTS weekly_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type VARCHAR(50) NOT NULL,  -- 'conquer_country', 'win_battles', etc.
  week_start DATE NOT NULL,  -- Lunedì della settimana
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  reward_amount INTEGER NOT NULL,
  reward_type VARCHAR(20) DEFAULT 'm1u',
  details JSONB,  -- Dettagli extra (es. quale paese conquistato)
  
  -- Un utente può completare ogni sfida solo una volta per settimana
  UNIQUE(user_id, challenge_type, week_start)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_weekly_challenge_user ON weekly_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_challenge_week ON weekly_challenge_completions(week_start);

-- 2. Funzione per ottenere il lunedì della settimana corrente
CREATE OR REPLACE FUNCTION get_week_start(p_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_date - EXTRACT(DOW FROM p_date)::INTEGER + 1;
$$;

-- 3. Funzione per verificare e premiare sfida settimanale "Conquista 1 paese"
CREATE OR REPLACE FUNCTION check_weekly_conquer_challenge(p_user_id UUID, p_country_code CHAR(2))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start DATE;
  v_already_completed BOOLEAN;
  v_reward_amount INTEGER := 100;  -- +100 M1U per conquista settimanale
BEGIN
  -- Calcola inizio settimana (lunedì)
  v_week_start := get_week_start(CURRENT_DATE);
  
  -- Verifica se già completata questa settimana
  SELECT EXISTS(
    SELECT 1 FROM weekly_challenge_completions
    WHERE user_id = p_user_id 
      AND challenge_type = 'conquer_country'
      AND week_start = v_week_start
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_completed_this_week',
      'week_start', v_week_start
    );
  END IF;
  
  -- Registra completamento
  INSERT INTO weekly_challenge_completions (
    user_id, challenge_type, week_start, reward_amount, details
  ) VALUES (
    p_user_id, 'conquer_country', v_week_start, v_reward_amount,
    jsonb_build_object('country_code', p_country_code)
  );
  
  -- Assegna reward M1U
  PERFORM admin_credit_m1u(p_user_id, v_reward_amount, 'weekly_challenge_conquer');
  
  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward_amount,
    'challenge', 'conquer_country',
    'country_code', p_country_code,
    'week_start', v_week_start
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION check_weekly_conquer_challenge TO authenticated;

-- 4. Trigger che si attiva quando un paese viene conquistato
-- Integra con la funzione log_battle_result esistente
CREATE OR REPLACE FUNCTION trigger_weekly_challenge_on_conquest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo se status diventa 'conquered' e owner cambia
  IF NEW.status = 'conquered' AND NEW.owner_id IS NOT NULL 
     AND (OLD.owner_id IS NULL OR OLD.owner_id != NEW.owner_id) THEN
    
    -- Chiama la funzione per verificare e premiare la sfida settimanale
    PERFORM check_weekly_conquer_challenge(NEW.owner_id, NEW.country_code);
    
    RAISE NOTICE '[WeeklyChallenge] 🏆 Checked conquest challenge for user % on country %', 
      NEW.owner_id, NEW.country_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crea trigger su country_domination (se non esiste)
DROP TRIGGER IF EXISTS trigger_weekly_challenge ON public.country_domination;
CREATE TRIGGER trigger_weekly_challenge
  AFTER UPDATE ON public.country_domination
  FOR EACH ROW
  EXECUTE FUNCTION trigger_weekly_challenge_on_conquest();

-- 5. Funzione per ottenere stato sfide settimanali utente
CREATE OR REPLACE FUNCTION get_user_weekly_challenges(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start DATE;
  v_conquer_completed BOOLEAN;
  v_result JSONB;
BEGIN
  v_week_start := get_week_start(CURRENT_DATE);
  
  -- Check sfida conquista
  SELECT EXISTS(
    SELECT 1 FROM weekly_challenge_completions
    WHERE user_id = p_user_id 
      AND challenge_type = 'conquer_country'
      AND week_start = v_week_start
  ) INTO v_conquer_completed;
  
  RETURN jsonb_build_object(
    'week_start', v_week_start,
    'challenges', jsonb_build_array(
      jsonb_build_object(
        'id', 'conquer_country',
        'name', 'Conquista 1 Paese',
        'description', 'Conquista un paese questa settimana',
        'reward', 100,
        'reward_type', 'm1u',
        'completed', v_conquer_completed
      )
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_weekly_challenges TO authenticated;

