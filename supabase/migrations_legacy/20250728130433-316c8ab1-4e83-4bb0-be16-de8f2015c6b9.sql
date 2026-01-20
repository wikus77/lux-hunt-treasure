-- Fix per utente senza profilo: Crea profilo mancante per utente autenticato
-- URGENT FIX: L'utente 120afe62-1308-4a77-9b4a-c8f9a635b399 è autenticato ma non ha profilo

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  agent_code,
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
  '120afe62-1308-4a77-9b4a-c8f9a635b399',
  'contact@m1ssion.com',
  'Joseph',
  'AGT-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'base',
  100,
  false,
  false,
  false,
  NULL,
  'registered_pending',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();

-- Verifica che il trigger funzioni per i nuovi utenti
-- Ricrea il trigger se necessario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    agent_code,
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
    'AGT-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'base'),
    100,
    false,
    false,
    false,
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'status', 'registered_pending'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
    
  RAISE LOG 'TRIGGER SUCCESS: Profilo M1SSION creato per utente % con access_enabled = false', NEW.id;
  RETURN NEW;
END;
$$;

-- Ricrea il trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_m1ssion();

-- Verifica che tutti gli utenti autenticati abbiano un profilo corrispondente
INSERT INTO public.profiles (
  id, email, full_name, agent_code, subscription_plan, credits, 
  can_access_app, is_pre_registered, access_enabled, status, created_at, updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'User'),
  'AGT-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  COALESCE(u.raw_user_meta_data->>'subscription_plan', 'base'),
  100,
  CASE WHEN u.email = 'wikus77@hotmail.it' THEN true ELSE false END,
  false,
  CASE WHEN u.email = 'wikus77@hotmail.it' THEN true ELSE false END,
  COALESCE(u.raw_user_meta_data->>'status', 'registered_pending'),
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;