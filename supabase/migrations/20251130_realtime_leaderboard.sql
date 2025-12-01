-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- REALTIME LEADERBOARD SYSTEM - Geographic filters & notifications

-- 1. ADD GEOGRAPHIC COLUMNS TO PROFILES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IT';

-- Create indexes for geographic filtering
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- 2. CREATE LEADERBOARD MATERIALIZED VIEW FOR PERFORMANCE
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard_rankings AS
SELECT 
  p.id,
  p.agent_code,
  p.full_name,
  p.avatar_url,
  p.city,
  p.region,
  p.country,
  p.subscription_plan,
  p.current_streak_days,
  COALESCE(p.pulse_energy, 0) as pulse_energy,
  COALESCE(p.m1_units, 0) as m1_units,
  COALESCE(uc.clues_count, 0) as clues_unlocked,
  COALESCE(bc.buzz_total, 0) as buzz_used,
  -- Calculate composite score
  (
    COALESCE(p.pulse_energy, 0) * 2 +
    COALESCE(uc.clues_count, 0) * 10 +
    COALESCE(bc.buzz_total, 0) * 5 +
    COALESCE(p.current_streak_days, 0) * 3
  ) as total_score,
  ROW_NUMBER() OVER (ORDER BY (
    COALESCE(p.pulse_energy, 0) * 2 +
    COALESCE(uc.clues_count, 0) * 10 +
    COALESCE(bc.buzz_total, 0) * 5 +
    COALESCE(p.current_streak_days, 0) * 3
  ) DESC) as global_rank,
  ROW_NUMBER() OVER (PARTITION BY p.country ORDER BY (
    COALESCE(p.pulse_energy, 0) * 2 +
    COALESCE(uc.clues_count, 0) * 10 +
    COALESCE(bc.buzz_total, 0) * 5
  ) DESC) as country_rank,
  ROW_NUMBER() OVER (PARTITION BY p.region ORDER BY (
    COALESCE(p.pulse_energy, 0) * 2 +
    COALESCE(uc.clues_count, 0) * 10 +
    COALESCE(bc.buzz_total, 0) * 5
  ) DESC) as region_rank,
  ROW_NUMBER() OVER (PARTITION BY p.city ORDER BY (
    COALESCE(p.pulse_energy, 0) * 2 +
    COALESCE(uc.clues_count, 0) * 10 +
    COALESCE(bc.buzz_total, 0) * 5
  ) DESC) as city_rank,
  NOW() as last_updated
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as clues_count 
  FROM public.user_clues 
  GROUP BY user_id
) uc ON p.id = uc.user_id
LEFT JOIN (
  SELECT user_id, SUM(COALESCE(buzz_count, 0)) as buzz_total 
  FROM public.user_buzz_counter 
  GROUP BY user_id
) bc ON p.id = bc.user_id
WHERE p.agent_code IS NOT NULL;

-- Create unique index for refresh concurrently
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_rankings_id ON public.leaderboard_rankings(id);

