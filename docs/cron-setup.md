# 🕐 M1SSION™ Auto-Push Cron Setup Guide

**Purpose:** Schedule automatic push notifications delivery  
**Function:** `auto-push-cron`  
**Schedule:** Every hour from 9:00 to 20:00 (Europe/Rome timezone)  
**Status:** ⚠️ Requires manual configuration (secrets)

---

## 📋 Prerequisites

Before running the migration, you need:

1. **Supabase Project Access** (Dashboard access)
2. **Three Secret Values:**
   - `SUPABASE_URL` - Your Supabase project URL
   - `CRON_SECRET` - Authentication secret for cron jobs
   - `SUPABASE_ANON_KEY` - Public anonymous key

---

## ✅ Step 1: Get Your Secret Values

### A) SUPABASE_URL
```bash
# Your Supabase project URL
https://vkjrqirvdvjbemsfzxof.supabase.co
```

### B) SUPABASE_ANON_KEY
- Go to: Supabase Dashboard → Settings → API
- Copy the **anon/public** key (starts with `eyJ...`)

### C) CRON_SECRET
- Go to: Supabase Dashboard → Settings → Edge Functions → Secrets
- Find `CRON_SECRET` (if it doesn't exist, you need to create it first)
- **Security:** Never commit this value to Git!

---

## ✅ Step 2: Configure the Migration

**File:** `supabase/migrations/20250108000000_schedule_auto_push_cron.sql`

**Before running, replace these placeholders:**

```sql
-- REPLACE THESE THREE VALUES:
url := '<SUPABASE_URL>/functions/v1/auto-push-cron',           -- Line 31
'x-cron-secret', '<CRON_SECRET>',                              -- Line 35
'apikey', '<SUPABASE_ANON_KEY>'                                -- Line 36
```

**Example (with real values):**
```sql
url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
'x-cron-secret', 'my-super-secret-cron-key-abc123',
'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## ✅ Step 3: Run the Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to: Supabase Dashboard → SQL Editor
2. Click **New Query**
3. Copy the **modified** migration SQL (with your real values)
4. Click **Run**
5. Verify success message

### Option B: Via Supabase CLI (Advanced)

```bash
# Make sure you've replaced the placeholders first!
supabase db push
```

---

## ✅ Step 4: Verify the Job is Running

### Check if the job was created:

```sql
SELECT * FROM cron.job WHERE jobname = 'auto-push-hourly';
```

**Expected result:**
- 1 row with `jobname = 'auto-push-hourly'`
- `schedule = '0 9-20 * * *'`
- `active = true`

### Check job execution history:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-push-hourly')
ORDER BY start_time DESC 
LIMIT 10;
```

**Expected:** Entries appear every hour (9-20) with `status = 'succeeded'`

---

## ✅ Step 5: Manual Testing

Test the endpoint directly (before waiting for the cron schedule):

```bash
# Replace with your actual values
export SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export CRON_SECRET="your-actual-cron-secret"
export ANON_KEY="your-actual-anon-key"

# Trigger the cron job manually
curl -sS "$SUPABASE_URL/functions/v1/auto-push-cron" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "apikey: $ANON_KEY" | jq .
```

**Expected response:**
```json
{
  "ok": true,
  "sent": 3,
  "message": "Push notifications sent successfully"
}
```

**If you get an error:**
- `401 Unauthorized` → Check your `CRON_SECRET` value
- `404 Not Found` → Check your `SUPABASE_URL` is correct
- `500 Internal Error` → Check Edge Function logs in Dashboard

---

## ✅ Step 6: Monitor Auto Push Logs

After the cron runs, check the `auto_push_log` table:

```sql
SELECT 
  sent_at,
  user_id,
  template_id,
  delivery->>'sent' as sent_count
FROM auto_push_log
ORDER BY sent_at DESC
LIMIT 10;
```

**Expected:** New entries every hour (9-20) showing successful deliveries

---

## 🔧 Troubleshooting

### Job not running?

Check cron status:
```sql
SELECT * FROM cron.job WHERE jobname = 'auto-push-hourly';
```

If `active = false`, enable it:
```sql
UPDATE cron.job SET active = true WHERE jobname = 'auto-push-hourly';
```

### Job running but no pushes sent?

1. **Check `auto_push_config`:**
```sql
SELECT * FROM auto_push_config;
```
Verify `enabled = true`

2. **Check `auto_push_templates`:**
```sql
SELECT count(*) FROM auto_push_templates WHERE active = true;
```
Must have at least 1 active template

3. **Check `webpush_subscriptions`:**
```sql
SELECT count(*) FROM webpush_subscriptions WHERE is_active = true;
```
Must have at least 1 active subscription

4. **Check Edge Function logs:**
- Go to: Supabase Dashboard → Edge Functions → auto-push-cron → Logs
- Look for error messages

---

## 🛑 Unscheduling the Job (if needed)

To stop the cron job:

```sql
SELECT cron.unschedule('auto-push-hourly');
```

To re-enable later, just run the migration again.

---

## 📊 Expected Behavior

**Once configured correctly:**

- ✅ Job runs every hour from 9:00 to 20:00 (Europe/Rome time)
- ✅ Respects `quiet_hours` from `auto_push_config`
- ✅ Sends max `daily_max` pushes per user (default: 5)
- ✅ Randomly selects templates from `auto_push_templates`
- ✅ Logs all deliveries to `auto_push_log`
- ✅ Updates `last_sent_at` in `webpush_subscriptions`

**Outside 9-20 hours:** Job doesn't run (by cron schedule)  
**During quiet hours (21:00-08:59):** Job runs but skips sending (by config)

---

## 🔐 Security Notes

- ✅ **NEVER commit secrets to Git** (placeholders only in migration file)
- ✅ `CRON_SECRET` should be long, random, and unique
- ✅ Edge Function verifies secret on every request
- ✅ Failed auth attempts return `401 Unauthorized`
- ✅ All cron executions are logged in `cron.job_run_details`

---

## 📞 Support

If the cron job isn't working after following this guide:

1. Check Edge Function logs in Supabase Dashboard
2. Verify all three secrets are correct
3. Test the endpoint manually (Step 5)
4. Check database tables (Step 6)

**File Location:** `docs/cron-setup.md`  
**Migration File:** `supabase/migrations/20250108000000_schedule_auto_push_cron.sql`  
**Related Function:** `supabase/functions/auto-push-cron/index.ts`
