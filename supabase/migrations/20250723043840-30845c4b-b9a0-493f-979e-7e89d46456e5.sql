-- Add daily cookie banner tracking to profiles table
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Add last_cookie_banner_shown column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_cookie_banner_shown DATE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_cookie_banner_shown 
ON public.profiles(last_cookie_banner_shown);