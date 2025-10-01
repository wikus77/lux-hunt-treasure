-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- NORAH AI v6: Analytics & Auto-Profile

-- 1. Create norah_events table for analytics (intent, sentiment, phase tracking)
CREATE TABLE IF NOT EXISTS public.norah_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  intent text,
  sentiment text,
  phase text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.norah_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see/insert their own events
CREATE POLICY "Users can view their own norah events"
ON public.norah_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own norah events"
ON public.norah_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_norah_events_user_created 
ON public.norah_events(user_id, created_at DESC);

-- 2. Trigger for auto-insert agent_profile on first auth (optional, reduces AG-UNKNOWN)
CREATE OR REPLACE FUNCTION public.auto_create_agent_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_agent_code text;
BEGIN
  -- Generate unique agent code
  new_agent_code := 'AG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  
  -- Check uniqueness (retry if collision)
  WHILE EXISTS (
    SELECT 1 FROM public.profiles WHERE agent_code = new_agent_code
    UNION
    SELECT 1 FROM public.agent_profiles WHERE agent_code = new_agent_code
  ) LOOP
    new_agent_code := 'AG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  END LOOP;
  
  -- Insert into agent_profiles if not exists
  INSERT INTO public.agent_profiles (user_id, agent_code, nickname)
  VALUES (NEW.id, new_agent_code, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (on insert)
DROP TRIGGER IF EXISTS on_auth_user_created_agent_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_agent_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_agent_profile();

-- 3. Add helpful comment
COMMENT ON TABLE public.norah_events IS 'NORAH AI v6 analytics: tracks user interactions for anti-repetition and NBA improvements';
COMMENT ON FUNCTION public.auto_create_agent_profile() IS 'Auto-creates agent_profile on user signup to prevent AG-UNKNOWN states';