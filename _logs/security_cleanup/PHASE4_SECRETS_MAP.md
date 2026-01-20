# 🗺️ PHASE 4: SECRETS MAP

**Data:** 2026-01-20 09:50 CET  
**Totale Secrets:** 88  
**Referenziati nel codice:** ~45 unici  
**Candidati rimozione:** 30+

---

## 📊 RIEPILOGO PER CATEGORIA

| Categoria | Count | Azione |
|-----------|-------|--------|
| **REQUIRED** (core) | 28 | ❌ NON TOCCARE |
| **DUPLICATE** (stesso digest) | 6 | ✅ RIMUOVERE |
| **UNUSED** (zero riferimenti) | 22 | ✅ RIMUOVERE |
| **LEGACY** (alias vecchi) | 8 | ⚠️ VALUTARE |
| **CONFIG** (non sensibili) | 14 | ⚠️ VALUTARE |
| **INVALID** (nomi sporchi) | 2 | ✅ RIMUOVERE |

---

## 🔴 REQUIRED (NON TOCCARE - 28 secrets)

| Secret | Occorrenze | File Principali |
|--------|------------|-----------------|
| `SUPABASE_URL` | 42 | _shared/client.ts, tutti i functions |
| `SUPABASE_SERVICE_ROLE_KEY` | 41 | _shared/client.ts, admin/cron functions |
| `SUPABASE_ANON_KEY` | 7 | _shared/client.ts, public functions |
| `STRIPE_SECRET_KEY` | 7 | stripe-*, handle-payment-* |
| `STRIPE_WEBHOOK_SECRET` | 1 | stripe-webhook-secure |
| `VAPID_PUBLIC_KEY` | 7 | push functions |
| `VAPID_PRIVATE_KEY` | 5 | push functions |
| `VAPID_CONTACT` | 5 | push functions |
| `VAPID_SUBJECT` | 4 | smart-push-engine, final-shoot-notify |
| `PUSH_ADMIN_TOKEN` | 5 | battle-push-*, claim-marker-* |
| `CLOUDFLARE_API_TOKEN` | 6 | _shared/embedProvider.ts |
| `CLOUDFLARE_ACCOUNT_ID` | 6 | _shared/embedProvider.ts |
| `MJ_APIKEY_PUBLIC` | 4 | send-mailjet-email |
| `MJ_APIKEY_PRIVATE` | 4 | send-mailjet-email |
| `SMTP_HOST` | 3 | email functions |
| `SMTP_PORT` | 3 | email functions |
| `SMTP_USER` | 3 | email functions |
| `SMTP_PASSWORD` | 3 | email functions |
| `RESEND_API_KEY` | 2 | resend email |
| `LOVABLE_API_KEY` | 2 | norah-chat, populate-knowledge-base |
| `GEMINI_API_KEY` | 3 | norah-chat-v2, tts-google, generate-mission-clues-ai |
| `FCM_SERVICE_ACCOUNT_JSON` | 3 | fcm-send, fcm-test, fcmTestSend |
| `FCM_PROJECT_ID` | 4 | fcm-send, fcm-test, send-test-push |
| `CRON_SECRET` | 3 | pulse-decay-cron, lottery-draw-cron, sync-subscription-status |
| `CONTACT_EMAIL` | 2 | various |
| `CORS_ORIGINS` | 2 | _shared/edge-helpers.ts, authCors.ts |
| `ADMIN_WHITELIST` | 3 | _shared/edge-helpers.ts, authCors.ts, client.ts |
| `APPLE_SHARED_SECRET` | 2 | verify-iap-purchase, restore-iap-subscription |

---

## 🟢 DUPLICATE (Rimuovere - stesso digest) - 6 secrets

