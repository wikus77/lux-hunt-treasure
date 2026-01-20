# M1SSION™ IAP Deployment Report

**Data:** $(date)
**Progetto:** vkjrqirvdvjbemsfzxof

---

## ✅ COMPLETATO

### Edge Functions Deploy
| Funzione | Stato |
|----------|-------|
| verify-iap-purchase | ✅ DEPLOYED |
| restore-iap-subscription | ✅ DEPLOYED |
| sync-subscription-status | ✅ DEPLOYED |
| iap-apple-notifications | ✅ DEPLOYED |
| iap-google-rtdn | ✅ DEPLOYED |

---

## ⚠️ BLOCCATO: Database Migrations

**Problema:** Il connection pooler Supabase è saturo e va in timeout.
- `supabase db pull` fallisce
- `supabase db push` non può funzionare

**Root Cause:** `context deadline exceeded` sul pooler AWS EU-Central-1

---

## 🔧 AZIONE RICHIESTA (Manuale)

### Applica le migrazioni via Supabase Dashboard:

1. Vai a: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/sql
2. Copia e incolla il contenuto di: `./_logs/FULL_IAP_MIGRATION.sql`
3. Clicca "Run"

**Il file contiene:**
- Schema tabelle IAP (iap_products, iap_transactions, user_wallet, user_entitlements)
- Funzioni helper (increment_user_m1u, grant_subscription_entitlement, etc.)
- Rate limiting e replay defense tables
- Status mapping per Apple/Google notifications

---

## �� SECRETS DA IMPOSTARE

Dopo le migrazioni, imposta i secrets:

```bash
supabase secrets set APPLE_SHARED_SECRET="xxx"
supabase secrets set APPLE_BUNDLE_ID="eu.m1ssion.app"
supabase secrets set GOOGLE_PACKAGE_NAME="eu.m1ssion.app"
supabase secrets set PUBSUB_VERIFICATION_TOKEN="$(openssl rand -hex 32)"
supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"
```

Per Google Service Account:
1. Crea file `service-account.json`
2. Esegui: `supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY="$(cat service-account.json)"`

---

## 📊 STATUS FINALE

| Componente | Stato |
|------------|-------|
| Edge Functions | ✅ PASS |
| Database Migrations | ⚠️ MANUALE RICHIESTO |
| Secrets | ⏳ DA IMPOSTARE |
