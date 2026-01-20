-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Aggiorna il trigger per garantire che i nuovi utenti abbiano access_enabled = false

-- Prima rimuovi il trigger esistente se presente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_enhanced();

-- Crea la funzione aggiornata per gestire nuovi utenti con controllo accessi
CREATE OR REPLACE FUNCTION public.handle_new_user_m1ssion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log per debug
  RAISE LOG 'TRIGGER FIRED: Creando profilo M1SSION per utente % con email %', NEW.id, NEW.email;
  
  -- Inserisce automaticamente un profilo per ogni nuovo utente auth
  -- con access_enabled = false per controllo accessi post-registrazione
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    public.generate_unique_agent_code(),
    'base',
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'base'),
    100,
    false, -- Sempre false per controllo accessi
    false,
    false, -- CRITICO: Accesso disabilitato per default
    NULL, -- Nessuna data di accesso iniziale
    COALESCE(NEW.raw_user_meta_data->>'status', 'registered_pending'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    agent_code = COALESCE(EXCLUDED.agent_code, profiles.agent_code),
    updated_at = now();
    
  RAISE LOG 'TRIGGER SUCCESS: Profilo M1SSION creato per utente % con access_enabled = false', NEW.id;
  RETURN NEW;
END;
$$;

-- Crea il trigger per nuovi utenti
CREATE TRIGGER on_auth_user_created_m1ssion
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_m1ssion();