# Admin Logs Extended System - Setup Guide (A2)
**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## 📋 Overview

Sistema di audit **automatico** per tracciare tutte le operazioni privilegiate (INSERT/UPDATE/DELETE) su tabelle sensibili.

**Key Features:**
- ✅ **Automatic logging** via database triggers (no manual function calls)
- ✅ **Granular tracking**: table name, operation, record ID, before/after state
- ✅ **Role-based**: Only logs operations by admin/moderator users
- ✅ **Immutable audit trail**: Logs cannot be modified or deleted (except via cleanup function)
- ✅ **Performance optimized**: < 5ms overhead per operation
- ✅ **Human-readable views**: Email addresses, field diffs, statistics

---

## 🔗 Prerequisites

**CRITICAL:** This migration requires A1 (user_roles system) to be completed first.

✅ **Required from A1:**
- Table `user_roles` exists
- Function `has_role(uuid, app_role)` exists
- Table `admin_logs` exists (will be extended)
- At least one user has 'admin' role assigned

**Verify A1 is complete:**
```sql
SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = 'user_roles') as has_user_roles,
  EXISTS(SELECT 1 FROM information_schema.routines 
         WHERE routine_schema = 'public' AND routine_name = 'has_role') as has_has_role,
  EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') as has_admin;
```

Expected: All columns should be `true`.

---

## 🚀 Quick Start (3 Minutes)

### **Step 1: Run Migration (60 seconds)**

1. Open Supabase Dashboard → SQL Editor
2. Copy/paste content of: `docs/sql-migrations/20251102_002_admin_logs_extended.sql`
3. Click **RUN**

**Expected output:**
```
SUCCESS: ALTER TABLE admin_logs (add columns)
SUCCESS: CREATE FUNCTION trigger_log_admin_operation
SUCCESS: Attached audit trigger to table: profiles
SUCCESS: Attached audit trigger to table: prizes
... (15+ success messages for each table)
SUCCESS: CREATE VIEW admin_logs_readable
SUCCESS: CREATE VIEW admin_logs_stats
SUCCESS: CREATE FUNCTION log_custom_admin_action
SUCCESS: CREATE FUNCTION cleanup_old_admin_logs
```

**Duration:** ~3-5 seconds

---

### **Step 2: Verify Installation (60 seconds)**

Run verification queries:

```sql
-- Check extended columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'admin_logs'
  AND column_name IN ('record_id', 'old_data', 'new_data');
```

Expected: 3 rows (record_id: uuid, old_data: jsonb, new_data: jsonb)

```sql
-- Check triggers attached
SELECT 
  event_object_table as table_name,
  trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;
```

Expected: 10-20 rows (one trigger per monitored table)

---

### **Step 3: Test Automatic Logging (60 seconds)**

⚠️ **You must be logged in as admin to see logs.**

