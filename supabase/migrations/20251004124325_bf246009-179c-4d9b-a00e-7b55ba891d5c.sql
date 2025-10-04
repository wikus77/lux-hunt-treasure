-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Onboarding Tutorial & Mission Enrollment Infrastructure

-- ============================================
-- 1. User Tutorial Preferences
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_flags (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hide_tutorial boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own flags"
  ON public.user_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own flags"
  ON public.user_flags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flags"
  ON public.user_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. Mission Enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS public.mission_enrollments (
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mission_id, user_id)
);

ALTER TABLE public.mission_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own enrollments"
  ON public.mission_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
  ON public.mission_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mission_enrollments_mission ON public.mission_enrollments(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_enrollments_user ON public.mission_enrollments(user_id);

-- ============================================
-- 3. RPC Functions for Tutorial Flags
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_flags()
RETURNS TABLE(hide_tutorial boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(hide_tutorial, false)
  FROM public.user_flags
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.set_hide_tutorial(p_hide boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.user_flags(user_id, hide_tutorial)
  VALUES (auth.uid(), p_hide)
  ON CONFLICT (user_id) DO UPDATE
  SET hide_tutorial = EXCLUDED.hide_tutorial,
      updated_at = now();
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_flags() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.set_hide_tutorial(boolean) TO authenticated, anon;