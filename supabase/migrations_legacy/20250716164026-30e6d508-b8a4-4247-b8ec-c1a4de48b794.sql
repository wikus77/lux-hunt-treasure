-- © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
-- M1SSION™ Database Security Fix - Complete Function Search Path Correction

-- Fix remaining database functions to have secure search_path
CREATE OR REPLACE FUNCTION public.calculate_buzz_price(daily_count integer)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF daily_count BETWEEN 0 AND 10 THEN
    RETURN 1.99;
  ELSIF daily_count BETWEEN 11 AND 20 THEN
    RETURN 3.99;
  ELSIF daily_count BETWEEN 21 AND 30 THEN
    RETURN 5.99;
  ELSIF daily_count BETWEEN 31 AND 40 THEN
    RETURN 7.99;
  ELSIF daily_count BETWEEN 41 AND 50 THEN
    RETURN 9.99;
  ELSE
    RETURN 0; -- Valore che indica "bloccato"
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_mission_week()
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  mission_start_date DATE;
  current_week INTEGER;
BEGIN
  -- Ottieni la data di inizio missione (assumo che sia nella tabella missions)
  SELECT MIN(publication_date)::DATE INTO mission_start_date 
  FROM public.missions WHERE status = 'active';
  
  -- Se non c'è una missione attiva, restituisci 1 come default
  IF mission_start_date IS NULL THEN
    RETURN 1;
  END IF;
  
  -- Calcola la settimana corrente (arrotondata per eccesso)
  current_week := CEIL((CURRENT_DATE - mission_start_date) / 7.0);
  
  -- Minimo settimana 1
  RETURN GREATEST(1, current_week);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_buzz_counter(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Inserisci o aggiorna il contatore per oggi
  INSERT INTO public.user_buzz_counter (user_id, date, buzz_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET buzz_count = user_buzz_counter.buzz_count + 1
  RETURNING buzz_count INTO new_count;
  
  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_map_generation_counter(p_user_id uuid, p_week integer)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_generations INTEGER[];
  week_index INTEGER;
  updated_generations INTEGER;
BEGIN
  -- Assicurati che l'indice della settimana sia valido (1-4)
  week_index := GREATEST(1, LEAST(4, p_week));
  
  -- Ottieni o crea il record
  INSERT INTO public.user_buzz_counter (user_id, date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  -- Ottieni l'array delle generazioni
  SELECT week_map_generations INTO current_generations
  FROM public.user_buzz_counter
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- Incrementa il contatore per la settimana specificata
  current_generations[week_index] := current_generations[week_index] + 1;
  
  -- Aggiorna il record
  UPDATE public.user_buzz_counter
  SET week_map_generations = current_generations
  WHERE user_id = p_user_id AND date = CURRENT_DATE
  RETURNING week_map_generations[week_index] INTO updated_generations;
  
  RETURN updated_generations;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_max_map_generations(p_week integer)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  CASE p_week
    WHEN 1 THEN RETURN 2;
    WHEN 2 THEN RETURN 3;
    WHEN 3 THEN RETURN 3;
    WHEN 4 THEN RETURN 4;
    ELSE RETURN 4; -- Default per settimane > 4
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_map_radius_km(p_week integer, p_generation_count integer)
RETURNS double precision
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  CASE p_week
    WHEN 1 THEN
      CASE p_generation_count
        WHEN 1 THEN RETURN 500.0;
        WHEN 2 THEN RETURN 400.0;
        ELSE RETURN 500.0;
      END CASE;
    WHEN 2 THEN
      CASE p_generation_count
        WHEN 1 THEN RETURN 350.0;
        WHEN 2 THEN RETURN 300.0;
        WHEN 3 THEN RETURN 250.0;
        ELSE RETURN 300.0;
      END CASE;
    WHEN 3 THEN
      CASE p_generation_count
        WHEN 1 THEN RETURN 250.0;
        WHEN 2 THEN RETURN 200.0;
        WHEN 3 THEN RETURN 150.0;
        ELSE RETURN 200.0;
      END CASE;
    WHEN 4 THEN
      CASE p_generation_count
        WHEN 1 THEN RETURN 100.0;
        WHEN 2 THEN RETURN 50.0;
        WHEN 3 THEN RETURN 15.0;
        WHEN 4 THEN RETURN 5.0;
        ELSE RETURN 25.0;
      END CASE;
    ELSE
      RETURN 10.0; -- Default per settimane > 4
  END CASE;
END;
$$;