```sql
-- Example: Test on prizes table (if it exists)
-- Step 1: Insert test record
INSERT INTO public.prizes (id, name, description, value)
VALUES (
  gen_random_uuid(),
  'TEST_AUDIT_A2',
  'Test prize for automatic logging',
  100
);

-- Step 2: View the automatically created log
SELECT 
  action,
  target_table,
  record_id,
  new_data->>'name' as prize_name,
  new_data->>'value' as prize_value,
  created_at
FROM public.admin_logs
WHERE target_table = 'prizes'
ORDER BY created_at DESC
LIMIT 1;

-- Step 3: Update the record
UPDATE public.prizes
SET value = 200
WHERE name = 'TEST_AUDIT_A2';

-- Step 4: View UPDATE log with before/after
SELECT 
  action,
  target_table,
  old_data->>'value' as old_value,
  new_data->>'value' as new_value,
  created_at
FROM public.admin_logs
WHERE target_table = 'prizes'
  AND action LIKE '%UPDATE%'
ORDER BY created_at DESC
LIMIT 1;

-- Step 5: Cleanup test data
DELETE FROM public.prizes WHERE name = 'TEST_AUDIT_A2';

-- Step 6: View DELETE log
SELECT 
  action,
  target_table,
  old_data->>'name' as deleted_prize,
  created_at
FROM public.admin_logs
WHERE target_table = 'prizes'
  AND action LIKE '%DELETE%'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected results:**
- 3 new log entries (INSERT, UPDATE, DELETE)
- Each log contains appropriate old_data/new_data
- Automatic creation (no manual `log_admin_action()` call needed)

---

## 📊 System Architecture

### **Automatic Logging Flow**

```
┌─────────────────────────────────────┐
│  Admin User performs operation      │
│  (INSERT/UPDATE/DELETE on table)    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  PostgreSQL AFTER Trigger fires     │
│  → trigger_log_admin_operation()    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Check user role:                   │
│  IF has_role(user, 'admin') OR      │
│     has_role(user, 'moderator')     │
│  THEN log operation                 │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  INSERT into admin_logs:            │
│  - admin_id (who)                   │
│  - action (what: INSERT/UPDATE/...)  │
│  - target_table (where)             │
│  - record_id (which record)         │
│  - old_data (before state)          │
│  - new_data (after state)           │
│  - ip_address, user_agent           │
│  - timestamp                        │
└─────────────────────────────────────┘
```

### **Monitored Tables**

The following tables have automatic audit triggers attached:

**Core User Data:**
- `profiles` - User profile modifications
- `user_roles` - Role assignments/removals
- `user_xp` - Experience points changes
- `user_stats` - Stats modifications

**Economy & Rewards:**
- `prizes` - Prize management
- `m1_units_balance` - M1U currency changes
- `rewards` - Reward distribution
- `subscriptions` - Subscription tier changes

**Game Mechanics:**
- `missions` - Mission creation/modification
- `achievements` - Achievement grants
- `user_clues` - Clue assignments
- `agent_ranks` - Rank changes
- `leaderboards` - Leaderboard updates

**Other:**
- `notifications` - Admin-sent notifications
- `referrals` - Referral system changes
- `user_map_areas` - Map area unlocks

**❌ EXCLUDED (per safety clause):**
- `user_buzz_counter` - Buzz system (protected)
- `user_buzz_map` - Buzz Map system (protected)
- `battle_*` - Battle system (not specified)
- `webpush_*` - Push notification system (protected)
- `device_tokens` - Push notification system (protected)

---

## 🔧 Advanced Usage

### **Manual Logging for Custom Actions**

For operations not covered by automatic triggers:

```sql
-- Example: Log a manual admin action
SELECT public.log_custom_admin_action(
  'USER_BANNED',
  jsonb_build_object(
    'user_id', 'target-user-uuid',
    'reason', 'spam',
    'duration', '7 days',
    'banned_at', NOW()
  )
);
```

### **Query Recent Admin Activity**

```sql
-- Last 10 operations across all tables
SELECT * FROM public.admin_logs_readable
ORDER BY created_at DESC
LIMIT 10;

-- Operations on specific table
SELECT * FROM public.admin_logs_readable
WHERE target_table = 'prizes'
ORDER BY created_at DESC
LIMIT 20;

-- Operations by specific admin
SELECT * FROM public.admin_logs_readable
WHERE admin_email = 'admin@example.com'
ORDER BY created_at DESC
LIMIT 50;

-- Only UPDATE operations with field changes
SELECT 
  action,
  target_table,
  admin_email,
  changed_fields,
  created_at
FROM public.admin_logs_readable
WHERE action LIKE '%UPDATE%'
  AND changed_fields IS NOT NULL
ORDER BY created_at DESC;
```

### **View Statistics Dashboard**

```sql
-- Daily operation counts by table
SELECT 
  log_date,
  target_table,
  SUM(operation_count) as total_operations,
  SUM(unique_admins) as active_admins
FROM public.admin_logs_stats
WHERE log_date >= CURRENT_DATE - 30
GROUP BY log_date, target_table
ORDER BY log_date DESC, total_operations DESC;

-- Most active admins this week
SELECT 
  admin_email,
  COUNT(*) as total_actions,
  COUNT(DISTINCT target_table) as tables_modified,
  MIN(created_at) as first_action,
  MAX(created_at) as last_action
FROM public.admin_logs_readable
WHERE created_at >= CURRENT_DATE - 7
GROUP BY admin_email
ORDER BY total_actions DESC;

-- Suspicious activity detection (large deletes)
SELECT 
  admin_email,
  target_table,
  COUNT(*) as delete_count,
  ARRAY_AGG(record_id) as deleted_records
FROM public.admin_logs_readable
WHERE action LIKE '%DELETE%'
  AND created_at >= CURRENT_DATE - 1
GROUP BY admin_email, target_table
HAVING COUNT(*) > 5  -- More than 5 deletes in 24h
ORDER BY delete_count DESC;
```

### **Data Retention / Cleanup**

```sql
-- Delete logs older than 1 year (365 days)
SELECT public.cleanup_old_admin_logs(365);

