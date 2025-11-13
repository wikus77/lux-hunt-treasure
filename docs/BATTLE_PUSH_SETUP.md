# Battle Push Notification System - Setup Guide
© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

## Overview
Phase 5 Battle Push integration extends the existing M1SSION push pipeline with Battle-specific notifications (invite, resolved) without modifying the core push infrastructure.

## Architecture
```
Battle RPC → battle_notifications (DB) → battle-push-dispatcher (cron) → webpush-targeted-send → iOS Device
```

## Setup Checklist

### ✅ 1. Database Schema (CRITICAL - Must Execute First)

**IMPORTANT**: If not already done, execute this SQL in Supabase SQL Editor:

```sql
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Create battle_notifications table
CREATE TABLE IF NOT EXISTS public.battle_notifications (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_target uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type           text NOT NULL,        -- 'battle_invite' | 'battle_resolved'
    payload        jsonb NOT NULL,       -- { title, body, url, ...metadata }
    dedupe_key     text,
    consumed       boolean DEFAULT false,
    created_at     timestamptz DEFAULT now()
);

-- Dedupe index
CREATE UNIQUE INDEX IF NOT EXISTS battle_notifications_dedupe_idx
ON public.battle_notifications(dedupe_key)
WHERE dedupe_key IS NOT NULL;

-- Performance index for dispatcher queries
CREATE INDEX IF NOT EXISTS battle_notifications_unconsumed_idx
ON public.battle_notifications(consumed, created_at)
WHERE consumed = false;

-- Enable RLS (notifications are read by service role only, not by users)
ALTER TABLE public.battle_notifications ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only edge functions with service_role access this table
```

**Verify table exists:**
```sql
SELECT * FROM battle_notifications LIMIT 1;
```

---

### ✅ 2. Configure Cron Schedule (Supabase Dashboard)

**Option A: Via Dashboard**
1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create new job:
   - **Name:** `battle-push-dispatcher`
   - **Schedule:** `*/30 * * * *` (every 30 seconds)
   - **Function:** Invoke edge function via `pg_cron` + `pg_net`

**SQL (if using pg_cron):**
```sql
SELECT cron.schedule(
  'battle-push-dispatcher',
  '*/30 * * * *', -- Every 30 seconds
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/battle-push-dispatcher',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

**Option B: Via Supabase Edge Function Schedule (if supported)**
- Check if Supabase supports native edge function cron schedules
- If yes, the `verify_jwt = false` in `config.toml` already enables this

---

### ✅ 3. Verify Edge Function Deployment

After deploy, check edge function logs in Supabase Dashboard → Edge Functions → `battle-push-dispatcher`:

**Expected logs:**
```json
{
  "function": "battle-push-dispatcher",
  "phase": "start",
  "action": "fetch_unconsumed",
  "timestamp": "2025-01-13T..."
}
```

**Test manually:**
```bash
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/battle-push-dispatcher" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json"
```

---

### ✅ 4. Environment Variables Check

Ensure these secrets exist in Supabase Dashboard → Settings → Edge Functions → Secrets:

- `SUPABASE_URL` ✅ (auto-provided)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (auto-provided)
- `PUSH_ADMIN_TOKEN` ✅ (should already exist from existing push system)
- `VAPID_PUBLIC_KEY` ✅
- `VAPID_PRIVATE_KEY` ✅
- `VAPID_CONTACT` ✅

**No new secrets needed** - Phase 5 reuses existing push infrastructure.

---

## Testing Flow

### Smoke Test 1: Battle Invite Notification

1. **Create a test battle** via frontend or API:
   ```bash
   curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/battle-create" \
     -H "Authorization: Bearer <USER_JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "opponent_id": "<OPPONENT_USER_ID>",
       "stake_type": "energy",
       "stake_percentage": 25
     }'
   ```

2. **Verify DB record created:**
   ```sql
   SELECT * FROM battle_notifications 
   WHERE type = 'battle_invite' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   
   Expected: `consumed = false`, `payload.title` = "🎯 [AgentCode] ti sfida!"

3. **Wait 30 seconds** (cron interval)

