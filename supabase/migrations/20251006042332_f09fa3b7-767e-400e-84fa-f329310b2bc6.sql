-- M1SSION™ Web Push Subscriptions - Table + Indices + View
-- © 2025 Joseph MULÉ

-- Create or ensure webpush_subscriptions table exists
CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text UNIQUE NOT NULL,
  keys jsonb NOT NULL,
  device_info jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_webpush_user_active 
  ON public.webpush_subscriptions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_webpush_endpoint 
  ON public.webpush_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_webpush_active_only 
  ON public.webpush_subscriptions(is_active) 
  WHERE is_active = true;

-- VIEW to avoid "auth column not found" errors
-- Flattens JSONB keys for easier querying
CREATE OR REPLACE VIEW public.webpush_subscriptions_flat AS
SELECT
  id,
  user_id,
  endpoint,
  is_active,
  created_at,
  last_used_at,
  device_info,
  keys->>'p256dh' AS p256dh,
  keys->>'auth' AS auth
FROM public.webpush_subscriptions;

-- Enable RLS (if not already enabled)
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.webpush_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.webpush_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.webpush_subscriptions;
DROP POLICY IF EXISTS "Service role full access" ON public.webpush_subscriptions;

-- Create new policies
CREATE POLICY "Users can view own subscriptions"
  ON public.webpush_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.webpush_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.webpush_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON public.webpush_subscriptions
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Comment for documentation
COMMENT ON TABLE public.webpush_subscriptions IS 'M1SSION™ Web Push subscriptions storage - keys stored as JSONB';
COMMENT ON VIEW public.webpush_subscriptions_flat IS 'Flattened view of webpush_subscriptions with extracted p256dh and auth keys';