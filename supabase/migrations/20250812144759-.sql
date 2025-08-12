-- © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
-- Cleanup duplicate qr_redemptions and add unique index

DO $$
BEGIN
  IF to_regclass('public.qr_redemptions') IS NOT NULL THEN
    -- delete duplicates keeping the earliest row per code
    WITH ranked AS (
      SELECT id, code, ROW_NUMBER() OVER (PARTITION BY code ORDER BY created_at ASC, id ASC) AS rn
      FROM public.qr_redemptions
    )
    DELETE FROM public.qr_redemptions q
    USING ranked r
    WHERE q.id = r.id AND r.rn > 1;
  END IF;
END $$;

-- Try to create the unique index again
DO $$
BEGIN
  IF to_regclass('public.qr_redemptions') IS NOT NULL THEN
    BEGIN
      CREATE UNIQUE INDEX IF NOT EXISTS qr_redemptions_code_key ON public.qr_redemptions(code);
    EXCEPTION WHEN others THEN
      -- ignore if still failing
      NULL;
    END;
  END IF;
END $$;