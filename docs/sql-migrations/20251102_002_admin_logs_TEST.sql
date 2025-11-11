-- Admin Logs Extended System - Test Suite (A2)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- Comprehensive tests for automatic audit logging system

-- ============================================================================
-- TEST 1: Verify extended schema exists
-- ============================================================================
SELECT 
  'admin_logs extended schema' as test_name,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_logs' 
      AND column_name = 'record_id'
    ) AND EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_logs' 
      AND column_name = 'old_data'
    ) AND EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_logs' 
      AND column_name = 'new_data'
    )
    THEN '✅ PASS: All extended columns exist'
    ELSE '❌ FAIL: Missing columns'
  END as result;

-- Expected: ✅ PASS

-- ============================================================================
-- TEST 2: Verify trigger function exists
-- ============================================================================
SELECT 
  'trigger_log_admin_operation function' as test_name,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'trigger_log_admin_operation'
      AND security_type = 'DEFINER'
    )
    THEN '✅ PASS: Trigger function exists with SECURITY DEFINER'
    ELSE '❌ FAIL: Function missing or wrong security type'
  END as result;

-- Expected: ✅ PASS

-- ============================================================================
-- TEST 3: Verify triggers are attached to sensitive tables
-- ============================================================================
SELECT 
  event_object_table as table_name,
  trigger_name,
  action_statement,
  CASE 
    WHEN action_statement LIKE '%trigger_log_admin_operation%'
    THEN '✅ Attached'
    ELSE '⚠️ Wrong function'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;

-- Expected: Multiple rows with ✅ status for tables like:
-- profiles, prizes, user_clues, user_xp, agent_ranks, etc.

-- ============================================================================
-- TEST 4: Verify views exist
-- ============================================================================
SELECT 
  'admin_logs_readable view' as view_name,
  EXISTS(
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'admin_logs_readable'
  ) as exists
UNION ALL
SELECT 
  'admin_logs_stats view',
  EXISTS(
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'admin_logs_stats'
  );

-- Expected: Both should show 'exists = true'

-- ============================================================================
-- TEST 5: Verify helper functions exist
-- ============================================================================
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'log_custom_admin_action',
    'cleanup_old_admin_logs',
    'can_view_admin_logs'
  )
ORDER BY routine_name;

-- Expected: 3 functions, all with SECURITY DEFINER

-- ============================================================================
-- TEST 6: Test automatic logging on INSERT (requires admin role)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Run only if you are logged in as admin

-- Step 1: Count existing logs
-- SELECT COUNT(*) as log_count_before FROM public.admin_logs;

-- Step 2: Insert test record in a monitored table (if prizes table exists)
-- INSERT INTO public.prizes (id, name, description, value)
-- VALUES (
--   gen_random_uuid(),
--   'TEST_PRIZE_A2',
--   'Test prize for admin logging verification',
--   100
-- );

-- Step 3: Count logs after insert
-- SELECT COUNT(*) as log_count_after FROM public.admin_logs;

-- Step 4: View the new log entry
-- SELECT 
--   action,
--   target_table,
--   record_id,
--   new_data->>'name' as prize_name,
--   created_at
-- FROM public.admin_logs
-- WHERE target_table = 'prizes'
-- ORDER BY created_at DESC
-- LIMIT 1;

-- Expected: log_count_after = log_count_before + 1
-- Expected: action = 'INSERT on prizes'
-- Expected: new_data contains prize details

-- ============================================================================
-- TEST 7: Test automatic logging on UPDATE (requires admin role)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Run only if you are logged in as admin

-- Step 1: Update the test prize
-- UPDATE public.prizes 
-- SET value = 200, description = 'Updated test prize'
-- WHERE name = 'TEST_PRIZE_A2';

-- Step 2: View the UPDATE log
-- SELECT 
--   action,
--   target_table,
--   record_id,
--   old_data->>'value' as old_value,
--   new_data->>'value' as new_value,
--   old_data->>'description' as old_description,
--   new_data->>'description' as new_description,
--   created_at
-- FROM public.admin_logs
-- WHERE target_table = 'prizes'
--   AND action LIKE '%UPDATE%'
-- ORDER BY created_at DESC
-- LIMIT 1;

