# 🔍 SECRETS DUPLICATI IDENTIFICATI

## ⚠️ DUPLICATI CRITICI (STESSA FUNZIONE, NOMI DIVERSI)

### 1. Supabase Core (3 coppie duplicate)
| Secret Lungo | Secret Corto | Note |
|--------------|--------------|------|
| `SUPABASE_SERVICE_ROLE_KEY` (163 usi) | `SERVICE_ROLE_KEY` (176 usi) | ⚠️ DUPLICATO |
| `SUPABASE_ANON_KEY` (30 usi) | `ANON_KEY` (32 usi) | ⚠️ DUPLICATO |
| `SUPABASE_URL` (191 usi) | `SB_URL` (13 usi) | ⚠️ DUPLICATO |

**Stima risparmio:** 3 secrets

### 2. Mailjet (2 coppie duplicate)
| Secret Nuovo | Secret Vecchio | Note |
|--------------|----------------|------|
| `MAILJET_API_KEY` (2 usi) | `MJ_APIKEY_PUBLIC` (16 usi) | ⚠️ DUPLICATO |
| `MAILJET_SECRET_KEY` (2 usi) | `MJ_APIKEY_PRIVATE` (16 usi) | ⚠️ DUPLICATO |

**Stima risparmio:** 2 secrets

### 3. Firebase Service Account (3 versioni)
| Secret | Usi | Note |
|--------|-----|------|
| `FCM_SERVICE_ACCOUNT_JSON` | 4 | JSON diretto |
| `FCM_SERVICE_ACCOUNT_JSON_B64` | 2 | Base64 encoded |
| `FIREBASE_SA_JSON` | 3 | Alias |

**Stima risparmio:** 2 secrets (tenere solo uno)

### 4. VAPID Keys (possibili duplicati)
| Secret | Usi | Note |
|--------|-----|------|
| `VAPID_CONTACT` | 10 | mailto per VAPID |
| `VAPID_EMAIL` | 4 | Email VAPID |
| `VAPID_SUBJECT` | 12 | Subject VAPID |

**Possibile risparmio:** 2 secrets (potrebbero essere lo stesso valore)

---

## 🗑️ SECRETS FRONTEND (NON APPARTENGONO A SUPABASE SECRETS!)

Questi 9 secrets sono **PUBLIC** keys e non dovrebbero essere in Supabase secrets:

| Secret | Motivo |
|--------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key è pubblica |
| `VITE_FIREBASE_APP_ID` | Firebase App ID è pubblico |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain è pubblico |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID è pubblico |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID è pubblico |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket è pubblico |
| `VITE_FIREBASE_VAPID_KEY` | VAPID Public Key è pubblica |
| `VITE_STRIPE_PUBLISHABLE_KEY_LIVE` | Stripe Publishable Key è pubblica |
| `VITE_STRIPE_PUBLISHABLE_KEY_TEST` | Stripe Test Key è pubblica |

**Stima risparmio:** 9 secrets

---

## 📊 RIEPILOGO POTENZIALE RISPARMIO

| Categoria | Secrets Rimovibili |
|-----------|-------------------|
| Duplicati Supabase Core | 3 |
| Duplicati Mailjet | 2 |
| Duplicati Firebase SA | 2 |
| Duplicati VAPID | 2 |
| Secrets Frontend | 9 |
| **TOTALE** | **18 secrets** |

