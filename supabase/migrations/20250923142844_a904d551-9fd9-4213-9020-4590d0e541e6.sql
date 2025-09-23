-- 1. Aggiunge colonna updated_at mancante
ALTER TABLE public.webpush_subscriptions 
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Aggiunge constraint NOT NULL su provider (aggiorna prima i null)
UPDATE public.webpush_subscriptions
SET provider = CASE
  WHEN endpoint LIKE '%web.push.apple.com%' THEN 'apns'
  WHEN endpoint LIKE '%fcm.googleapis.com%' THEN 'fcm'
  ELSE 'webpush'
END
WHERE provider IS NULL;

-- 3. Aggiunge constraint CHECK su provider
ALTER TABLE public.webpush_subscriptions 
ALTER COLUMN provider SET NOT NULL;

ALTER TABLE public.webpush_subscriptions 
DROP CONSTRAINT IF EXISTS check_provider_values;

ALTER TABLE public.webpush_subscriptions 
ADD CONSTRAINT check_provider_values CHECK (provider IN ('apns','fcm','webpush'));

-- 4. Crea indici per performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_webpush_user_endpoint 
ON public.webpush_subscriptions(user_id, endpoint);

CREATE INDEX IF NOT EXISTS idx_webpush_active 
ON public.webpush_subscriptions(is_active) WHERE is_active;

-- 5. Funzione e trigger per updated_at
CREATE OR REPLACE FUNCTION public._touch_updated_at() 
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$;

DROP TRIGGER IF EXISTS trg_touch_webpush ON public.webpush_subscriptions;
CREATE TRIGGER trg_touch_webpush 
BEFORE UPDATE ON public.webpush_subscriptions
FOR EACH ROW EXECUTE FUNCTION public._touch_updated_at();

-- 6. Aggiorna RLS policies
DROP POLICY IF EXISTS "webpush self" ON public.webpush_subscriptions;
CREATE POLICY "webpush self" ON public.webpush_subscriptions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);