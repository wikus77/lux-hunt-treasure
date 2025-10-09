-- Add id column to push_tokens (without primary key since token is already PK)
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;