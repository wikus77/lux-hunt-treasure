-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Aggiorna schema profiles e crea tabella user_plan_events per sincronizzazione totale

-- Aggiorna la tabella profiles per includere access_starts_at
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_starts_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Crea tabella per tracciare tutti gli eventi del piano utente
CREATE TABLE IF NOT EXISTS public.user_plan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'purchase', 'upgrade', 'downgrade', 'cancellation'
  old_plan TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  stripe_payment_intent_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_plan_events ENABLE ROW LEVEL SECURITY;

-- RLS policies per user_plan_events
CREATE POLICY "Users can view their own plan events"
ON public.user_plan_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert plan events"
ON public.user_plan_events
FOR INSERT
WITH CHECK (true);

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_user_plan_events_user_id ON public.user_plan_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plan_events_created_at ON public.user_plan_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_plan_events_event_type ON public.user_plan_events(event_type);

-- Trigger per updated_at su user_plan_events
CREATE OR REPLACE FUNCTION public.update_user_plan_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_plan_events_updated_at
  BEFORE UPDATE ON public.user_plan_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_plan_events_updated_at();

-- Funzione per calcolare access_starts_at in base al piano
CREATE OR REPLACE FUNCTION public.calculate_access_start_time(p_plan TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
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

-- Funzione avanzata per aggiornare piano utente con tutti i calcoli
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