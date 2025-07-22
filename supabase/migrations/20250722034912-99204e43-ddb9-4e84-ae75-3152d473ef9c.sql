-- Migrazione completa sistema abbonamenti M1SSION™
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1. Aggiorna tabella subscriptions se esiste, altrimenti crea
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'Base',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Abilita RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Politiche RLS per subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Funzione per aggiornare subscription tier nel profilo
CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Aggiorna il tier nel profilo quando cambia la subscription
  UPDATE public.profiles 
  SET 
    subscription_tier = NEW.tier,
    tier = NEW.tier,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 5. Trigger per sincronizzazione automatica
DROP TRIGGER IF EXISTS sync_subscription_tier_trigger ON public.subscriptions;
CREATE TRIGGER sync_subscription_tier_trigger
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_subscription_tier();

-- 6. Funzione per ottenere subscription attiva
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE(
  tier TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.tier,
    s.status,
    s.current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Se non trova subscription attiva, ritorna Base
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'Base'::TEXT, 'active'::TEXT, NULL::TIMESTAMPTZ;
  END IF;
END;
$$;