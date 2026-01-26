-- ============================================================================
-- 🎯 FINAL SHOOT PLUS + ELITE MONETIZATION
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================
-- 
-- PRICING TIERS:
-- - FREE (attempts 1-3): 0 M1U
-- - PLUS (attempts 4-13): 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 M1U
-- - ELITE (attempts 14-23): 1500 M1U each
-- - HARD CAP: 23 total attempts per user/mission
--
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- 1. SCHEMA UPDATES (ADDITIVE ONLY)
-- ════════════════════════════════════════════════════════════════════════════

-- Remove old constraint (max 3 attempts)
ALTER TABLE public.final_shoot_attempts 
  DROP CONSTRAINT IF EXISTS final_shoot_attempts_attempt_number_check;

-- Add new constraint (max 23 attempts)
ALTER TABLE public.final_shoot_attempts 
  ADD CONSTRAINT final_shoot_attempts_attempt_number_check 
  CHECK (attempt_number BETWEEN 1 AND 23);

-- Add monetization columns
ALTER TABLE public.final_shoot_attempts
  ADD COLUMN IF NOT EXISTS cost_m1u INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS charged BOOLEAN DEFAULT false NOT NULL;

-- Add tier constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'final_shoot_attempts_tier_check'
  ) THEN
    ALTER TABLE public.final_shoot_attempts
      ADD CONSTRAINT final_shoot_attempts_tier_check 
      CHECK (tier IN ('free', 'plus', 'elite'));
  END IF;
END $$;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_fsa_user_mission_paid 
  ON public.final_shoot_attempts(user_id, mission_id, tier);

