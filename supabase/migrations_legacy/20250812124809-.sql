-- Secure newsletter_subscribers and prevent email enumeration
-- 1) Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 2) Add a unique constraint on email to prevent duplicates and allow safe upsert/duplicate handling
--    Using a plain unique index to be compatible with PostgREST upsert onConflict('email')
CREATE UNIQUE INDEX IF NOT EXISTS uniq_newsletter_subscribers_email ON public.newsletter_subscribers (email);

-- 3) (Defensive) Remove any potential overly-permissive public read policies if they exist
DROP POLICY IF EXISTS "Allow public read newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can read newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can read newsletter_subscribers" ON public.newsletter_subscribers;

-- 4) Ensure SELECT remains restricted to admins and owners only (no-op if already present)
--    Note: Creating duplicate policies is harmless; Postgres will allow multiple policies that all must pass (OR logic for USING)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers' AND policyname = 'Users can read their own subscriptions'
  ) THEN
    CREATE POLICY "Users can read their own subscriptions"
    ON public.newsletter_subscribers
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers' AND policyname = 'Admins can manage all subscriptions'
  ) THEN
    CREATE POLICY "Admins can manage all subscriptions"
    ON public.newsletter_subscribers
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;