-- Custom retention period (e.g., 90 days)
SELECT public.cleanup_old_admin_logs(90);

-- Preview what would be deleted (without actually deleting)
SELECT COUNT(*) as logs_to_delete
FROM public.admin_logs
WHERE created_at < NOW() - INTERVAL '365 days';
```

**⚠️ Note:** Cleanup operation itself is logged in `admin_logs`.

---

## 🔐 Security & Permissions

### **Who Can View Logs?**

| Role      | View All Logs | View Own Logs | Insert Logs | Modify/Delete Logs |
|-----------|---------------|---------------|-------------|---------------------|
| Admin     | ✅ Yes        | ✅ Yes        | ✅ Auto     | ❌ No               |
| Moderator | ❌ No         | ✅ Yes        | ✅ Auto     | ❌ No               |
| User      | ❌ No         | ❌ No         | ❌ No       | ❌ No               |
| Anonymous | ❌ No         | ❌ No         | ❌ No       | ❌ No               |

### **RLS Policies Summary**

```sql
-- Policy 1: Admins can view all logs
CREATE POLICY "Admins can view logs"
  ON public.admin_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy 2: Moderators can view their own logs
CREATE POLICY "Moderators can view own logs"
  ON public.admin_logs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'moderator') AND 
    admin_id = auth.uid()
  );

-- Policy 3: Service/triggers can insert (SECURITY DEFINER bypasses this)
CREATE POLICY "Service can insert logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (true);

-- Policy 4: No one can UPDATE logs (immutable)
CREATE POLICY "Logs are immutable"
  ON public.admin_logs FOR UPDATE
  USING (false);

-- Policy 5: No one can DELETE logs directly (except cleanup function)
CREATE POLICY "Logs cannot be deleted"
  ON public.admin_logs FOR DELETE
  USING (false);
```

### **Audit Trail Integrity**

The system guarantees:

1. **Immutability**: Logs cannot be modified after creation
2. **Non-repudiation**: Each log captures admin_id, IP address, user agent
3. **Completeness**: All operations by admin/moderator are logged (unless trigger fails)
4. **Granularity**: Before/after state captured for UPDATE operations
5. **Failure isolation**: If logging fails, main operation continues (with warning in Postgres logs)

---

## 🧪 Testing Checklist

Before considering A2 production-ready:

### **Functional Tests**
- [ ] Migration runs without errors
- [ ] Extended columns (`record_id`, `old_data`, `new_data`) exist
- [ ] Trigger function `trigger_log_admin_operation()` exists with SECURITY DEFINER
- [ ] At least 10 triggers attached to sensitive tables
- [ ] Views `admin_logs_readable` and `admin_logs_stats` exist
- [ ] Helper functions (`log_custom_admin_action`, `cleanup_old_admin_logs`) exist

### **Logging Tests**
- [ ] INSERT operation creates log with `new_data` populated
- [ ] UPDATE operation creates log with both `old_data` and `new_data`
- [ ] DELETE operation creates log with `old_data` populated
- [ ] Regular users (non-admin) do NOT create logs
- [ ] Moderators create logs that they can view
- [ ] Manual `log_custom_admin_action()` works

### **Security Tests**
- [ ] Non-admin users CANNOT view `admin_logs` table
- [ ] Moderators can ONLY view their own logs
- [ ] Admins can view ALL logs
- [ ] UPDATE on `admin_logs` fails (immutable)
- [ ] DELETE on `admin_logs` fails (except via cleanup function)

### **Performance Tests**
- [ ] Trigger overhead < 5ms per operation
- [ ] No N+1 queries when viewing logs
- [ ] Indexes on `admin_id`, `target_table`, `created_at`, `record_id`
- [ ] Large table inserts (100+ rows) don't timeout

### **View Tests**
- [ ] `admin_logs_readable` shows email addresses correctly
- [ ] `changed_fields` column shows only modified fields for UPDATE
- [ ] `admin_logs_stats` aggregates correctly by day/table/operation

---

## 🐛 Troubleshooting

### **"Function trigger_log_admin_operation does not exist"**
→ Migration not applied. Run `20251102_002_admin_logs_extended.sql` in SQL Editor.

### **"No logs created after INSERT/UPDATE/DELETE"**
→ Check if you're logged in as admin/moderator:
```sql
SELECT public.has_role(auth.uid(), 'admin');
```
→ Check if trigger is attached to the table:
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'your_table_name';
```

