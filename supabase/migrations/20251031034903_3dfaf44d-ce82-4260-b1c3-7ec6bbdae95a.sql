-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Mind Fractal Backend Optimization: View + Indices

-- Drop existing indices if they exist
DROP INDEX IF EXISTS idx_mind_links_user_seed;
DROP INDEX IF EXISTS idx_mind_links_theme;

-- Create optimized indices for resume and milestone queries
CREATE INDEX IF NOT EXISTS idx_mind_links_user_seed_created 
  ON public.dna_mind_links (user_id, seed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mind_links_user_seed_theme 
  ON public.dna_mind_links (user_id, seed, theme, created_at DESC);

-- Create view for last 50 links (security_invoker = on for RLS)
CREATE OR REPLACE VIEW public.v_dna_mind_links_recent
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  seed,
  node_a,
  node_b,
  theme,
  intensity,
  created_at
FROM public.dna_mind_links
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 50;

-- Grant access to authenticated users
GRANT SELECT ON public.v_dna_mind_links_recent TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™