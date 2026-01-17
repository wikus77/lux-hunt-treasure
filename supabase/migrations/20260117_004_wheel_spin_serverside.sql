-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRAZIONE: Fortune Wheel Server-Side (AAA+ Security Fix)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- OBIETTIVO: Spostare la logica della ruota della fortuna server-side per
-- prevenire manipolazioni client-side dei reward.
--
-- CONTENUTO:
-- 1. Tabella wheel_spins (lock 1 spin/day per utente)
-- 2. Funzione RPC execute_wheel_spin (SECURITY DEFINER)
-- 3. Trigger immutability su wheel_spins
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABELLA: wheel_spins (registro spin con lock atomico)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  segment_id INT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('m1u', 'pe', 'clue', 'marker', 'retry', 'nothing')),
  reward_value INT NOT NULL DEFAULT 0,
  reward_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- UNIQUE constraint per garantire 1 spin/day per utente (atomico)
  CONSTRAINT wheel_spins_user_day_unique UNIQUE (user_id, spin_date)
);

-- Indici per query efficienti
CREATE INDEX IF NOT EXISTS idx_wheel_spins_user_id ON public.wheel_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_date ON public.wheel_spins(spin_date);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_user_date ON public.wheel_spins(user_id, spin_date);

-- RLS: Solo lettura per il proprietario, nessun insert/update/delete diretto
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

-- Policy: utente può vedere i propri spin
CREATE POLICY "Users can view own spins"
  ON public.wheel_spins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: nessun insert diretto dal client
CREATE POLICY "No direct insert - use RPC only"
  ON public.wheel_spins
  FOR INSERT
  WITH CHECK (false);

-- Policy: nessun update diretto
CREATE POLICY "No direct update"
  ON public.wheel_spins
  FOR UPDATE
  USING (false);

-- Policy: nessun delete diretto
CREATE POLICY "No direct delete"
  ON public.wheel_spins
  FOR DELETE
  USING (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. TRIGGER IMMUTABILITY (come altre tabelle critiche)
-- ══════════════════════════════════════════════════════════════════════════════

-- Riusa la funzione forbid_update_delete() già creata nella migrazione precedente
-- Se non esiste, la creiamo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'forbid_update_delete') THEN
    CREATE OR REPLACE FUNCTION forbid_update_delete()
    RETURNS trigger AS $func$
    BEGIN
      RAISE EXCEPTION 'IMMUTABLE TABLE — operation not allowed';
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Trigger per bloccare UPDATE/DELETE su wheel_spins
DROP TRIGGER IF EXISTS no_update_delete_wheel_spins ON public.wheel_spins;
CREATE TRIGGER no_update_delete_wheel_spins
  BEFORE UPDATE OR DELETE ON public.wheel_spins
  FOR EACH ROW
  EXECUTE FUNCTION forbid_update_delete();

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. FUNZIONE RPC: execute_wheel_spin (SECURITY DEFINER)
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Logica:
-- 1. Verifica utente autenticato
-- 2. Verifica se ha già girato oggi (atomic check via INSERT)
-- 3. Calcola outcome server-side (weighted random)
-- 4. Assegna reward (M1U/PE) server-side
-- 5. Logga su prize_awards se reward economico
-- 6. Ritorna payload per UI
--
-- Return JSONB:
-- { 
--   "status": "success" | "already_spun_today" | "error",
--   "spin_id": UUID,
--   "segment_id": INT,
--   "reward_type": TEXT,
--   "reward_value": INT,
--   "reward_label": TEXT,
--   "message": TEXT
-- }
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.execute_wheel_spin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_today DATE := CURRENT_DATE;
  v_spin_id UUID;
  v_segment RECORD;
  v_random DOUBLE PRECISION;
  v_cumulative DOUBLE PRECISION := 0;
  v_total_weight INT := 0;
  v_current_m1u INT;
  v_current_pe INT;
