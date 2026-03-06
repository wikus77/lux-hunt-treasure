-- Fix delete-account 500: storage.objects.owner_id FK blocks auth.users delete.
-- Apply ONLY if FASE 1 forensics shows constraint storage_objects_owner_fkey (or similar).
-- Rollback: DROP the new constraint and re-add with ON DELETE RESTRICT (Supabase default).
-- See reports/INCIDENT_DELETE_500_AUTH_DELETE_FORENSICS_AND_FIX.md

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname LIKE 'storage_objects%owner%'
      AND conrelid = 'storage.objects'::regclass
  ) THEN
    ALTER TABLE storage.objects DROP CONSTRAINT IF EXISTS storage_objects_owner_fkey;
    ALTER TABLE storage.objects
      ADD CONSTRAINT storage_objects_owner_fkey
      FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'storage.objects owner FK set to ON DELETE CASCADE';
  ELSE
    RAISE NOTICE 'storage_objects owner FK not found or already CASCADE, skip';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'storage objects FK fix skipped: %', SQLERRM;
END $$;
