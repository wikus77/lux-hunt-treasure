-- Fix user_buzz_counter structure and create M1U events table
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1) Ensure user_buzz_counter has daily_count column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_buzz_counter' 
    AND column_name = 'daily_count'
  ) THEN
    ALTER TABLE public.user_buzz_counter 
    ADD COLUMN daily_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 2) Create user_m1_units_events table for M1U transaction logging
CREATE TABLE IF NOT EXISTS public.user_m1_units_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_m1_units_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own M1U events"
  ON public.user_m1_units_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert M1U events"
  ON public.user_m1_units_events
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_m1_units_events_user_id 
  ON public.user_m1_units_events(user_id);

CREATE INDEX IF NOT EXISTS idx_user_m1_units_events_created_at 
  ON public.user_m1_units_events(created_at DESC);

-- Comment
COMMENT ON TABLE public.user_m1_units_events IS 
'Logs all M1U transactions (buzz payments, buzz_map payments, rewards, etc.)';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™