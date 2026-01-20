-- Add subscription_plan column to profiles table for predefined plan selection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT;