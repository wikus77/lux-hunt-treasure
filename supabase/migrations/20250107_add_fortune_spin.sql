-- Add last_fortune_spin column to profiles table for Fortune Wheel cooldown
-- This prevents users from bypassing daily limit with hard refresh

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_fortune_spin TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.last_fortune_spin IS 'Timestamp of last Fortune Wheel spin for daily cooldown';
