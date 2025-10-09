-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- FASE 3: Interactive Walkthrough - Add walkthrough tracking columns to profiles

-- Add walkthrough completion tracking columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS buzz_walkthrough_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS buzz_map_walkthrough_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS walkthrough_step_buzz INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS walkthrough_step_buzz_map INTEGER DEFAULT 0;

-- Add helpful comment
COMMENT ON COLUMN public.profiles.buzz_walkthrough_completed IS 'Tracks if user completed BUZZ (clues) walkthrough';
COMMENT ON COLUMN public.profiles.buzz_map_walkthrough_completed IS 'Tracks if user completed BUZZ MAP (area) walkthrough';
COMMENT ON COLUMN public.profiles.walkthrough_step_buzz IS 'Current step in BUZZ walkthrough (0-5)';
COMMENT ON COLUMN public.profiles.walkthrough_step_buzz_map IS 'Current step in BUZZ MAP walkthrough (0-5)';