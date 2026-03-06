-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ Wheel Server-Real — 1 spin/day authoritative
-- Date: 2026-03-04
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Table for Edge spin-wheel; client cannot INSERT/UPDATE/DELETE.
-- delete-account safe: ON DELETE CASCADE on user_id.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.daily_wheel_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key text NOT NULL,
  segment_id int NOT NULL,
  reward_type text NOT NULL,
  credited_amount int NOT NULL DEFAULT 0,
  reward_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_wheel_runs_user_day_unique UNIQUE (user_id, day_key)
);

CREATE INDEX IF NOT EXISTS idx_daily_wheel_runs_user_day ON public.daily_wheel_runs(user_id, day_key);

ALTER TABLE public.daily_wheel_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wheel runs"
  ON public.daily_wheel_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "No client insert"
  ON public.daily_wheel_runs FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No client update"
  ON public.daily_wheel_runs FOR UPDATE
  USING (false);

CREATE POLICY "No client delete"
  ON public.daily_wheel_runs FOR DELETE
  USING (false);

COMMENT ON TABLE public.daily_wheel_runs IS 'One spin per user per day_key (UTC). Written only by Edge spin-wheel (service_role).';
