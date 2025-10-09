# M1SSION™ Web Push End-to-End Testing Guide
## © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

Complete testing and debugging workflow for Web Push notifications system.

---

## 📋 Prerequisites

### Environment Setup
```bash
# Set your Supabase project reference
export REF=vkjrqirvdvjbemsfzxof
export SB_URL="https://${REF}.supabase.co"

# Get keys from Supabase (optional, for local testing)
export ANON=$(supabase secrets list | awk '/SUPABASE_ANON_KEY/ {print $NF}')
export SRK=$(supabase secrets list | awk '/SUPABASE_SERVICE_ROLE_KEY/ {print $NF}')
```

---

## 🔍 Step 1: Verify Secrets Configuration

### List all required secrets
```bash
supabase secrets list | egrep -i 'SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|VAPID_(PUBLIC|PRIVATE|CONTACT)|SUPABASE_ANON_KEY|SUPABASE_URL'
```

### ✅ Required secrets (must NOT be placeholders):
- `SUPABASE_URL` → `https://vkjrqirvdvjbemsfzxof.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` → Real service role key (starts with `eyJhbG...`)
- `SUPABASE_ANON_KEY` → Real anon key (starts with `eyJhbG...`)
- `VAPID_PUBLIC_KEY` → Base64url string (87 chars, e.g., `BBjgzWK_1_...`)
- `VAPID_PRIVATE_KEY` → Base64url string (43 chars)
- `VAPID_CONTACT` → `mailto:admin@m1ssion.eu` (or your contact)

### ⚠️ If any secret is missing or placeholder:
```bash
# Set secrets via Supabase Dashboard
# Functions → Settings → Edge Functions Secrets
# Or via CLI:
supabase secrets set VAPID_PUBLIC_KEY=BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q
supabase secrets set VAPID_PRIVATE_KEY=<your-private-key>
supabase secrets set VAPID_CONTACT=mailto:admin@m1ssion.eu
```

---

## 🚀 Step 2: Deploy Edge Functions

### Redeploy both functions
```bash
# Deploy push-subscribe
supabase functions deploy push-subscribe

# Deploy webpush-send
supabase functions deploy webpush-send
```

### ✅ Expected output:
```
Deploying push-subscribe (project ref: vkjrqirvdvjbemsfzxof)
...
Deployed Function push-subscribe on project vkjrqirvdvjbemsfzxof

Deploying webpush-send (project ref: vkjrqirvdvjbemsfzxof)
...
Deployed Function webpush-send on project vkjrqirvdvjbemsfzxof
```

---

## 🧪 Step 3: Test Edge Functions (Sanity Checks)

### Test CORS Preflight (OPTIONS)
```bash
curl -i -X OPTIONS "$SB_URL/functions/v1/push-subscribe" \
  -H "Origin: https://m1ssion.pages.dev" \
  -H "Access-Control-Request-Method: POST"
```

**Expected:** `204 No Content` with CORS headers

---

### Test Unauthorized Call (should return 401)
```bash
curl -sS "$SB_URL/functions/v1/push-subscribe" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"test","keys":{"p256dh":"x","auth":"y"}}'
```

**Expected:**
```json
{
  "error": "Unauthorized",
  "reason": "missing_or_invalid_jwt",
  "details": "Authorization header missing or malformed"
}
```

---

## 🗄️ Step 4: Verify Database Schema

### A) Check table structure
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='webpush_subscriptions'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `user_id` (uuid, NULL) — nullable for service role
- `endpoint` (text, NOT NULL)
- `keys` (jsonb, NOT NULL)
- `device_info` (jsonb, NULL)
- `is_active` (boolean, NOT NULL, default: true)
- `created_at` (timestamp, NOT NULL, default: now())
- `last_used_at` (timestamp, NULL)

---

### B) Check indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname='public' AND tablename='webpush_subscriptions';
```

**Expected indexes:**
- `webpush_subscriptions_pkey` (PRIMARY KEY on id)
- `webpush_subscriptions_endpoint_key` (UNIQUE on endpoint)
- `idx_webpush_user_active` (on user_id, is_active)
- `idx_webpush_endpoint` (on endpoint)

---

### C) Check RLS policies
```sql
SELECT polname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='webpush_subscriptions';
```

**Expected policies:**
- `insert own` (INSERT, authenticated users can insert their own)
- `update own` (UPDATE, authenticated users can update their own)
- `delete own` (DELETE, authenticated users can delete their own)

---

### D) Check current subscriptions count
```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active) as active
FROM public.webpush_subscriptions;
```

**Expected (before testing):** `total: 0, active: 0`

---

### E) View latest subscriptions (without exposing full endpoint)
```sql
SELECT
  user_id,
  LEFT(endpoint, 55) || '…' as endpoint_head,
  (keys->>'p256dh') IS NOT NULL as has_p256dh,
  (keys->>'auth') IS NOT NULL as has_auth,
  is_active,
  created_at,
  last_used_at
