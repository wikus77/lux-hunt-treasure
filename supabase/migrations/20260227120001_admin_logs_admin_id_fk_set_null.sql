-- If admin_logs uses admin_id (not user_id) to reference auth.users, fix that FK for delete-account.
-- Run after 20260227120000; one of the two will apply depending on schema.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_logs' AND column_name = 'admin_id') THEN
    ALTER TABLE public.admin_logs ALTER COLUMN admin_id DROP NOT NULL;
    ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;
    ALTER TABLE public.admin_logs
      ADD CONSTRAINT admin_logs_admin_id_fkey
      FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'admin_logs admin_id FK fix skipped: %', SQLERRM;
END $$;
