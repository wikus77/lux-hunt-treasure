-- Create webpush_subscriptions table for proper Web Push storage
CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('apns','fcm','webpush')),
  p256dh text NOT NULL,
  auth text NOT NULL,
  keys jsonb,
  platform text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on user_id and endpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_webpush_subscriptions_user_endpoint 
ON public.webpush_subscriptions(user_id, endpoint);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_webpush_subscriptions_active 
ON public.webpush_subscriptions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can manage their own webpush subscriptions"
ON public.webpush_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for service role access
CREATE POLICY "Service role can manage all webpush subscriptions"
ON public.webpush_subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_webpush_subscriptions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_webpush_subscriptions_updated_at
  BEFORE UPDATE ON public.webpush_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_webpush_subscriptions_updated_at();