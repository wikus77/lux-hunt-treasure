-- © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
-- Create qr_redemptions table for idempotent QR redeem tracking
CREATE TABLE IF NOT EXISTS public.qr_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  meta JSONB DEFAULT '{}'::jsonb
);

-- Ensure unique code constraint
CREATE UNIQUE INDEX IF NOT EXISTS qr_redemptions_code_key ON public.qr_redemptions(code);

-- View for map markers that includes redemption state without exposing base table
CREATE OR REPLACE VIEW public.qr_codes_map AS
SELECT 
  q.code,
  q.title,
  q.lat,
  q.lng,
  q.is_active,
  EXISTS(SELECT 1 FROM public.qr_redemptions r WHERE r.code = q.code) AS is_redeemed
FROM public.qr_codes q;

-- Grant safe read access to the map view only
GRANT SELECT ON public.qr_codes_map TO anon, authenticated;
-- Revoke direct access to base table if it exists (best-effort, safe)
DO $$ BEGIN
  IF to_regclass('public.qr_codes') IS NOT NULL THEN
    REVOKE ALL ON public.qr_codes FROM anon, authenticated;
  END IF;
END $$;

-- Best-effort: enable RLS on potentially sensitive tables if they exist
DO $$
BEGIN
  IF to_regclass('public.customer_contacts') IS NOT NULL THEN
    ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.pre_registration_users') IS NOT NULL THEN
    ALTER TABLE public.pre_registration_users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;