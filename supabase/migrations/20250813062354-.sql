-- © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
-- Ensure table exists (idempotent)
DO $$ BEGIN
  IF to_regclass('public.qr_redemptions') IS NULL THEN
    CREATE TABLE public.qr_redemptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL,
      user_id UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      meta JSONB DEFAULT '{}'::jsonb
    );
  END IF;
END $$;

-- Deduplicate existing rows by code, keep earliest
WITH ranked AS (
  SELECT id, code, created_at,
         ROW_NUMBER() OVER (PARTITION BY code ORDER BY created_at) AS rn
  FROM public.qr_redemptions
)
DELETE FROM public.qr_redemptions r
USING ranked d
WHERE r.id = d.id AND d.rn > 1;

-- Create unique index on code (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'qr_redemptions_code_key'
  ) THEN
    CREATE UNIQUE INDEX qr_redemptions_code_key ON public.qr_redemptions(code);
  END IF;
END $$;

-- Create/update view for map display
CREATE OR REPLACE VIEW public.qr_codes_map AS
SELECT 
  q.code,
  q.title,
  q.lat,
  q.lng,
  q.is_active,
  EXISTS(SELECT 1 FROM public.qr_redemptions r WHERE r.code = q.code) AS is_redeemed
FROM public.qr_codes q;

GRANT SELECT ON public.qr_codes_map TO anon, authenticated;

DO $$ BEGIN
  IF to_regclass('public.qr_codes') IS NOT NULL THEN
    REVOKE ALL ON public.qr_codes FROM anon, authenticated;
  END IF;
END $$;