-- ════════════════════════════════════════════════════════════════════════════
-- 2. PRICING FUNCTION (Deterministic, Server-Side)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_final_shoot_pricing(
  p_user_id UUID,
  p_mission_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempts_used INTEGER;
  next_attempt INTEGER;
  tier TEXT;
  cost INTEGER;
  allowed BOOLEAN;
  reason TEXT;
BEGIN
  -- Count attempts already made
  SELECT COUNT(*) INTO attempts_used
  FROM public.final_shoot_attempts
  WHERE user_id = p_user_id AND mission_id = p_mission_id;
  
  next_attempt := attempts_used + 1;
  
  -- Determine tier and cost
  IF next_attempt <= 3 THEN
    -- FREE tier (attempts 1-3)
    tier := 'free';
    cost := 0;
    allowed := true;
    reason := NULL;
  ELSIF next_attempt <= 13 THEN
    -- PLUS tier (attempts 4-13): 100, 200, 300, ..., 1000
    tier := 'plus';
    cost := (next_attempt - 3) * 100;
    allowed := true;
    reason := NULL;
  ELSIF next_attempt <= 23 THEN
    -- ELITE tier (attempts 14-23): 1500 each
    tier := 'elite';
    cost := 1500;
    allowed := true;
    reason := NULL;
  ELSE
    -- HARD CAP reached
    tier := 'blocked';
    cost := 0;
    allowed := false;
    reason := 'cap_reached';
  END IF;
  
  RETURN jsonb_build_object(
    'attempts_used', attempts_used,
    'next_attempt_number', next_attempt,
    'tier', tier,
    'cost_m1u', cost,
    'allowed', allowed,
    'reason', reason,
    'free_remaining', GREATEST(0, 3 - attempts_used),
    'plus_remaining', CASE WHEN attempts_used < 13 THEN GREATEST(0, 13 - GREATEST(3, attempts_used)) ELSE 0 END,
    'elite_remaining', CASE WHEN attempts_used < 23 THEN GREATEST(0, 23 - GREATEST(13, attempts_used)) ELSE 0 END,
    'total_remaining', GREATEST(0, 23 - attempts_used)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_final_shoot_pricing(UUID, UUID) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. UPDATED get_final_shoot_remaining (backwards compatible)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_final_shoot_remaining(
  p_user_id UUID, 
  p_mission_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempts_used INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempts_used
  FROM public.final_shoot_attempts
  WHERE user_id = p_user_id AND mission_id = p_mission_id;
  
  -- Now returns total remaining (up to 23) instead of just free (3)
  RETURN GREATEST(0, 23 - attempts_used);
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- 4. UPDATED execute_final_shoot WITH ATOMIC M1U CHARGE
-- ════════════════════════════════════════════════════════════════════════════

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
  is_winner BOOLEAN;
  attempt_record_id UUID;
  existing_winner UUID;
  -- Pricing variables
  v_pricing JSONB;
  v_attempts_used INTEGER;
  v_next_attempt INTEGER;
  v_tier TEXT;
  v_cost INTEGER;
  v_allowed BOOLEAN;
  v_reason TEXT;
  -- Balance variables
  v_current_balance INTEGER;
  v_new_balance INTEGER;
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
  -- STEP 2: Get pricing info (server-side calculation)
  -- ═══════════════════════════════════════════════════════════════════════════
  v_pricing := public.get_final_shoot_pricing(p_user_id, p_mission_id);
  v_attempts_used := (v_pricing->>'attempts_used')::INTEGER;
  v_next_attempt := (v_pricing->>'next_attempt_number')::INTEGER;
  v_tier := v_pricing->>'tier';
  v_cost := (v_pricing->>'cost_m1u')::INTEGER;
  v_allowed := (v_pricing->>'allowed')::BOOLEAN;
  v_reason := v_pricing->>'reason';
  
  -- Check if cap reached
  IF NOT v_allowed THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'cap_reached',
      'error', 'Hai raggiunto il limite massimo di 23 tentativi per questa missione.',
      'attempts_used', v_attempts_used,
      'pricing', v_pricing
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 3: If paid attempt, verify and charge M1U ATOMICALLY
  -- ═══════════════════════════════════════════════════════════════════════════
  IF v_cost > 0 THEN
    -- Get current balance with row lock
    SELECT COALESCE(m1_units, 0) INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Check sufficient funds
    IF v_current_balance < v_cost THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', 'insufficient_funds',
        'error', format('Saldo M1U insufficiente. Richiesti: %s M1U, Disponibili: %s M1U', v_cost, v_current_balance),
        'required_m1u', v_cost,
        'current_balance', v_current_balance,
        'tier', v_tier,
        'pricing', v_pricing
      );
    END IF;
    
    -- Deduct M1U atomically
    UPDATE public.profiles
    SET 
      m1_units = m1_units - v_cost,
      updated_at = now()
    WHERE id = p_user_id
    RETURNING m1_units INTO v_new_balance;
    
    -- Also update user_wallet if exists
    UPDATE public.user_wallet
    SET 
      balance_m1u = balance_m1u - v_cost,
      total_spent_m1u = total_spent_m1u + v_cost,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 4: Verifica se esiste già un vincitore per questa missione
  -- ═══════════════════════════════════════════════════════════════════════════
  SELECT winner_user_id INTO existing_winner
  FROM public.final_shoot_winners
  WHERE mission_id = p_mission_id
  LIMIT 1;
  
  IF existing_winner IS NOT NULL THEN
    -- REFUND if paid (mission already won)
    IF v_cost > 0 THEN
      UPDATE public.profiles
      SET m1_units = m1_units + v_cost, updated_at = now()
      WHERE id = p_user_id;
      
      UPDATE public.user_wallet
      SET balance_m1u = balance_m1u + v_cost, total_spent_m1u = total_spent_m1u - v_cost, updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
    
    IF existing_winner = p_user_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', 'already_won',
        'error', 'Hai già vinto questa missione!',
        'refunded', v_cost > 0,
        'refund_amount', v_cost
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'status', 'mission_claimed',
        'error', 'Questa missione è già stata vinta da un altro utente.',
        'refunded', v_cost > 0,
        'refund_amount', v_cost
      );
    END IF;
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 5: Ottieni coordinate premio
  -- ═══════════════════════════════════════════════════════════════════════════
  SELECT cmd.prize_lat, cmd.prize_lng INTO prize_lat, prize_lng
  FROM public.current_mission_data cmd
  WHERE cmd.is_active = true
  ORDER BY cmd.created_at DESC
  LIMIT 1;
  
  IF prize_lat IS NULL OR prize_lng IS NULL THEN
    -- REFUND if paid (config error)
    IF v_cost > 0 THEN
      UPDATE public.profiles
      SET m1_units = m1_units + v_cost, updated_at = now()
      WHERE id = p_user_id;
      
      UPDATE public.user_wallet
      SET balance_m1u = balance_m1u + v_cost, total_spent_m1u = total_spent_m1u - v_cost, updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
    
    RETURN jsonb_build_object(
      'success', false,
      'status', 'config_error',
      'error', 'Coordinate premio non configurate.',
      'refunded', v_cost > 0,
      'refund_amount', v_cost
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 6: Calcola distanza usando formula Haversine (in metri)
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
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 7: Registra tentativo con pricing info
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO public.final_shoot_attempts (
    user_id, mission_id, attempt_lat, attempt_lng, 
    distance_meters, is_winner, attempt_number,
    cost_m1u, tier, charged
  ) VALUES (
    p_user_id, p_mission_id, p_lat, p_lng,
    distance, is_winner, v_next_attempt,
    v_cost, v_tier, (v_cost > 0)
  )
  RETURNING id INTO attempt_record_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- STEP 8: Se vincitore, tenta lock atomico
  -- ═══════════════════════════════════════════════════════════════════════════
  IF is_winner THEN
    BEGIN
      INSERT INTO public.final_shoot_winners (mission_id, winner_user_id, attempt_id, won_at, distance_meters)
      VALUES (p_mission_id, p_user_id, attempt_record_id, NOW(), distance)
      ON CONFLICT (mission_id) DO NOTHING;
      
      -- Verifica se siamo stati noi a vincere
      SELECT winner_user_id INTO existing_winner
      FROM public.final_shoot_winners
      WHERE mission_id = p_mission_id;
      
      IF existing_winner = p_user_id THEN
        RETURN jsonb_build_object(
          'success', true,
          'status', 'winner',
          'winner', true,
          'distance_meters', distance,
          'attempts_remaining', 23 - v_next_attempt,
          'message', 'Complimenti! Hai trovato il premio!',
          'cost_charged', v_cost,
          'tier', v_tier
        );
      ELSE
        -- Race condition lost - still charged (attempt was valid)
        RETURN jsonb_build_object(
          'success', true,
          'status', 'race_lost',
          'winner', false,
          'distance_meters', distance,
          'attempts_remaining', 23 - v_next_attempt,
          'hint', 'Eri sulla posizione giusta, ma qualcun altro ha vinto per primo!',
          'cost_charged', v_cost,
          'tier', v_tier
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', true,
        'status', 'race_error',
        'winner', false,
        'distance_meters', distance,
        'attempts_remaining', 23 - v_next_attempt,
        'hint', 'Tentativo registrato, ma verifica risultato.',
        'cost_charged', v_cost,
        'tier', v_tier
      );
    END;
  ELSE
    -- Non vincitore - hint con soglie ragionevoli
    RETURN jsonb_build_object(
      'success', true,
      'status', 'missed',
      'winner', false,
      'distance_meters', distance,
      'attempts_remaining', 23 - v_next_attempt,
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
      END,
      'cost_charged', v_cost,
      'tier', v_tier,
      'pricing', public.get_final_shoot_pricing(p_user_id, p_mission_id)
    );
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- On any error, attempt refund if paid
  IF v_cost > 0 THEN
    BEGIN
      UPDATE public.profiles
      SET m1_units = m1_units + v_cost, updated_at = now()
      WHERE id = p_user_id;
      
      UPDATE public.user_wallet
      SET balance_m1u = balance_m1u + v_cost, total_spent_m1u = total_spent_m1u - v_cost, updated_at = now()
      WHERE user_id = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Log refund failure but don't mask original error
      NULL;
    END;
  END IF;
  
  RETURN jsonb_build_object(
    'success', false,
    'status', 'error',
    'error', SQLERRM,
    'refund_attempted', v_cost > 0
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.execute_final_shoot(UUID, UUID, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 5. COMMENTS & DOCUMENTATION
-- ════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.get_final_shoot_pricing IS 
'Returns pricing info for next Final Shoot attempt. 
Tiers: free (1-3), plus (4-13: 100-1000 M1U), elite (14-23: 1500 M1U each). 
Hard cap at 23 attempts.';

COMMENT ON FUNCTION public.execute_final_shoot IS 
'Execute Final Shoot attempt with atomic M1U charging. 
Validates funds before attempt, refunds on system errors.';

-- ════════════════════════════════════════════════════════════════════════════
-- PRICING REFERENCE:
-- ════════════════════════════════════════════════════════════════════════════
-- Attempt  | Tier  | Cost M1U
-- ---------|-------|----------
-- 1-3      | free  | 0
-- 4        | plus  | 100
-- 5        | plus  | 200
-- 6        | plus  | 300
-- 7        | plus  | 400
-- 8        | plus  | 500
-- 9        | plus  | 600
-- 10       | plus  | 700
-- 11       | plus  | 800
-- 12       | plus  | 900
-- 13       | plus  | 1000
-- 14-23    | elite | 1500 (each)
-- 24+      | BLOCKED
-- ════════════════════════════════════════════════════════════════════════════
