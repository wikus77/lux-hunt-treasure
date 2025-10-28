-- M1SSION DNA™ — Schema & RLS Policies
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Table: user_dna_profiles (main DNA storage)
CREATE TABLE IF NOT EXISTS public.agent_dna (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  intuito INT2 NOT NULL DEFAULT 50 CHECK (intuito BETWEEN 0 AND 100),
  audacia INT2 NOT NULL DEFAULT 50 CHECK (audacia BETWEEN 0 AND 100),
  etica INT2 NOT NULL DEFAULT 50 CHECK (etica BETWEEN 0 AND 100),
  rischio INT2 NOT NULL DEFAULT 50 CHECK (rischio BETWEEN 0 AND 100),
  vibrazione INT2 NOT NULL DEFAULT 50 CHECK (vibrazione BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: user_dna_events (audit trail, optional)
CREATE TABLE IF NOT EXISTS public.agent_dna_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('onboarding', 'quiz', 'action', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agent_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_dna_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_dna (owner read/write)
CREATE POLICY "Users can view their own DNA"
  ON public.agent_dna
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own DNA"
  ON public.agent_dna
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DNA"
  ON public.agent_dna
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for agent_dna_events (owner read, system write)
CREATE POLICY "Users can view their own DNA events"
  ON public.agent_dna_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert DNA events"
  ON public.agent_dna_events
  FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_dna_updated_at ON public.agent_dna(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_dna_events_user_id ON public.agent_dna_events(user_id, created_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_agent_dna_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_dna_updated_at
  BEFORE UPDATE ON public.agent_dna
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_dna_timestamp();

-- Helper function: ensure DNA exists for user
CREATE OR REPLACE FUNCTION public.ensure_agent_dna(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.agent_dna(user_id) 
  VALUES (p_user)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™