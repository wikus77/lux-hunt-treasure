-- Add name column to pre_registered_users table
ALTER TABLE public.pre_registered_users 
ADD COLUMN name TEXT;

-- Make password_hash nullable for pre-registration (they'll set it later when converting to full user)
ALTER TABLE public.pre_registered_users 
ALTER COLUMN password_hash DROP NOT NULL;