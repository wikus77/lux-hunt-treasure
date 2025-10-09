# Web Push JSONB Keys Implementation

## Overview
This document describes how the M1SSION™ Web Push system stores subscription keys in JSONB format in the database, while supporting both flat and nested input formats for maximum compatibility.

## Database Schema

The `public.webpush_subscriptions` table stores push notification subscription data with the following structure:

```sql
CREATE TABLE public.webpush_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  endpoint text UNIQUE NOT NULL,
  keys jsonb NOT NULL,           -- Stores {p256dh, auth} as JSONB
  device_info jsonb,              -- Stores {platform, ua} as JSONB
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);
```

### Why JSONB for Keys?

1. **Flexibility**: Easy to add more key types in the future without schema changes
2. **Standard Format**: Matches the browser's `PushSubscription.toJSON()` output
3. **Type Safety**: JSONB ensures valid JSON structure
4. **Query Support**: Can query specific keys using PostgreSQL JSONB operators

## Edge Function: webpush-upsert

Located at: `supabase/functions/webpush-upsert/index.ts`

### Input Format Support

The function accepts **both** formats for maximum compatibility:

#### Nested Format (Preferred)
```json
{
  "user_id": "uuid",
  "provider": "webpush",
  "endpoint": "https://...",
  "keys": {
    "p256dh": "base64-encoded-key",
    "auth": "base64-encoded-key"
  },
  "ua": "user-agent-string",
  "platform": "web"
}
```

#### Flat Format (Legacy Support)
```json
{
  "user_id": "uuid",
  "provider": "webpush",
  "endpoint": "https://...",
  "p256dh": "base64-encoded-key",
  "auth": "base64-encoded-key",
  "ua": "user-agent-string",
  "platform": "web"
}
```

### Key Extraction Logic

```typescript
// Tolerant extraction - supports both formats
const p256dh = body?.p256dh ?? body?.keys?.p256dh;
const auth   = body?.auth   ?? body?.keys?.auth;
```

### Database Upsert

```typescript
await supabase
  .from('webpush_subscriptions')
  .upsert({
    user_id: userId,
    endpoint: endpoint,
    keys: { p256dh, auth },  // Always stored as JSONB
    device_info: { platform, ua },
    is_active: true,
    last_used_at: new Date().toISOString()
  }, { 
    onConflict: 'endpoint' 
  });
```

### Response Format

```json
{
  "ok": true,
  "upserted": {
    "endpoint_tail": "...last12chars",
    "user_id": "uuid",
    "provider": "webpush"
  },
  "mode": "jsonb_keys",
  "id": "subscription-uuid"
}
```

## Client-Side Integration

### enableWebPush.ts

Located at: `src/lib/push/enableWebPush.ts`

Sends the subscription data in the preferred nested format:

```typescript
const raw = sub.toJSON();

const body = {
  user_id: session.user.id,
  provider: 'webpush',
  endpoint: raw.endpoint,
  keys: raw.keys,  // Nested: {p256dh, auth}
  ua: navigator.userAgent,
  platform: navigator.userAgentData?.platform || navigator.platform || 'web'
};

await supabase.functions.invoke('webpush-upsert', {
  body,
  headers: { Authorization: `Bearer ${token}` }
});
```

### register-push.ts

Located at: `src/lib/push/register-push.ts`

Sends **both** formats for maximum compatibility:

```typescript
await supabase.functions.invoke('webpush-upsert', {
  body: {
    user_id: userId,
    endpoint,
    provider,
    p256dh: getKey('p256dh'),      // Flat format
    auth: getKey('auth'),          // Flat format
    keys: {                        // Nested format
      p256dh: getKey('p256dh'), 
      auth: getKey('auth') 
    },
    platform,
    is_active: true
  }
});
```

## Push Center Debug Tab

Located at: `src/components/push-center/sections/DebugTab.tsx`

The Debug Tab now uses `enableWebPush()` for subscription and provides clear error messages:

### Error Handling

