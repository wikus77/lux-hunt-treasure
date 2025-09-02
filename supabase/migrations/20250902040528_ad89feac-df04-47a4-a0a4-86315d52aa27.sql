-- Add push_notifications_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN push_notifications_enabled boolean DEFAULT false;