-- Expected: action = 'UPDATE on prizes'
-- Expected: old_value = '100', new_value = '200'
-- Expected: Both old_data and new_data populated

-- ============================================================================
-- TEST 8: Test automatic logging on DELETE (requires admin role)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Run only if you are logged in as admin

-- Step 1: Delete the test prize
-- DELETE FROM public.prizes WHERE name = 'TEST_PRIZE_A2';

-- Step 2: View the DELETE log
-- SELECT 
--   action,
--   target_table,
--   record_id,
--   old_data->>'name' as prize_name,
--   old_data->>'value' as prize_value,
--   new_data,  -- Should be NULL for DELETE
--   created_at
-- FROM public.admin_logs
-- WHERE target_table = 'prizes'
--   AND action LIKE '%DELETE%'
-- ORDER BY created_at DESC
-- LIMIT 1;

-- Expected: action = 'DELETE on prizes'
-- Expected: old_data contains prize details
-- Expected: new_data IS NULL

-- ============================================================================
-- TEST 9: Test manual logging with log_custom_admin_action
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Run only if you are logged in as admin

-- SELECT public.log_custom_admin_action(
--   'MANUAL_TEST_A2',
--   jsonb_build_object(
--     'test_timestamp', NOW(),
--     'test_passed', true,
--     'notes', 'Manual logging test for A2 system'
--   )
-- );

-- View the manual log entry
-- SELECT 
--   action,
--   target_table,  -- Should be NULL for manual logs
--   details,
--   created_at
-- FROM public.admin_logs
-- WHERE action = 'MANUAL_TEST_A2'
-- ORDER BY created_at DESC
-- LIMIT 1;

-- Expected: Log entry created with custom details

-- ============================================================================
-- TEST 10: Test admin_logs_readable view
-- ============================================================================
SELECT 
  action,
  target_table,
  admin_email,
  changed_fields,
  created_at
FROM public.admin_logs_readable
WHERE created_at >= CURRENT_DATE - 1  -- Last 24 hours
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Human-readable view with email addresses
-- Expected: changed_fields shows only modified columns for UPDATE operations

-- ============================================================================
-- TEST 11: Test admin_logs_stats view
-- ============================================================================
SELECT 
  log_date,
  target_table,
  operation,
  operation_count,
  unique_admins
FROM public.admin_logs_stats
WHERE log_date >= CURRENT_DATE - 7  -- Last 7 days
ORDER BY log_date DESC, operation_count DESC
LIMIT 20;

-- Expected: Aggregated statistics by day/table/operation
-- Expected: operation IN ('INSERT', 'UPDATE', 'DELETE')

-- ============================================================================
-- TEST 12: Test RLS policies (non-admin user should NOT see logs)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Log in as non-admin user and run:

-- SELECT COUNT(*) as visible_logs FROM public.admin_logs;

-- Expected for non-admin: 0 rows (or only their own if moderator)
-- Expected for admin: All logs visible

-- ============================================================================
-- TEST 13: Test moderator can view own logs only
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Log in as user with 'moderator' role

-- Step 1: Create a test log as moderator
-- SELECT public.log_custom_admin_action('MODERATOR_TEST', '{"test": true}'::jsonb);

-- Step 2: Try to view all logs
-- SELECT COUNT(*) as my_logs 
-- FROM public.admin_logs 
-- WHERE admin_id = auth.uid();

-- SELECT COUNT(*) as all_logs 
-- FROM public.admin_logs;

-- Expected: my_logs = 1 (or more if moderator has other actions)
-- Expected: all_logs = my_logs (RLS should filter to own logs only)

-- ============================================================================
-- TEST 14: Test logs are immutable (UPDATE should fail)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - This should FAIL as expected

