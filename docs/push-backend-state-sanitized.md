# M1SSION™ Push Backend - Sanitized State Report
**Generated**: 2025-10-07  
**Security Level**: READ-ONLY AUDIT (No secrets exposed)

---

## 🔐 Secrets Status

| Secret Name | Status | Notes |
|------------|--------|-------|
| `VAPID_PUBLIC_KEY` | ✅ Present | Public key prefix: `BN399Y…` (87 chars total) |
| `VAPID_PRIVATE_KEY` | ✅ Present | Private key (not exposed) |
| `ADMIN_PUSH_TOKEN` | ✅ Present | Admin broadcast token (not exposed) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Present | Service role for backend ops |

**Security Notes**:
- All secrets stored in Supabase Secrets (encrypted at rest)
- VAPID keys generated once, rotation not implemented yet
- Admin token used only in `webpush-send` edge function
- Service role never exposed to client

---

## 📡 Edge Functions

### 1. `webpush-upsert`
- **Method**: POST
- **Auth**: JWT (user session)
- **Purpose**: Subscribe user to push notifications
- **CORS**: `*` (authenticated requests only)
- **RLS**: Inserts row with `auth.uid()` as `user_id`
- **Inputs**: `{ endpoint, keys: { p256dh, auth }, ua?, user_id }`
- **Output**: `{ success: true/false }`

### 2. `webpush-send`
- **Method**: POST
- **Auth**: `x-admin-token` header (server-only)
- **Purpose**: Broadcast push notifications
- **CORS**: `*` (admin token required)
- **Audience**: `all | active_subscribers | specific_users`
- **Payload**: `{ title, body, url, image?, badge? }`
- **Rate Limiting**: None (admin only)

### 3. `webpush-self-test` (NEW)
- **Method**: POST
- **Auth**: JWT (user session)
- **Purpose**: Send test push to authenticated user only
- **CORS**: `*`
- **Output**: `{ success, sent_to }`

### 4. `push-health` (NEW - READ-ONLY)
- **Method**: GET
- **Auth**: None (public endpoint, no sensitive data)
- **Purpose**: Health check for monitoring
- **CORS**: `https://m1ssion.eu`, `https://*.pages.dev`
- **Output**:
```json
{
  "ok": true,
  "subs_count": 42,
  "vapid_public_prefix": "BN399Y…",
  "last_sent": "2025-10-07T14:30:00.000Z"
}
```

---

## 🗄️ Database Schema

### Table: `webpush_subscriptions`
```sql
CREATE TABLE public.webpush_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  ua TEXT,
  platform TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0
);
```

**Indices** (NEW):
- `idx_webpush_user_active (user_id, is_active) WHERE is_active = true`
- `idx_active_subs (is_active) WHERE is_active = true`
- `idx_webpush_endpoint (endpoint)`

**RLS Policies**:
- **SELECT**: User can view own subscriptions (`user_id = auth.uid()`)
- **INSERT**: User can insert own subscriptions (`user_id = auth.uid()`)
- **UPDATE**: Service role only (endpoint cleanup)
- **DELETE**: Service role only (expired subscriptions)

---

### Table: `auto_push_log` (Optional)
```sql
CREATE TABLE public.auto_push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_date DATE DEFAULT CURRENT_DATE,
  delivery JSONB
);
```

**Indices** (NEW):
- `idx_auto_push_sent_at (sent_at DESC)`

**RLS Policies**:
- **SELECT**: User can view own logs (`user_id = auth.uid()`)
- **INSERT**: Service role only
- **UPDATE/DELETE**: Service role only

---

## 🔒 Row-Level Security Summary

### ✅ Secure Patterns
1. **User-scoped reads**: All SELECT policies check `auth.uid() = user_id`
2. **User-scoped writes**: INSERT policies enforce `auth.uid() = user_id`
3. **Admin-only mutations**: UPDATE/DELETE restricted to service role
4. **No public writes**: All tables require authentication

### ⚠️ Considerations
1. **Endpoint cleanup**: Currently service role only - consider admin UI
2. **Failure tracking**: `failure_count` incremented by backend, not user-modifiable
3. **Soft deletes**: `is_active = false` instead of DELETE (preserves history)

---

## 🚀 Deployment Status

