-- Create webpush_subscriptions table for Web Push notifications
-- Ensures pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the webpush_subscriptions table
CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,  -- { "p256dh": "...", "auth": "..." }
  device_info JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own subscriptions
CREATE POLICY webpush_insert_own
ON public.webpush_subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can view their own subscriptions
CREATE POLICY webpush_select_own
ON public.webpush_subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policy: Users can update their own subscriptions
CREATE POLICY webpush_update_own
ON public.webpush_subscriptions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_webpush_user_active 
ON public.webpush_subscriptions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_webpush_endpoint 
ON public.webpush_subscriptions(endpoint);