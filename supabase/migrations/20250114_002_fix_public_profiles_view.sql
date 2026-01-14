-- ============================================
-- M1SSION™ FIX: Create public_profiles VIEW
-- This VIEW is REQUIRED for non-admin users to see other agents
-- © 2025 Joseph MULÉ – M1SSION™
-- ============================================

-- 1. Drop existing view if broken
DROP VIEW IF EXISTS public_profiles CASCADE;

-- 2. Create the public_profiles VIEW with safe fields only
-- This allows ALL authenticated users to see basic info of other users
CREATE VIEW public_profiles AS
SELECT
  id,
  agent_code,
  nickname,
  full_name,           -- Added for display name
  avatar_url,
  investigative_style,
  rank_id,
  created_at
FROM profiles;

-- 3. Grant SELECT access to authenticated users AND anonymous
GRANT SELECT ON public_profiles TO anon, authenticated;

-- 4. Verify the view was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'public_profiles'
  ) THEN
    RAISE NOTICE '✅ VIEW public_profiles created successfully';
  ELSE
    RAISE EXCEPTION '❌ VIEW public_profiles was NOT created!';
  END IF;
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