### Current Environment
- **Service Worker**: `public/sw.js` (version: `sw-bump-2025-10-07-05`)
- **VAPID Public**: `public/vapid-public.txt` (BN399Y…)
- **Client Hook**: `src/hooks/useUnifiedPushSubscription.ts`
- **Repair Utility**: `src/utils/pushRepair.ts`

### Active Features
- ✅ Push subscription via `repairPush()`
- ✅ Automatic endpoint cleanup on 410/404
- ✅ Self-test functionality
- ✅ Health monitoring endpoint
- 🚧 Activation UI (feature-flagged: `PUSH_ACTIVATE_UI=off`)

---

## 📊 Performance Metrics (Safe to Query)

### Active Subscriptions
```sql
SELECT COUNT(*) as active_subs
FROM public.webpush_subscriptions
WHERE is_active = true;
```

### Subscriptions by Platform
```sql
SELECT platform, COUNT(*) as count
FROM public.webpush_subscriptions
WHERE is_active = true
GROUP BY platform;
```

### Last 24h Push Activity
```sql
SELECT COUNT(*) as sent_last_24h
FROM public.auto_push_log
WHERE sent_at > NOW() - INTERVAL '24 hours';
```

### Failure Rate
```sql
SELECT 
  COUNT(CASE WHEN failure_count > 0 THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100 as failure_pct
FROM public.webpush_subscriptions
WHERE is_active = true;
```

---

## 🧪 Testing Commands (Safe)

### Health Check
```bash
curl -sS "$SB_URL/functions/v1/push-health" \
  -H "apikey: $ANON" | jq .

# Expected:
# {
#   "ok": true,
#   "subs_count": 42,
#   "vapid_public_prefix": "BN399Y…",
#   "last_sent": "2025-10-07T..."
# }
```

### Self-Test (Authenticated User)
```bash
# Get user JWT
TOKEN=$(curl -sS "$SB_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"***"}' | jq -r .access_token)

# Send self-test push
curl -sS "$SB_URL/functions/v1/webpush-self-test" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $ANON" | jq .
```

### Count Active Subscriptions (Service Role)
```bash
curl -sI "$SB_URL/rest/v1/webpush_subscriptions?select=count&is_active=eq.true" \
  -H "apikey: $SERVICE_ROLE" \
  -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Prefer: count=exact" | grep content-range
```

---

## 🔍 Audit Findings

### ✅ Security Strengths
1. **No hardcoded secrets**: All sensitive data in Supabase Secrets
2. **JWT-based auth**: User actions require valid session
3. **Admin token**: Broadcast requires separate admin credential
4. **RLS enabled**: All push tables have row-level security
5. **CORS restrictions**: Production endpoints limit origins

### 🔧 Recommendations
1. **VAPID rotation**: Implement key rotation procedure (currently manual)
2. **Rate limiting**: Add user-level rate limits to `webpush-upsert`
3. **Monitoring**: Set up alerts for:
   - Subscription count drops
   - High failure rates (>5%)
   - Missing health check responses
4. **Cleanup job**: Automate removal of subscriptions with `failure_count > 10`
5. **Analytics**: Track conversion funnel:
   - Permission granted → subscription created
   - Subscription created → first push received
   - Push received → notification clicked

---

## 📝 Change Log

### 2025-10-07 (Current)
- ✅ Added `push-health` endpoint (read-only monitoring)
- ✅ Created performance indices for subscriptions table
- ✅ Added `webpush-self-test` for user-initiated testing
- ✅ Updated Service Worker to v5 with cleanup improvements

### Previous
- ✅ Initial push subscription system (`webpush-upsert`)
- ✅ Admin broadcast functionality (`webpush-send`)
- ✅ Client-side repair utility (`pushRepair()`)
- ✅ VAPID keys generation and deployment

---

## 🚨 Security Incident Response

If VAPID keys are compromised:
1. Generate new keypair: `npx web-push generate-vapid-keys`
2. Update secrets in Supabase dashboard
3. Deploy new `public/vapid-public.txt`
4. Force Service Worker update: bump version in `public/sw.js`
5. All users must re-subscribe (automatic on next visit)

If Admin token is compromised:
1. Rotate `ADMIN_PUSH_TOKEN` in Supabase Secrets
2. Update any server-side scripts using the token
3. Monitor `auto_push_log` for unauthorized broadcasts
4. Consider temporary rate limiting on `webpush-send`

---

**Report Status**: ✅ Complete  
**Next Review**: 2025-11-07 (Monthly)  
**Contact**: DevOps Team
