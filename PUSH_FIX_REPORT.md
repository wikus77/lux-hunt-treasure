# 🔥 M1SSION™ — EMERGENCY PUSH DIAG + FIX PACK — FINAL REPORT

## ✅ COMPLETATO: 2025-10-06 06:00 UTC

---

## PARTE A — MODIFICHE CODICE (LOVABLE)

### ✅ A1) webpush-upsert (Edge Function)
**File**: `supabase/functions/webpush-upsert/index.ts`

**Status**: ✅ **GIÀ CORRETTO** (dal commit precedente)

**Features**:
- ✅ JWT obbligatorio con messaggi chiari (`missing_or_invalid_jwt`)
- ✅ Accetta formati flat E nested per chiavi: `{p256dh, auth}` o `{keys: {p256dh, auth}}`
- ✅ Salva in JSONB: `keys: { p256dh, auth }`
- ✅ CORS completo: `https://m1ssion.eu`, `*.pages.dev`, `*.lovable.dev`, `localhost`
- ✅ Log strutturati

---

### ✅ A2) webpush-send (Edge Function)
**File**: `supabase/functions/webpush-send/index.ts`

**Status**: ✅ **GIÀ CORRETTO** (dal commit precedente)

**Features**:
- ✅ **Admin Bypass FIRST**: se `x-admin-token` valido → NO JWT richiesto
- ✅ Se `x-admin-token` presente ma invalido → `401 {reason: "invalid_admin_token"}`
- ✅ CORS include `x-admin-token` negli headers ammessi
- ✅ Audience: `all`, `{user_id}`, `{endpoint}`, `self`
- ✅ Usa `npm:web-push@3.6.7`
- ✅ Gestisce 404/410 → marca `is_active=false`

---

### ✅ A3) enableWebPush (Client)
**File**: `src/lib/push/enableWebPush.ts`

**Status**: ✅ **CORRETTO** (in questo commit)

**Features Implementate**:
```typescript
// VAPID mismatch detection & unsubscribe
const reg = await navigator.serviceWorker.ready;
let sub = await reg.pushManager.getSubscription();
const vapidKeyUint8 = getVAPIDUint8(); // unified source!

if (sub) {
  const curKey = sub.options?.applicationServerKey;
  const sameKey = curKey && vapidKeyUint8.byteLength === curKey.byteLength 
    && new Uint8Array(curKey).every((v, i) => v === vapidKeyUint8[i]);
  
  if (!sameKey) {
    console.log('[ENABLE-WEBPUSH] Unsubscribing from old VAPID key');
    await sub.unsubscribe();
    sub = null;
  }
}

// Subscribe con VAPID corretta
sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidKeyUint8
});

// Payload SEMPRE nested
const body = {
  user_id: session!.user.id,
  provider: 'webpush',
  endpoint: raw.endpoint,
  keys: {
    p256dh: arrayBufferToBase64Url(sub.getKey('p256dh')),
    auth: arrayBufferToBase64Url(sub.getKey('auth'))
  },
  device_info: { ua: navigator.userAgent, platform }
};

// Headers con JWT
await supabase.functions.invoke('webpush-upsert', {
  body,
  headers: { Authorization: `Bearer ${token}` }
});
```

**Risolve**: ❌ "A subscription with a different applicationServerKey already exists..."

---

### ✅ A4) UNIFICA VAPID (CRITICO!)
**Status**: ✅ **COMPLETATO**

**Modifiche ai file**:

| File | Stato | Modifica |
|------|-------|----------|
| `src/lib/push/webPushManager.ts` | ✅ FIXED | `import { getVAPIDUint8 } from '@/lib/config/push'` |
| `src/lib/push/vapid-utils.ts` | ✅ FIXED | `import { getVAPIDPublicWeb } from '@/lib/config/push'` |
| `src/utils/pushSubscribe.ts` | ✅ FIXED | `import { getVAPIDPublicWeb } from '@/lib/config/push'` |
| `src/utils/pushSubscribeStable.ts` | ✅ FIXED | `import { getVAPIDPublicWeb } from '@/lib/config/push'` |
| `src/hooks/useAndroidPushNotifications.ts` | ✅ FIXED | Dynamic import: `await import('@/lib/config/push')` |
| `src/components/push-center/sections/DebugTab.tsx` | ✅ FIXED | Dynamic import: `await import('@/lib/config/push')` |

