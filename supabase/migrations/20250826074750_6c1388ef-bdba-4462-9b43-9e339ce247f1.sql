-- M1SSION™ AG-X0197: Push Tokens Table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  ua TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index on token to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS push_tokens_token_key ON push_tokens(token);

-- Enable Row Level Security
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_tokens
CREATE POLICY "Users can view own tokens" ON push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Allow updates to existing tokens
CREATE POLICY "Users can update own tokens" ON push_tokens
  FOR UPDATE USING (auth.uid() = user_id);