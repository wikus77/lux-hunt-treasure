-- ============================================================================
-- M1SSION™ FIX: Prize Intro Tracking nel DATABASE
-- PROBLEMA: Il localStorage viene cancellato con reinstallazione app
-- SOLUZIONE: Salvare nel DB quale missione l'utente ha già visto
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. Aggiungi colonna per tracciare l'ultima missione per cui è stato visto il Prize Intro
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_prize_intro_mission_id UUID;

-- 2. Commento per documentazione
COMMENT ON COLUMN public.profiles.last_seen_prize_intro_mission_id IS 
  'ID della missione per cui è stato mostrato il Briefing Prize. Se uguale alla missione attiva, non mostrare di nuovo.';

-- 3. RPC per controllare e aggiornare lo stato del Prize Intro
CREATE OR REPLACE FUNCTION public.check_prize_intro_seen(p_mission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_seen_mission UUID;
BEGIN
  -- Recupera l'ultima missione vista
  SELECT last_seen_prize_intro_mission_id INTO v_last_seen_mission
  FROM profiles
  WHERE id = auth.uid();
  
  -- Se è la stessa missione, è già stato visto
  IF v_last_seen_mission IS NOT NULL AND v_last_seen_mission = p_mission_id THEN
    RETURN true; -- già visto
  END IF;
  
  RETURN false; -- non ancora visto per questa missione
END;
$$;

-- 4. RPC per segnare il Prize Intro come visto
CREATE OR REPLACE FUNCTION public.mark_prize_intro_seen(p_mission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET last_seen_prize_intro_mission_id = p_mission_id,
      updated_at = NOW()
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_prize_intro_seen TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_prize_intro_seen TO authenticated;

-- 6. Log
DO $$
BEGIN
  RAISE NOTICE '✅ Prize Intro tracking column and RPCs created';
END;
$$;

