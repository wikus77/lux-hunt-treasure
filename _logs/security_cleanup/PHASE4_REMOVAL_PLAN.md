# 🗑️ PHASE 4: REMOVAL PLAN

**Data:** 2026-01-20 09:50 CET  
**Target:** 88 → ~58 secrets (30 rimozioni)  
**Strategia:** Batch piccoli (5-8 secrets) + smoke test dopo ogni batch

---

## ⚠️ VINCOLI

1. ❌ NON toccare auth/login/core
2. ❌ NON rimuovere secrets REQUIRED
3. ✅ Smoke test PASS dopo ogni batch
4. ✅ Rollback possibile (git + ripristino secrets)

---

## 📋 BATCH PLAN

### BATCH 1: INVALID NAMES (2 secrets) - SAFEST
**Rischio:** ⭐ ZERO - nomi invalidi, impossibile usarli

```bash
# BATCH 1: Invalid secret names
supabase secrets unset \
  '`APNS_ENVIRONMENT' \
  '`' \
  --project-ref vkjrqirvdvjbemsfzxof
```

**Verifica post:**
```bash
bash _logs/security_cleanup/smoke_test_functions_curl.sh vkjrqirvdvjbemsfzxof
```

---

### BATCH 2: DUPLICATES - VAPID (3 secrets) - LOW RISK
**Rischio:** ⭐ BASSO - stesso valore, altro nome già usato

| Rimuovere | Mantenere (stesso digest) |
|-----------|---------------------------|
| `VAPID_PUBLIC` | `VAPID_PUBLIC_KEY` |
| `VAPID_SUB` | `VAPID_SUBJECT` |
| `WEBPUSH_CONTACT_EMAIL` | `VAPID_SUBJECT` |

```bash
# BATCH 2: VAPID duplicates
supabase secrets unset \
  VAPID_PUBLIC \
  VAPID_SUB \
  WEBPUSH_CONTACT_EMAIL \
  --project-ref vkjrqirvdvjbemsfzxof
```

---

### BATCH 3: AION LEGACY (3 secrets) - LOW RISK
**Rischio:** ⭐ BASSO - sistema AION deprecato, zero riferimenti

```bash
# BATCH 3: AION legacy
supabase secrets unset \
  AION_DEBUG \
  AION_LOCALE \
  AION_MODE \
  --project-ref vkjrqirvdvjbemsfzxof
```

---

### BATCH 4: ADMIN LEGACY (3 secrets) - LOW RISK
**Rischio:** ⭐ BASSO - mai usati nel codice

```bash
# BATCH 4: Admin legacy
supabase secrets unset \
  ADMIN_EMAILS \
  ADMIN_KEY \
  ADMIN_TOKEN \
  --project-ref vkjrqirvdvjbemsfzxof
```

⚠️ **NOTA:** `ADMIN_USER_IDS` e `ADMIN_WHITELIST` sono DIVERSI e sono usati!

---

### BATCH 5: FIREBASE FRONTEND (6 secrets) - LOW RISK
**Rischio:** ⭐ BASSO - chiavi pubbliche frontend, non usate nel backend

```bash
# BATCH 5: Firebase frontend keys
supabase secrets unset \
  FIREBASE_API_KEY \
  FIREBASE_APP_ID \
  FIREBASE_AUTH_DOMAIN \
  FIREBASE_STORAGE_BUCKET \
  FIREBASE_VAPID_KEY \
  FIREBASE_SERVER_KEY \
  --project-ref vkjrqirvdvjbemsfzxof
```

---

### BATCH 6: FIREBASE DUPLICATES (5 secrets) - MEDIUM RISK
**Rischio:** ⭐⭐ MEDIO - verificare che FCM_* sia configurato

| Rimuovere | Canonical |
|-----------|-----------|
| `FIREBASE_CLIENT_EMAIL` | `FCM_CLIENT_EMAIL` |
| `FIREBASE_CLIENT_ID` | N/A |
| `FIREBASE_PRIVATE_KEY` | `FCM_PRIVATE_KEY` |
| `FIREBASE_PRIVATE_KEY_ID` | N/A |
| `FCM_CLIENT_EMAIL` | (empty value - digest e3b0c44...) |

```bash
# BATCH 6: Firebase duplicates
supabase secrets unset \
  FIREBASE_CLIENT_EMAIL \
  FIREBASE_CLIENT_ID \
  FIREBASE_PRIVATE_KEY \
  FIREBASE_PRIVATE_KEY_ID \
  FCM_CLIENT_EMAIL \
  --project-ref vkjrqirvdvjbemsfzxof
```

---

### BATCH 7: UNUSED CONFIG (6 secrets) - LOW RISK
**Rischio:** ⭐ BASSO - mai referenziati

```bash
# BATCH 7: Unused config
supabase secrets unset \
  AI_PROVIDER \
  ALLOWED_ORIGINS \
  FREE_OVERRIDE_ENABLE \
  LOG_DELIVERY \
  POSTGREST_URL \
  PROJECT_REF \
  --project-ref vkjrqirvdvjbemsfzxof
```

---

