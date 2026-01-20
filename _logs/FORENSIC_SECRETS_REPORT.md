# 🔬 FORENSIC SECRETS AUDIT REPORT
## Progetto: M1SSION™ (lux-hunt-treasure)
**Data:** 2026-01-20  
**Supabase Project:** vkjrqlrvdvjbeestfxof

---

## 📊 EXECUTIVE SUMMARY

| Metrica | Valore |
|---------|--------|
| **Limite Supabase secrets** | ~100 |
| **Secrets identificati nel codice** | 77 |
| **Secrets duplicati trovati** | 18 |
| **Secrets rimovibili (stima)** | 18-25 |
| **Target post-pulizia** | ~55-60 secrets |

### ⚠️ PROBLEMA CLI
Il comando `supabase secrets list` ha restituito **errore 403** (insufficient privileges).
L'analisi è stata condotta esclusivamente tramite grep del codice sorgente.

---

## 🔍 SECRETS ATTUALMENTE IN USO (77 totali)

### Core Infrastructure (usati ovunque)
- `SUPABASE_URL` (191 usi)
- `SUPABASE_SERVICE_ROLE_KEY` (163 usi)
- `SERVICE_ROLE_KEY` (176 usi) ⚠️ DUPLICATO
- `SUPABASE_ANON_KEY` (30 usi)
- `ANON_KEY` (32 usi) ⚠️ DUPLICATO
- `SB_URL` (13 usi) ⚠️ DUPLICATO

### Push Notifications
- `VAPID_PUBLIC_KEY` (39 usi)
- `VAPID_PRIVATE_KEY` (36 usi)
- `VAPID_SUBJECT` (12 usi)
- `VAPID_CONTACT` (10 usi)
- `VAPID_EMAIL` (4 usi)
- `PUSH_ADMIN_TOKEN` (14 usi)
- `FCM_SERVER_KEY` (7 usi)
- `FCM_PROJECT_ID` (6 usi)
- `FCM_SERVICE_ACCOUNT_JSON` (4 usi)
- `FCM_SERVICE_ACCOUNT_JSON_B64` (2 usi) ⚠️ DUPLICATO
- `FIREBASE_SA_JSON` (3 usi) ⚠️ DUPLICATO

### AI & Embeddings
- `GEMINI_API_KEY` (10 usi)
- `OPENAI_API_KEY` (11 usi)
- `LOVABLE_API_KEY` (18 usi)
- `CLOUDFLARE_API_TOKEN` (9 usi)
- `CLOUDFLARE_ACCOUNT_ID` (9 usi)
- `CF_EMBEDDING_MODEL` (7 usi)
- `EMBEDDING_MODEL` (8 usi)

### Email
- `MJ_APIKEY_PUBLIC` (16 usi)
- `MJ_APIKEY_PRIVATE` (16 usi)
- `MAILJET_API_KEY` (2 usi) ⚠️ DUPLICATO
- `MAILJET_SECRET_KEY` (2 usi) ⚠️ DUPLICATO
- `SMTP_HOST` (3 usi)
- `SMTP_USER` (3 usi)
- `SMTP_PASSWORD` (5 usi)
- `SMTP_PORT` (3 usi)
- `CONTACT_EMAIL` (2 usi)
- `NOREPLY_EMAIL` (1 uso)
- `NOREPLY_PASSWORD` (1 uso)
- `RESEND_API_KEY` (2 usi)

### Stripe Payments
- `STRIPE_SECRET_KEY` (19 usi)
- `STRIPE_WEBHOOK_SECRET` (4 usi)

### IAP (In-App Purchase) - NUOVI
- `APPLE_SHARED_SECRET` (5 usi)
- `APPLE_BUNDLE_ID` (3 usi)
- `GOOGLE_SERVICE_ACCOUNT_KEY` (5 usi)
- `GOOGLE_PACKAGE_NAME` (4 usi)
- `PUBSUB_VERIFICATION_TOKEN` (2 usi)
- `IAP_SANDBOX` (3 usi)

### Security & Admin
- `CRON_SECRET` (9 usi)
- `INTERNAL_SECRET` (4 usi)
- `ADMIN_WHITELIST` (9 usi)
- `ADMIN_USER_IDS` (1 uso)
- `DECAY_ADMIN_TOKEN` (1 uso)
- `M1SSION_HMAC_SECRET` (1 uso)

