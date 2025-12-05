-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Mission Command Center - Aggiunta coordinate premio e tabella Final Shoot

-- 1. Aggiungi coordinate premio a current_mission_data
ALTER TABLE public.current_mission_data 
ADD COLUMN IF NOT EXISTS prize_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS prize_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS prize_name TEXT,
ADD COLUMN IF NOT EXISTS prize_brand TEXT,
ADD COLUMN IF NOT EXISTS prize_model TEXT,
ADD COLUMN IF NOT EXISTS prize_size TEXT,
ADD COLUMN IF NOT EXISTS prize_weight TEXT,
ADD COLUMN IF NOT EXISTS prize_description TEXT,
ADD COLUMN IF NOT EXISTS prize_value_estimate TEXT,
ADD COLUMN IF NOT EXISTS prize_image_url TEXT,
ADD COLUMN IF NOT EXISTS mission_name TEXT,
ADD COLUMN IF NOT EXISTS mission_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS mission_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mission_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS clues_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS clues_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS linked_mission_id UUID REFERENCES public.missions(id);

-- 2. Crea tabella per Final Shoot
CREATE TABLE IF NOT EXISTS public.final_shoot_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  attempt_lat DOUBLE PRECISION NOT NULL,
  attempt_lng DOUBLE PRECISION NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, mission_id, attempt_number)
);

-- 3. Abilita RLS per final_shoot_attempts
ALTER TABLE public.final_shoot_attempts ENABLE ROW LEVEL SECURITY;

-- 4. Policy per final_shoot_attempts
CREATE POLICY "Users can view their own attempts"
ON public.final_shoot_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
ON public.final_shoot_attempts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND attempt_number <= 3
  AND NOT EXISTS (
    SELECT 1 FROM public.final_shoot_attempts 
    WHERE user_id = auth.uid() 
    AND mission_id = final_shoot_attempts.mission_id 
    AND attempt_number = final_shoot_attempts.attempt_number
  )
);

CREATE POLICY "Admin can manage all attempts"
ON public.final_shoot_attempts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND encode(digest(email, 'sha256'), 'hex') = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52'
  )
);

-- 5. Funzione per verificare se Final Shoot è disponibile (ultimi 7 giorni)
CREATE OR REPLACE FUNCTION public.is_final_shoot_available(p_mission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mission_end_date TIMESTAMP WITH TIME ZONE;
  days_remaining INTEGER;
BEGIN
  SELECT end_date INTO mission_end_date
  FROM public.missions
  WHERE id = p_mission_id AND status = 'active';
  
  IF mission_end_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  days_remaining := EXTRACT(DAY FROM (mission_end_date - now()));
  
  -- Final Shoot disponibile solo negli ultimi 7 giorni
  RETURN days_remaining <= 7 AND days_remaining >= 0;
END;
$$;

-- 6. Funzione per contare tentativi Final Shoot rimanenti
CREATE OR REPLACE FUNCTION public.get_final_shoot_remaining(p_user_id UUID, p_mission_id UUID)
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
  
  RETURN 3 - attempts_used;
END;
$$;

-- 7. Funzione per eseguire Final Shoot
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
BEGIN
  -- Verifica se Final Shoot è disponibile
  IF NOT is_final_shoot_available(p_mission_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Final Shoot non ancora disponibile. Attendi gli ultimi 7 giorni di missione.'
    );
  END IF;
  
  -- Verifica tentativi rimanenti
  remaining_attempts := get_final_shoot_remaining(p_user_id, p_mission_id);
  IF remaining_attempts <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Hai esaurito i 3 tentativi Final Shoot per questa missione.'
    );
  END IF;
  
  -- Ottieni coordinate premio dalla current_mission_data
  SELECT cmd.prize_lat, cmd.prize_lng INTO prize_lat, prize_lng
  FROM public.current_mission_data cmd
  WHERE cmd.is_active = true
  ORDER BY cmd.created_at DESC
  LIMIT 1;
  
  IF prize_lat IS NULL OR prize_lng IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Coordinate premio non configurate.'
    );
  END IF;
  
  -- Calcola distanza usando formula Haversine (in metri)
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
  
  -- Registra tentativo
  INSERT INTO public.final_shoot_attempts (
    user_id, mission_id, attempt_lat, attempt_lng, 
    distance_meters, is_winner, attempt_number
  ) VALUES (
    p_user_id, p_mission_id, p_lat, p_lng,
    distance, is_winner, current_attempt
  );
  
  -- Se vincitore, invia evento (da gestire lato app)
  IF is_winner THEN
    RETURN jsonb_build_object(
      'success', true,
      'winner', true,
      'distance_meters', distance,
      'attempts_remaining', remaining_attempts - 1,
      'message', '🎉 CONGRATULAZIONI! Hai trovato il premio!'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'winner', false,
      'distance_meters', distance,
      'attempts_remaining', remaining_attempts - 1,
      'hint', CASE 
        WHEN distance < 50 THEN 'Bollente! Sei vicinissimo!'
        WHEN distance < 200 THEN 'Caldo! Stai andando nella direzione giusta!'
        WHEN distance < 500 THEN 'Tiepido. Continua a cercare!'
        WHEN distance < 1000 THEN 'Freddo. Sei lontano.'
        ELSE 'Gelido! Completamente fuori strada.'
      END
    );
  END IF;
END;
$$;

-- 8. Indici per performance
CREATE INDEX IF NOT EXISTS idx_final_shoot_user ON public.final_shoot_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_final_shoot_mission ON public.final_shoot_attempts(mission_id);
CREATE INDEX IF NOT EXISTS idx_final_shoot_winner ON public.final_shoot_attempts(is_winner) WHERE is_winner = true;

-- 9. Abilita realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'final_shoot_attempts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.final_shoot_attempts;
  END IF;
END$$;

-- 10. Commenti per documentazione
COMMENT ON TABLE public.final_shoot_attempts IS 'M1SSION™ Final Shoot - Tentativi degli utenti per indovinare la posizione del premio';
COMMENT ON COLUMN public.current_mission_data.prize_lat IS 'Latitudine esatta del premio per Final Shoot';
COMMENT ON COLUMN public.current_mission_data.prize_lng IS 'Longitudine esatta del premio per Final Shoot';
COMMENT ON FUNCTION public.execute_final_shoot IS 'Esegue un tentativo Final Shoot con tolleranza 19 metri';


