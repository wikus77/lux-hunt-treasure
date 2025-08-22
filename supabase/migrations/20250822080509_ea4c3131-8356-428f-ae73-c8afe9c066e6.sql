-- © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
-- FCM Push Tokens Table Schema

-- Create push_tokens table for FCM token management
CREATE TABLE IF NOT EXISTS public.push_tokens (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT PRIMARY KEY,
  platform TEXT CHECK (platform IN ('web','ios','android')) DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient user lookup
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to insert/update their own tokens + anonymous insert for pre-login registration
CREATE POLICY "Users can insert own tokens or anonymous tokens" 
ON public.push_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own tokens
CREATE POLICY "Users can update own tokens" 
ON public.push_tokens 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to view their own tokens + system to view for push sending
CREATE POLICY "Users can view own tokens" 
ON public.push_tokens 
FOR SELECT 
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Allow system to delete tokens (cleanup)
CREATE POLICY "System can delete tokens" 
ON public.push_tokens 
FOR DELETE 
USING (auth.jwt() ->> 'role' = 'service_role');