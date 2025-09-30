-- Add missing columns for BUZZ MAP functionality
-- user_map_areas: add level_index for tracking user's progression
ALTER TABLE public.user_map_areas
  ADD COLUMN IF NOT EXISTS level_index integer;

-- buzz_map_actions: add payment_intent_id for linking to Stripe payments
ALTER TABLE public.buzz_map_actions
  ADD COLUMN IF NOT EXISTS payment_intent_id text;

-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_user_map_areas_user_source ON public.user_map_areas (user_id, source);
CREATE INDEX IF NOT EXISTS idx_buzz_map_actions_user_created ON public.buzz_map_actions (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_buzz_map_actions_pid ON public.buzz_map_actions (payment_intent_id);

-- Add RLS policy for users to read their own map areas (fixed column name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'select_own_user_map_areas' AND tablename = 'user_map_areas'
  ) THEN
    CREATE POLICY select_own_user_map_areas
    ON public.user_map_areas FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END$$;