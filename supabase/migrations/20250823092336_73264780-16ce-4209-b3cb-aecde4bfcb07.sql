-- Ensure push_tokens table exists with correct structure and RLS
CREATE TABLE IF NOT EXISTS public.push_tokens(
  user_id uuid null,
  token text primary key,
  platform text not null default 'web',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and create new one
DROP POLICY IF EXISTS "anon can insert token" ON public.push_tokens;
CREATE POLICY "anon can insert token"
  ON public.push_tokens FOR INSERT 
  TO anon WITH CHECK (true);

-- Also allow authenticated users to insert/upsert their tokens
DROP POLICY IF EXISTS "users can manage their tokens" ON public.push_tokens;
CREATE POLICY "users can manage their tokens"
  ON public.push_tokens FOR ALL
  TO authenticated 
  USING (true)
  WITH CHECK (true);