
-- Add missing columns to profiles table for personal info functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'italiano';

-- Ensure all necessary columns exist for personal info form
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS investigative_style text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS phone text;