-- 3. CREATE RANK HISTORY TABLE FOR TRACKING CHANGES
CREATE TABLE IF NOT EXISTS public.leaderboard_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_rank INTEGER,
  new_rank INTEGER,
  rank_change INTEGER,
  scope TEXT DEFAULT 'global', -- 'global', 'country', 'region', 'city'
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_history_user ON public.leaderboard_history(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_time ON public.leaderboard_history(recorded_at DESC);

-- 4. CREATE FUNCTION TO REFRESH LEADERBOARD AND TRACK CHANGES
CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_rankings RECORD;
  new_rank INTEGER;
BEGIN
  -- Store current rankings before refresh
  FOR old_rankings IN 
    SELECT id, global_rank FROM public.leaderboard_rankings
  LOOP
    -- Get new rank after refresh (will be calculated)
    SELECT global_rank INTO new_rank 
    FROM public.leaderboard_rankings 
    WHERE id = old_rankings.id;
    
    -- If rank changed, insert history record
    IF new_rank IS DISTINCT FROM old_rankings.global_rank THEN
      INSERT INTO public.leaderboard_history (user_id, previous_rank, new_rank, rank_change, scope)
      VALUES (
        old_rankings.id,
        old_rankings.global_rank,
        new_rank,
        old_rankings.global_rank - new_rank, -- Positive = moved up
        'global'
      );
    END IF;
  END LOOP;

  -- Refresh the materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_rankings;
END;
$$;

-- 5. CREATE FUNCTION TO CHECK IF USER GOT OVERTAKEN
CREATE OR REPLACE FUNCTION public.get_rank_changes(p_user_id UUID, p_since TIMESTAMPTZ DEFAULT NOW() - INTERVAL '1 hour')
RETURNS TABLE (
  overtaken_by TEXT,
  your_old_rank INTEGER,
  your_new_rank INTEGER,
  their_new_rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.full_name,
    lh.previous_rank,
    lh.new_rank,
    lr.global_rank
  FROM public.leaderboard_history lh
  JOIN public.profiles p ON p.id = lh.user_id
  JOIN public.leaderboard_rankings lr ON lr.id = lh.user_id
  WHERE lh.recorded_at > p_since
    AND lh.rank_change > 0 -- They moved up
    AND lh.new_rank < (
      SELECT global_rank FROM public.leaderboard_rankings WHERE id = p_user_id
    )
    AND lh.previous_rank >= (
      SELECT global_rank FROM public.leaderboard_rankings WHERE id = p_user_id
    )
  ORDER BY lh.recorded_at DESC
  LIMIT 5;
END;
$$;

-- 6. CREATE REALTIME FUNCTION FOR LIVE UPDATES
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_scope TEXT DEFAULT 'global',
  p_filter_value TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  agent_code TEXT,
  full_name TEXT,
  avatar_url TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  subscription_plan TEXT,
  streak_days INTEGER,
  pulse_energy INTEGER,
  m1_units INTEGER,
  clues_unlocked BIGINT,
  buzz_used BIGINT,
  total_score BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id,
    lr.agent_code,
    lr.full_name,
    lr.avatar_url,
    lr.city,
    lr.region,
    lr.country,
    lr.subscription_plan,
    lr.current_streak_days,
    lr.pulse_energy::INTEGER,
    lr.m1_units::INTEGER,
    lr.clues_unlocked,
    lr.buzz_used,
    lr.total_score,
    CASE 
      WHEN p_scope = 'city' THEN lr.city_rank
      WHEN p_scope = 'region' THEN lr.region_rank
      WHEN p_scope = 'country' THEN lr.country_rank
      ELSE lr.global_rank
    END as rank
  FROM public.leaderboard_rankings lr
  WHERE 
    CASE 
      WHEN p_scope = 'city' AND p_filter_value IS NOT NULL THEN lr.city = p_filter_value
      WHEN p_scope = 'region' AND p_filter_value IS NOT NULL THEN lr.region = p_filter_value
      WHEN p_scope = 'country' AND p_filter_value IS NOT NULL THEN lr.country = p_filter_value
      ELSE TRUE
    END
  ORDER BY rank ASC
  LIMIT p_limit;
END;
$$;

-- 7. GRANT PERMISSIONS
GRANT SELECT ON public.leaderboard_rankings TO authenticated;
GRANT SELECT ON public.leaderboard_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rank_changes TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_leaderboard TO service_role;

-- 8. ENABLE RLS
ALTER TABLE public.leaderboard_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all rank history" ON public.leaderboard_history
  FOR SELECT USING (true);

CREATE POLICY "Only system can insert history" ON public.leaderboard_history
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON MATERIALIZED VIEW public.leaderboard_rankings IS 'Cached leaderboard with geographic rankings';
COMMENT ON FUNCTION public.get_leaderboard IS 'Get leaderboard with geographic filtering';

