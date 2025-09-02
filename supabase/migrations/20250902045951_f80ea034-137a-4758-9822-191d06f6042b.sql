-- Fix push_subscriptions table: make user_id nullable and add unique constraint on endpoint
ALTER TABLE public.push_subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Create unique index on endpoint if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS ux_push_subscriptions_endpoint
ON public.push_subscriptions ((subscription->>'endpoint'));

-- Add updated_at column if missing
ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();