# 🏪 STORE READINESS REPORT

**Data:** 2026-01-20  
**Progetto:** M1SSION™ (lux-hunt-treasure)  
**Supabase:** vkjrqirvdvjbemsfzxof  
**Secrets Count:** 85/100 ✅

---

## 📊 EXECUTIVE SUMMARY

| Category | Status | Details |
|----------|--------|---------|
| **Secrets Capacity** | ✅ PASS | 85/100 (15 slots liberi) |
| **Apple IAP** | ✅ PASS | APPLE_SHARED_SECRET, APPLE_BUNDLE_ID presenti |
| **Google IAP** | ❌ **FAIL** | GOOGLE_SERVICE_ACCOUNT_KEY **MANCANTE** |
| **Stripe** | ✅ PASS | SECRET_KEY, WEBHOOK_SECRET presenti |
| **Push (APNS)** | ✅ PASS | APNS_KEY_ID, APNS_PRIVATE_KEY, APNS_TEAM_ID |
| **Push (FCM)** | ✅ PASS | FCM_SERVICE_ACCOUNT_JSON, FCM_PROJECT_ID |
| **Push (VAPID)** | ✅ PASS | VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY |
| **Core Supabase** | ✅ PASS | URL, ANON_KEY, SERVICE_ROLE_KEY |
| **Hardcoded Secrets** | ✅ PASS | Nessun secret hardcoded trovato |
| **Smoke Test** | ✅ PASS | 8/8 passed |

---

## 🔴 CRITICAL: Missing Secret

```
❌ GOOGLE_SERVICE_ACCOUNT_KEY - REQUIRED for Google Play IAP verification
```

**Used in:**
- `supabase/functions/iap-google-rtdn/index.ts`
- `supabase/functions/verify-iap-purchase/index.ts`

**Action Required:**
```bash
# 1. Create Google Play Service Account in Google Cloud Console
# 2. Download JSON key
# 3. Add to Supabase:
supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY='<paste-json-here>' --project-ref vkjrqirvdvjbemsfzxof
```

---

## ✅ APPLE iOS READINESS

| Secret | Status | Value (digest) |
|--------|--------|----------------|
| `APPLE_SHARED_SECRET` | ✅ Present | `7c68301a...` |
| `APPLE_BUNDLE_ID` | ✅ Present | `3946398...` (eu.m1ssion.app) |
| `APNS_ENVIRONMENT` | ✅ Present | `f82d263...` |
| `APNS_KEY_ID` | ✅ Present | `5830aae...` |
| `APNS_PRIVATE_KEY` | ✅ Present | `6ba36c6...` |
| `APNS_TEAM_ID` | ✅ Present | `c54132e...` |

**IAP Functions:**
- ✅ `verify-iap-purchase` - Apple receipt validation
- ✅ `restore-iap-subscription` - Subscription restore
- ✅ `iap-apple-notifications` - Server-to-server notifications

---

## ⚠️ GOOGLE ANDROID READINESS

| Secret | Status | Value (digest) |
|--------|--------|----------------|
| `GOOGLE_PACKAGE_NAME` | ✅ Present | `3946398...` (eu.m1ssion.app) |
| `PUBSUB_VERIFICATION_TOKEN` | ✅ Present | `21621cc...` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | ❌ **MISSING** | - |
| `FCM_SERVICE_ACCOUNT_JSON` | ✅ Present | `abd1405...` |
| `FCM_PROJECT_ID` | ✅ Present | `6bff907...` |

**IAP Functions:**
- ⚠️ `verify-iap-purchase` - Google verification will FAIL without GOOGLE_SERVICE_ACCOUNT_KEY
- ⚠️ `iap-google-rtdn` - Pub/Sub webhook will FAIL without GOOGLE_SERVICE_ACCOUNT_KEY

---

## ✅ STRIPE READINESS

| Secret | Status | Note |
|--------|--------|------|
| `STRIPE_SECRET_KEY` | ✅ Present | Live/Test mode |
| `STRIPE_WEBHOOK_SECRET` | ✅ Present | Webhook verification |
| `STRIPE_PUBLISHABLE_KEY` | ✅ Present | (Should be frontend only) |

---

## ✅ PUSH NOTIFICATIONS

