-- Ensure push_subscriptions table is properly configured
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint text PRIMARY KEY,
  user_id uuid NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text NULL,
  platform text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.touch_push_subscriptions_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

DROP TRIGGER IF EXISTS trg_touch_push_subscriptions ON public.push_subscriptions;
CREATE TRIGGER trg_touch_push_subscriptions
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION public.touch_push_subscriptions_updated_at();

-- Ensure RLS is enabled
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "push_subscriptions_anon_insert" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_anon_insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true); -- Allow anonymous inserts

DROP POLICY IF EXISTS "push_subscriptions_select" ON public.push_subscriptions;  
CREATE POLICY "push_subscriptions_select" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "push_subscriptions_update" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_update" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_delete" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);