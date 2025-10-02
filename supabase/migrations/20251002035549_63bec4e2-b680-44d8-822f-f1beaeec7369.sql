-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- NORAH v6.2: Episodic Memory + Telemetry

-- Episodic Memory Table
CREATE TABLE IF NOT EXISTS public.norah_memory_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  emotional_peak TEXT CHECK (emotional_peak IN ('positive','negative','breakthrough')),
  learned_pref JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for norah_memory_episodes
ALTER TABLE public.norah_memory_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY norah_memory_episodes_own
  ON public.norah_memory_episodes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_norah_memory_user_created
  ON public.norah_memory_episodes(user_id, created_at DESC);

-- Ensure norah_events has proper index for telemetry
CREATE INDEX IF NOT EXISTS idx_norah_events_user_created
  ON public.norah_events(user_id, created_at DESC);