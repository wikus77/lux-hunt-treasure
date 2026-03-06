-- Fix delete-account 500: FK admin_logs -> auth.users blocks deleteUser.
-- Solution: ON DELETE SET NULL so logs are preserved and user can be deleted.
-- Rollback: see reports/DELETE_ACCOUNT_FK_ADMIN_LOGS_FIX.md
-- If your schema uses admin_id instead of user_id, run FASE 1 query and apply the admin_id variant from the report.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_logs' AND column_name = 'user_id') THEN
    ALTER TABLE public.admin_logs ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_user_id_fkey;
    ALTER TABLE public.admin_logs
      ADD CONSTRAINT admin_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'admin_logs user_id FK fix skipped (column or constraint may differ): %', SQLERRM;
END $$;
