-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Mind Fractal V3 Backend Schema - Fixed

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.upsert_dna_mind_link CASCADE;
DROP FUNCTION IF EXISTS public.get_recent_links CASCADE;
DROP FUNCTION IF EXISTS public.get_mf_progress CASCADE;

-- Table for neural link connections
CREATE TABLE IF NOT EXISTS public.dna_mind_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  seed BIGINT NOT NULL,
  node_a INTEGER NOT NULL,
  node_b INTEGER NOT NULL,
  theme TEXT NOT NULL,
  intensity FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dna_mind_links_user_seed_created 
  ON public.dna_mind_links(user_id, seed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dna_mind_links_user_seed_theme 
  ON public.dna_mind_links(user_id, seed, theme);

-- Enable RLS
ALTER TABLE public.dna_mind_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own mind links" ON public.dna_mind_links;
DROP POLICY IF EXISTS "Users can create their own mind links" ON public.dna_mind_links;

-- RLS Policies - owner only
CREATE POLICY "Users can view their own mind links"
  ON public.dna_mind_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind links"
  ON public.dna_mind_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table for evolution milestones
CREATE TABLE IF NOT EXISTS public.dna_mind_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  seed BIGINT NOT NULL,
  theme TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, seed, theme, level)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dna_mind_milestones_user_seed_theme
  ON public.dna_mind_milestones(user_id, seed, theme);

-- Enable RLS
ALTER TABLE public.dna_mind_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.dna_mind_milestones;
DROP POLICY IF EXISTS "Users can create their own milestones" ON public.dna_mind_milestones;

-- RLS Policies
CREATE POLICY "Users can view their own milestones"
  ON public.dna_mind_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones"
  ON public.dna_mind_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RPC: Upsert link and check for milestone
CREATE FUNCTION public.upsert_dna_mind_link(
  p_user_id UUID,
  p_seed BIGINT,
  p_a INTEGER,
  p_b INTEGER,
  p_theme TEXT,
  p_intensity FLOAT DEFAULT 1.0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_links INTEGER;
  v_theme_links INTEGER;
  v_milestone_added BOOLEAN := false;
  v_milestone_level INTEGER := 0;
BEGIN
  -- Insert the link
  INSERT INTO dna_mind_links (user_id, seed, node_a, node_b, theme, intensity)
  VALUES (p_user_id, p_seed, p_a, p_b, p_theme, p_intensity);

  -- Count total links for this seed
  SELECT COUNT(*) INTO v_total_links
  FROM dna_mind_links
  WHERE user_id = p_user_id AND seed = p_seed;

  -- Count links for this theme
  SELECT COUNT(*) INTO v_theme_links
  FROM dna_mind_links
  WHERE user_id = p_user_id AND seed = p_seed AND theme = p_theme;

  -- Check if milestone reached (every 5 links of same theme)
  IF v_theme_links % 5 = 0 THEN
    v_milestone_level := v_theme_links / 5;
    
    -- Insert or update milestone
    INSERT INTO dna_mind_milestones (user_id, seed, theme, level)
    VALUES (p_user_id, p_seed, p_theme, v_milestone_level)
    ON CONFLICT (user_id, seed, theme, level) DO NOTHING;
    
    v_milestone_added := true;
  END IF;

  -- Return summary
  RETURN jsonb_build_object(
    'total_links', v_total_links,
    'theme_links', v_theme_links,
    'milestone_added', v_milestone_added,
    'milestone_level', v_milestone_level
  );
END;
$$;

-- RPC: Get recent links for session resume
CREATE FUNCTION public.get_recent_links(
  p_user_id UUID,
  p_seed BIGINT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  node_a INTEGER,
  node_b INTEGER,
  theme TEXT,
  intensity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT node_a, node_b, theme, intensity, created_at
  FROM dna_mind_links
  WHERE user_id = p_user_id AND seed = p_seed
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

-- RPC: Get progress summary
CREATE FUNCTION public.get_mf_progress(
  p_user_id UUID,
  p_seed BIGINT
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_links', COUNT(*),
    'themes', jsonb_agg(DISTINCT theme),
    'milestones', (
      SELECT COUNT(*) FROM dna_mind_milestones 
      WHERE user_id = p_user_id AND seed = p_seed
    )
  )
  FROM dna_mind_links
  WHERE user_id = p_user_id AND seed = p_seed;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_dna_mind_link TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_links TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mf_progress TO authenticated;

COMMENT ON TABLE public.dna_mind_links IS 'Neural network connections in Mind Fractal V3';
COMMENT ON TABLE public.dna_mind_milestones IS 'Evolution milestones for Mind Fractal V3';
COMMENT ON FUNCTION public.upsert_dna_mind_link IS 'Insert link and calculate milestones';
COMMENT ON FUNCTION public.get_recent_links IS 'Resume session by fetching recent links';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™