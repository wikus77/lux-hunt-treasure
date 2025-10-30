-- Neural Links DNA Game Tables and RPC Functions

-- Session tracking for neural network puzzle
CREATE TABLE IF NOT EXISTS user_dna_neural_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed TEXT NOT NULL,
  pairs_count INT NOT NULL DEFAULT 6,
  moves INT NOT NULL DEFAULT 0,
  links_made INT NOT NULL DEFAULT 0,
  duration_ms BIGINT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual links made during a session
CREATE TABLE IF NOT EXISTS user_dna_neural_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_dna_neural_sessions(id) ON DELETE CASCADE,
  node_a INT NOT NULL,
  node_b INT NOT NULL,
  link_length FLOAT8 NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User DNA profile for cumulative progress
CREATE TABLE IF NOT EXISTS user_dna_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  last_seed TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_dna_neural_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dna_neural_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dna_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own neural sessions"
  ON user_dna_neural_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own neural sessions"
  ON user_dna_neural_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own neural sessions"
  ON user_dna_neural_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for links
CREATE POLICY "Users can view their own neural links"
  ON user_dna_neural_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_dna_neural_sessions
    WHERE id = session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own neural links"
  ON user_dna_neural_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_dna_neural_sessions
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- RLS Policies for DNA profile
CREATE POLICY "Users can view their own DNA profile"
  ON user_dna_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DNA profile"
  ON user_dna_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DNA profile"
  ON user_dna_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- RPC: Start a new neural session
CREATE OR REPLACE FUNCTION rpc_neural_start(p_seed TEXT, p_pairs INT DEFAULT 6)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Create new session
  INSERT INTO user_dna_neural_sessions(user_id, seed, pairs_count)
  VALUES (auth.uid(), p_seed, p_pairs)
  RETURNING id INTO v_session_id;
  
  -- Update user profile with last seed
  INSERT INTO user_dna_profile (user_id, last_seed, updated_at)
  VALUES (auth.uid(), p_seed, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET last_seed = EXCLUDED.last_seed, updated_at = now();
  
  RETURN v_session_id;
END;
$$;

-- RPC: Record a link connection
CREATE OR REPLACE FUNCTION rpc_neural_link(
  p_session_id UUID,
  p_node_a INT,
  p_node_b INT,
  p_length FLOAT8
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the link
  INSERT INTO user_dna_neural_links(session_id, node_a, node_b, link_length)
  VALUES (p_session_id, p_node_a, p_node_b, p_length);
  
  -- Update session stats
  UPDATE user_dna_neural_sessions
  SET moves = moves + 1,
      links_made = links_made + 1
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$;

-- RPC: Complete a neural session
CREATE OR REPLACE FUNCTION rpc_neural_complete(
  p_session_id UUID,
  p_duration_ms BIGINT,
  p_xp_gain INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark session as completed
  UPDATE user_dna_neural_sessions
  SET completed_at = now(),
      duration_ms = p_duration_ms
  WHERE id = p_session_id AND user_id = auth.uid();
  
  -- Update user XP and level
  INSERT INTO user_dna_profile (user_id, xp, level, updated_at)
  VALUES (auth.uid(), p_xp_gain, 1, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    xp = user_dna_profile.xp + EXCLUDED.xp,
    level = CEIL((user_dna_profile.xp + EXCLUDED.xp)::NUMERIC / 100)::INT,
    updated_at = now();
END;
$$;