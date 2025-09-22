-- 1) Tabella webpush_subscriptions (se non esiste)
CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  provider text CHECK (provider IN ('fcm','apns','mozilla','unknown')) DEFAULT 'unknown',
  keys jsonb NOT NULL, -- {"p256dh":"...","auth":"..."}
  ua text,
  platform text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Indici per performance
CREATE INDEX IF NOT EXISTS webpush_subs_user_created_idx ON public.webpush_subscriptions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS webpush_subs_endpoint_idx ON public.webpush_subscriptions USING gin (to_tsvector('simple', endpoint));
CREATE INDEX IF NOT EXISTS webpush_subs_provider_idx ON public.webpush_subscriptions(provider);

-- 3) RLS
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy per lettura proprie subscriptions
DROP POLICY IF EXISTS "read own subs" ON public.webpush_subscriptions;
CREATE POLICY "read own subs" ON public.webpush_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy per inserimento via service role
DROP POLICY IF EXISTS "insert service role only" ON public.webpush_subscriptions;
CREATE POLICY "insert service role only" ON public.webpush_subscriptions
  FOR INSERT WITH CHECK (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- Policy per update via service role
DROP POLICY IF EXISTS "update service role only" ON public.webpush_subscriptions;
CREATE POLICY "update service role only" ON public.webpush_subscriptions
  FOR UPDATE USING (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- 4) Vista: ultimo endpoint per utente, preferendo APNs
CREATE OR REPLACE VIEW public.webpush_latest_per_user AS
WITH ranked AS (
  SELECT *,
         row_number() OVER (
           PARTITION BY user_id
           ORDER BY (CASE WHEN provider='apns' THEN 0 WHEN provider='fcm' THEN 1 ELSE 2 END),
                    created_at DESC
         ) AS rn
  FROM public.webpush_subscriptions
)
SELECT * FROM ranked WHERE rn = 1;

-- 5) Trigger per updated_at
CREATE OR REPLACE FUNCTION update_webpush_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_webpush_subscriptions_updated_at_trigger ON public.webpush_subscriptions;
CREATE TRIGGER update_webpush_subscriptions_updated_at_trigger
  BEFORE UPDATE ON public.webpush_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_webpush_subscriptions_updated_at();