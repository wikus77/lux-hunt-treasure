-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- NORAH AI Context Tables

-- Profilo agente
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_code text NOT NULL,
  nickname text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stato missione attiva
CREATE TABLE IF NOT EXISTS public.agent_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL,
  progress jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Indizi raccolti
CREATE TABLE IF NOT EXISTS public.agent_clues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clue_id text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Azioni BUZZ
CREATE TABLE IF NOT EXISTS public.agent_buzz_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Tentativi Final Shot
CREATE TABLE IF NOT EXISTS public.agent_finalshot_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coords jsonb NOT NULL,
  result text,
  created_at timestamptz DEFAULT now()
);

-- Storico NORAH
CREATE TABLE IF NOT EXISTS public.norah_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','norah')),
  intent text,
  content text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_buzz_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_finalshot_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.norah_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_profiles' AND policyname = 'agent_profiles_self') THEN
    CREATE POLICY agent_profiles_self ON public.agent_profiles
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_missions' AND policyname = 'agent_missions_self') THEN
    CREATE POLICY agent_missions_self ON public.agent_missions
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_clues' AND policyname = 'agent_clues_self') THEN
    CREATE POLICY agent_clues_self ON public.agent_clues
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_buzz_actions' AND policyname = 'agent_buzz_actions_self') THEN
    CREATE POLICY agent_buzz_actions_self ON public.agent_buzz_actions
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_finalshot_attempts' AND policyname = 'agent_finalshot_attempts_self') THEN
    CREATE POLICY agent_finalshot_attempts_self ON public.agent_finalshot_attempts
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'norah_messages' AND policyname = 'norah_messages_self') THEN
    CREATE POLICY norah_messages_self ON public.norah_messages
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;