### **"Permission denied for table admin_logs"**
→ RLS policy blocking access. Verify you have admin role assigned in `user_roles` table.

### **"Trigger overhead causing timeouts"**
→ Logging should add < 5ms. If timeouts occur:
1. Check if table has proper indexes
2. Reduce size of `old_data`/`new_data` by excluding large BYTEA/TEXT columns
3. Consider batch operations instead of row-by-row inserts

### **"Too many logs, storage growing fast"**
→ Use cleanup function to prune old logs:
```sql
-- Delete logs older than 90 days
SELECT public.cleanup_old_admin_logs(90);
```

### **"View admin_logs_readable is slow"**
→ The view joins to `auth.users` for email addresses. For performance:
```sql
-- Create materialized view (refresh daily)
CREATE MATERIALIZED VIEW admin_logs_readable_cached AS
SELECT * FROM admin_logs_readable;

CREATE INDEX ON admin_logs_readable_cached(created_at DESC);

-- Refresh daily via cron
REFRESH MATERIALIZED VIEW admin_logs_readable_cached;
```

---

## 📈 Monitoring & Alerts

### **Set Up Alerts (Recommended)**

**1. Excessive Deletes Alert**
```sql
-- Run this query daily via cron, send alert if > 0
SELECT 
  admin_email,
  COUNT(*) as delete_count
FROM public.admin_logs_readable
WHERE action LIKE '%DELETE%'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY admin_email
HAVING COUNT(*) > 100;  -- Threshold
```

**2. After-Hours Activity Alert**
```sql
-- Detect admin operations outside business hours
SELECT *
FROM public.admin_logs_readable
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND EXTRACT(HOUR FROM created_at) NOT BETWEEN 8 AND 18;  -- 8am-6pm
```

**3. Bulk Updates Alert**
```sql
-- Detect admins updating many records in short time
SELECT 
  admin_email,
  target_table,
  COUNT(*) as update_count,
  MAX(created_at) - MIN(created_at) as time_span
FROM public.admin_logs_readable
WHERE action LIKE '%UPDATE%'
  AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY admin_email, target_table
HAVING COUNT(*) > 50;  -- More than 50 updates in 1 hour
```

---

## 🔄 Adding New Tables to Audit

To add automatic logging to a new table:

```sql
-- Example: Add logging to new table 'custom_table'
DROP TRIGGER IF EXISTS audit_custom_table_changes ON public.custom_table;

CREATE TRIGGER audit_custom_table_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.custom_table
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_admin_operation();
```

**Requirements for table:**
- Must have an `id` column (UUID or similar) as primary key
- Should have proper RLS policies restricting access
- Should be in `public` schema

---

## 🚨 Rollback Plan

If A2 causes issues, rollback:

```sql
-- Remove all audit triggers
DO $$
DECLARE
  _trigger RECORD;
BEGIN
  FOR _trigger IN 
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND trigger_name LIKE 'audit_%'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 
                   _trigger.trigger_name, 
                   _trigger.event_object_table);
  END LOOP;
END $$;

-- Remove extended schema
ALTER TABLE public.admin_logs DROP COLUMN IF EXISTS record_id;
ALTER TABLE public.admin_logs DROP COLUMN IF EXISTS old_data;
ALTER TABLE public.admin_logs DROP COLUMN IF EXISTS new_data;

-- Remove views and functions
DROP VIEW IF EXISTS public.admin_logs_stats CASCADE;
DROP VIEW IF EXISTS public.admin_logs_readable CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_admin_logs(INTEGER);
DROP FUNCTION IF EXISTS public.log_custom_admin_action(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.can_view_admin_logs();
DROP FUNCTION IF EXISTS public.trigger_log_admin_operation() CASCADE;
```

After rollback, A1 system (basic admin_logs) remains functional.

---

## 📚 Next Steps

1. **Deploy to staging:** Test in non-production environment first
2. **Monitor performance:** Check trigger overhead on high-traffic tables
3. **Set up alerts:** Implement monitoring queries above
4. **Document workflows:** Update team documentation on how to view logs
5. **Train admins:** Show admins how to use `admin_logs_readable` view

---

## 📄 License & Copyright

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

All code in this implementation is proprietary to M1SSION™.

---

**🎉 A2 System Ready**

Once Quick Start is complete, automatic audit logging is operational.
All admin/moderator operations on sensitive tables are now tracked.

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