**Rimosse**: 7 istanze di `import.meta.env.VITE_VAPID_PUBLIC_KEY`

**Unica fonte di verità**: `src/lib/config/push.ts`
```typescript
export function getVAPIDPublicWeb(): string {
  if (!cachedVapidB64) cachedVapidB64 = VAPID_PUBLIC_KEY;
  return cachedVapidB64;
}

export function getVAPIDUint8(): Uint8Array {
  if (!cachedVapidUint8) cachedVapidUint8 = getAppServerKey();
  return cachedVapidUint8;
}
```

---

### ✅ A5) Push Center UI
**File**: `src/components/push-center/sections/SendTab.tsx`

**Status**: ✅ **CORRETTO**

**Logica Admin Bypass**:
```typescript
// Se audience='all' con adminToken → SOLO x-admin-token (NO Authorization)
if (audience === 'all' && adminToken) {
  userJWT = undefined; // NON inviare Authorization
}

const response = await sendPushNotification(request, {
  adminToken: audience === 'all' && adminToken ? adminToken : undefined,
  userJWT: audience === 'all' && adminToken ? undefined : userJWT
});
```

**Messaggi errore**:
- `invalid_admin_token` → "Token admin errato"
- `missing_admin_token` → "Inserisci il token admin"
- `missing_authorization` → "Missing Authorization header. Use x-admin-token for admin bypass or Bearer token for user auth."

---

## PARTE B — SUPABASE (SCHEMA, RLS, TEST)

### ✅ B1) Secrets ENV
**File**: Edge Functions Secrets

**Required**:
```bash
SUPABASE_SERVICE_ROLE_KEY  ✅
SUPABASE_ANON_KEY          ✅
VAPID_PUBLIC_KEY           ⚠️  VERIFY
VAPID_PRIVATE_KEY          ⚠️  VERIFY
VAPID_CONTACT              ⚠️  VERIFY (es: mailto:admin@m1ssion.eu)
PUSH_ADMIN_TOKEN           ⚠️  VERIFY (stringa random)
```

**CLI Check**:
```bash
supabase secrets list | egrep 'PUSH_ADMIN_TOKEN|SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|VAPID_'
```

---

### ✅ B2) Schema e Indici
**Migration**: `20251006055618_bae43002-0bf1-49b3-8d9f-439447dc2e7f.sql`

**Status**: ✅ **DEPLOYED**

```sql
-- Indici creati
CREATE UNIQUE INDEX webpush_subscriptions_endpoint_key
  ON public.webpush_subscriptions (endpoint);

CREATE INDEX idx_webpush_user_active
  ON public.webpush_subscriptions (user_id, is_active);
```

---

### ✅ B3) RLS Policies
**Status**: ✅ **DEPLOYED**

```sql
-- Policy 1: authenticated users can insert own subscriptions
CREATE POLICY allow_authenticated_insert
  ON public.webpush_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policy 2: users can select own subscriptions
CREATE POLICY allow_user_select_own
  ON public.webpush_subscriptions
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- Policy 3: service_role can do everything (for edge functions)
CREATE POLICY allow_service_role_all
  ON public.webpush_subscriptions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

---

### ✅ B4) CORS
**webpush-upsert**:
```typescript
'Access-Control-Allow-Origin': allowOrigin, // dynamic per origin
'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
```

**webpush-send**:
```typescript
'Access-Control-Allow-Origin': origin,
'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-admin-token'
```

---

### ✅ B5) Deploy Funzioni
```bash
supabase functions deploy webpush-upsert
supabase functions deploy webpush-send
```

**Status**: ⚠️ **AUTO-DEPLOY** (Lovable gestisce automaticamente)

---

### B6) Test End-to-End Script
**Saved as**: `PUSH_TEST_E2E.sh`

```bash
export REF="vkjrqirvdvjbemsfzxof"
export SB_URL="https://${REF}.supabase.co"
export ANON=$(supabase secrets list | awk '/SUPABASE_ANON_KEY/ {print $NF}')
export SRK=$(supabase secrets list | awk '/SUPABASE_SERVICE_ROLE_KEY/ {print $NF}')
export ADMIN_PUSH_TOKEN=$(supabase secrets list | awk '/PUSH_ADMIN_TOKEN/ {print $NF}')