```typescript
if (error.message.includes('missing_fields')) {
  errorReason = 'missing_fields';
  suggestion = '⚠️ Browser subscription may have failed. Check VAPID key configuration.';
} else if (error.message.includes('database_error')) {
  errorReason = 'database_error';
  suggestion = '⚠️ Check webpush_subscriptions table schema and RLS policies.';
} else if (error.message.includes('invalid_jwt')) {
  errorReason = 'auth_error';
  suggestion = '⚠️ JWT invalid or expired. Please log in again.';
}
```

## Validation

The webpush-upsert function validates:

1. **Required Fields**:
   - `endpoint` (string)
   - `p256dh` (string, from either format)
   - `auth` (string, from either format)
   - `provider` (must be 'webpush')

2. **Authentication**:
   - Valid JWT in `Authorization: Bearer <token>` header
   - User ID extracted from JWT must exist

3. **Provider**:
   - Currently only 'webpush' is supported
   - Future: 'apns', 'fcm' may be added

## SQL Queries

### Verify Schema
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='webpush_subscriptions'
ORDER BY ordinal_position;
```

### Check Indices
```sql
-- Ensure unique endpoint
CREATE UNIQUE INDEX IF NOT EXISTS webpush_subscriptions_endpoint_key
  ON public.webpush_subscriptions (endpoint);

-- User lookups
CREATE INDEX IF NOT EXISTS idx_webpush_user_active
  ON public.webpush_subscriptions (user_id, is_active);
```

### Query Recent Subscriptions
```sql
SELECT 
  user_id, 
  LEFT(endpoint, 32)||'…' as endpoint_preview, 
  keys->>'p256dh' as p256dh_preview,
  keys->>'auth' as auth_preview,
  is_active, 
  created_at
FROM public.webpush_subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

## Testing Checklist

- [ ] DebugTab shows permission, SW, session, VAPID, subscription
- [ ] (Re)Subscribe returns 200 from webpush-upsert
- [ ] Database shows keys stored as JSONB: `{"p256dh":"...","auth":"..."}`
- [ ] SubscriptionsTab shows subscription rows
- [ ] SendTab "Self" sends 200 with user JWT
- [ ] SendTab "All – Admin" sends 200 with x-admin-token

## Error Messages & Suggestions

| Error Reason | User Message | Admin Action |
|--------------|--------------|--------------|
| `missing_fields` | Missing p256dh or auth keys | Check VAPID key configuration |
| `database_error` | Database error during upsert | Check table schema and RLS policies |
| `auth_error` / `invalid_jwt` | Authentication failed | User needs to log in again |
| `permission_denied` | Notification permission denied | Check browser settings |
| `invalid_provider` | Invalid provider (must be webpush) | Update client code |

## Migration Notes

### From Flat Columns to JSONB

If you previously had `p256dh` and `auth` as separate columns:

```sql
-- Create JSONB column
ALTER TABLE public.webpush_subscriptions 
  ADD COLUMN IF NOT EXISTS keys jsonb;

-- Migrate data
UPDATE public.webpush_subscriptions
SET keys = jsonb_build_object('p256dh', p256dh, 'auth', auth)
WHERE keys IS NULL;

-- Make keys NOT NULL
ALTER TABLE public.webpush_subscriptions 
  ALTER COLUMN keys SET NOT NULL;

-- Drop old columns (optional, only after verifying)
-- ALTER TABLE public.webpush_subscriptions DROP COLUMN p256dh;
-- ALTER TABLE public.webpush_subscriptions DROP COLUMN auth;
```

## Future Enhancements

1. **Multi-Provider Support**: Add APNS and FCM provider-specific key storage
2. **Key Rotation**: Support updating keys without changing endpoint
3. **Expiration**: Add `expires_at` field for subscription management
4. **Analytics**: Track subscription creation/renewal patterns
5. **Device Fingerprinting**: Enhance device_info with more metadata

## References

- [Web Push API Specification](https://www.w3.org/TR/push-api/)
- [VAPID Protocol (RFC 8292)](https://tools.ietf.org/html/rfc8292)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
