-- Create tables for Stripe webhook security and idempotency
-- M1SSION™ - Secure Payment Processing

-- Stripe webhook events table for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can manage webhook events" ON public.stripe_webhook_events
FOR ALL USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Idempotency keys table for client-side requests
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  request_hash TEXT NOT NULL,
  response_data JSONB,
  status_code INTEGER,
  user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can manage idempotency keys" ON public.idempotency_keys
FOR ALL USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Users can view their own idempotency keys" ON public.idempotency_keys
FOR SELECT USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_id ON public.stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON public.idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON public.idempotency_keys(expires_at);

-- Function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM public.idempotency_keys 
  WHERE expires_at < now();
END;
$function$;