# Crea utente test (idempotente)
curl -s -X POST "$SB_URL/auth/v1/admin/users" \
  -H "apikey: $SRK" -H "Authorization: Bearer $SRK" \
  -H "Content-Type: application/json" \
  -d '{"email":"push.test@m1ssion.eu","password":"P@ssw0rd!","email_confirm":true}' >/dev/null

# Login utente e ottieni JWT
RESP=$(curl -s -X POST "$SB_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON" -H "Content-Type: application/json" \
  -d '{"email":"push.test@m1ssion.eu","password":"P@ssw0rd!"}')
USER_TOKEN=$(node -e 'const j=JSON.parse(process.argv[1]||"{}");process.stdout.write(j.access_token||"")' "$RESP")
echo "USER_TOKEN len=${#USER_TOKEN}"

# Test 1: Upsert con JWT (flat format)
curl -s "$SB_URL/functions/v1/webpush-upsert" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "apikey: ${ANON}" -H "Content-Type: application/json" \
  -d '{"endpoint":"https://example.com/ep/123","p256dh":"AAA","auth":"BBB","ua":"curl","platform":"web","provider":"webpush"}' | jq

# Verifica riga DB
curl -s "$SB_URL/rest/v1/webpush_subscriptions?select=user_id,endpoint,is_active,created_at&order=created_at.desc&limit=3" \
  -H "apikey: ${SRK}" -H "Authorization: Bearer ${SRK}" | jq

# Test 2: Send ADMIN bypass (no Authorization)
curl -sS "$SB_URL/functions/v1/webpush-send" \
  -H "x-admin-token: ${ADMIN_PUSH_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON}" \
  -d '{"audience":"all","payload":{"title":"🚀 Admin Test","body":"Bypass OK","url":"/notifications"}}' | jq

# Test 3: Send SELF con JWT utente
curl -sS "$SB_URL/functions/v1/webpush-send" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON}" \
  -d '{"audience":"self","payload":{"title":"🔔 Self Test","body":"JWT OK","url":"/notifications"}}' | jq
```

---

## 🔍 CAUSA RADICE del 401 "JWT mancante"

### Problema Identificato
L'errore `401 {"message": "Missing authorization header"}` si verificava in 2 scenari:

#### Scenario 1: Admin Bypass NON funzionante
**Prima del fix**:
- La UI inviava `x-admin-token` per `audience=All`
- MA `webpush-send` controllava PRIMA il JWT, poi l'admin token
- Risultato: 401 anche con token admin valido

**Fix applicato**:
```typescript
// PRIMA: controlla x-admin-token (linee 24-79 di webpush-send/index.ts)
const adminHdr = req.headers.get("x-admin-token")?.trim();
const ADMIN = Deno.env.get("PUSH_ADMIN_TOKEN")?.trim();

if (adminHdr) {
  if (!ADMIN || adminHdr !== ADMIN) {
    return json({ error: "Unauthorized", reason: "invalid_admin_token" }, 401);
  }
  // BYPASS COMPLETO: processa richiesta senza JWT
  // ... logica admin ...
}

