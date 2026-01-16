-- ============================================================================
-- M1SSION™ FIX: Prize Intro + MicroMissions Tracking nel DATABASE
-- PROBLEMA: Il localStorage viene cancellato con reinstallazione/logout
-- SOLUZIONE: Salvare nel DB per persistenza definitiva
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. PRIZE INTRO TRACKING
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_prize_intro_mission_id UUID;

COMMENT ON COLUMN public.profiles.last_seen_prize_intro_mission_id IS 
  'ID della missione per cui è stato mostrato il Briefing Prize.';

CREATE OR REPLACE FUNCTION public.check_prize_intro_seen(p_mission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_seen_mission UUID;
BEGIN
  SELECT last_seen_prize_intro_mission_id INTO v_last_seen_mission
  FROM profiles WHERE id = auth.uid();
  
  IF v_last_seen_mission IS NOT NULL AND v_last_seen_mission = p_mission_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_prize_intro_seen(p_mission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET last_seen_prize_intro_mission_id = p_mission_id, updated_at = NOW()
  WHERE id = auth.uid();
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_prize_intro_seen TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_prize_intro_seen TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 2. MICRO MISSIONS TRACKING (CRITICO PER SICUREZZA!)
-- ═══════════════════════════════════════════════════════════════

-- Colonna per tracciare se MicroMissions completate
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS micro_missions_completed BOOLEAN DEFAULT false;

-- Colonna per tracciare se ricompensa già data (ANTI-EXPLOIT!)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS micro_missions_rewarded BOOLEAN DEFAULT false;

-- Colonna per tracciare quando è stata data la ricompensa
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS micro_missions_rewarded_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.micro_missions_completed IS 
  'TRUE se utente ha completato tutte le MicroMissions (11 step).';
COMMENT ON COLUMN public.profiles.micro_missions_rewarded IS 
  'TRUE se utente ha già ricevuto la ricompensa 50 M1U. ANTI-EXPLOIT!';
COMMENT ON COLUMN public.profiles.micro_missions_rewarded_at IS 
  'Timestamp di quando è stata data la ricompensa.';

-- RPC per verificare se MicroMissions già completate
CREATE OR REPLACE FUNCTION public.check_micro_missions_completed()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed BOOLEAN;
  v_rewarded BOOLEAN;
BEGIN
  SELECT micro_missions_completed, micro_missions_rewarded
  INTO v_completed, v_rewarded
  FROM profiles WHERE id = auth.uid();
  
  RETURN jsonb_build_object(
    'completed', COALESCE(v_completed, false),
    'rewarded', COALESCE(v_rewarded, false)
  );
END;
$$;

-- RPC per segnare MicroMissions completate E dare ricompensa (UNA SOLA VOLTA!)
CREATE OR REPLACE FUNCTION public.complete_micro_missions_and_reward()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_rewarded BOOLEAN;
  v_current_m1u INTEGER;
  v_reward_amount INTEGER := 50;
BEGIN
  -- Check se già premiato
  SELECT micro_missions_rewarded INTO v_already_rewarded
  FROM profiles WHERE id = auth.uid();
  
  IF v_already_rewarded = true THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_rewarded',
      'message', 'Ricompensa già ricevuta in precedenza'
    );
  END IF;
  
  -- Recupera M1U attuale
  SELECT COALESCE(m1_units, 0) INTO v_current_m1u
  FROM profiles WHERE id = auth.uid();
  
  -- Aggiorna profilo: segna completato + premiato + aggiungi M1U
  UPDATE profiles
  SET 
    micro_missions_completed = true,
    micro_missions_rewarded = true,
    micro_missions_rewarded_at = NOW(),
    m1_units = v_current_m1u + v_reward_amount,
    updated_at = NOW()
  WHERE id = auth.uid();
  
  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward_amount,
    'new_balance', v_current_m1u + v_reward_amount,
    'message', 'Congratulazioni! +50 M1U!'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_micro_missions_completed TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_micro_missions_and_reward TO authenticated;

-- Log
DO $$
BEGIN
  RAISE NOTICE '✅ Prize Intro + MicroMissions tracking created (anti-exploit)';
END;
$$;

