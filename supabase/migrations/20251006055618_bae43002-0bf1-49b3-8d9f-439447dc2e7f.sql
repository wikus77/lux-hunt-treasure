-- © 2025 M1SSION™ – Web Push Subscriptions: Indices e RLS

-- 1) Indici per performance
CREATE UNIQUE INDEX IF NOT EXISTS webpush_subscriptions_endpoint_key
  ON public.webpush_subscriptions (endpoint);

CREATE INDEX IF NOT EXISTS idx_webpush_user_active
  ON public.webpush_subscriptions (user_id, is_active);

-- 2) Abilita RLS (se non già abilitata)
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3) Policy: authenticated users can insert own subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='webpush_subscriptions' 
      AND policyname='allow_authenticated_insert'
  ) THEN
    CREATE POLICY allow_authenticated_insert
      ON public.webpush_subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- 4) Policy: users can select own subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='webpush_subscriptions' 
      AND policyname='allow_user_select_own'
  ) THEN
    CREATE POLICY allow_user_select_own
      ON public.webpush_subscriptions
      FOR SELECT
      TO authenticated
      USING (user_id IS NULL OR user_id = auth.uid());
  END IF;
END $$;

-- 5) Policy: service_role can do everything (per edge functions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='webpush_subscriptions' 
      AND policyname='allow_service_role_all'
  ) THEN
    CREATE POLICY allow_service_role_all
      ON public.webpush_subscriptions
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;