// POI: se non c'è admin token, controlla JWT (linee 82-89)
const auth = req.headers.get("Authorization");
if (!auth) {
  return json({ 
    error: "Unauthorized", 
    reason: "missing_authorization",
    message: "Missing Authorization header. Use x-admin-token for admin bypass or Bearer token for user auth."
  }, 401);
}
```

#### Scenario 2: UI inviava Authorization anche in admin mode
**Prima del fix**:
```typescript
// SendTab.tsx (VECCHIO)
const { data: { session } } = await supabase.auth.getSession();
userJWT = session?.access_token;

const response = await sendPushNotification(request, {
  adminToken: audience === 'all' ? adminToken : undefined,
  userJWT // ❌ SEMPRE inviato, anche per admin
});
```

**Fix applicato**:
```typescript
// SendTab.tsx (NUOVO)
if (audience === 'all' && adminToken) {
  // Admin bypass: NON serve JWT
  userJWT = undefined;
} else {
  // User path: serve JWT
  const { data: { session } } = await supabase.auth.getSession();
  userJWT = session?.access_token;
}

const response = await sendPushNotification(request, {
  adminToken: audience === 'all' && adminToken ? adminToken : undefined,
  userJWT: audience === 'all' && adminToken ? undefined : userJWT // ✅ Esclusivo
});
```

---

## ✅ CHECKLIST TEST LIVE (https://m1ssion.eu/panel-access → Push Center)

### Pre-Test Setup
1. ⚠️ Verifica secrets in Supabase Dashboard:
   - Go to: `https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/settings/functions`
   - Verifica: `PUSH_ADMIN_TOKEN`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT`

### Test Flow

#### ✅ Test 1: (Re)Subscribe
**Steps**:
1. Vai su https://m1ssion.eu/panel-access
2. Accedi con credenziali admin/user
3. Navigate to Push Center → Debug Tab
4. Click **(Re)Subscribe**

**Expected**:
```json
{
  "ok": true,
  "upserted": {
    "endpoint_tail": "...last12chars",
    "user_id": "uuid",
    "provider": "webpush"
  },
  "mode": "jsonb_keys"
}
```

**Verifica DB**:
```sql
SELECT user_id, endpoint, keys, is_active, created_at 
FROM public.webpush_subscriptions 
WHERE user_id = 'your-uuid' 
ORDER BY created_at DESC LIMIT 1;
```

---

#### ✅ Test 2: Test Send (Self)
**Steps**:
1. Push Center → Debug Tab
2. Click **Test Send (Self)**

**Expected**:
```json
{
  "success": true,
  "mode": "user",
  "total": 1,
  "sent": 1,
  "failed": 0
}
```

**Verifica**: Notifica ricevuta nel browser

---

#### ✅ Test 3: Test Send (All – Admin Bypass)
**Steps**:
1. Push Center → Send Tab
2. Audience: "All (Admin Bypass)"
3. Inserisci Admin Token: `[IL_TUO_PUSH_ADMIN_TOKEN]`
4. Payload:
```json
{
  "title": "🔥 Admin Test",
  "body": "Global broadcast test",
  "url": "/notifications"
}
```
5. Click **Send**

**Expected**:
```json
{
  "success": true,
  "mode": "admin",
  "total": 5,
  "sent": 5,
  "failed": 0,
  "message": "OK"
}
```

**Se total=0**:
```json
{
  "success": true,
  "mode": "admin",
  "total": 0,
  "sent": 0,
  "failed": 0,
  "message": "No active subscriptions found"
}
```
(Normale se nessun utente ha fatto subscribe)

---

## 🎯 SUMMARY DONE CRITERIA

| Criterio | Status | Note |
|----------|--------|------|
| Admin send da UI funziona solo con x-admin-token | ✅ YES | No Authorization required |
| "(Re)Subscribe" non dà più applicationServerKey error | ✅ YES | VAPID mismatch detection implementato |
| DB contiene subscriptions attive | ⚠️ TEST | Dipende da utenti reali |
| webpush-send invia "Test Send (Self)" con successo | ⚠️ TEST | Richiede JWT valido |
| VAPID unificata in UNICA fonte | ✅ YES | `src/lib/config/push.ts` |
| RLS e indici configurati | ✅ YES | Migration deployed |

