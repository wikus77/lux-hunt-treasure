-- ============================================================================
-- TRON BATTLE SYSTEM - Complete Database Schema
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- Drop existing battles table if it's incomplete
DROP TABLE IF EXISTS public.battles CASCADE;
DROP TABLE IF EXISTS public.battle_transfers CASCADE;
DROP TABLE IF EXISTS public.battle_participants CASCADE;
DROP TABLE IF EXISTS public.battle_audit CASCADE;
DROP TABLE IF EXISTS public.battle_energy_traces CASCADE;
DROP TABLE IF EXISTS public.battle_ghost_mode CASCADE;

-- ============================================================================
-- Main Battles Table
-- ============================================================================
CREATE TABLE public.battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ready', 'countdown', 'active', 'resolved', 'cancelled', 'expired')),
  
  -- Arena info
  arena_name TEXT,
  arena_lat DOUBLE PRECISION,
  arena_lng DOUBLE PRECISION,
  
  -- Stake info
  stake_type TEXT NOT NULL CHECK (stake_type IN ('energy', 'buzz', 'clue')),
  stake_amount NUMERIC NOT NULL DEFAULT 0,
  stake_percentage INTEGER NOT NULL CHECK (stake_percentage IN (25, 50, 75)),
  
  -- Participants
  creator_id UUID NOT NULL,
  opponent_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  countdown_start_at TIMESTAMPTZ,
  flash_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  
  -- Battle results
  winner_id UUID,
  creator_tap_at TIMESTAMPTZ,
  opponent_tap_at TIMESTAMPTZ,
  creator_reaction_ms INTEGER,
  opponent_reaction_ms INTEGER,
  creator_ping_ms INTEGER,
  opponent_ping_ms INTEGER,
  server_compensation_ms INTEGER,
  
  -- Ghost mode penalties
  creator_ghost_until TIMESTAMPTZ,
  opponent_ghost_until TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_battles_creator ON public.battles(creator_id);
CREATE INDEX idx_battles_opponent ON public.battles(opponent_id);
CREATE INDEX idx_battles_status ON public.battles(status);
CREATE INDEX idx_battles_created_at ON public.battles(created_at DESC);
CREATE INDEX idx_battles_winner ON public.battles(winner_id) WHERE winner_id IS NOT NULL;

-- ============================================================================
-- Battle Participants Table
-- ============================================================================
CREATE TABLE public.battle_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'opponent')),
  tap_timestamp TIMESTAMPTZ,
  reaction_ms INTEGER,
  ping_ms INTEGER,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_battle_participants_battle ON public.battle_participants(battle_id);
CREATE INDEX idx_battle_participants_user ON public.battle_participants(user_id);

-- ============================================================================
-- Battle Transfers Table
-- ============================================================================
CREATE TABLE public.battle_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('energy', 'buzz', 'clue')),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_battle_transfers_battle ON public.battle_transfers(battle_id);
CREATE INDEX idx_battle_transfers_from ON public.battle_transfers(from_user_id);
CREATE INDEX idx_battle_transfers_to ON public.battle_transfers(to_user_id);

-- ============================================================================
-- Battle Audit Log
-- ============================================================================
CREATE TABLE public.battle_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB DEFAULT '{}'::jsonb,
  rng_seed TEXT
);

CREATE INDEX idx_battle_audit_battle ON public.battle_audit(battle_id);
CREATE INDEX idx_battle_audit_event ON public.battle_audit(event_type);
CREATE INDEX idx_battle_audit_timestamp ON public.battle_audit(timestamp DESC);

-- ============================================================================
-- Battle Energy Traces (visual effects)
-- ============================================================================
CREATE TABLE public.battle_energy_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  end_lat DOUBLE PRECISION NOT NULL,
  end_lng DOUBLE PRECISION NOT NULL,
  intensity DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 minutes')
);

CREATE INDEX idx_battle_energy_traces_battle ON public.battle_energy_traces(battle_id);
CREATE INDEX idx_battle_energy_traces_winner ON public.battle_energy_traces(winner_id);
CREATE INDEX idx_battle_energy_traces_expires ON public.battle_energy_traces(expires_at);

-- ============================================================================
-- Battle Ghost Mode (cooldown penalties)
-- ============================================================================
CREATE TABLE public.battle_ghost_mode (
  user_id UUID NOT NULL PRIMARY KEY,
  ghost_mode_active BOOLEAN NOT NULL DEFAULT false,
  ghost_until TIMESTAMPTZ,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_battle_ghost_mode_active ON public.battle_ghost_mode(ghost_mode_active, ghost_until);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Battles: Users can see their own battles
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own battles"
  ON public.battles FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can insert their own battles"
  ON public.battles FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own battles"
  ON public.battles FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

-- Battle Participants
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of their battles"
  ON public.battle_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles
      WHERE battles.id = battle_participants.battle_id
        AND (battles.creator_id = auth.uid() OR battles.opponent_id = auth.uid())
    )
  );

CREATE POLICY "System can insert participants"
  ON public.battle_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update participants"
  ON public.battle_participants FOR UPDATE
  USING (true);

-- Battle Transfers
ALTER TABLE public.battle_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transfers"
  ON public.battle_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "System can insert transfers"
  ON public.battle_transfers FOR INSERT
  WITH CHECK (true);

-- Battle Audit
ALTER TABLE public.battle_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs of their battles"
  ON public.battle_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles
      WHERE battles.id = battle_audit.battle_id
        AND (battles.creator_id = auth.uid() OR battles.opponent_id = auth.uid())
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.battle_audit FOR INSERT
  WITH CHECK (true);

-- Battle Energy Traces
ALTER TABLE public.battle_energy_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view energy traces"
  ON public.battle_energy_traces FOR SELECT
  USING (true);

CREATE POLICY "System can insert energy traces"
  ON public.battle_energy_traces FOR INSERT
  WITH CHECK (true);

-- Battle Ghost Mode
ALTER TABLE public.battle_ghost_mode ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ghost mode"
  ON public.battle_ghost_mode FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage ghost mode"
  ON public.battle_ghost_mode FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Database Functions
-- ============================================================================

-- Function to pick random opponent
CREATE OR REPLACE FUNCTION pick_random_opponent(p_me UUID)
RETURNS TABLE (id UUID, username TEXT, agent_code TEXT, display_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nickname as username,
    p.agent_code,
    p.full_name as display_name
  FROM profiles p
  WHERE p.id != p_me
    AND p.id NOT IN (
      SELECT user_id FROM battle_ghost_mode
      WHERE ghost_mode_active = true
        AND ghost_until > now()
    )
  ORDER BY random()
  LIMIT 1;
END;
$$;

-- ============================================================================
-- Enable Realtime
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_audit;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_energy_traces;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™