-- Create fcm_tokens table if not exists
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fid text NOT NULL UNIQUE,
  token text NOT NULL,
  user_agent text,
  ip inet,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS fcm_tokens_user_idx ON public.fcm_tokens(user_id);

-- Enable RLS
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user access
DROP POLICY IF EXISTS "user can manage own tokens" ON public.fcm_tokens;
CREATE POLICY "user can manage own tokens"
ON public.fcm_tokens
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_fcm_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';