### BATCH 8: BUILD INFO (3 secrets) - LOW RISK
**Rischio:** ⭐ BASSO - info di build, non funzionali

```bash
# BATCH 8: Build info
supabase secrets unset \
  VITE_BUILD_ID \
  VITE_PWA_VERSION \
  X_M1_DROPPER_VERSION \
  --project-ref vkjrqirvdvjbemsfzxof
```

---

## 📊 RIEPILOGO BATCH

| Batch | Secrets | Rischio | Descrizione |
|-------|---------|---------|-------------|
| 1 | 2 | ⭐ Zero | Invalid names |
| 2 | 3 | ⭐ Low | VAPID duplicates |
| 3 | 3 | ⭐ Low | AION legacy |
| 4 | 3 | ⭐ Low | Admin legacy |
| 5 | 6 | ⭐ Low | Firebase frontend |
| 6 | 5 | ⭐⭐ Med | Firebase duplicates |
| 7 | 6 | ⭐ Low | Unused config |
| 8 | 3 | ⭐ Low | Build info |
| **TOTALE** | **31** | | |

---

## 🔄 ROLLBACK PLAN

### Se smoke test fallisce:

1. **Identifica secret mancante** dal log errore
2. **Ripristina singolo secret:**
```bash
# Esempio: ripristina VAPID_PUBLIC
supabase secrets set VAPID_PUBLIC="$(supabase secrets list --project-ref vkjrqirvdvjbemsfzxof | grep VAPID_PUBLIC_KEY | awk '{print $3}')" \
  --project-ref vkjrqirvdvjbemsfzxof
```

3. **Oppure rollback completo:**
```bash
# Torna al commit pre-cleanup
git log --oneline -5
# Nota: i secrets NON sono in git, devi ripristinarli manualmente dal backup
```

### Backup secrets (se possibile):
```bash
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof > _logs/security_cleanup/secrets_backup_$(date +%Y%m%d_%H%M%S).txt
```

---

## 🚀 ESECUZIONE

### Script completo (da eseguire batch per batch):

```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="vkjrqirvdvjbemsfzxof"
SMOKE_TEST="./_logs/security_cleanup/smoke_test_functions_curl.sh"

run_batch() {
  local batch_name="$1"
  shift
  echo "=== BATCH: $batch_name ==="
  echo "Removing: $@"
  supabase secrets unset "$@" --project-ref "$PROJECT_REF"
  echo ""
  echo "Running smoke test..."
  if bash "$SMOKE_TEST" "$PROJECT_REF"; then
    echo "✅ BATCH $batch_name: PASS"
  else
    echo "❌ BATCH $batch_name: FAIL - STOP!"
    exit 1
  fi
  echo ""
}

# Esegui un batch alla volta, commentando quelli già fatti
# run_batch "1-INVALID" '`APNS_ENVIRONMENT' '`'
# run_batch "2-VAPID" VAPID_PUBLIC VAPID_SUB WEBPUSH_CONTACT_EMAIL
# run_batch "3-AION" AION_DEBUG AION_LOCALE AION_MODE
# run_batch "4-ADMIN" ADMIN_EMAILS ADMIN_KEY ADMIN_TOKEN
# run_batch "5-FB-FRONTEND" FIREBASE_API_KEY FIREBASE_APP_ID FIREBASE_AUTH_DOMAIN FIREBASE_STORAGE_BUCKET FIREBASE_VAPID_KEY FIREBASE_SERVER_KEY
# run_batch "6-FB-DUPLICATES" FIREBASE_CLIENT_EMAIL FIREBASE_CLIENT_ID FIREBASE_PRIVATE_KEY FIREBASE_PRIVATE_KEY_ID FCM_CLIENT_EMAIL
# run_batch "7-UNUSED" AI_PROVIDER ALLOWED_ORIGINS FREE_OVERRIDE_ENABLE LOG_DELIVERY POSTGREST_URL PROJECT_REF
# run_batch "8-BUILD" VITE_BUILD_ID VITE_PWA_VERSION X_M1_DROPPER_VERSION

echo "=== ALL BATCHES COMPLETE ==="
supabase secrets list --project-ref "$PROJECT_REF" | wc -l
```

---

## ✅ CHECKLIST PRE-ESECUZIONE

- [ ] Backup secrets list salvato
- [ ] Git status pulito
- [ ] Smoke test base PASSA
- [ ] Autorizzazione esplicita ricevuta

---

## 📌 SECRETS DA NON TOCCARE MAI

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_CONTACT
VAPID_SUBJECT
PUSH_ADMIN_TOKEN
FCM_SERVICE_ACCOUNT_JSON
FCM_PROJECT_ID
FCM_SERVER_KEY
CRON_SECRET
ADMIN_WHITELIST
ADMIN_USER_IDS
CORS_ORIGINS
MJ_APIKEY_PUBLIC
MJ_APIKEY_PRIVATE
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
GEMINI_API_KEY
LOVABLE_API_KEY
RESEND_API_KEY
APPLE_SHARED_SECRET
CONTACT_EMAIL
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

---

*© 2026 M1SSION™ - Security Cleanup Phase 4*