BEGIN
  -- 1. VERIFICA UTENTE AUTENTICATO
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'User not authenticated'
    );
  END IF;

  -- 2. DEFINIZIONE SEGMENTI SERVER-SIDE (identici al client per coerenza UI)
  -- IMPORTANTE: Questi sono i VERI pesi usati per il calcolo, non modificabili dal client
  -- Formato: (id, label, value, type, probability)
  -- Total probability = 117 (sum of all weights)
  
  CREATE TEMP TABLE IF NOT EXISTS temp_wheel_segments (
    segment_id INT,
    label TEXT,
    value INT,
    reward_type TEXT,
    probability INT
  ) ON COMMIT DROP;
  
  DELETE FROM temp_wheel_segments;
  
  INSERT INTO temp_wheel_segments (segment_id, label, value, reward_type, probability) VALUES
    (1, '50 M1U', 50, 'm1u', 2),
    (2, '5 M1U', 5, 'm1u', 15),
    (3, 'LOSE', 0, 'nothing', 10),
    (4, '50 PE', 50, 'pe', 3),
    (5, '50 M1U', 50, 'm1u', 2),
    (6, '200 PE', 200, 'pe', 1),
    (7, '100 PE', 100, 'pe', 2),
    (8, '50 M1U', 50, 'm1u', 2),
    (9, 'LOSE', 0, 'nothing', 10),
    (10, 'Retry', 0, 'retry', 12),
    (11, 'CLUE', 1, 'clue', 5),
    (12, '5 M1U', 5, 'm1u', 15),
    (13, 'Retry', 0, 'retry', 12),
    (14, 'LOSE', 0, 'nothing', 10),
    (15, '3 M1U', 3, 'm1u', 10),
    (16, '2 M1U', 2, 'm1u', 8);
  
  -- Calcola peso totale
  SELECT SUM(probability) INTO v_total_weight FROM temp_wheel_segments;
  
  -- 3. CALCOLA OUTCOME SERVER-SIDE (weighted random)
  v_random := random() * v_total_weight;
  v_cumulative := 0;
  
  FOR v_segment IN 
    SELECT * FROM temp_wheel_segments ORDER BY segment_id
  LOOP
    v_cumulative := v_cumulative + v_segment.probability;
    IF v_random <= v_cumulative THEN
      EXIT; -- Found the winning segment
    END IF;
  END LOOP;
  
  -- 4. TENTA INSERIMENTO ATOMICO (verifica 1 spin/day)
  BEGIN
    INSERT INTO public.wheel_spins (
      user_id,
      spin_date,
      segment_id,
      reward_type,
      reward_value,
      reward_label
    ) VALUES (
      v_user_id,
      v_today,
      v_segment.segment_id,
      v_segment.reward_type,
      v_segment.value,
      v_segment.label
    )
    RETURNING id INTO v_spin_id;
    
  EXCEPTION WHEN unique_violation THEN
    -- Utente ha già girato oggi
    RETURN jsonb_build_object(
      'status', 'already_spun_today',
      'message', 'You have already spun the wheel today. Come back tomorrow!'
    );
  END;
  
  -- 5. ASSEGNA REWARD SERVER-SIDE
  IF v_segment.reward_type = 'm1u' AND v_segment.value > 0 THEN
    -- Ottieni M1U correnti
    SELECT COALESCE(m1_units, 0) INTO v_current_m1u
    FROM public.profiles
    WHERE id = v_user_id;
    
    -- Aggiorna M1U
    UPDATE public.profiles
    SET m1_units = COALESCE(m1_units, 0) + v_segment.value
    WHERE id = v_user_id;
    
    -- Logga su prize_awards
    INSERT INTO public.prize_awards (
      award_type,
      prize_id,
      user_id,
      source,
      evidence,
      status
    ) VALUES (
      'wheel',
      'fortune_wheel_m1u_' || v_segment.value,
      v_user_id,
      'fortune_wheel',
      jsonb_build_object(
        'spin_id', v_spin_id,
        'segment_id', v_segment.segment_id,
        'reward_value', v_segment.value,
        'balance_before', v_current_m1u,
        'balance_after', v_current_m1u + v_segment.value
      ),
      'confirmed'
    );
    
  ELSIF v_segment.reward_type = 'pe' AND v_segment.value > 0 THEN
    -- Ottieni PE correnti
    SELECT COALESCE(pulse_energy, 0) INTO v_current_pe
    FROM public.profiles
    WHERE id = v_user_id;
    
    -- Aggiorna PE
    UPDATE public.profiles
    SET pulse_energy = COALESCE(pulse_energy, 0) + v_segment.value
    WHERE id = v_user_id;
    
    -- Logga su prize_awards (PE non è "economico" ma tracciamo comunque)
    INSERT INTO public.prize_awards (
      award_type,
      prize_id,
      user_id,
      source,
      evidence,
      status
    ) VALUES (
      'wheel',
      'fortune_wheel_pe_' || v_segment.value,
      v_user_id,
      'fortune_wheel',
      jsonb_build_object(
        'spin_id', v_spin_id,
        'segment_id', v_segment.segment_id,
        'reward_value', v_segment.value,
        'balance_before', v_current_pe,
        'balance_after', v_current_pe + v_segment.value
      ),
      'confirmed'
    );
    
  ELSIF v_segment.reward_type = 'clue' THEN
    -- CLUE: per ora non gestiamo unlock automatico, solo tracking
    -- Il client mostrerà un indizio random dalla lista statica
    INSERT INTO public.prize_awards (
      award_type,
      prize_id,
      user_id,
      source,
      evidence,
      status
    ) VALUES (
      'wheel',
      'fortune_wheel_clue',
      v_user_id,
      'fortune_wheel',
      jsonb_build_object(
        'spin_id', v_spin_id,
        'segment_id', v_segment.segment_id
      ),
      'confirmed'
    );
  END IF;
  
  -- 6. UPDATE last_fortune_spin su profiles (per sync cross-device)
  UPDATE public.profiles
  SET last_fortune_spin = now()
  WHERE id = v_user_id;
  
  -- 7. RITORNA PAYLOAD PER UI
  RETURN jsonb_build_object(
    'status', 'success',
    'spin_id', v_spin_id,
    'segment_id', v_segment.segment_id,
    'reward_type', v_segment.reward_type,
    'reward_value', v_segment.value,
    'reward_label', v_segment.label,
    'message', CASE 
      WHEN v_segment.reward_type = 'm1u' THEN 'Hai vinto ' || v_segment.value || ' M1U!'
      WHEN v_segment.reward_type = 'pe' THEN 'Hai vinto ' || v_segment.value || ' PE!'
      WHEN v_segment.reward_type = 'clue' THEN 'Hai vinto un indizio!'
      WHEN v_segment.reward_type = 'retry' THEN 'Riprova domani!'
      ELSE 'LOSE - Riprova domani!'
    END
  );
  