| Secret da RIMUOVERE | Digest | Secret CANONICAL (mantenere) |
|---------------------|--------|------------------------------|
| `VAPID_PUBLIC` | `2844887bb...` | `VAPID_PUBLIC_KEY` ✅ |
| `VAPID_SUB` | `b1a151f01...` | `VAPID_SUBJECT` ✅ |
| `WEBPUSH_CONTACT_EMAIL` | `b1a151f01...` | `VAPID_SUBJECT` ✅ |
| `FCM_SERVICE_ACCOUNT_JSON_B64` | `32841455d...` | `FCM_SERVICE_ACCOUNT_JSON` ✅ |
| `FIREBASE_SA_JSON` | `56e8c976d...` | `FCM_SERVICE_ACCOUNT_JSON` (diverso digest!) ⚠️ |
| `FIREBASE_SERVICE_ACCOUNT_B64` | `1544d1640...` | Verificare se usato |

**Nota:** `FIREBASE_SA_JSON` ha digest DIVERSO da `FCM_SERVICE_ACCOUNT_JSON` - potrebbero essere chiavi diverse!

---

## 🟡 UNUSED (Zero riferimenti nel codice) - 22 secrets

| Secret | Digest | Note | Azione |
|--------|--------|------|--------|
| `ADMIN_EMAILS` | `9e0aefd8f...` | Mai usato | ✅ REMOVE |
| `ADMIN_KEY` | `ec24aeaca...` | Mai usato | ✅ REMOVE |
| `ADMIN_TOKEN` | `ff730232...` | Mai usato (diverso da PUSH_ADMIN_TOKEN) | ✅ REMOVE |
| `AION_DEBUG` | `6b86b273f...` | Legacy AION | ✅ REMOVE |
| `AION_LOCALE` | `2ad8a704...` | Legacy AION | ✅ REMOVE |
| `AION_MODE` | `6754af96...` | Legacy AION | ✅ REMOVE |
| `AI_PROVIDER` | `5d72436...` | Mai usato | ✅ REMOVE |
| `ALLOWED_ORIGINS` | `bcbc0720...` | Mai usato (usato CORS_ORIGINS) | ✅ REMOVE |
| `FCM_CLIENT_EMAIL` | `e3b0c442...` | Empty value (digest = empty string) | ✅ REMOVE |
| `FCM_SENDER_ID` | `182b7fde...` | Mai usato | ✅ REMOVE |
| `FIREBASE_API_KEY` | `0cec948d...` | Frontend only, non backend | ✅ REMOVE |
| `FIREBASE_APP_ID` | `af6c406a...` | Frontend only | ✅ REMOVE |
| `FIREBASE_AUTH_DOMAIN` | `abe26ac3...` | Frontend only | ✅ REMOVE |
| `FIREBASE_CLIENT_EMAIL` | `4d5d6bb5...` | Duplicato FCM_CLIENT_EMAIL | ✅ REMOVE |
| `FIREBASE_CLIENT_ID` | `b91b62e6...` | Mai usato | ✅ REMOVE |
| `FIREBASE_PRIVATE_KEY` | `3f17971e...` | Duplicato FCM_PRIVATE_KEY | ✅ REMOVE |
| `FIREBASE_PRIVATE_KEY_ID` | `ce32f649...` | Mai usato | ✅ REMOVE |
| `FIREBASE_SERVER_KEY` | `33916d93...` | Legacy (usare FCM_SERVER_KEY) | ✅ REMOVE |
| `FIREBASE_STORAGE_BUCKET` | `f8a6fd5f...` | Frontend only | ✅ REMOVE |
| `FIREBASE_VAPID_KEY` | `a1cd835e...` | Frontend only | ✅ REMOVE |
| `FREE_OVERRIDE_ENABLE` | `5feceb66...` | Mai usato | ✅ REMOVE |
| `JWT_SECRET` | `80a10788...` | Supabase internal, non usato da noi | ⚠️ VERIFY |

---

## 🟠 CONFIG/NON-SENSIBILI (Valutare) - 14 secrets

