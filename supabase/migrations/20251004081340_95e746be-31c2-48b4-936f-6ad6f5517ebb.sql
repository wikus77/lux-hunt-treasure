-- Add streak columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in_date DATE;

-- Create weekly_leaderboard table
CREATE TABLE IF NOT EXISTS public.weekly_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_xp INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_number, year)
);

ALTER TABLE public.weekly_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_leaderboard
CREATE POLICY "Users can view weekly leaderboard"
  ON public.weekly_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "System can manage weekly leaderboard"
  ON public.weekly_leaderboard FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create materialized view for current week leaderboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.current_week_leaderboard AS
SELECT 
  wl.user_id,
  wl.total_xp,
  wl.rank,
  p.agent_code,
  p.avatar_url,
  EXTRACT(WEEK FROM CURRENT_DATE) as current_week,
  EXTRACT(YEAR FROM CURRENT_DATE) as current_year
FROM public.weekly_leaderboard wl
JOIN public.profiles p ON p.id = wl.user_id
WHERE wl.week_number = EXTRACT(WEEK FROM CURRENT_DATE)
  AND wl.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY wl.total_xp DESC
LIMIT 100;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboard_week_year 
  ON public.weekly_leaderboard(week_number, year, total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_streak 
  ON public.profiles(current_streak_days DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_current_week_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.current_week_leaderboard;
END;
$$;

-- Trigger to update weekly_leaderboard updated_at
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_weekly_leaderboard_timestamp
  BEFORE UPDATE ON public.weekly_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_weekly_leaderboard_updated_at();