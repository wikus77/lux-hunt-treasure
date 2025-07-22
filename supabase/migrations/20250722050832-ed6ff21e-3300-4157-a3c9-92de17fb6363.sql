-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Webhook Stripe + Checkout Sessions per completamento pagamenti

-- 1. Tabella per tracciare sessioni checkout Stripe
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  amount_total INTEGER,
  currency TEXT DEFAULT 'eur',
  payment_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Abilita RLS per checkout_sessions
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- 3. Politiche RLS per checkout_sessions
CREATE POLICY "Users can view own checkout sessions" 
ON public.checkout_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkout sessions" 
ON public.checkout_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update checkout sessions" 
ON public.checkout_sessions FOR UPDATE 
USING (true);

-- 4. Funzione per processare webhook Stripe completato
CREATE OR REPLACE FUNCTION public.process_stripe_webhook_completed(
  p_session_id TEXT,
  p_stripe_customer_id TEXT,
  p_payment_status TEXT,
  p_amount_total INTEGER
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  subscription_id UUID;
BEGIN
  -- Trova la sessione checkout
  SELECT * INTO session_record
  FROM public.checkout_sessions
  WHERE session_id = p_session_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Aggiorna stato sessione
  UPDATE public.checkout_sessions
  SET 
    status = 'completed',
    payment_status = p_payment_status,
    stripe_customer_id = p_stripe_customer_id,
    amount_total = p_amount_total,
    completed_at = now(),
    updated_at = now()
  WHERE session_id = p_session_id;
  
  -- Crea o aggiorna subscription
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    stripe_customer_id,
    stripe_subscription_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  ) VALUES (
    session_record.user_id,
    session_record.tier,
    p_stripe_customer_id,
    p_session_id, -- Usiamo session_id come fallback
    'active',
    now(),
    now() + INTERVAL '1 month',
    false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = session_record.tier,
    stripe_customer_id = p_stripe_customer_id,
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + INTERVAL '1 month',
    cancel_at_period_end = false,
    updated_at = now();
  
  -- Aggiorna profilo utente
  UPDATE public.profiles
  SET 
    subscription_tier = session_record.tier,
    tier = session_record.tier,
    updated_at = now()
  WHERE id = session_record.user_id;
  
  RETURN true;
END;
$$;

-- 5. Trigger per aggiornare updated_at su checkout_sessions
CREATE OR REPLACE FUNCTION public.update_checkout_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_checkout_sessions_updated_at_trigger
  BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_checkout_sessions_updated_at();