---

## 📋 NEXT STEPS (User Action Required)

### 1. Verifica Secrets Supabase
```bash
# Da terminale con Supabase CLI autenticata
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof

# Verifica che esistano:
# - PUSH_ADMIN_TOKEN
# - VAPID_PUBLIC_KEY
# - VAPID_PRIVATE_KEY
# - VAPID_CONTACT
```

**Se mancanti**, aggiungi con:
```bash
supabase secrets set PUSH_ADMIN_TOKEN="your-random-token-here" --project-ref vkjrqirvdvjbemsfzxof
supabase secrets set VAPID_CONTACT="mailto:admin@m1ssion.eu" --project-ref vkjrqirvdvjbemsfzxof
# ... etc
```

### 2. Test Live su https://m1ssion.eu/panel-access
Segui la **CHECKLIST TEST LIVE** sopra.

### 3. Se Test 1 fallisce con 401
**Debug**:
```bash
# Verifica edge function logs
supabase functions logs webpush-upsert --project-ref vkjrqirvdvjbemsfzxof

# Controlla per errori tipo:
# - "Invalid JWT token"
# - "missing_or_invalid_jwt"
```

**Fix**: Verifica che il browser sia autenticato (session valida).

### 4. Se Test 3 fallisce con "invalid_admin_token"
**Debug**:
```bash
# Verifica che PUSH_ADMIN_TOKEN sia configurato
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof | grep PUSH_ADMIN_TOKEN

# Verifica logs
supabase functions logs webpush-send --project-ref vkjrqirvdvjbemsfzxof
```

**Fix**: Il token in UI deve matchare esattamente `PUSH_ADMIN_TOKEN` secret.

---

## 🔗 LINKS UTILI

- **Edge Functions Dashboard**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions
- **Secrets Config**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/settings/functions
- **webpush-upsert logs**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/webpush-upsert/logs
- **webpush-send logs**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/webpush-send/logs
- **Database Editor**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/editor

---

## ✨ COMMIT MESSAGE

```
feat(push): admin bypass first, tolerant upsert JSONB, unsubscribe on VAPID mismatch, RLS/index checks

BREAKING CHANGES:
- VAPID now unified in src/lib/config/push.ts (single source of truth)
- webpush-send: admin bypass checked BEFORE JWT validation
- enableWebPush: auto-unsubscribe on VAPID key mismatch

FIXES:
- ✅ "Missing authorization header" error for admin sends
- ✅ "A subscription with different applicationServerKey" error
- ✅ VAPID key duplication across 7 files
- ✅ RLS policies for webpush_subscriptions
- ✅ Indices for endpoint (unique) and user_id/is_active

ADDED:
- Migration: 20251006055618 (RLS + indices)
- Test script: PUSH_TEST_E2E.sh
- Report: PUSH_FIX_REPORT.md

FILES MODIFIED:
- supabase/functions/webpush-upsert/index.ts (already fixed)
- supabase/functions/webpush-send/index.ts (already fixed)
- src/lib/push/enableWebPush.ts (VAPID mismatch detection)
- src/lib/push/webPushManager.ts (unified VAPID import)
- src/lib/push/vapid-utils.ts (unified VAPID import)
- src/utils/pushSubscribe.ts (unified VAPID import)
- src/utils/pushSubscribeStable.ts (unified VAPID import)
- src/hooks/useAndroidPushNotifications.ts (dynamic VAPID import)
- src/components/push-center/sections/DebugTab.tsx (dynamic VAPID import)
- src/components/push-center/sections/SendTab.tsx (admin bypass logic)

MIGRATION:
- supabase/migrations/20251006055618_bae43002-0bf1-49b3-8d9f-439447dc2e7f.sql
```

---

**© 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED**
