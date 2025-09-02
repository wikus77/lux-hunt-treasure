-- Fix push_subscriptions table: make user_id nullable
ALTER TABLE public.push_subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Create unique index on endpoint column
CREATE UNIQUE INDEX IF NOT EXISTS ux_push_subscriptions_endpoint
ON public.push_subscriptions (endpoint);

-- Add updated_at column if missing
ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();