-- UPDATE public.admin_logs
-- SET action = 'TAMPERED'
-- WHERE id = (SELECT id FROM public.admin_logs LIMIT 1);

-- Expected: ERROR - Policy violation (UPDATE not allowed)

-- ============================================================================
-- TEST 15: Test logs cannot be deleted directly (DELETE should fail)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - This should FAIL as expected

-- DELETE FROM public.admin_logs
-- WHERE id = (SELECT id FROM public.admin_logs LIMIT 1);

-- Expected: ERROR - Policy violation (DELETE not allowed)

-- ============================================================================
-- TEST 16: Test cleanup function (admin only)
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Run only if you are admin and want to test cleanup

-- Step 1: Create old test log (simulate old data)
-- INSERT INTO public.admin_logs (admin_id, action, created_at)
-- VALUES (
--   auth.uid(),
--   'OLD_TEST_LOG',
--   NOW() - INTERVAL '400 days'
-- );

-- Step 2: Run cleanup (delete logs older than 365 days)
-- SELECT public.cleanup_old_admin_logs(365);

-- Step 3: Verify old log was deleted
-- SELECT COUNT(*) as old_logs
-- FROM public.admin_logs
-- WHERE action = 'OLD_TEST_LOG';

-- Expected: Cleanup function returns deleted count
-- Expected: old_logs = 0 (deleted)
-- Expected: Cleanup action itself logged in admin_logs

-- ============================================================================
-- TEST 17: Performance test - trigger overhead
-- ============================================================================
-- Measure time for INSERT with and without logging

-- Without logging (on unmonitored table):
-- EXPLAIN ANALYZE
-- INSERT INTO public.some_unmonitored_table (...) VALUES (...);

-- With logging (on monitored table as admin):
-- EXPLAIN ANALYZE
-- INSERT INTO public.prizes (...) VALUES (...);

-- Expected: Trigger overhead < 5ms
-- Expected: No significant performance degradation

-- ============================================================================
-- TEST 18: Verify no logs created for non-admin users
-- ============================================================================
-- ⚠️ INTERACTIVE TEST - Log in as regular user (not admin/moderator)

-- Step 1: Insert data in a table user has access to
-- (e.g., update own profile)

-- Step 2: Check if log was created
-- SELECT COUNT(*) as user_logs
-- FROM public.admin_logs
-- WHERE admin_id = auth.uid();

-- Expected: user_logs = 0 (regular users don't trigger audit logs)

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================
SELECT 
  'Admin Logs Extended System (A2) Status' as check_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'admin_logs' 
                AND column_name IN ('record_id', 'old_data', 'new_data'))
      AND EXISTS(SELECT 1 FROM information_schema.routines 
                WHERE routine_schema = 'public' 
                AND routine_name = 'trigger_log_admin_operation')
      AND EXISTS(SELECT 1 FROM information_schema.views 
                WHERE table_schema = 'public' 
                AND table_name = 'admin_logs_readable')
      AND EXISTS(SELECT 1 FROM information_schema.triggers 
                WHERE trigger_schema = 'public' 
                AND trigger_name LIKE 'audit_%')
    THEN '✅ SYSTEM OPERATIONAL'
    ELSE '❌ SYSTEM INCOMPLETE'
  END as status,
  (SELECT COUNT(*) FROM information_schema.triggers 
   WHERE trigger_schema = 'public' AND trigger_name LIKE 'audit_%') as trigger_count,
  (SELECT COUNT(*) FROM public.admin_logs) as total_logs,
  NOW() as tested_at;

-- Expected: 
-- - status = '✅ SYSTEM OPERATIONAL'
-- - trigger_count > 10 (depends on how many tables exist)
-- - total_logs >= 0 (depends on usage)

-- ============================================================================
-- CLEANUP TEST DATA (optional)
-- ============================================================================
-- Run this to clean up any test data created during verification

-- DELETE FROM public.prizes WHERE name LIKE 'TEST_PRIZE_%';
-- DELETE FROM public.admin_logs WHERE action LIKE '%TEST%';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
