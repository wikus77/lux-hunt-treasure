# 🎯 PIANO RIMOZIONE SECRETS - RISK SCORING

## LEGENDA RISCHIO
- 🟢 **LOW** = Può essere rimosso senza modifiche al codice
- 🟡 **MEDIUM** = Richiede piccole modifiche al codice (rinomina env.get)
- 🔴 **HIGH** = Richiede refactoring significativo o test approfonditi

---

## 🟢 LOW RISK - RIMOZIONE IMMEDIATA (9 secrets)

| Secret | Motivo | Azione |
|--------|--------|--------|
| `VITE_FIREBASE_API_KEY` | Public key, non serve in secrets | DELETE |
| `VITE_FIREBASE_APP_ID` | Public, non serve in secrets | DELETE |
| `VITE_FIREBASE_AUTH_DOMAIN` | Public, non serve in secrets | DELETE |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Public, non serve in secrets | DELETE |
| `VITE_FIREBASE_PROJECT_ID` | Public, non serve in secrets | DELETE |
| `VITE_FIREBASE_STORAGE_BUCKET` | Public, non serve in secrets | DELETE |
| `VITE_FIREBASE_VAPID_KEY` | Public key, non serve in secrets | DELETE |
| `VITE_STRIPE_PUBLISHABLE_KEY_LIVE` | Publishable = public | DELETE |
| `VITE_STRIPE_PUBLISHABLE_KEY_TEST` | Publishable = public | DELETE |

**⚠️ NOTA:** Richiede modifica a `get-firebase-config` e `_shared/stripeConfig.ts` per hardcodare o passare da altro canale.

---

## 🟡 MEDIUM RISK - CONSOLIDAMENTO DUPLICATI (7-9 secrets)

### Supabase Core - Standardizzare sui nomi lunghi
| Da Rimuovere | Tenere | Modifiche |
|--------------|--------|-----------|
| `SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | ~20 file |
| `ANON_KEY` | `SUPABASE_ANON_KEY` | ~15 file |
| `SB_URL` | `SUPABASE_URL` | ~8 file |

### Mailjet - Standardizzare sui nomi nuovi
| Da Rimuovere | Tenere | Modifiche |
|--------------|--------|-----------|
| `MJ_APIKEY_PUBLIC` | `MAILJET_API_KEY` | ~8 file |
| `MJ_APIKEY_PRIVATE` | `MAILJET_SECRET_KEY` | ~8 file |

### Firebase Service Account - Tenere uno solo
| Da Rimuovere | Tenere | Modifiche |
|--------------|--------|-----------|
| `FCM_SERVICE_ACCOUNT_JSON_B64` | `FCM_SERVICE_ACCOUNT_JSON` | ~2 file |
| `FIREBASE_SA_JSON` | `FCM_SERVICE_ACCOUNT_JSON` | ~3 file |

---

## 🔴 HIGH RISK - DA VALUTARE (analisi approfondita richiesta)

| Secret | Usi | Note | Azione Consigliata |
|--------|-----|------|-------------------|
| `ONESIGNAL_REST_API_KEY` | 1 | Solo in send-push-notification-onesignal | Verificare se OneSignal è ancora usato |
| `LOVABLE_API_KEY` | 18 | Chat/Norah AI | MANTENERE se in uso |
| `DECAY_ADMIN_TOKEN` | 1 | Protezione domination-decay-job | MANTENERE |
| `M1SSION_HMAC_SECRET` | 1 | Protezione API | MANTENERE |
| `RESEND_API_KEY` | 2 | Email alternativo | Verificare se Resend è usato |

---

## 📊 RIEPILOGO PIANO

| Fase | Azione | Secrets | Rischio |
|------|--------|---------|---------|
| 1 | Rimuovi secrets frontend VITE_* | 9 | 🟢 LOW |
| 2 | Consolida Supabase (SB_URL → SUPABASE_URL, etc.) | 3 | 🟡 MEDIUM |
| 3 | Consolida Mailjet | 2 | 🟡 MEDIUM |
| 4 | Consolida Firebase SA | 2 | 🟡 MEDIUM |
| 5 | Valuta VAPID duplicati | 2 | 🟡 MEDIUM |
| **TOTALE** | | **18** | |

**Obiettivo:** Da ~100 secrets a ~82 secrets (o meno con ulteriore pulizia)
