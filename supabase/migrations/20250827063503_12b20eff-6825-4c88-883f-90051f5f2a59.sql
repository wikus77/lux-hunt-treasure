-- Create table for push tokens (if not exists)
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  token TEXT NOT NULL UNIQUE,
  ua TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can insert tokens" ON public.push_tokens;  
DROP POLICY IF EXISTS "Users can delete own tokens" ON public.push_tokens;

-- Create policies for push_tokens
CREATE POLICY "Users can view own tokens" 
ON public.push_tokens 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert tokens" 
ON public.push_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own tokens" 
ON public.push_tokens 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);