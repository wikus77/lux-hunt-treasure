-- M1SSION™ Web Push VAPID Backend Infrastructure
-- Standard push_subscriptions table with proper endpoint detection

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create push_subscriptions table (replacing push_tokens for clarity)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  endpoint_type TEXT GENERATED ALWAYS AS (
    CASE
      WHEN endpoint LIKE 'https://web.push.apple.com/%' THEN 'apns'
      WHEN endpoint LIKE 'https://fcm.googleapis.com/%' THEN 'fcm'
      WHEN endpoint LIKE 'https://wns.notify.windows.com/%' THEN 'wns'
      ELSE 'other'
    END
  ) STORED,
  p256dh TEXT,
  auth TEXT,
  keys JSONB,
  user_agent TEXT,
  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint_type ON public.push_subscriptions(endpoint_type);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "own_subs" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;

-- Create policy: users can only see/manage their own subscriptions
CREATE POLICY "own_subs" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_push_subscriptions_updated_at();