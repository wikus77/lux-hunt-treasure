-- © 2025 Joseph MULÉ – M1SSION™ – Mind Fractal DB Hardening (Fix)

-- Add indices for better query performance (if not exist)
CREATE INDEX IF NOT EXISTS idx_dna_sessions_user 
  ON dna_mind_fractal_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_dna_sessions_updated 
  ON dna_mind_fractal_sessions (updated_at DESC);

-- Add unique constraint on (user_id, seed) for upsert logic
CREATE UNIQUE INDEX IF NOT EXISTS idx_dna_sessions_user_seed 
  ON dna_mind_fractal_sessions (user_id, seed);

-- Drop existing function to allow changing return type
DROP FUNCTION IF EXISTS upsert_dna_mind_fractal_session(BIGINT, INT, INT, FLOAT);

-- Create updated RPC function with clamping and validation
CREATE OR REPLACE FUNCTION upsert_dna_mind_fractal_session(
  p_seed BIGINT,
  p_moves INT,
  p_time_spent INT,
  p_completion_ratio FLOAT
) RETURNS VOID AS $$
DECLARE
  v_clamped_ratio FLOAT;
BEGIN
  -- Clamp completion_ratio to [0, 1]
  v_clamped_ratio := GREATEST(0.0, LEAST(1.0, p_completion_ratio));
  
  -- Validate non-negative values
  IF p_moves < 0 OR p_time_spent < 0 THEN
    RAISE EXCEPTION 'Moves and time_spent must be non-negative';
  END IF;
  
  -- Upsert atomically by (user_id, seed)
  INSERT INTO dna_mind_fractal_sessions (
    user_id, 
    seed, 
    moves, 
    time_spent, 
    completion_ratio
  )
  VALUES (
    auth.uid(), 
    p_seed, 
    p_moves, 
    p_time_spent, 
    v_clamped_ratio
  )
  ON CONFLICT (user_id, seed)
  DO UPDATE SET
    moves = EXCLUDED.moves,
    time_spent = EXCLUDED.time_spent,
    completion_ratio = EXCLUDED.completion_ratio,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION upsert_dna_mind_fractal_session TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
