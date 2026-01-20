-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Aggiunta campi per nuova logica di registrazione con accesso condizionato

-- Aggiungi i campi necessari alla tabella profiles se non esistono già
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'base',
ADD COLUMN IF NOT EXISTS access_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS device_token TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'registered_pending';

-- Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_profiles_access_enabled ON public.profiles(access_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_access_start_date ON public.profiles(access_start_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Funzione per generare codice agente univoco migliorata
CREATE OR REPLACE FUNCTION public.generate_unique_agent_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Funzione per calcolare access_start_date in base al piano
CREATE OR REPLACE FUNCTION public.calculate_access_start_date(plan_name TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
IMMUTABLE
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

-- Trigger per aggiornare access_start_date quando cambia subscription_plan
CREATE OR REPLACE FUNCTION public.update_access_date_on_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Crea il trigger se non esiste
DROP TRIGGER IF EXISTS trigger_update_access_date ON public.profiles;
CREATE TRIGGER trigger_update_access_date
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_access_date_on_plan_change();

-- Funzione per verificare se un utente può accedere
CREATE OR REPLACE FUNCTION public.can_user_access_mission(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Aggiorna il trigger di creazione profilo per includere i nuovi campi
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log per debug
  RAISE LOG 'TRIGGER FIRED: Creando profilo enhanced per utente % con email %', NEW.id, NEW.email;
  
  -- Inserisce automaticamente un profilo per ogni nuovo utente auth
  INSERT INTO public.profiles (
    id,
    email,
    agent_code,
    plan,
    subscription_plan,
    credits,
    can_access_app,
    is_pre_registered,
    access_enabled,
    access_start_date,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    public.generate_unique_agent_code(),
    'base',
    'base',
    100,
    false,
    false,
    false, -- Accesso disabilitato per default
    public.calculate_access_start_date('base'), -- Data di accesso base
    'registered_pending',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    agent_code = COALESCE(EXCLUDED.agent_code, profiles.agent_code),
    updated_at = now();
    
  RAISE LOG 'TRIGGER SUCCESS: Profilo enhanced creato per utente %', NEW.id;
  RETURN NEW;
END;
$$;

-- Sostituisci il trigger esistente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_enhanced();

-- RLS policy per i nuovi campi
CREATE POLICY "Users can view their own enhanced profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own enhanced profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);