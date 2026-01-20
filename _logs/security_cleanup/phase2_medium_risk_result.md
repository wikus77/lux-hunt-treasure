# FASE 2 — MEDIUM RISK RESULT
## Security Cleanup: Consolidamento Duplicati

**Data:** 2026-01-20  
**Status:** ✅ COMPLETATA (parziale)

---

## 📋 RIEPILOGO MODIFICHE

### File Modificati: 11

| File | Modifica | Stato |
|------|----------|-------|
| `get-firebase-config/index.ts` | Rimosso 7 VITE_* secrets | ✅ |
| `_shared/stripeConfig.ts` | Rimosso 2 VITE_* secrets | ✅ |
| `push-broadcast/index.ts` | Standardizzato SUPABASE_* | ✅ |
| `auto-push-cron/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `battle-push-send/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `chat-push-notify/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `pulse-breaker-round/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `pulse-threshold-notify/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `webpush-send/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `webpush-targeted-send/index.ts` | Rimosso fallback SERVICE_ROLE_KEY | ✅ |
| `fcmTestSend/index.ts` | Standardizzato FCM_SERVICE_ACCOUNT_JSON | ✅ |

---

## 📊 TABELLA STANDARDIZZAZIONE

### Supabase Core
| OLD Secret | NEW Secret | File Impattati | Stato |
|------------|------------|----------------|-------|
| `SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | 9 file | ✅ Completato |
| `ANON_KEY` | `SUPABASE_ANON_KEY` | 1 file | ✅ Completato |
| `SB_URL` | `SUPABASE_URL` | 1 file | ✅ Completato |

### Firebase
| OLD Secret | NEW Secret | File Impattati | Stato |
|------------|------------|----------------|-------|
| `FIREBASE_SA_JSON` | `FCM_SERVICE_ACCOUNT_JSON` | 1 file | ✅ Completato |
| `FCM_SERVICE_ACCOUNT_JSON_B64` | `FCM_SERVICE_ACCOUNT_JSON` | Già fallback | ⚠️ Keep both |

### Stripe Frontend
| OLD Secret | NEW Secret | File Impattati | Stato |
|------------|------------|----------------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY_TEST` | N/A (rimosso) | 1 file | ✅ Completato |
| `VITE_STRIPE_PUBLISHABLE_KEY_LIVE` | N/A (rimosso) | 1 file | ✅ Completato |

### Mailjet (⚠️ NON CONSOLIDATO)
| OLD Secret | NEW Secret | File Impattati | Stato |
|------------|------------|----------------|-------|
| `MJ_APIKEY_PUBLIC` | `MAILJET_API_KEY` | 5 file | ⏸️ Rimandato |
| `MJ_APIKEY_PRIVATE` | `MAILJET_SECRET_KEY` | 5 file | ⏸️ Rimandato |

**Motivazione rimando Mailjet:** Richiede modifiche a 5 file + test estensivi. Rischio medio-alto.

---

## 📈 CONTEGGIO SLOT RECUPERATI

| Categoria | Secrets Rimovibili | Note |
|-----------|-------------------|------|
| VITE_FIREBASE_* | 7 | ✅ Pronti |
| VITE_STRIPE_* | 2 | ✅ Pronti |
| SERVICE_ROLE_KEY | 1 | ✅ Pronto |
| ANON_KEY | 1 | ✅ Pronto (se esiste) |
| SB_URL | 1 | ✅ Pronto (se esiste) |
| FIREBASE_SA_JSON | 1 | ✅ Pronto |
| **TOTALE** | **13** | |

### Secrets NON consolidati (da valutare)
- `MJ_APIKEY_PUBLIC` → `MAILJET_API_KEY` (⏸️)
- `MJ_APIKEY_PRIVATE` → `MAILJET_SECRET_KEY` (⏸️)
- `FCM_SERVICE_ACCOUNT_JSON_B64` (keep both per sicurezza)
- VAPID duplicates (`VAPID_EMAIL`, `VAPID_CONTACT`, `VAPID_SUBJECT`) - da verificare valori

---

## ⚠️ NOTE IMPORTANTI

1. **I secrets NON sono stati rimossi** - solo l'utilizzo nel codice
2. **Fallback mantenuti** dove necessario per migration safety
3. **Mailjet rimandato** - troppi file, richiede test dedicato
4. **VAPID non toccato** - richiede verifica valori effettivi

---

## 📋 LISTA SECRETS PRONTI PER RIMOZIONE

```
# FASE 1 - LOW RISK (9 secrets)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_VAPID_KEY
VITE_STRIPE_PUBLISHABLE_KEY_LIVE
VITE_STRIPE_PUBLISHABLE_KEY_TEST

# FASE 2 - MEDIUM RISK (4 secrets, se esistono)
SERVICE_ROLE_KEY
ANON_KEY
SB_URL
FIREBASE_SA_JSON
```

**TOTALE POTENZIALE: 13 secrets**

---

## 🔄 PROSSIMI STEP

1. **FASE 3**: Deploy Edge Functions per test
2. **FASE 4**: Report finale + STOP
3. **POST-APPROVAZIONE**: 
   - Rimozione secrets elencati
   - Test Mailjet consolidation
   - Inserimento IAP secrets

---

**Rollback point:** `git reset --hard 011df48f80ffc2992370c817b105cd900630637d`

