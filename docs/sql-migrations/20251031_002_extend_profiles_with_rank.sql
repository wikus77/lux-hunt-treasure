-- Migration: Extend profiles with pulse_energy and rank_id
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Add columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pulse_energy INT DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rank_id INT REFERENCES agent_ranks(id),
ADD COLUMN IF NOT EXISTS rank_updated_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_pulse_energy ON profiles (pulse_energy DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rank_id ON profiles (rank_id);

-- Initialize pulse_energy from user_xp.total_xp (if exists)
UPDATE profiles p
SET pulse_energy = COALESCE(
  (SELECT total_xp FROM user_xp WHERE user_id = p.id),
  0
)
WHERE pulse_energy = 0;

-- Calculate initial rank_id based on pulse_energy
UPDATE profiles p
SET 
  rank_id = (
    SELECT id FROM agent_ranks
    WHERE pe_min <= p.pulse_energy
      AND (pe_max IS NULL OR p.pulse_energy < pe_max)
    ORDER BY pe_min DESC
    LIMIT 1
  ),
  rank_updated_at = NOW()
WHERE rank_id IS NULL;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