END;
$$;

-- Grant execute a authenticated users
GRANT EXECUTE ON FUNCTION public.execute_wheel_spin() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. HELPER RPC: check_can_spin_today (per UI check senza spin)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_can_spin_today()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_existing_spin RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('can_spin', false, 'reason', 'not_authenticated');
  END IF;
  
  SELECT id, segment_id, reward_type, reward_value, reward_label, created_at
  INTO v_existing_spin
  FROM public.wheel_spins
  WHERE user_id = v_user_id AND spin_date = CURRENT_DATE;
  
  IF v_existing_spin.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'can_spin', false,
      'reason', 'already_spun_today',
      'last_spin', jsonb_build_object(
        'spin_id', v_existing_spin.id,
        'segment_id', v_existing_spin.segment_id,
        'reward_type', v_existing_spin.reward_type,
        'reward_value', v_existing_spin.reward_value,
        'reward_label', v_existing_spin.reward_label,
        'spun_at', v_existing_spin.created_at
      )
    );
  END IF;
  
  RETURN jsonb_build_object('can_spin', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_can_spin_today() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. COMMENTI
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.wheel_spins IS 'Registro immutabile degli spin della Fortune Wheel. 1 spin/day per utente, determinato server-side.';
COMMENT ON FUNCTION public.execute_wheel_spin() IS 'RPC per eseguire uno spin della Fortune Wheel. Determina outcome server-side, assegna reward atomicamente, garantisce 1 spin/day.';
COMMENT ON FUNCTION public.check_can_spin_today() IS 'RPC per verificare se l''utente può girare la ruota oggi (senza consumare lo spin).';

