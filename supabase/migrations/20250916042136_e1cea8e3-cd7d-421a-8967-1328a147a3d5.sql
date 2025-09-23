-- FIX #1: Aggiungere RLS policy mancante per SELECT subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='subscriptions'
      AND policyname='subscriptions_select_own'
  ) THEN
    CREATE POLICY "subscriptions_select_own"
    ON public.subscriptions
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;