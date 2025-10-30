-- Migration: Create Rubik 4×4 tracking tables with full support
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Validation function for 96-character cube state (4×4 = 6 faces × 16 stickers)
CREATE OR REPLACE FUNCTION public.validate_cube96(p text) 
RETURNS boolean
LANGUAGE sql 
IMMUTABLE 
AS $$
  SELECT char_length(p) = 96
$$;

-- Sessions table: tracks complete Rubik solving sessions
CREATE TABLE IF NOT EXISTS public.dna_rubik_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_state text NOT NULL CHECK (public.validate_cube96(initial_state)),
  final_state text CHECK (final_state IS NULL OR public.validate_cube96(final_state)),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  moves_count integer NOT NULL DEFAULT 0,
  is_solved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Moves table: tracks individual rotations during solving
CREATE TABLE IF NOT EXISTS public.dna_rubik_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.dna_rubik_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  face char(1) NOT NULL CHECK (face IN ('U', 'D', 'L', 'R', 'F', 'B')),
  slice_index smallint NOT NULL CHECK (slice_index BETWEEN 0 AND 3),
  clockwise boolean NOT NULL DEFAULT true,
  cube_before text NOT NULL CHECK (public.validate_cube96(cube_before)),
  cube_after text NOT NULL CHECK (public.validate_cube96(cube_after)),
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rubik_sessions_user ON public.dna_rubik_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rubik_sessions_solved ON public.dna_rubik_sessions(user_id, is_solved);
CREATE INDEX IF NOT EXISTS idx_rubik_moves_session ON public.dna_rubik_moves(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rubik_moves_user ON public.dna_rubik_moves(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.dna_rubik_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_rubik_moves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own Rubik sessions"
  ON public.dna_rubik_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Rubik sessions"
  ON public.dna_rubik_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Rubik sessions"
  ON public.dna_rubik_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for moves
CREATE POLICY "Users can view their own Rubik moves"
  ON public.dna_rubik_moves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Rubik moves"
  ON public.dna_rubik_moves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.dna_rubik_sessions IS 'Tracks complete Rubik 4×4 solving sessions';
COMMENT ON TABLE public.dna_rubik_moves IS 'Tracks individual layer rotations during Rubik solving';
COMMENT ON COLUMN public.dna_rubik_moves.slice_index IS 'Layer index for 4×4 cube: 0-3 (0=outermost, 3=innermost)';
COMMENT ON FUNCTION public.validate_cube96(text) IS 'Validates that cube state string is exactly 96 characters for 4×4 Rubik cube';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™