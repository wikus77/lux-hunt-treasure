# SECRETS USAGE SCAN

| Secret | Occurrences | Status |
|--------|-------------|--------|
| `BASE_URL` | 0 | ✅ UNUSED |
| `EXTERNAL_SUPABASE_URL` | 0 | ✅ UNUSED |
| `PROJECT_URL` | 0 | ✅ UNUSED |
| `SB_URL` | 0 | ✅ UNUSED |
| `URL` | 0 | ✅ UNUSED |
| `ANON_KEY` | 0 | ✅ UNUSED |
| `EXTERNAL_SUPABASE_ANON_KEY` | 0 | ✅ UNUSED |
| `VITE_SUPABASE_ANON_KEY` | 0 | ✅ UNUSED |
| `SERVICE_ROLE_KEY` | 2 | ⚠️ USED (2) |
| `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` | 0 | ✅ UNUSED |
| `SRK` | 0 | ✅ UNUSED |
| `ADMIN_BROADCAST_TOKEN` | 0 | ✅ UNUSED |
| `X_ADMIN_TOKEN` | 0 | ✅ UNUSED |
| `VAPID_SUB` | 0 | ✅ UNUSED |
| `WEBPUSH_CONTACT_EMAIL` | 0 | ✅ UNUSED |
| `VAPID_PUBLIC` | 0 | ✅ UNUSED |
| `FIREBASE_PROJECT_ID` | 0 | ✅ UNUSED |
| `FIREBASE_MESSAGING_SENDER_ID` | 0 | ✅ UNUSED |
| `VITE_SUPABASE_PROJECT_ID` | 0 | ✅ UNUSED |
| `VITE_SUPABASE_URL` | 0 | ✅ UNUSED |


## INVALID/DIRTY SECRETS

| Secret Name | Issue | Risk | Action |
|-------------|-------|------|--------|
| `wikus77@hotmail.it` | Email as secret name | HIGH | REMOVE |
| `\`APNS_ENVIRONMENT` | Has backtick character | HIGH | REMOVE |
| `\`` | Empty/corrupted name | HIGH | REMOVE |
