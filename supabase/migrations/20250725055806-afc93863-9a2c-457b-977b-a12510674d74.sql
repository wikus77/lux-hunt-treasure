-- Remove "base" plan defaults and ensure null subscription plans
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Update profiles table to remove base plan default
ALTER TABLE public.profiles ALTER COLUMN subscription_plan DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN plan DROP DEFAULT;

-- Update existing base plan users to null (they need to choose a plan)
UPDATE public.profiles 
SET subscription_plan = NULL, plan = NULL 
WHERE subscription_plan = 'base' OR plan = 'base';

-- Update the trigger function to not assign base plan by default
CREATE OR REPLACE FUNCTION public.handle_new_user_m1ssion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    NULL, -- No default plan - user must choose
    NULL, -- No default subscription plan - user must choose
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
$function$;