-- Drop old Rubik tables and recreate for 4x4 wireframe version
-- Clean slate for the new implementation

-- Drop existing tables
DROP TABLE IF EXISTS public.dna_rubik_moves CASCADE;
DROP TABLE IF EXISTS public.dna_rubik_sessions CASCADE;
DROP TABLE IF EXISTS public.dna_rubik_state CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS public.validate_cube96(text) CASCADE;

-- 1) Current state table (one row per user)
CREATE TABLE public.dna_rubik_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  size INT NOT NULL DEFAULT 4 CHECK (size = 4),
  state JSONB NOT NULL,
  scramble_seed TEXT NOT NULL,
  solved BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Move log (append-only history)
CREATE TABLE public.dna_rubik_moves (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  move TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rubik_moves_user_time ON public.dna_rubik_moves (user_id, created_at DESC);

-- 3) Enable RLS
ALTER TABLE public.dna_rubik_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_rubik_moves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dna_rubik_state
CREATE POLICY "Users can read own rubik state"
  ON public.dna_rubik_state
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rubik state"
  ON public.dna_rubik_state
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rubik state"
  ON public.dna_rubik_state
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for dna_rubik_moves
CREATE POLICY "Users can read own rubik moves"
  ON public.dna_rubik_moves
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rubik moves"
  ON public.dna_rubik_moves
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4) RPC: Get state atomically
CREATE OR REPLACE FUNCTION public.dna_get_rubik_state()
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(s) FROM (
    SELECT size, state, scramble_seed, solved, updated_at
    FROM dna_rubik_state
    WHERE user_id = auth.uid()
  ) s;
$$;

-- 5) RPC: Set state atomically (upsert)
CREATE OR REPLACE FUNCTION public.dna_set_rubik_state(
  p_state JSONB,
  p_solved BOOLEAN,
  p_scramble_seed TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dna_rubik_state(user_id, size, state, scramble_seed, solved)
  VALUES (auth.uid(), 4, p_state, p_scramble_seed, p_solved)
  ON CONFLICT (user_id)
  DO UPDATE SET
    state = EXCLUDED.state,
    scramble_seed = EXCLUDED.scramble_seed,
    solved = EXCLUDED.solved,
    updated_at = now();
END;
$$;

-- 6) RPC: Log move
CREATE OR REPLACE FUNCTION public.dna_log_rubik_move(p_move TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO dna_rubik_moves(user_id, move)
  VALUES (auth.uid(), p_move);
$$;