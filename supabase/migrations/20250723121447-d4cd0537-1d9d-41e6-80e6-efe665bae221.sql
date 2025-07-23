-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix critico: Trigger auth.users → profiles non funzionante

-- 1. Inserisci manualmente il profilo mancante per dev.wikus77@hotmail.it
INSERT INTO public.profiles (
  id,
  email,
  agent_code,
  plan,
  credits,
  can_access_app,
  is_pre_registered,
  created_at,
  updated_at
) VALUES (
  'e558ee6f-0d6f-4462-a846-ebfad1599655',
  'dev.wikus77@hotmail.it',
  public.generate_agent_code(),
  'Base',
  100,
  false,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 2. Ricreo completamente la funzione handle_new_user 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log per debug
  RAISE LOG 'TRIGGER FIRED: Creando profilo per utente % con email %', NEW.id, NEW.email;
  
  -- Inserisce automaticamente un profilo per ogni nuovo utente auth
  INSERT INTO public.profiles (
    id,
    email,
    agent_code,
    plan,
    credits,
    can_access_app,
    is_pre_registered,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'agent_code', public.generate_agent_code()),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Base'),
    COALESCE((NEW.raw_user_meta_data->>'credits')::integer, 100),
    COALESCE((NEW.raw_user_meta_data->>'can_access_app')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'is_pre_registered')::boolean, true),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    agent_code = COALESCE(EXCLUDED.agent_code, profiles.agent_code),
    plan = COALESCE(EXCLUDED.plan, profiles.plan),
    credits = COALESCE(EXCLUDED.credits, profiles.credits),
    can_access_app = COALESCE(EXCLUDED.can_access_app, profiles.can_access_app),
    is_pre_registered = COALESCE(EXCLUDED.is_pre_registered, profiles.is_pre_registered),
    updated_at = now();
    
  RAISE LOG 'TRIGGER SUCCESS: Profilo creato/aggiornato per utente %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 3. Elimino e ricreo il trigger per essere sicuro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verifica che il trigger sia stato creato correttamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
  ) THEN
    RAISE NOTICE 'TRIGGER CREATO CORRETTAMENTE: on_auth_user_created';
  ELSE
    RAISE EXCEPTION 'TRIGGER NON CREATO: ERRORE CRITICO';
  END IF;
END $$;