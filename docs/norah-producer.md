# 🤖 M1SSION™ Norah Producer - AI to Push Pipeline

**Purpose:** Transform Norah AI content into push notification templates  
**Function:** `norah-producer`  
**Mode:** Template creation only (NO direct push sending)  
**Delivery:** Handled by `auto-push-cron` (separate job)

---

## 📋 Overview

The Norah Producer is a **safe, read-only bridge** between Norah AI-generated content and the push notification system:

```
┌─────────────────┐
│  Norah AI       │  ← Content generation
│  (ai_generated  │
│   _clues)       │
└────────┬────────┘
         │ READ (last 24h)
         ▼
┌─────────────────────┐
│  norah-producer     │  ← THIS FUNCTION
│  (scheduled job)    │     (transforms content)
└────────┬────────────┘
         │ INSERT
         ▼
┌─────────────────────┐
│ auto_push_templates │  ← Push templates DB
│ (kind: norah_ai)    │
└────────┬────────────┘
         │ SELECT (random weighted)
         ▼
┌─────────────────────┐
│  auto-push-cron     │  ← ACTUAL DELIVERY
│  (sends to users)   │
└─────────────────────┘
```

**Key Safety Features:**
- ✅ Only creates templates (doesn't send pushes)
- ✅ CORS aligned with other push functions
- ✅ Cron secret authentication required
- ✅ Reads from safe AI content table
- ✅ No user data exposure

---

## 🔐 Authentication

**Required header:**
```bash
x-cron-secret: <YOUR_CRON_SECRET>
```

**Security:**
- Same `CRON_SECRET` used by `auto-push-cron`
- Should be configured in Supabase Dashboard → Edge Functions → Secrets
- Never hardcode or commit to Git

---

## ✅ How It Works

### 1. Fetch Recent Norah Content

Queries `ai_generated_clues` table for:
- Content created in last **24 hours**
- Type: `insight` (high-quality AI analysis)
- Max: **10 items** per run

### 2. Transform to Push Template

Each AI insight becomes:
```json
{
  "kind": "norah_ai",
  "title": "🤖 Insight da Norah",
  "body": "<First 160 chars of content>",
  "url": "/intelligence",
  "image_url": null,
  "weight": 2,
  "active": true
}
```

### 3. Insert into `auto_push_templates`

Templates are stored for later delivery by `auto-push-cron`.

**NOTE:** This function does **NOT** send pushes directly!

---

## 🧪 Manual Testing

### Prerequisites

Set your environment variables:
```bash
export SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export CRON_SECRET="your-actual-cron-secret"
export ANON_KEY="your-actual-anon-key"
```

### Test the Function

```bash
curl -sS "$SUPABASE_URL/functions/v1/norah-producer" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "apikey: $ANON_KEY" | jq .
```

**Expected response (with new content):**
```json
{
  "ok": true,
  "templates_created": 5,
  "message": "Successfully created 5 Norah AI push templates"
}
```

**Expected response (no new content):**
```json
{
  "ok": true,
  "templates_created": 0,
  "message": "no_new_content"
}
```

**Error response (bad secret):**
```json
{
  "ok": false,
  "error": "unauthorized"
}
```

---

## 📊 Verify Templates Were Created

After running the producer, check the database:

```sql
-- Count Norah AI templates
SELECT count(*) 
FROM auto_push_templates 
WHERE kind = 'norah_ai' AND active = true;

-- View recent Norah templates
SELECT 
  created_at,
  title,
  LEFT(body, 60) AS body_preview,
  weight,
  active
FROM auto_push_templates
WHERE kind = 'norah_ai'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** New rows with timestamps from when you ran the function

---

## ⏰ Scheduling (Optional)

You can schedule `norah-producer` to run periodically (e.g., daily):

### Option A: Via pg_cron (Recommended)

```sql
-- Run daily at 8:00 AM (before auto-push-cron starts)
SELECT cron.schedule(
  'norah-producer-daily',
  '0 8 * * *',  -- Daily at 8am
  $$
  SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/norah-producer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>',
      'apikey', '<SUPABASE_ANON_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### Option B: Manual Trigger (when needed)

Just run the curl command above whenever you want to refresh Norah templates.

---

## 🔍 Monitoring & Logs

### Check Edge Function Logs

1. Go to: Supabase Dashboard → Edge Functions → norah-producer → Logs
2. Look for:
   - `[NORAH-PRODUCER] Fetching Norah content since...`
   - `[NORAH-PRODUCER] Found X Norah insights`
   - `[NORAH-PRODUCER] ✅ Created X push templates`

### Common Log Messages

**Success:**
```
[NORAH-PRODUCER] Fetching Norah content since 2025-01-07T10:00:00.000Z
[NORAH-PRODUCER] Found 5 Norah insights
[NORAH-PRODUCER] ✅ Created 5 push templates
```

**No new content:**
```
[NORAH-PRODUCER] Fetching Norah content since 2025-01-07T10:00:00.000Z
[NORAH-PRODUCER] No new Norah content found
```

**Error:**
```
[NORAH-PRODUCER] Unauthorized: invalid x-cron-secret
[NORAH-PRODUCER] Error fetching clues: <error details>
[NORAH-PRODUCER] Error inserting templates: <error details>
```

---

## 🛠️ Troubleshooting

### No templates being created?

**Check 1: Is there recent Norah content?**
```sql
SELECT count(*) 
FROM ai_generated_clues 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND content_type = 'insight';
```
Must return > 0

**Check 2: Are templates actually missing?**
```sql
SELECT count(*) 
FROM auto_push_templates 
WHERE kind = 'norah_ai';
```

**Check 3: View Edge Function logs** (see Monitoring section above)

### Templates created but not delivered?

**This is expected!** `norah-producer` only creates templates.

To actually send pushes, you need `auto-push-cron` to run.

**Verify auto-push-cron is scheduled:**
```sql
SELECT * FROM cron.job WHERE jobname = 'auto-push-hourly';
```

**Check recent push deliveries:**
```sql
SELECT count(*) 
FROM auto_push_log 
WHERE sent_at >= NOW() - INTERVAL '24 hours';
```

### 401 Unauthorized error?

Your `CRON_SECRET` is incorrect.

**Fix:**
1. Go to: Supabase Dashboard → Settings → Edge Functions → Secrets
2. Find `CRON_SECRET`
3. Use that exact value in your curl command

---

## 📈 Expected Behavior

**When properly configured:**

1. ✅ Runs on schedule (e.g., daily at 8am)
2. ✅ Fetches last 24h of Norah insights
3. ✅ Creates 0-10 templates per run
4. ✅ Templates have `kind = 'norah_ai'`, `weight = 2`
5. ✅ Templates are marked `active = true`
6. ✅ Logs success/failure to Edge Function logs
7. ✅ Does **NOT** send pushes directly

**Then, `auto-push-cron` will:**
- ✅ Select random templates (including Norah AI ones)
- ✅ Send them to users during 9-20h window
- ✅ Respect daily limits and quiet hours
- ✅ Log deliveries to `auto_push_log`

---

## 🎯 Integration with Full Pipeline

```
Daily at 8am:
┌──────────────────┐
│ norah-producer   │  ← Creates fresh templates
└─────────┬────────┘
          │
          ▼
┌──────────────────────┐
│ auto_push_templates  │  ← Template pool
│ (20-30 templates)    │
└─────────┬────────────┘
          │
Hourly 9-20:
          │
          ▼
┌──────────────────┐
│ auto-push-cron   │  ← Delivers to users
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ Users receive    │
│ push notifications│
└──────────────────┘
```

**Result:** Fresh AI-powered content delivered automatically to engaged users!

---

## 🔐 Security Notes

- ✅ Requires `CRON_SECRET` authentication
- ✅ Uses `SERVICE_ROLE_KEY` internally (never exposed)
- ✅ CORS restricted to `m1ssion.eu` + `*.pages.dev`
- ✅ Only reads from safe AI tables
- ✅ No direct user data access
- ✅ All actions logged to Edge Function logs

---

## 📞 Support

**If templates aren't being created:**

1. Check Edge Function logs (see Monitoring section)
2. Verify Norah AI content exists (check SQL query above)
3. Test manually with curl command
4. Check `CRON_SECRET` is correct

**If templates created but not delivered:**

This is a different issue! See `docs/cron-setup.md` for `auto-push-cron` configuration.

---

**File Location:** `docs/norah-producer.md`  
**Function:** `supabase/functions/norah-producer/index.ts`  
**Related:** `docs/cron-setup.md`, `auto-push-cron`
