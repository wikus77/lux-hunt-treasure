-- Fix: column mission_enrollments.id does not exist (sql_state 42703).
-- Old schema (mission_id, user_id, joined_at) may exist; app expects id, state, created_at.
-- Add missing columns if the table has the legacy schema.

DO $$
BEGIN
  -- Add id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.mission_enrollments
      ADD COLUMN id UUID DEFAULT gen_random_uuid() NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_enrollments_id ON public.mission_enrollments (id);
  END IF;

  -- Add state if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'state'
  ) THEN
    ALTER TABLE public.mission_enrollments ADD COLUMN state TEXT DEFAULT 'active';
  END IF;

  -- Add created_at if missing (some schemas use joined_at)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.mission_enrollments ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'joined_at') THEN
      UPDATE public.mission_enrollments SET created_at = joined_at WHERE created_at IS NULL;
    END IF;
  END IF;
END $$;