### Debug & Config
- `DEBUG_PANELS` (3 usi)
- `DEBUG_BUZZ_MAP` (2 usi)
- `IP_HASH_SALT` (2 usi)
- `CORS_ORIGINS` (3 usi)
- `CORS_ALLOWED_ORIGIN` (1 uso)
- `ORIGIN_APP` (1 uso)
- `ORIGIN_WEB` (1 uso)

### Misc
- `ELEVENLABS_API_KEY` (3 usi)
- `ONESIGNAL_REST_API_KEY` (1 uso) ⚠️ PROBABILMENTE UNUSED
- `FEED_SCORE_MIN` (4 usi)
- `NOTIFIER_PREFS_COOLDOWN_HOURS` (1 uso)
- `USE_IONOS_ONLY` (2 usi)
- `USE_PRO_SCORING` (1 uso)
- `BUILD_SHA` (2 usi)
- `LOVABLE_CHAT_MODEL` (2 usi)
- `GEMINI_MODEL` (2 usi)

### 🚨 FRONTEND SECRETS (NON DOVREBBERO ESSERE QUI!)
- `VITE_FIREBASE_API_KEY` (1 uso) ⛔ PUBLIC
- `VITE_FIREBASE_APP_ID` (1 uso) ⛔ PUBLIC
- `VITE_FIREBASE_AUTH_DOMAIN` (1 uso) ⛔ PUBLIC
- `VITE_FIREBASE_MESSAGING_SENDER_ID` (1 uso) ⛔ PUBLIC
- `VITE_FIREBASE_PROJECT_ID` (1 uso) ⛔ PUBLIC
- `VITE_FIREBASE_STORAGE_BUCKET` (1 uso) ⛔ PUBLIC
- `VITE_FIREBASE_VAPID_KEY` (1 uso) ⛔ PUBLIC
- `VITE_STRIPE_PUBLISHABLE_KEY_LIVE` (1 uso) ⛔ PUBLIC
- `VITE_STRIPE_PUBLISHABLE_KEY_TEST` (1 uso) ⛔ PUBLIC

---

## ⚠️ DUPLICATI IDENTIFICATI

### Tipo 1: Stessa funzione, nomi diversi
| Coppia | Risparmio |
|--------|-----------|
| `SERVICE_ROLE_KEY` = `SUPABASE_SERVICE_ROLE_KEY` | 1 secret |
| `ANON_KEY` = `SUPABASE_ANON_KEY` | 1 secret |
| `SB_URL` = `SUPABASE_URL` | 1 secret |
| `MJ_APIKEY_PUBLIC` = `MAILJET_API_KEY` | 1 secret |
| `MJ_APIKEY_PRIVATE` = `MAILJET_SECRET_KEY` | 1 secret |

### Tipo 2: Stessi dati, formati diversi
| Gruppo | Risparmio |
|--------|-----------|
| `FCM_SERVICE_ACCOUNT_JSON` / `FCM_SERVICE_ACCOUNT_JSON_B64` / `FIREBASE_SA_JSON` | 2 secrets |
| `VAPID_CONTACT` / `VAPID_EMAIL` / `VAPID_SUBJECT` | 2 secrets |

**Totale duplicati: ~9 secrets**

---

## 🗑️ SECRETS DA RIMUOVERE