FROM public.webpush_subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🔧 Step 5: Create Missing Indexes (if needed)

Run these **ONLY** if indexes don't exist:

```sql
-- Unique endpoint constraint (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS webpush_subscriptions_endpoint_key
  ON public.webpush_subscriptions (endpoint);

-- User + active index (for audience queries)
CREATE INDEX IF NOT EXISTS idx_webpush_user_active
  ON public.webpush_subscriptions (user_id, is_active);

-- Endpoint index (for lookups)
CREATE INDEX IF NOT EXISTS idx_webpush_endpoint
  ON public.webpush_subscriptions (endpoint);
```

---

## 🛡️ Step 6: Verify RLS Policies (optional)

If policies are missing, create them:

```sql
-- Enable RLS
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- Insert own
CREATE POLICY IF NOT EXISTS "insert own"
ON public.webpush_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update own
CREATE POLICY IF NOT EXISTS "update own"
ON public.webpush_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Delete own
CREATE POLICY IF NOT EXISTS "delete own"
ON public.webpush_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

**Note:** Edge functions use `service_role` client which bypasses RLS.

---

## 📱 Step 7: Frontend Testing (Device)

### A) Navigate to `/push-debug`
1. Open the app on your device (iOS Safari, Chrome, etc.)
2. Go to `/push-debug`
3. Verify displayed info:
   - ✅ **Permission:** `granted` or `default`
   - ✅ **Service Worker:** `registered` or `not registered`
   - ✅ **Subscription:** `present` or `none`
   - ✅ **Auth UID:** Your user UUID (first 8 chars)
   - ✅ **VAPID Key:** First 20 chars of the key
   - ✅ **Last Subscribe:** `not tested` (initially)

---

### B) Press "Resubscribe" button
1. Click "Resubscribe"
2. If prompted, grant notification permission
3. Wait for response

**Expected result:**
- ✅ **Status:** `200 OK saved`
- ✅ **Subscription:** Endpoint tail displayed (last 12 chars)

**If 401 error:**
- Check browser console for `[PUSH-SUBSCRIBE]` logs
- Verify JWT token is being sent in `Authorization` header
- Check Edge Function logs for `hasAuth=false` or `reason: missing_or_invalid_jwt`

---

### C) Verify database entry
```sql
SELECT
  user_id,
  LEFT(endpoint, 55) || '…' as endpoint_head,
  (keys->>'p256dh') IS NOT NULL as has_p256dh,
  (keys->>'auth') IS NOT NULL as has_auth,
  is_active,
  created_at,
  last_used_at
FROM public.webpush_subscriptions
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** 1 new row with:
- `user_id` = your UUID
- `endpoint_head` = starts with `https://`
- `has_p256dh` = `true`
- `has_auth` = `true`
- `is_active` = `true`
- `created_at` = recent timestamp

---

## 🔔 Step 8: Send Test Notification

### A) Broadcast to all active subscriptions
```bash
curl -sS "$SB_URL/functions/v1/webpush-send" \
  -H "Authorization: Bearer ${ANON}" \
  -H "apikey: ${ANON}" \
  -H "Content-Type: application/json" \
  -d '{
    "audience": "all",
    "payload": {
      "title": "🔔 M1SSION Test",
      "body": "Push notification is working!",
      "url": "/notifications"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "results": [
    {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "success": true,
      "status": 201
    }
  ],
  "total": 1,
  "sent": 1,
  "failed": 0
}
```

**Device:** You should receive a notification!

---

### B) Send to specific user (replace USER_ID)
```bash
export USER_ID="<your-user-uuid>"

curl -sS "$SB_URL/functions/v1/webpush-send" \
  -H "Authorization: Bearer ${ANON}" \
  -H "apikey: ${ANON}" \
  -H "Content-Type: application/json" \
  -d "{
    \"audience\": {
      \"user_id\": \"$USER_ID\"
    },
    \"payload\": {
      \"title\": \"🎯 Personal Test\",
      \"body\": \"Only you can see this!\",
      \"url\": \"/notifications\"
    }
  }"
```

---

## 📊 Step 9: Check Edge Function Logs

### A) View push-subscribe logs
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/push-subscribe/logs)
2. Look for recent logs

**Expected log entries:**
```
[PUSH-SUBSCRIBE] hasAuth: true len: 123 preview: Bearer eyJhbGciOiJIUzI1NiIsInR5c...
[PUSH-SUBSCRIBE] user= <your-uuid> endpointHash= xyz123abc456 hasKeys= true platform= web
✅ Saved subscription for user <uuid> (web)
```

