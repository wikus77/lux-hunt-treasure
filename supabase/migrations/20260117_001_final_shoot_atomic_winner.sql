-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Final Shoot: Lock atomico "first winner" + Sicurezza

-- ============================================================================
-- 1. Tabella per lock atomico del vincitore finale (UN SOLO VINCITORE per missione)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.final_shoot_winners (
  mission_id UUID PRIMARY KEY REFERENCES public.missions(id) ON DELETE CASCADE,
  winner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  won_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  distance_meters DOUBLE PRECISION NOT NULL,
  attempt_id UUID REFERENCES public.final_shoot_attempts(id),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_fsw_winner ON public.final_shoot_winners(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_fsw_won_at ON public.final_shoot_winners(won_at DESC);

-- RLS
ALTER TABLE public.final_shoot_winners ENABLE ROW LEVEL SECURITY;

-- Policy: Chiunque può vedere i vincitori (trasparenza)
CREATE POLICY "Anyone can view final shoot winners"
ON public.final_shoot_winners
FOR SELECT
USING (true);

-- Policy: Solo service_role può inserire (via RPC SECURITY DEFINER)
CREATE POLICY "Only system can insert winners"
ON public.final_shoot_winners
FOR INSERT
WITH CHECK (false); -- RPC usa SECURITY DEFINER, bypassa RLS

-- ============================================================================
-- 2. Aggiorna RPC execute_final_shoot con lock atomico "first winner"
-- ============================================================================

CREATE OR REPLACE FUNCTION public.execute_final_shoot(
  p_user_id UUID,
  p_mission_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prize_lat DOUBLE PRECISION;
  prize_lng DOUBLE PRECISION;
  distance DOUBLE PRECISION;
  remaining_attempts INTEGER;
  current_attempt INTEGER;
  is_winner BOOLEAN;
  tolerance_meters DOUBLE PRECISION := 19; -- 19 metri di tolleranza
  existing_winner_id UUID;
  attempt_record_id UUID;
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 1: Verifica se esiste già un vincitore per questa missione
  -- ═══════════════════════════════════════════════════════════════════════════
  SELECT winner_user_id INTO existing_winner_id
  FROM public.final_shoot_winners
  WHERE mission_id = p_mission_id;
  
  IF existing_winner_id IS NOT NULL THEN
    -- Se il vincitore è l'utente stesso, ritorna successo con già vinto
    IF existing_winner_id = p_user_id THEN
      RETURN jsonb_build_object(
        'success', true,
        'status', 'already_won',
        'message', 'Hai già vinto il Final Shoot per questa missione!'
      );
    ELSE
      -- Un altro utente ha già vinto
      RETURN jsonb_build_object(
        'success', false,
        'status', 'already_claimed',
        'error', 'Il premio è già stato vinto da un altro agente.',
        'winner_claimed_at', (SELECT won_at FROM public.final_shoot_winners WHERE mission_id = p_mission_id)
      );
    END IF;
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 2: Verifica se Final Shoot è disponibile (ultimi 7 giorni)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF NOT is_final_shoot_available(p_mission_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'not_available',
      'error', 'Final Shoot non ancora disponibile. Attendi gli ultimi 7 giorni di missione.'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 3: Verifica tentativi rimanenti
  -- ═══════════════════════════════════════════════════════════════════════════
  remaining_attempts := get_final_shoot_remaining(p_user_id, p_mission_id);
  IF remaining_attempts <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'no_attempts',
      'error', 'Hai esaurito i 3 tentativi Final Shoot per questa missione.'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 4: Ottieni coordinate premio
  -- ═══════════════════════════════════════════════════════════════════════════
  SELECT cmd.prize_lat, cmd.prize_lng INTO prize_lat, prize_lng
  FROM public.current_mission_data cmd
  WHERE cmd.is_active = true
  ORDER BY cmd.created_at DESC
  LIMIT 1;
  
  IF prize_lat IS NULL OR prize_lng IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'config_error',
      'error', 'Coordinate premio non configurate.'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 5: Calcola distanza usando formula Haversine (in metri)
  -- ═══════════════════════════════════════════════════════════════════════════
  distance := 6371000 * 2 * ASIN(
    SQRT(
      POWER(SIN(RADIANS(p_lat - prize_lat) / 2), 2) +
      COS(RADIANS(prize_lat)) * COS(RADIANS(p_lat)) *
      POWER(SIN(RADIANS(p_lng - prize_lng) / 2), 2)
    )
  );
  
  -- Determina se è vincitore (entro 19 metri)
  is_winner := distance <= tolerance_meters;
  
  -- Calcola numero tentativo
  current_attempt := 4 - remaining_attempts;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 6: Registra tentativo (con RETURNING per ottenere l'ID)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO public.final_shoot_attempts (
    user_id, mission_id, attempt_lat, attempt_lng, 
    distance_meters, is_winner, attempt_number
  ) VALUES (
    p_user_id, p_mission_id, p_lat, p_lng,
    distance, is_winner, current_attempt
  )
  RETURNING id INTO attempt_record_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 7: Se vincitore, tenta lock atomico (INSERT con ON CONFLICT)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF is_winner THEN
    BEGIN
      -- Tenta insert atomico - PK su mission_id garantisce UN SOLO vincitore
      INSERT INTO public.final_shoot_winners (
        mission_id, winner_user_id, distance_meters, attempt_id, evidence
      ) VALUES (
        p_mission_id, 
        p_user_id, 
        distance, 
        attempt_record_id,
        jsonb_build_object(
          'attempt_lat', p_lat,
          'attempt_lng', p_lng,
          'server_timestamp', now(),
          'tolerance_meters', tolerance_meters
        )
      );
      
      -- Se insert riuscito, l'utente è IL vincitore
      RETURN jsonb_build_object(
        'success', true,
        'status', 'winner',
        'winner', true,
        'distance_meters', distance,
        'attempts_remaining', remaining_attempts - 1,
        'won_at', now(),
        'message', '🎉 CONGRATULAZIONI! HAI VINTO IL FINAL SHOOT!'
      );
      
    EXCEPTION WHEN unique_violation THEN
      -- Race condition: un altro utente ha vinto nello stesso istante
      -- Aggiorna il record dell'attempt per riflettere che NON è vincitore
      UPDATE public.final_shoot_attempts
      SET is_winner = false
      WHERE id = attempt_record_id;
      
      RETURN jsonb_build_object(
        'success', false,
        'status', 'already_claimed',
        'winner', false,
        'distance_meters', distance,
        'error', 'Il premio è appena stato vinto da un altro agente!',
        'attempts_remaining', remaining_attempts - 1
      );
    END;
  ELSE
    -- Non vincitore, ritorna hint
    RETURN jsonb_build_object(
      'success', true,
      'status', 'missed',
      'winner', false,
      'distance_meters', distance,
      'attempts_remaining', remaining_attempts - 1,
      'hint', CASE 
        WHEN distance < 50 THEN '🔥 Bollente! Sei vicinissimo!'
        WHEN distance < 100 THEN '🌡️ Molto caldo! Quasi ci sei!'
        WHEN distance < 250 THEN '☀️ Caldo! Stai andando bene!'
        WHEN distance < 500 THEN '😊 Tiepido. Direzione giusta!'
        WHEN distance < 1000 THEN '😐 Freddo. Riprova!'
        WHEN distance < 2000 THEN '❄️ Molto freddo. Sei lontano.'
        ELSE '🥶 Freddissimo! Completamente fuori strada.'
      END
    );
  END IF;
END;
$$;

-- ============================================================================
-- 3. Revoca permessi INSERT diretto dal client
-- ============================================================================

-- Rimuovi policy che permetteva insert diretto
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.final_shoot_attempts;

-- Nuova policy: NESSUN insert diretto, solo via RPC SECURITY DEFINER
CREATE POLICY "No direct insert - use RPC only"
ON public.final_shoot_attempts
FOR INSERT
WITH CHECK (false);

-- ============================================================================
-- 4. Grants
-- ============================================================================

-- La RPC execute_final_shoot è SECURITY DEFINER quindi bypassa RLS
-- Gli utenti possono solo chiamare la RPC, non inserire direttamente

GRANT SELECT ON public.final_shoot_winners TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_final_shoot TO authenticated;

-- ============================================================================
-- 5. Commenti
-- ============================================================================

COMMENT ON TABLE public.final_shoot_winners IS 
'M1SSION™ Final Shoot Winners - Lock atomico per garantire UN SOLO vincitore per missione. PK su mission_id.';

COMMENT ON FUNCTION public.execute_final_shoot IS 
'Esegue un tentativo Final Shoot con:
- Calcolo distanza server-side (Haversine)
- Lock atomico first-winner via INSERT ON CONFLICT
- Timestamp server-side authoritative
- Nessun insert diretto permesso dal client';

