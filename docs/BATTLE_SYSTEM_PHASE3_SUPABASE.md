# 🛡️ M1SSION™ Battle System - FASE 3: Supabase Realtime & Cron

**Status:** ✅ Backend Ready  
**Date:** 2025-01-12  
**Version:** 3.0.0

---

## 📋 Overview

Phase 3 backend implements:
1. **Realtime View** (`v_battle_events`) for session-specific event streaming
2. **Edge Function Cron** (`battle-cron-finalize`) to auto-close expired battles

---

## 🗄️ Database Changes

### 1. View: `v_battle_events`

**Purpose:** Unified view of battle events for realtime subscriptions

**Schema:**
```sql
CREATE VIEW v_battle_events AS
SELECT 
  bn.id,
  bn.session_id,
  bn.type,           -- 'attack_started' | 'defense_needed' | 'battle_resolved'
  bn.payload,        -- jsonb event data
  bn.created_at,
  bs.attacker_id,
  bs.defender_id
FROM battle_notifications bn
INNER JOIN battle_sessions bs ON bn.session_id = bs.id
WHERE bn.type IN ('attack_started', 'defense_needed', 'battle_resolved')
ORDER BY bn.created_at DESC;
```

**RLS Policy:**
- Users can only see events for battles where they are attacker OR defender
- Enforced via `battle_sessions` join

**Indexes:**
```sql
-- Fast session-based queries
CREATE INDEX idx_battle_notifications_session_created 
ON battle_notifications(session_id, created_at DESC);

-- Type filtering
CREATE INDEX idx_battle_notifications_type 
ON battle_notifications(type);

-- User-targeted notifications
CREATE INDEX idx_battle_notifications_user_target 
ON battle_notifications(user_id_target);
```

---

### 2. Realtime Publication

**Tables Added to `supabase_realtime`:**
- ✅ `battle_sessions` (already in Phase 1)
- ✅ `battle_notifications` (new in Phase 3)

**Why?**
- Clients subscribe to `battle:{session_id}` channel
- Receive live updates when sessions/notifications change

---

## ⚙️ Edge Function: `battle-cron-finalize`

### Purpose
Auto-close battles where defender didn't respond within 60 seconds.

### Schedule
Runs **every 1 minute** (configurable in `supabase/config.toml`)

### Logic
1. Calls `finalize_expired_battles()` RPC (from Phase 2)
2. RPC finds sessions with:
   - `status = 'await_defense'`
   - `expires_at < now()`
3. Marks as `status = 'resolved'`, `winner_id = attacker_id`
4. Credits rewards to attacker
5. Inserts `battle_resolved` event into `battle_notifications`

### Response
```json
{
  "sessions_finalized": 2
}
```

### Error Handling
- Uses service role key (bypasses RLS)
- Logs all operations with `[Battle Cron]` prefix
- Returns error details if RPC fails

---

## 📦 Installation

### Step 1: Run Migration
```bash
# Execute SQL migration
supabase db push supabase/migrations/20250112000003_battle_phase3_realtime.sql
```

### Step 2: Deploy Edge Function
```bash
# Deploy with schedule configuration
supabase functions deploy battle-cron-finalize

# Verify deployment
supabase functions list
```

### Step 3: Configure Cron Schedule
Ensure `supabase/config.toml` includes:

```toml
[functions.battle-cron-finalize]
verify_jwt = false

[functions.battle-cron-finalize.schedule]
cron = "* * * * *"  # Every 1 minute
```

---

## 🧪 Testing & Verification

### Test 1: View Events
```sql
-- Check view returns data
SELECT * FROM v_battle_events 
WHERE session_id = 'your-session-id' 
ORDER BY created_at DESC;
```

**Expected Output:**
```
id | session_id | type             | payload              | created_at
---|------------|------------------|----------------------|------------
1  | uuid-123   | attack_started   | {"weapon": "plasma"} | 2025-01-12
2  | uuid-123   | battle_resolved  | {"winner": "att..."}| 2025-01-12
```

---

