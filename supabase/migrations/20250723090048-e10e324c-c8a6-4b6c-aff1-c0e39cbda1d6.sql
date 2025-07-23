-- Create pre_registered_users table for users who register before the mission launches
CREATE TABLE public.pre_registered_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_pre_registered BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.pre_registered_users ENABLE ROW LEVEL SECURITY;

-- Create policies for pre_registered_users
CREATE POLICY "Users can view their own pre-registration" 
ON public.pre_registered_users 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow pre-registration inserts" 
ON public.pre_registered_users 
FOR INSERT 
WITH CHECK (true);

-- Add column to profiles table to track pre-registration status
ALTER TABLE public.profiles 
ADD COLUMN is_pre_registered BOOLEAN DEFAULT false,
ADD COLUMN pre_registration_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create function to check if mission has started
CREATE OR REPLACE FUNCTION public.has_mission_started()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT now() >= '2025-08-19T05:00:00Z'::timestamptz;
$$;