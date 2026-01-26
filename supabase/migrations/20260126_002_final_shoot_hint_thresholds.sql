-- ============================================================================
-- 🔧 FIX 26/01/2026: Aggiornamento soglie hint Final Shoot
-- Problema: soglie troppo aggressive (>2km = "Freddissimo")
-- Soluzione: soglie più ragionevoli per esperienza utente
-- ============================================================================

-- Aggiorna la funzione execute_final_shoot con nuove soglie hint
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
  tolerance_meters DOUBLE PRECISION := 19;
  remaining_attempts INTEGER;
  is_winner BOOLEAN;
  current_attempt INTEGER;
  attempt_record_id UUID;
  existing_winner UUID;
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 1: Verifica disponibilità Final Shoot (ultimi 7 giorni)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF NOT public.is_final_shoot_available(p_mission_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'not_available',
      'error', 'Final Shot non ancora disponibile. Attendi gli ultimi 7 giorni di missione.'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 2: Verifica tentativi rimanenti
  -- ═══════════════════════════════════════════════════════════════════════════
  remaining_attempts := public.get_final_shoot_remaining(p_user_id, p_mission_id);
  
  IF remaining_attempts <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'no_attempts',
      'error', 'Hai esaurito tutti i tentativi per questa missione.',
      'attempts_remaining', 0
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 3: Verifica se esiste già un vincitore per questa missione
  -- 🔧 FIX 26/01/2026: Usa winner_user_id (colonna reale) invece di user_id
  -- ═══════════════════════════════════════════════════════════════════════════
  SELECT winner_user_id INTO existing_winner
  FROM public.final_shoot_winners
  WHERE mission_id = p_mission_id
  LIMIT 1;
  
  IF existing_winner IS NOT NULL THEN
    IF existing_winner = p_user_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', 'already_won',
        'error', 'Hai già vinto questa missione!'
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'status', 'mission_claimed',
        'error', 'Questa missione è già stata vinta da un altro utente.'
      );
    END IF;
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
      -- 🔧 FIX 26/01/2026: Usa winner_user_id (colonna reale) + includi distance_meters (NOT NULL)
      INSERT INTO public.final_shoot_winners (mission_id, winner_user_id, attempt_id, won_at, distance_meters)
      VALUES (p_mission_id, p_user_id, attempt_record_id, NOW(), distance)
      ON CONFLICT (mission_id) DO NOTHING;
      
      -- Verifica se siamo stati noi a vincere (race condition check)
      -- 🔧 FIX 26/01/2026: Usa winner_user_id (colonna reale)
      SELECT winner_user_id INTO existing_winner
      FROM public.final_shoot_winners
      WHERE mission_id = p_mission_id;
      
      IF existing_winner = p_user_id THEN
        -- Vittoria confermata!
        RETURN jsonb_build_object(
          'success', true,
          'status', 'winner',
          'winner', true,
          'distance_meters', distance,
          'attempts_remaining', remaining_attempts - 1,
          'message', 'Complimenti! Hai trovato il premio!'
        );
      ELSE
        -- Race condition: qualcun altro ha vinto per primo
        RETURN jsonb_build_object(
          'success', true,
          'status', 'race_lost',
          'winner', false,
          'distance_meters', distance,
          'attempts_remaining', remaining_attempts - 1,
          'hint', 'Eri sulla posizione giusta, ma qualcun altro ha vinto per primo!'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Errore durante insert winner, probabilmente race condition
      RETURN jsonb_build_object(
        'success', true,
        'status', 'race_error',
        'winner', false,
        'distance_meters', distance,
        'attempts_remaining', remaining_attempts - 1,
        'hint', 'Tentativo registrato, ma verifica risultato.'
      );
    END;
  ELSE
    -- 🔧 FIX 26/01/2026: Soglie hint più ragionevoli
    -- Non vincitore, ritorna hint con soglie aggiornate
    RETURN jsonb_build_object(
      'success', true,
      'status', 'missed',
      'winner', false,
      'distance_meters', distance,
      'attempts_remaining', remaining_attempts - 1,
      'hint', CASE 
        WHEN distance <= 19 THEN '🎯 PERFETTO! HAI VINTO!'
        WHEN distance <= 150 THEN '🔥 Ci sei quasi! Pochissimi passi!'
        WHEN distance <= 500 THEN '🌡️ Molto vicino! Sei in zona calda!'
        WHEN distance <= 1000 THEN '☀️ Vicino! Continua così!'
        WHEN distance <= 3000 THEN '😊 Sei in zona. Esplora meglio!'
        WHEN distance <= 5000 THEN '😐 Zona giusta ma non vicinissimo.'
        WHEN distance <= 10000 THEN '❄️ Lontano. Cambia direzione!'
        WHEN distance <= 25000 THEN '🥶 Molto lontano. Riconsidera la zona!'
        ELSE '🌍 Lontanissimo! Sei fuori area.'
      END
    );
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'status', 'error',
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_final_shoot(UUID, UUID, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- ============================================================================
-- SOGLIE AGGIORNATE (riepilogo):
-- <= 19m      → 🎯 PERFETTO! HAI VINTO! (vittoria)
-- <= 150m     → 🔥 Ci sei quasi! Pochissimi passi!
-- <= 500m     → 🌡️ Molto vicino! Sei in zona calda!
-- <= 1000m    → ☀️ Vicino! Continua così!
-- <= 3000m    → 😊 Sei in zona. Esplora meglio!
-- <= 5000m    → 😐 Zona giusta ma non vicinissimo.
-- <= 10000m   → ❄️ Lontano. Cambia direzione!
-- <= 25000m   → 🥶 Molto lontano. Riconsidera la zona!
-- > 25000m    → 🌍 Lontanissimo! Sei fuori area.
-- ============================================================================
