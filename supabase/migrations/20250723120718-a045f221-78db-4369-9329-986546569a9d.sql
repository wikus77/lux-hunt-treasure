-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Auto-sync trigger: auth.users → profiles per ogni nuovo utente

-- Funzione per gestire nuovi utenti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce automaticamente un profilo per ogni nuovo utente auth
  INSERT INTO public.profiles (
    id,
    email,
    agent_code,
    plan,
    credits,
    can_access_app,
    is_pre_registered
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'agent_code', public.generate_agent_code()),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Base'),
    COALESCE((NEW.raw_user_meta_data->>'credits')::integer, 100),
    COALESCE((NEW.raw_user_meta_data->>'can_access_app')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'is_pre_registered')::boolean, true)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    agent_code = COALESCE(EXCLUDED.agent_code, profiles.agent_code),
    plan = COALESCE(EXCLUDED.plan, profiles.plan),
    credits = COALESCE(EXCLUDED.credits, profiles.credits),
    can_access_app = COALESCE(EXCLUDED.can_access_app, profiles.can_access_app),
    is_pre_registered = COALESCE(EXCLUDED.is_pre_registered, profiles.is_pre_registered),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger automatico su ogni inserimento in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();