**If you see:**
- `hasAuth: false` → JWT not sent or malformed
- `reason: invalid_jwt` → JWT expired or invalid
- `Database save failed` → Check `SUPABASE_SERVICE_ROLE_KEY` secret

---

### B) View webpush-send logs
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/webpush-send/logs)
2. Look for send operation logs

**Expected:**
```
[WEBPUSH-SEND] Sending to 1 subscriptions
✅ Sent to endpoint: https://fcm.googleapis.com/fcm/send/... (status 201)
```

**If you see:**
- `410 Gone` or `404 Not Found` → Subscription expired, edge function should mark as `is_active=false`
- `VAPID keys not configured` → Check `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` secrets

---

## 🐛 Troubleshooting

### ❌ Problem: Subscribe returns 401
**Cause:** JWT not sent or invalid

**Fix:**
1. Ensure `enableWebPush()` waits for session:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) {
     await new Promise((resolve) => {
       const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
         if (s) {
           sub.subscription?.unsubscribe();
           resolve(null);
         }
       });
     });
   }
   const token = (await supabase.auth.getSession()).data.session?.access_token;
   ```
2. Invoke with explicit header:
   ```typescript
   const { data, error } = await supabase.functions.invoke('push-subscribe', {
     body: { endpoint, keys, platform, ua },
     headers: { Authorization: `Bearer ${token}` }
   });
   ```

---

### ❌ Problem: Send returns 0 sent
**Cause:** No active subscriptions in database

**Fix:**
1. Check DB:
   ```sql
   SELECT COUNT(*) FROM webpush_subscriptions WHERE is_active=true;
   ```
2. If 0, go to `/push-debug` and click "Resubscribe"
3. Verify subscription saved:
   ```sql
   SELECT * FROM webpush_subscriptions ORDER BY created_at DESC LIMIT 1;
   ```

---

### ❌ Problem: VAPID key mismatch
**Cause:** Frontend uses different VAPID key than backend

**Fix:**
1. Ensure frontend uses unified VAPID from `src/lib/vapid.ts`:
   ```typescript
   import { VAPID_PUBLIC_KEY } from '@/lib/vapid';
   ```
2. Ensure edge functions use same key from secrets:
   ```typescript
   const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
   const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
   ```
3. Verify keys match:
   ```bash
   supabase secrets list | grep VAPID_PUBLIC_KEY
   ```

---

### ❌ Problem: Module not found (webpush)
**Cause:** Old Deno import URL broken

**Fix:**
1. Edit `supabase/functions/webpush-send/index.ts`:
   ```typescript
   // ✅ Use npm import (stable)
   const webpush = await import('npm:web-push@3.6.7');
   
   // ❌ Don't use (broken)
   // import webpush from "https://deno.land/x/webpush@0.1.4/mod.ts";
   ```
2. Redeploy:
   ```bash
   supabase functions deploy webpush-send
   ```

---

## ✅ Success Checklist

- [ ] All secrets configured (no placeholders)
- [ ] Edge functions deployed without errors
- [ ] Database table has correct schema + indexes
- [ ] Frontend VAPID unified (no hardcoded duplicates)
- [ ] `/push-debug` shows "200 OK saved"
- [ ] Database has ≥1 active subscription
- [ ] Test send returns `sent > 0`
- [ ] Device receives notification
- [ ] Logs show successful subscribe + send operations

---

## 📚 Reference Links

- **Edge Function Logs:**
  - [push-subscribe](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/push-subscribe/logs)
  - [webpush-send](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/webpush-send/logs)
- **Edge Function Secrets:** [Settings](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/settings/functions)
- **SQL Editor:** [Run Queries](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/sql/new)
- **Table Editor:** [webpush_subscriptions](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/editor/public/webpush_subscriptions)

---

## 🔄 Quick Test Loop

```bash
# 1. Redeploy functions
supabase functions deploy push-subscribe
supabase functions deploy webpush-send

# 2. Frontend: Go to /push-debug → Click "Resubscribe"

# 3. Check DB
psql $DATABASE_URL -c "SELECT COUNT(*) FROM webpush_subscriptions WHERE is_active=true;"

# 4. Send test
curl -sS "$SB_URL/functions/v1/webpush-send" \
  -H "Authorization: Bearer ${ANON}" \
  -H "apikey: ${ANON}" \
  -H "Content-Type: application/json" \
  -d '{"audience":"all","payload":{"title":"Test","body":"Works!","url":"/"}}'

# 5. Check device for notification
```

---

**© 2025 M1SSION™ – ALL RIGHTS RESERVED**
