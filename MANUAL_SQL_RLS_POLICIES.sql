-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- RLS Policies & GRANT for BUZZ / BUZZ MAP
-- 
-- ⚠️ EXECUTE THIS SQL MANUALLY IN SUPABASE SQL EDITOR (PRODUCTION)
--
-- This script:
-- 1. Grants EXECUTE on RPC functions to authenticated users
-- 2. Creates RLS policies for user_map_areas, buzz_map_actions, user_buzz_counter
-- 3. Uses DO blocks to avoid errors if policies already exist

-- ============================================================
-- 1) GRANT RPC EXECUTE PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION public.increment_buzz_counter(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_buzz_price(uuid) TO authenticated;

-- ============================================================
-- 2) RLS POLICY: user_map_areas (INSERT own areas)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_own_area'
      AND n.nspname = 'public'
      AND c.relname = 'user_map_areas'
  ) THEN
    EXECUTE $SQL$
      CREATE POLICY insert_own_area ON public.user_map_areas
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id)
    $SQL$;
    RAISE NOTICE 'Created policy: insert_own_area on user_map_areas';
  ELSE
    RAISE NOTICE 'Policy insert_own_area already exists on user_map_areas';
  END IF;
END$$;

-- ============================================================
-- 3) RLS POLICY: buzz_map_actions (INSERT action logs)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_own_buzz_action'
      AND n.nspname = 'public'
      AND c.relname = 'buzz_map_actions'
  ) THEN
    EXECUTE $SQL$
      CREATE POLICY insert_own_buzz_action ON public.buzz_map_actions
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id)
    $SQL$;
    RAISE NOTICE 'Created policy: insert_own_buzz_action on buzz_map_actions';
  ELSE
    RAISE NOTICE 'Policy insert_own_buzz_action already exists on buzz_map_actions';
  END IF;
END$$;

-- ============================================================
-- 4) RLS POLICY: user_buzz_counter (UPSERT daily counter)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'upsert_own_buzz_counter'
      AND n.nspname = 'public'
      AND c.relname = 'user_buzz_counter'
  ) THEN
    EXECUTE $SQL$
      CREATE POLICY upsert_own_buzz_counter ON public.user_buzz_counter
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)
    $SQL$;
    RAISE NOTICE 'Created policy: upsert_own_buzz_counter on user_buzz_counter';
  ELSE
    RAISE NOTICE 'Policy upsert_own_buzz_counter already exists on user_buzz_counter';
  END IF;
END$$;

-- ============================================================
-- OPTIONAL: Enable RLS on tables (if not already enabled)
-- ============================================================
-- Uncomment these lines if RLS is not yet enabled on these tables:

-- ALTER TABLE public.user_map_areas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.buzz_map_actions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_buzz_counter ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify policies were created:

-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('user_map_areas', 'buzz_map_actions', 'user_buzz_counter')
-- ORDER BY tablename, policyname;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
