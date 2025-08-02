-- 🚨 EMERGENCY RLS RESET: Force drop all policies and recreate safely
-- Step 1: Get list of all current policies on profiles table (for debugging)
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 2: Force drop ALL policies with CASCADE
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles CASCADE;

-- Step 3: Also drop any other potential policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles CASCADE';
    END LOOP;
END$$;