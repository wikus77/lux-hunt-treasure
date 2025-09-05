-- Create FCM subscriptions table for cross-platform push notifications
-- property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.

CREATE TABLE IF NOT EXISTS public.fcm_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT CHECK (platform IN ('ios','android','desktop','unknown')) DEFAULT 'unknown',
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fcm_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own FCM subscriptions" 
  ON public.fcm_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own FCM subscriptions" 
  ON public.fcm_subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FCM subscriptions" 
  ON public.fcm_subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own FCM subscriptions" 
  ON public.fcm_subscriptions FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_fcm_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_fcm_subscriptions_updated_at
  BEFORE UPDATE ON public.fcm_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_fcm_subscriptions_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_fcm_subscriptions_user_id ON public.fcm_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_subscriptions_token ON public.fcm_subscriptions(token);
CREATE INDEX IF NOT EXISTS idx_fcm_subscriptions_active ON public.fcm_subscriptions(is_active) WHERE is_active = true;