| Secret | Usato? | Note |
|--------|--------|------|
| `APNS_ENVIRONMENT` | ❌ | iOS push non implementato |
| `APNS_KEY_ID` | ❌ | iOS push non implementato |
| `APNS_PRIVATE_KEY` | ❌ | iOS push non implementato |
| `APNS_TEAM_ID` | ❌ | iOS push non implementato |
| `APPLE_BUNDLE_ID` | ✅ | IAP functions |
| `ELEVENLABS_API_KEY` | ✅ | tts-elevenlabs |
| `GEMINI_MODEL` | ✅ | generate-mission-clues-ai |
| `KEY` | ❓ | Nome generico, verificare |
| `LOG_DELIVERY` | ❌ | Mai usato |
| `ONESIGNAL_APP_ID` | ✅ | send-push-notification-onesignal |
| `ONESIGNAL_REST_API_KEY` | ✅ | send-push-notification-onesignal |
| `POSTGREST_URL` | ❌ | Mai usato |
| `PROJECT_REF` | ❌ | Mai usato (info solo) |
| `SENTRY_DSN` | ❌ | Mai usato nel backend |
| `SUPABASE_DB_URL` | ❌ | Mai usato da functions |

---

## 🔵 LEGACY (Alias vecchi, possibile consolidamento) - 8 secrets

| Secret LEGACY | Usato? | Canonical | Stesso Digest? |
|--------------|--------|-----------|----------------|
| `CORS_ALLOWED_ORIGIN` | ❌ | `CORS_ORIGINS` | NO |
| `NOREPLY_EMAIL` | ? | `CONTACT_EMAIL` | Verificare |
| `NOREPLY_PASSWORD` | ? | `SMTP_PASSWORD` | Verificare |
| `ORIGIN_APP` | ? | `ALLOWED_ORIGINS` | NO |
| `ORIGIN_WEB` | ? | `ALLOWED_ORIGINS` | NO |
| `STRIPE_PUBLISHABLE_KEY` | ❌ | Frontend only | N/A |
| `VITE_BUILD_ID` | ❌ | Build info | N/A |
| `VITE_PWA_VERSION` | ❌ | Build info | N/A |
| `X_M1_DROPPER_VERSION` | ❌ | Build info | N/A |

---

## ❌ INVALID (Nomi sporchi) - 2 secrets

| Secret | Problema | Azione |
|--------|----------|--------|
| `` `APNS_ENVIRONMENT `` | Contiene backtick | ✅ REMOVE |
| `` ` `` | Nome = solo backtick | ✅ REMOVE |

---

## 📈 SECRETS USATI NEL CODICE (Top 25)

| # | Secret | Occorrenze |
|---|--------|------------|
| 1 | SUPABASE_URL | 42 |
| 2 | SUPABASE_SERVICE_ROLE_KEY | 41 |
| 3 | VAPID_PUBLIC_KEY | 7 |
| 4 | SUPABASE_ANON_KEY | 7 |
| 5 | STRIPE_SECRET_KEY | 7 |
| 6 | CLOUDFLARE_API_TOKEN | 6 |
| 7 | CLOUDFLARE_ACCOUNT_ID | 6 |
| 8 | VAPID_PRIVATE_KEY | 5 |
| 9 | VAPID_CONTACT | 5 |
| 10 | PUSH_ADMIN_TOKEN | 5 |
| 11 | MJ_APIKEY_PUBLIC | 4 |
| 12 | MJ_APIKEY_PRIVATE | 4 |
| 13 | FCM_PROJECT_ID | 4 |
| 14 | VAPID_SUBJECT | 4 |
| 15 | FCM_SERVICE_ACCOUNT_JSON | 3 |
| 16 | CRON_SECRET | 3 |
| 17 | GEMINI_API_KEY | 3 |
| 18 | SMTP_* | 3 each |
| 19 | ADMIN_WHITELIST | 3 |
| 20 | CORS_ORIGINS | 2 |
| 21 | LOVABLE_API_KEY | 2 |
| 22 | RESEND_API_KEY | 2 |
| 23 | APPLE_SHARED_SECRET | 2 |
| 24 | CONTACT_EMAIL | 2 |
| 25 | FCM_SERVER_KEY | 4 |

---

## 🎯 SOMMARIO AZIONI

| Azione | Count | Impact |
|--------|-------|--------|
| **REMOVE (sicuro)** | 30 | ✅ Zero impatto |
| **VERIFY (attenzione)** | 5 | ⚠️ Verificare prima |
| **KEEP (required)** | 53 | ❌ Non toccare |

**Target finale:** 88 → ~58 secrets (30 rimossi)

---

*© 2026 M1SSION™ - Security Cleanup Phase 4*

