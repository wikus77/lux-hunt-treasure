-- Create FCM tokens table for storing Firebase Cloud Messaging tokens
CREATE TABLE public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fid TEXT NOT NULL,             -- FID Firebase Installations
  token TEXT NOT NULL,           -- FCM token
  user_agent TEXT,
  ip INET,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index on Firebase Installation ID
CREATE UNIQUE INDEX fcm_tokens_fid_idx ON public.fcm_tokens(fid);

-- Enable Row Level Security
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own tokens
CREATE POLICY "Users can manage their own FCM tokens" ON public.fcm_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_fcm_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fcm_tokens_updated_at
  BEFORE UPDATE ON public.fcm_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fcm_tokens_updated_at();