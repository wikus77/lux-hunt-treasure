-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix per security warnings - aggiunge search_path alle funzioni

-- Fix per update_user_plan_events_updated_at
CREATE OR REPLACE FUNCTION public.update_user_plan_events_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix per calculate_access_start_time
CREATE OR REPLACE FUNCTION public.calculate_access_start_time(p_plan TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  early_access_hours INTEGER := 0;
BEGIN
  CASE p_plan
    WHEN 'silver' THEN early_access_hours := 2;
    WHEN 'gold' THEN early_access_hours := 24;
    WHEN 'black' THEN early_access_hours := 48;
    WHEN 'titanium' THEN early_access_hours := 72;
    ELSE early_access_hours := 0;
  END CASE;
  
  -- Per ora restituisce subito l'accesso
  -- In futuro si può modificare per calcolare in base alle missioni
  RETURN now();
END;
$$;

-- Fix per update_user_plan_complete
CREATE OR REPLACE FUNCTION public.update_user_plan_complete(
  p_user_id UUID,
  p_new_plan TEXT,
  p_event_type TEXT DEFAULT 'upgrade',
  p_old_plan TEXT DEFAULT NULL,
  p_amount DECIMAL DEFAULT NULL,
  p_payment_intent_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  access_start_time TIMESTAMP WITH TIME ZONE;
  result JSONB;
BEGIN
  -- Calcola access_starts_at
  access_start_time := public.calculate_access_start_time(p_new_plan);
  
  -- Aggiorna profilo con nuovo piano e accesso
  UPDATE public.profiles
  SET 
    plan = p_new_plan,
    can_access_app = CASE 
      WHEN p_new_plan = 'base' THEN false 
      ELSE true 
    END,
    access_starts_at = access_start_time,
    last_plan_change = now(),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Registra evento nella tabella eventi piano
  INSERT INTO public.user_plan_events (
    user_id, 
    plan, 
    event_type, 
    old_plan, 
    amount, 
    stripe_payment_intent_id,
    metadata
  ) VALUES (
    p_user_id,
    p_new_plan,
    p_event_type,
    p_old_plan,
    p_amount,
    p_payment_intent_id,
    jsonb_build_object(
      'access_starts_at', access_start_time,
      'can_access_app', CASE WHEN p_new_plan = 'base' THEN false ELSE true END,
      'processed_at', now()
    )
  );
  
  -- Sincronizza permessi
  PERFORM public.sync_user_permissions(p_user_id);
  
  -- Costruisci risultato
  result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'plan', p_new_plan,
    'access_starts_at', access_start_time,
    'event_type', p_event_type,
    'updated_at', now()
  );
  
  RETURN result;
END;
$$;