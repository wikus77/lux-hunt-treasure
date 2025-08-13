-- Deduplicate qr_redemptions by code using deterministic UUID ordering
WITH ranked AS (
  SELECT id, code,
         ROW_NUMBER() OVER (PARTITION BY code ORDER BY id) AS rn
  FROM public.qr_redemptions
)
DELETE FROM public.qr_redemptions r
USING ranked d
WHERE r.id = d.id AND d.rn > 1;

-- Ensure unique index exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'qr_redemptions_code_key'
  ) THEN
    CREATE UNIQUE INDEX qr_redemptions_code_key ON public.qr_redemptions(code);
  END IF;
END $$;