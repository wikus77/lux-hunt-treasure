-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix per security warnings - Aggiunta SET search_path alle funzioni mancanti

-- Fix security warning per generate_unique_agent_code
CREATE OR REPLACE FUNCTION public.generate_unique_agent_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    -- Genera codice nel formato AGT-XXXXX (5 cifre)
    new_code := 'AGT-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    -- Verifica se il codice esiste già
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE agent_code = new_code
    ) INTO code_exists;
    
    -- Incrementa tentativi per evitare loop infiniti
    attempts := attempts + 1;
    
    -- Se il codice è unico o abbiamo raggiunto il massimo dei tentativi, esci
    IF NOT code_exists OR attempts >= max_attempts THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fix security warning per update_access_date_on_plan_change
CREATE OR REPLACE FUNCTION public.update_access_date_on_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se il piano è cambiato, ricalcola access_start_date
  IF OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan THEN
    NEW.access_start_date := public.calculate_access_start_date(NEW.subscription_plan);
    
    -- Se è un piano premium, abilita l'accesso anticipato
    IF NEW.subscription_plan IN ('SILVER', 'GOLD', 'BLACK', 'TITANIUM') THEN
      NEW.access_enabled := true;
      NEW.status := 'premium_access_enabled';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix security warning per can_user_access_mission
CREATE OR REPLACE FUNCTION public.can_user_access_mission(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_profile RECORD;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Ottieni il profilo dell'utente
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = user_id;
  
  -- Se l'utente non esiste, nega l'accesso
  IF user_profile IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se l'accesso non è abilitato, nega
  IF NOT user_profile.access_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Se non c'è una data di inizio accesso, nega
  IF user_profile.access_start_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se è arrivato il momento dell'accesso
  RETURN current_time >= user_profile.access_start_date;
END;
$$;

-- Fix security warning per calculate_access_start_date
CREATE OR REPLACE FUNCTION public.calculate_access_start_date(plan_name TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
  CASE UPPER(plan_name)
    WHEN 'SILVER' THEN
      RETURN '2025-08-19 00:00:00+00'::TIMESTAMP WITH TIME ZONE;
    WHEN 'GOLD' THEN
      RETURN '2025-08-18 07:00:00+00'::TIMESTAMP WITH TIME ZONE;
    WHEN 'BLACK' THEN
      RETURN '2025-08-18 00:00:00+00'::TIMESTAMP WITH TIME ZONE;
    WHEN 'TITANIUM' THEN
      RETURN '2025-08-16 00:00:00+00'::TIMESTAMP WITH TIME ZONE;
    ELSE
      -- Piano base o non riconosciuto - accesso solo al momento del lancio
      RETURN '2025-08-19 12:00:00+00'::TIMESTAMP WITH TIME ZONE;
  END CASE;
END;
$$;