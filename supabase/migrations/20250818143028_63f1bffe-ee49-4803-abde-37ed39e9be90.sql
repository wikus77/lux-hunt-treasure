-- © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
-- Complete user_rewards schema for marker claim system

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marker_id uuid NOT NULL REFERENCES public.markers(id) ON DELETE CASCADE,
  reward_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  claimed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, marker_id)
);

-- Enable RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Policies for user_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.user_rewards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user rewards" 
ON public.user_rewards FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their claimed rewards" 
ON public.user_rewards FOR SELECT 
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_marker_id ON public.user_rewards(marker_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_claimed_at ON public.user_rewards(claimed_at);

-- Sample data for testing
INSERT INTO public.user_rewards (user_id, marker_id, reward_type, payload)
SELECT 
  p.id as user_id,
  m.id as marker_id,
  'buzz_free' as reward_type,
  '{"buzzCount": 1}'::jsonb as payload
FROM public.profiles p, public.markers m 
WHERE p.role = 'admin' 
LIMIT 1
ON CONFLICT (user_id, marker_id) DO NOTHING;