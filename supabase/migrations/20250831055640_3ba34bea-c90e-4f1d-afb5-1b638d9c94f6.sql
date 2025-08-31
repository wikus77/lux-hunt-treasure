-- © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
-- Create push_subscriptions table with proper schema

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint text PRIMARY KEY,
  user_id uuid NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text NULL,
  platform text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON public.push_subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_push_subscriptions_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- Drop and recreate trigger to ensure it's correct
DROP TRIGGER IF EXISTS trg_touch_push_subs ON public.push_subscriptions;
CREATE TRIGGER trg_touch_push_subs 
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_push_subscriptions_updated_at();

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "sub owner or anon insert" ON public.push_subscriptions;
DROP POLICY IF EXISTS "read own or anon rows" ON public.push_subscriptions;
DROP POLICY IF EXISTS "update own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "delete own" ON public.push_subscriptions;