-- Create battle_sessions table for TRON Battle system
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

CREATE TABLE IF NOT EXISTS battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  defender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'await_defense', 'resolved', 'expired', 'cancelled')),
  stake_type TEXT NOT NULL DEFAULT 'PE',
  stake_amount INTEGER NOT NULL DEFAULT 50,
  arena_name TEXT,
  
  -- Attacker info
  attacker_weapon_id UUID,
  attacker_weapon_power INTEGER DEFAULT 0,
  
  -- Defender info (filled when defender responds)
  defender_weapon_id UUID,
  defender_weapon_power INTEGER DEFAULT 0,
  
  -- Result
  winner_id UUID REFERENCES auth.users(id),
  surrender BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 seconds')
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_battle_sessions_creator ON battle_sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_defender ON battle_sessions(defender_id);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_status ON battle_sessions(status);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_created ON battle_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE battle_sessions ENABLE ROW LEVEL SECURITY;

-- Users can see battles they're involved in
CREATE POLICY "Users can view own battles" ON battle_sessions
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = defender_id);

-- Users can create battles (as attacker)
CREATE POLICY "Users can create battles" ON battle_sessions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Users can update battles they're involved in
CREATE POLICY "Users can update own battles" ON battle_sessions
  FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = defender_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_battle_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER battle_sessions_updated_at
  BEFORE UPDATE ON battle_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_sessions_updated_at();

-- Enable realtime for battle_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE battle_sessions;

COMMENT ON TABLE battle_sessions IS 'TRON Battle sessions between agents';