4. **Check notification consumed:**
   ```sql
   SELECT consumed FROM battle_notifications 
   WHERE type = 'battle_invite' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   
   Expected: `consumed = true`

5. **Verify push received on iOS device:**
   - Notification appears with battle invite details
   - Tap → App opens to `/map-3d-tiler`

---

### Smoke Test 2: Battle Resolved Notification

1. **Complete a battle** (both players tap, let system resolve)

2. **Verify DB records:**
   ```sql
   SELECT * FROM battle_notifications 
   WHERE type = 'battle_resolved' 
   ORDER BY created_at DESC 
   LIMIT 2;
   ```
   
   Expected: 2 records (winner + loser), both `consumed = false` initially

3. **Wait 30 seconds**, verify both marked `consumed = true`

4. **Check iOS devices:**
   - Winner receives: "🏆 Vittoria!"
   - Loser receives: "⚔️ Battle conclusa"
   - Both tap → `/map-3d-tiler`

---

## Monitoring & Observability

### Key Metrics to Track

1. **Dispatcher Health:**
   ```sql
   -- Daily consumption rate
   SELECT 
     DATE(created_at) as date,
     COUNT(*) as total_notifications,
     COUNT(*) FILTER (WHERE consumed = true) as consumed,
     ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 2) as avg_delay_sec
   FROM battle_notifications
   WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

2. **Edge Function Logs:**
   - Check for `"phase": "complete"` logs with `sent` count
   - Alert if `failed` count > 10% of `sent`

3. **Push Delivery Rate:**
   - Monitor `webpush-targeted-send` logs for 410/404 errors (expired subscriptions)

---

## Troubleshooting

### Issue: Notifications not consumed

**Check:**
1. Cron job running: `SELECT * FROM cron.job WHERE jobname = 'battle-push-dispatcher';`
2. Edge function logs: Look for errors in dispatcher execution
3. `PUSH_ADMIN_TOKEN` is correct in secrets

**Fix:**
- Manually trigger dispatcher:
  ```bash
  curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/battle-push-dispatcher" \
    -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
  ```

### Issue: Push not received on iOS

**Check:**
1. User has active subscription in `webpush_subscriptions`:
   ```sql
   SELECT * FROM webpush_subscriptions 
   WHERE user_id = '<USER_ID>' AND is_active = true;
   ```
2. Notification permission granted on device
3. `webpush-targeted-send` logs show `sent: 1` not `failed: 1`

**Fix:**
- Re-register push subscription from frontend
- Check Safari Notification Settings → M1SSION

### Issue: Duplicate notifications

**Check:**
- `dedupe_key` constraint is active:
  ```sql
  SELECT * FROM pg_indexes 
  WHERE tablename = 'battle_notifications' 
  AND indexname = 'battle_notifications_dedupe_idx';
  ```

**Fix:**
- If missing, re-run index creation SQL from step 1

---

## Phase 5 Integration Points

### Modified Files
1. **New:**
   - `supabase/functions/battle-push-dispatcher/index.ts` (dispatcher cron)
   
2. **Modified:**
   - `supabase/config.toml` (added dispatcher function entry)
   - `supabase/functions/battle-create/index.ts` (INSERT battle_invite notification)
   - `supabase/functions/battle-resolve/index.ts` (INSERT battle_resolved notifications)

### Unchanged (Safety Clause Respected)
- ✅ Push pipeline: `webpush-send`, `webpush-targeted-send`, `webpush-upsert`
- ✅ Service Worker: `public/sw.js`
- ✅ VAPID loader: `src/lib/vapid-loader.ts`
- ✅ Buzz/BuzzMap logic
- ✅ Norah AI
- ✅ Stripe payments
- ✅ Map 3D core
- ✅ UnifiedHeader/BottomNavigation

---

## Next Steps

1. **Execute SQL schema** (step 1) if not done
2. **Configure cron** (step 2)
3. **Deploy edge functions** (automatic on Lovable deploy)
4. **Run smoke tests** (create battle → verify push received)
5. **Monitor dispatcher logs** for 24h to ensure stability

## Support

For issues or questions:
- Check Supabase Dashboard → Edge Functions logs
- Review `battle_notifications` table for unconsumed records
- Verify `webpush-targeted-send` is receiving admin token correctly

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
