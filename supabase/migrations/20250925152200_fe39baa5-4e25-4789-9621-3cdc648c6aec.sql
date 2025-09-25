-- Migration: Add source column to user_map_areas if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_map_areas' AND column_name='source'
  ) THEN
    ALTER TABLE public.user_map_areas ADD COLUMN source TEXT DEFAULT 'buzz_map';
    CREATE INDEX IF NOT EXISTS idx_user_map_areas_source ON public.user_map_areas(source);
  END IF;
END $$;