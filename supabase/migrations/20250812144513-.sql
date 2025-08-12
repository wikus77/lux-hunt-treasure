-- © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
-- Security and QR redemption schema updates (idempotent)

-- 1) Ensure view permissions and revoke base table access
DO $$
BEGIN
  IF to_regclass('public.qr_codes') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.qr_codes FROM anon;
  END IF;
  PERFORM 1;
END $$;

GRANT USAGE ON SCHEMA public TO anon;
DO $$
BEGIN
  IF to_regclass('public.qr_codes_map') IS NOT NULL THEN
    EXECUTE 'GRANT SELECT ON public.qr_codes_map TO anon';
    EXECUTE 'ALTER VIEW public.qr_codes_map SET (security_barrier = on)';
  END IF;
END $$;

-- 2) Create qr_redemptions table and unique index
CREATE TABLE IF NOT EXISTS public.qr_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  meta jsonb DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS qr_redemptions_code_key ON public.qr_redemptions(code);

-- Enable RLS (minimal; inserts happen via service role in Edge Function)
ALTER TABLE public.qr_redemptions ENABLE ROW LEVEL SECURITY;

-- 3) Optional security fixes for existing tables (if they exist)
DO $$
BEGIN
  IF to_regclass('public.customer_contacts') IS NOT NULL THEN
    ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customer_contacts' AND policyname='sr read contacts'
    ) THEN
      CREATE POLICY "sr read contacts" ON public.customer_contacts FOR SELECT
        USING ((auth.jwt()->>'role')='service_role');
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customer_contacts' AND policyname='sr write contacts'
    ) THEN
      CREATE POLICY "sr write contacts" ON public.customer_contacts FOR ALL
        USING ((auth.jwt()->>'role')='service_role') WITH CHECK (true);
    END IF;
    REVOKE ALL ON public.customer_contacts FROM anon, authenticated;
  END IF;

  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='sr read newsletter'
    ) THEN
      CREATE POLICY "sr read newsletter" ON public.newsletter_subscribers FOR SELECT
        USING ((auth.jwt()->>'role')='service_role');
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='sr write newsletter'
    ) THEN
      CREATE POLICY "sr write newsletter" ON public.newsletter_subscribers FOR ALL
        USING ((auth.jwt()->>'role')='service_role') WITH CHECK (true);
    END IF;
    REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;
  END IF;

  IF to_regclass('public.pre_registration_users') IS NOT NULL THEN
    ALTER TABLE public.pre_registration_users ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pre_registration_users' AND policyname='sr read prereg'
    ) THEN
      CREATE POLICY "sr read prereg" ON public.pre_registration_users FOR SELECT
        USING ((auth.jwt()->>'role')='service_role');
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pre_registration_users' AND policyname='sr write prereg'
    ) THEN
      CREATE POLICY "sr write prereg" ON public.pre_registration_users FOR ALL
        USING ((auth.jwt()->>'role')='service_role') WITH CHECK (true);
    END IF;
    REVOKE ALL ON public.pre_registration_users FROM anon, authenticated;
  END IF;
END $$;
