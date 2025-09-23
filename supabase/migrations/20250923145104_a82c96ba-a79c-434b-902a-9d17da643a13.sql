-- Idempotent webpush_subscriptions schema update
DO $$
BEGIN
  -- Create table if not exists
  CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    provider text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    keys jsonb,
    platform text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  -- Add provider constraint if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webpush_subscriptions_provider_check') THEN
    ALTER TABLE public.webpush_subscriptions 
    ADD CONSTRAINT webpush_subscriptions_provider_check 
    CHECK (provider IN ('apns', 'fcm', 'webpush'));
  END IF;

  -- Create unique index if not exists
  CREATE UNIQUE INDEX IF NOT EXISTS idx_webpush_user_endpoint 
  ON public.webpush_subscriptions(user_id, endpoint);

  -- Create partial index if not exists
  CREATE INDEX IF NOT EXISTS idx_webpush_active 
  ON public.webpush_subscriptions(is_active) WHERE is_active;

  -- Update null providers
  UPDATE public.webpush_subscriptions
  SET provider = CASE
    WHEN endpoint LIKE '%web.push.apple.com%' THEN 'apns'
    WHEN endpoint LIKE '%fcm.googleapis.com%' THEN 'fcm'
    ELSE 'webpush'
  END
  WHERE provider IS NULL;

  -- Create or replace updated_at trigger function
  CREATE OR REPLACE FUNCTION public._touch_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  BEGIN 
    NEW.updated_at = now(); 
    RETURN NEW; 
  END; 
  $function$;

  -- Drop existing trigger if exists
  DROP TRIGGER IF EXISTS trg_touch_webpush ON public.webpush_subscriptions;

  -- Create trigger
  CREATE TRIGGER trg_touch_webpush 
  BEFORE UPDATE ON public.webpush_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public._touch_updated_at();

  -- Enable RLS
  ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

  -- Drop existing policy if exists
  DROP POLICY IF EXISTS "webpush self" ON public.webpush_subscriptions;

  -- Create RLS policy
  CREATE POLICY "webpush self" ON public.webpush_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

END $$;