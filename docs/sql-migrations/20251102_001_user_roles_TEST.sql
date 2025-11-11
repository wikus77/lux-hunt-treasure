-- User Roles System - Verification Tests
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- Run these queries to verify the system is working correctly

-- ============================================================================
-- TEST 1: Verify tables exist
-- ============================================================================
SELECT 
  'user_roles' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = 'user_roles') as exists
UNION ALL
SELECT 
  'admin_logs',
  EXISTS(SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = 'admin_logs')
UNION ALL
SELECT 
  'app_role enum',
  EXISTS(SELECT 1 FROM pg_type 
         WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace);

-- Expected: All rows should show 'exists = true'

-- ============================================================================
-- TEST 2: Verify functions exist
-- ============================================================================
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('has_role', 'current_user_role', 'log_admin_action', 'trigger_log_role_change')
ORDER BY routine_name;

-- Expected: 4 functions, all with security_type = 'DEFINER'

-- ============================================================================
-- TEST 3: Verify RLS is enabled
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_roles', 'admin_logs')
ORDER BY tablename;

-- Expected: Both tables should have rls_enabled = true

-- ============================================================================
-- TEST 4: Verify policies exist
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_roles', 'admin_logs')
ORDER BY tablename, policyname;

-- Expected: At least 5 policies across both tables

-- ============================================================================
-- TEST 5: Check admin role assignments (requires admin access)
-- ============================================================================
SELECT 
  ur.user_id,
  u.email,
  ur.role,
  ur.assigned_at,
  ur.metadata
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin'::public.app_role
ORDER BY ur.assigned_at DESC;

-- Expected: At least 1 row (founder)

-- ============================================================================
-- TEST 6: Test has_role() function (must be logged in)
-- ============================================================================
SELECT 
  auth.uid() as my_user_id,
  public.has_role(auth.uid(), 'admin') as is_admin,
  public.has_role(auth.uid(), 'moderator') as is_moderator,
  public.has_role(auth.uid(), 'agent') as is_agent;

-- Expected: is_admin = true for founder, false for others

-- ============================================================================
-- TEST 7: Test current_user_role() function (must be logged in)
-- ============================================================================
SELECT 
  auth.uid() as my_user_id,
  public.current_user_role() as my_role;

-- Expected: 'admin' for founder, NULL for users without roles

-- ============================================================================
-- TEST 8: Test log_admin_action() function (must be admin)
-- ============================================================================
-- WARNING: This will insert a row in admin_logs
-- Uncomment to test:
-- SELECT public.log_admin_action(
--   'SYSTEM_TEST',
--   auth.uid(),
--   'user_roles',
--   jsonb_build_object('test_timestamp', NOW(), 'test_passed', true)
-- );

-- Expected: Returns UUID of created log entry

-- ============================================================================
-- TEST 9: Verify audit trail captures role changes
-- ============================================================================
SELECT 
  al.id,
  al.action,
  u.email as admin_email,
  target_u.email as target_email,
  al.target_table,
  al.details,
  al.created_at
FROM public.admin_logs al
LEFT JOIN auth.users u ON u.id = al.admin_id
LEFT JOIN auth.users target_u ON target_u.id = al.target_user_id
WHERE al.action IN ('ROLE_ASSIGNED', 'ROLE_REVOKED', 'SYSTEM_TEST')
ORDER BY al.created_at DESC
LIMIT 10;

-- Expected: At least 1 row for founder role assignment

-- ============================================================================
-- TEST 10: Verify indexes exist
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_roles', 'admin_logs')
ORDER BY tablename, indexname;

-- Expected: Multiple indexes (user_id, role, admin_id, created_at, etc.)

-- ============================================================================
-- TEST 11: Performance test - has_role() execution time
-- ============================================================================
EXPLAIN ANALYZE
SELECT public.has_role(auth.uid(), 'admin');

-- Expected: Execution time < 5ms, Index Scan on user_roles

-- ============================================================================
-- TEST 12: Security test - non-admin cannot see other users' roles
-- ============================================================================
-- This should be tested with a non-admin user session
-- Expected: Query returns ONLY the logged-in user's roles, not all roles
SELECT 
  user_id,
  role,
  assigned_at
FROM public.user_roles;

-- If logged in as non-admin: should see only own roles
-- If logged in as admin: should see all roles

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================
SELECT 
  'User Roles System Status' as check_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'user_roles')
      AND EXISTS(SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'admin_logs')
      AND EXISTS(SELECT 1 FROM information_schema.routines 
                WHERE routine_schema = 'public' AND routine_name = 'has_role')
      AND EXISTS(SELECT 1 FROM information_schema.routines 
                WHERE routine_schema = 'public' AND routine_name = 'current_user_role')
      AND EXISTS(SELECT 1 FROM information_schema.routines 
                WHERE routine_schema = 'public' AND routine_name = 'log_admin_action')
    THEN '✅ SYSTEM OPERATIONAL'
    ELSE '❌ SYSTEM INCOMPLETE'
  END as status,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM public.admin_logs) as log_count,
  NOW() as tested_at;

-- Expected: status = '✅ SYSTEM OPERATIONAL', admin_count ≥ 1

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- 1. If all tests pass: Update existing policies to use has_role()
-- 2. Identify tables that need admin-only access
-- 3. Replace old (SELECT role FROM profiles ...) patterns
-- 4. Document which tables have been migrated
-- 5. Monitor admin_logs for suspicious activity

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
