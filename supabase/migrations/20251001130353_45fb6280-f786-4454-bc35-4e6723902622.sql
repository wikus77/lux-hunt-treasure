-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- NORAH AI v6.1 - Telemetry, Memory Persistence, Performance Indices

-- ============================================
-- 1. TELEMETRY: norah_events indices (corrected)
-- ============================================

-- Create indices for efficient telemetry queries (event not event_type)
CREATE INDEX IF NOT EXISTS idx_norah_events_user_id_created 
  ON public.norah_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_norah_events_event 
  ON public.norah_events(event, created_at DESC);

-- ============================================
-- 2. MEMORY PERSISTENCE: norah_messages indices
-- ============================================

CREATE INDEX IF NOT EXISTS idx_norah_messages_user_id_created 
  ON public.norah_messages(user_id, created_at DESC);

-- ============================================
-- 3. PERFORMANCE: Agent tables indices
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agent_profiles_user_id 
  ON public.agent_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_agent_clues_user_id_created 
  ON public.agent_clues(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_buzz_actions_user_id_created 
  ON public.agent_buzz_actions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_finalshot_attempts_user_id_created 
  ON public.agent_finalshot_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_missions_user_id 
  ON public.agent_missions(user_id);

-- ============================================
-- 4. EPISODIC MEMORY: Add summary column to norah_messages
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'norah_messages' 
    AND column_name = 'episodic_summary'
  ) THEN
    ALTER TABLE public.norah_messages 
    ADD COLUMN episodic_summary TEXT;
  END IF;
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™