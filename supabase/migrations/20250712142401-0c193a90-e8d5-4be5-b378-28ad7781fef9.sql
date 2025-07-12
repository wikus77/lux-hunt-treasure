-- Add missing columns to profiles table for settings functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_hints TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS preferred_rewards TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recovery_key TEXT;