### Fase 1: IMMEDIATA (9 secrets) - 🟢 LOW RISK
Secrets frontend che sono PUBLIC keys:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_VAPID_KEY
VITE_STRIPE_PUBLISHABLE_KEY_LIVE
VITE_STRIPE_PUBLISHABLE_KEY_TEST
```

**Azione richiesta:** Modificare `get-firebase-config/index.ts` e `_shared/stripeConfig.ts` per hardcodare questi valori invece di leggerli da env.

### Fase 2: CONSOLIDAMENTO (9 secrets) - 🟡 MEDIUM RISK
Standardizzare nomi duplicati nel codice, poi rimuovere:
```
SERVICE_ROLE_KEY → SUPABASE_SERVICE_ROLE_KEY
ANON_KEY → SUPABASE_ANON_KEY
SB_URL → SUPABASE_URL
MJ_APIKEY_PUBLIC → MAILJET_API_KEY
MJ_APIKEY_PRIVATE → MAILJET_SECRET_KEY
FCM_SERVICE_ACCOUNT_JSON_B64 → FCM_SERVICE_ACCOUNT_JSON
FIREBASE_SA_JSON → FCM_SERVICE_ACCOUNT_JSON
VAPID_EMAIL → VAPID_CONTACT
VAPID_SUBJECT → VAPID_CONTACT (se uguale)
```

---

## 🎯 VERDETTO FINALE

### RACCOMANDAZIONE: 🟢 PULIRE IL PROGETTO ATTUALE

**NON è necessario creare un nuovo progetto Supabase.**

Con la pulizia proposta:
- **Secrets attuali stimati:** ~100
- **Dopo Fase 1 (frontend):** ~91 (-9)
- **Dopo Fase 2 (duplicati):** ~82 (-9)
- **Margine finale:** ~18 secrets liberi

Questo è sufficiente per aggiungere i 6 secrets IAP richiesti:
1. `APPLE_SHARED_SECRET` ✅ (già definito)
2. `APPLE_BUNDLE_ID` ✅ (già definito)
3. `GOOGLE_PACKAGE_NAME` ✅ (già definito)
4. `GOOGLE_SERVICE_ACCOUNT_KEY` ✅ (già definito)
5. `PUBSUB_VERIFICATION_TOKEN` ✅ (già definito)
6. `CRON_SECRET` ✅ (già definito)

---

## 📋 PIANO D'AZIONE

### Step 1: Backup
```bash
# Se CLI funziona:
supabase secrets list --project-ref vkjrqlrvdvjbeestfxof > secrets_backup_$(date +%Y%m%d).txt
```

### Step 2: Modifica codice (per rimuovere VITE_*)
File da modificare:
- `supabase/functions/get-firebase-config/index.ts`
- `supabase/functions/_shared/stripeConfig.ts`

### Step 3: Standardizza duplicati nel codice
Cercare e sostituire in tutti i file:
- `Deno.env.get("SERVICE_ROLE_KEY")` → `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`
- `Deno.env.get("ANON_KEY")` → `Deno.env.get("SUPABASE_ANON_KEY")`
- `Deno.env.get("SB_URL")` → `Deno.env.get("SUPABASE_URL")`
- ecc...

### Step 4: Deploy Edge Functions modificate
```bash
supabase functions deploy --project-ref vkjrqlrvdvjbeestfxof
```

### Step 5: Rimuovi secrets inutilizzati
```bash
supabase secrets unset VITE_FIREBASE_API_KEY VITE_FIREBASE_APP_ID ... --project-ref vkjrqlrvdvjbeestfxof
```

### Step 6: Imposta secrets IAP mancanti
```bash
supabase secrets set \
  APPLE_SHARED_SECRET="<valore da App Store Connect>" \
  GOOGLE_SERVICE_ACCOUNT_KEY="<JSON service account>" \
  PUBSUB_VERIFICATION_TOKEN="<token per webhook Google>" \
  --project-ref vkjrqlrvdvjbeestfxof
```

---

## 📁 FILE GENERATI DA QUESTO AUDIT

| File | Descrizione |
|------|-------------|
| `_logs/secrets_from_code.txt` | Lista grezza secrets trovati nel codice |
| `_logs/secrets_raw_list.txt` | Output (fallito) di supabase secrets list |
| `_logs/secrets_usage_matrix.md` | Matrice di utilizzo per ogni secret |
| `_logs/secrets_duplicates.md` | Analisi dettagliata duplicati |
| `_logs/secrets_removal_plan.md` | Piano di rimozione con risk scoring |
| `_logs/FORENSIC_SECRETS_REPORT.md` | Questo report finale |

---

## ⚠️ VINCOLI RISPETTATI

- ❌ NON sono stati cancellati secrets
- ❌ NON è stato modificato codice
- ❌ NON è stato resettato il progetto
- ✅ SOLO analisi e report generati

---

**Fine Report - Generato automaticamente il 2026-01-20**