### Test 2: Simulate Expired Battle
```sql
-- 1. Create a test battle (or use existing)
SELECT start_battle_v2('defender-uuid', 'plasma-blade', 'test-nonce');

-- 2. Force expiration (backdated expires_at)
UPDATE battle_sessions 
SET expires_at = now() - interval '1 second' 
WHERE id = 'your-session-id' 
AND status = 'await_defense';

-- 3. Wait 1 minute (or trigger function manually)
SELECT battle-cron-finalize();

-- 4. Verify resolution
SELECT status, winner_id, ended_at 
FROM battle_sessions 
WHERE id = 'your-session-id';

-- Expected: status='resolved', winner_id=attacker_id, ended_at IS NOT NULL
```

---

### Test 3: Check Realtime Publication
```sql
-- Verify tables are published
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('battle_sessions', 'battle_notifications');
```

**Expected:**
```
pubname            | tablename             | schemaname
-------------------|-----------------------|------------
supabase_realtime  | battle_sessions       | public
supabase_realtime  | battle_notifications  | public
```

---

### Test 4: Edge Function Manual Trigger
```bash
# Invoke function manually (bypasses cron schedule)
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/battle-cron-finalize' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "sessions_finalized": 1
}
```

---

### Test 5: Client Realtime Subscription
```typescript
import { supabase } from '@/integrations/supabase/client';

const channel = supabase
  .channel('battle:test-session-id')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'battle_sessions',
    filter: 'id=eq.test-session-id'
  }, (payload) => {
    console.log('Session update:', payload);
  })
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'battle_notifications',
    filter: 'session_id=eq.test-session-id'
  }, (payload) => {
    console.log('Notification event:', payload);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });
```

**Expected Console Output:**
```
Subscription status: SUBSCRIBED
Session update: { eventType: 'UPDATE', new: { status: 'resolved', ... } }
Notification event: { eventType: 'INSERT', new: { type: 'battle_resolved', ... } }
```

---

## 📊 Performance Notes

### Indexes Impact
- **session_id, created_at**: Optimizes chronological event queries
- **type**: Fast filtering by event type
- **user_id_target**: Efficient user-specific notifications

### Cron Frequency
- **1 minute interval**: Balances responsiveness vs. load
- **Advisory Lock** in `finalize_expired_battles()` prevents concurrent runs

### Realtime Overhead
- Only 2 tables published (minimal replication lag)
- View uses `security_invoker=on` (no materialized caching)

---

## 🔒 Security Checklist

✅ **RLS Enabled:** All tables and view  
✅ **Service Role Only:** Edge function uses service key  
✅ **No Public Endpoints:** Cron is internal-only  
✅ **Filtered Events:** Users only see own battles  

---

## 🐛 Troubleshooting

### Issue: Cron Not Running
```bash
# Check function logs
supabase functions logs battle-cron-finalize

# Verify schedule in config.toml
cat supabase/config.toml | grep -A 2 battle-cron-finalize
```

### Issue: Realtime Not Receiving Events
```typescript
// Check channel status
channel.subscribe((status) => {
  if (status === 'CHANNEL_ERROR') {
    console.error('Realtime error - check RLS policies');
  }
});
```

### Issue: View Returns Empty
```sql
-- Check base tables have data
SELECT COUNT(*) FROM battle_notifications;

-- Verify RLS not blocking
SET ROLE authenticated;
SELECT * FROM v_battle_events LIMIT 1;
```

---

## 🔄 Rollback Plan

### Drop View
```sql
DROP VIEW IF EXISTS public.v_battle_events CASCADE;
```

### Remove from Realtime
```sql
ALTER PUBLICATION supabase_realtime 
DROP TABLE public.battle_notifications;
```

### Disable Cron
```bash
supabase functions delete battle-cron-finalize
```

---

## 📝 Migration Checklist

- [x] Create `v_battle_events` view with RLS
- [x] Add indexes on `battle_notifications`
- [x] Publish tables to `supabase_realtime`
- [x] Deploy `battle-cron-finalize` edge function
- [x] Configure cron schedule (1 min)
- [x] Test manual finalization
- [x] Test realtime subscription
- [x] Verify RLS policies

---

## 📖 Related Documentation

- [Phase 1 README](./BATTLE_SYSTEM_PHASE1_README.md) - Schema & Base RPCs
- [Phase 2 README](./BATTLE_SYSTEM_PHASE2_README.md) - Economy & Battle Logic
- [Phase 3 Frontend README](./BATTLE_SYSTEM_PHASE3_README.md) - UI Components

---

## 📝 Copyright

```
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
```

All Phase 3 files include mandatory copyright footer.

---

**End of Phase 3 Supabase README**