### Web Push (VAPID)
| Secret | Status |
|--------|--------|
| `VAPID_PUBLIC_KEY` | ✅ |
| `VAPID_PRIVATE_KEY` | ✅ |
| `VAPID_CONTACT` | ✅ |
| `VAPID_SUBJECT` | ✅ |

### FCM (Android)
| Secret | Status |
|--------|--------|
| `FCM_SERVICE_ACCOUNT_JSON` | ✅ |
| `FCM_PROJECT_ID` | ✅ |
| `FCM_SERVER_KEY` | ✅ |

### APNS (iOS)
| Secret | Status |
|--------|--------|
| `APNS_KEY_ID` | ✅ |
| `APNS_PRIVATE_KEY` | ✅ |
| `APNS_TEAM_ID` | ✅ |

---

## 🔒 SECURITY AUDIT

### Secrets Location (Correct)

| Secret Type | Supabase Secrets | Client .env (Vite) |
|-------------|------------------|-------------------|
| Service Role Key | ✅ Yes | ❌ No (correct) |
| Stripe Secret | ✅ Yes | ⚠️ Local only |
| Apple Shared Secret | ✅ Yes | ❌ No |
| VAPID Private | ✅ Yes | ❌ No |
| FCM Service Account | ✅ Yes | ❌ No |
| Anon Key | ✅ Yes | ✅ Yes (public) |
| Supabase URL | ✅ Yes | ✅ Yes (public) |

### .gitignore Protection
```
✅ .env files are gitignored
✅ No secrets in committed code
```

---

## 📋 NEXT STEPS CHECKLIST

### 🍎 iOS App Store

- [x] `APPLE_BUNDLE_ID` = eu.m1ssion.app ✅
- [x] `APPLE_SHARED_SECRET` configured ✅
- [x] `APNS_*` keys configured ✅
- [x] `verify-iap-purchase` function deployed ✅
- [x] `iap-apple-notifications` webhook ready ✅
- [ ] App Store Connect: Configure Server Notifications URL
- [ ] TestFlight: Verify sandbox IAP flow

### 🤖 Google Play Store

- [x] `GOOGLE_PACKAGE_NAME` = eu.m1ssion.app ✅
- [x] `PUBSUB_VERIFICATION_TOKEN` configured ✅
- [ ] **`GOOGLE_SERVICE_ACCOUNT_KEY`** ⚠️ ADD THIS!
- [x] `FCM_SERVICE_ACCOUNT_JSON` for push ✅
- [ ] Google Cloud: Create Pub/Sub topic + subscription
- [ ] Google Play Console: Link Pub/Sub for RTDN

---

## 🔧 COMMANDS TO EXECUTE

### 1. Add Missing Google Secret
```bash
# First, get the service account JSON from Google Cloud Console:
# 1. Go to Google Cloud Console > IAM > Service Accounts
# 2. Create/select service account with "Android Publisher" role
# 3. Download JSON key

# Then set it (replace <JSON_CONTENT> with the actual JSON):
supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}' --project-ref vkjrqirvdvjbemsfzxof
```

### 2. Verify All Secrets Present
```bash
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof | grep -E "APPLE_|GOOGLE_|STRIPE_|FCM_|VAPID_|APNS_"
```

### 3. Test IAP Endpoints
```bash
# Apple IAP test (will fail without valid receipt, but should return 400 not 500)
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/verify-iap-purchase" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{"platform":"ios","receipt_data":"test"}'

# Google IAP test
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/verify-iap-purchase" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{"platform":"android","product_id":"test","purchase_token":"test"}'
```

### 4. Full Smoke Test
```bash
bash _logs/security_cleanup/smoke_test_functions_curl.sh vkjrqirvdvjbemsfzxof
```

---

## 📊 FINAL STATUS

| Metric | Value |
|--------|-------|
| Secrets | 85/100 ✅ |
| iOS Ready | ✅ YES |
| Android Ready | ⚠️ BLOCKED (missing GOOGLE_SERVICE_ACCOUNT_KEY) |
| Stripe Ready | ✅ YES |
| Push Ready | ✅ YES |
| Security | ✅ PASS |

---

**BLOCKERS:** 
1. ❌ `GOOGLE_SERVICE_ACCOUNT_KEY` must be added before Google Play submission

**NO BLOCKERS FOR:**
- Apple App Store submission
- Stripe payments
- Push notifications (all platforms)

---

*© 2026 M1SSION™ - Store Readiness Audit*

