-- © 2025 Joseph MULÉ – M1SSION™ – Mind Fractal Schema

-- Table for tracking Mind Fractal game sessions
CREATE TABLE IF NOT EXISTS dna_mind_fractal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed BIGINT NOT NULL,
  moves INT NOT NULL DEFAULT 0,
  time_spent INT NOT NULL DEFAULT 0,
  completion_ratio FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS dna_mind_fractal_sessions_user_idx 
  ON dna_mind_fractal_sessions (user_id);

-- Enable RLS
ALTER TABLE dna_mind_fractal_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Mind Fractal sessions"
  ON dna_mind_fractal_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Mind Fractal sessions"
  ON dna_mind_fractal_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Mind Fractal sessions"
  ON dna_mind_fractal_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RPC function to upsert session
CREATE OR REPLACE FUNCTION upsert_dna_mind_fractal_session(
  p_seed BIGINT,
  p_moves INT,
  p_time_spent INT,
  p_completion_ratio FLOAT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO dna_mind_fractal_sessions (user_id, seed, moves, time_spent, completion_ratio)
  VALUES (auth.uid(), p_seed, p_moves, p_time_spent, p_completion_ratio)
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