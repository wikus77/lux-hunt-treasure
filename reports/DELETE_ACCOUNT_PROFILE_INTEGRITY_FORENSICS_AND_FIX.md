# Delete Account → Profile Integrity (zombie users) — Forensics & Fix

**App:** M1SSION™ — iOS native wrapped (Capacitor / WKWebView)  
**Branch:** `fix/delete-account-profile-integrity-ios`  
**Tag rollback:** `ROLLBACK_DELETE_ACCOUNT_PROFILE_INTEGRITY_20260227_0644`  
**Data:** 2026-02-27  

---

## 1) Rollback

- **Branch:** `fix/delete-account-profile-integrity-ios`
- **Tag:** `ROLLBACK_DELETE_ACCOUNT_PROFILE_INTEGRITY_20260227_0644`
- **Ripristino:** `git checkout ROLLBACK_DELETE_ACCOUNT_PROFILE_INTEGRITY_20260227_0644` oppure `git reset --hard ROLLBACK_DELETE_ACCOUNT_PROFILE_INTEGRITY_20260227_0644`

---

## 2) Prova certa del bug

### 2.1 Ordine nella Edge Function (pre-fix)

In `supabase/functions/delete-account/index.ts`:

1. Storage (avatars) cleanup  
2. Public tables: `email_sends`, `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`  
3. **`profiles`** — `delete().eq('id', user_id)`  
4. **`admin.auth.admin.deleteUser(user_id)`**

Quindi **`profiles` viene cancellato prima di `deleteUser`**. Se `deleteUser` fallisce (FK su altra tabella, rete, ecc.), l’utente resta in `auth.users` senza riga in `public.profiles` → **zombie** → PGRST116 e loop Briefing/Welcome.

### 2.2 Prova DB

- Query: `select count(*) from public.profiles where id = '7acd9551-644d-4e32-8758-f892efe47686';`  
- Risultato: **0** (confermato da utente).  
- Conclusione: utente presente in auth, profilo assente → stato incoerente compatibile con delete parziale.

### 2.3 FK blocker

- `profiles.id` ha FK verso `auth.users(id)` (es. `ON DELETE CASCADE` in `20251208_fix_user_delete_fk.sql`).  
- Per eseguire `deleteUser` è necessario rimuovere prima la riga in `profiles`.  
- Altre tabelle con FK verso `auth.users` (migrations): `user_roles`, `antifraud_log`, `user_entitlements`, `user_wallet`, `iap_transactions`, `subscription_entitlements`, `m1u_ledger`, `vera_mission_runs`, `mpe_*`, ecc.  
- Se una di queste non viene pulita prima di `profiles`/`deleteUser`, la delete auth può fallire. Se invece si cancella `profiles` e poi `deleteUser` fallisce per altro motivo → zombie.

---

## 3) Patch applicate (solo in scope)

### 3.1 Edge Function `delete-account` (FIX 1)

- **File:** `supabase/functions/delete-account/index.ts`
- **Modifiche:**
  - Aggiunte alla cleanup prima di `profiles`: `user_roles` (column `user_id`), `antifraud_log` (column `user_id`) per ridurre il rischio che una FK blocchi `deleteUser`.
  - Commenti che chiariscono: profilo cancellato per ultimo tra i public; se `deleteUser` fallisce dopo, si ha zombie e il safety net app (ensureProfile) ripara al prossimo boot.
- **Ordine invariato:** child tables → `profiles` → `deleteUser` (necessario perché `profiles.id` → `auth.users.id`).

### 3.2 Safety net bootstrap (FIX 2)

- **File:** `src/hooks/useAccessControl.ts`
- **Modifiche:**  
  Se `.maybeSingle()` su `profiles` ritorna **null** (profilo mancante):
  - Tentativo di **insert** minimale in `profiles`: `id`, `email`, `full_name`, `role: 'user'`.
  - Se insert va a buon fine → log `[useAccessControl] ensureProfile: created minimal profile for <id>`.
  - Se insert fallisce con codice 23505 (unique_violation) → ignorato (race / già creato).
  - In ogni caso si imposta subito lo state con `canAccess: true`, `subscriptionPlan: 'free'`, `isLoading: false` così l’app non resta in loading e il loop Briefing/Welcome viene evitato.

Nessuna modifica a: routing, UI, Stripe, PWA, feature non collegate al flusso delete-account/bootstrap profilo.

---

## 4) Validazione post-fix

### 4.1 Test riproduzione

- **Se delete fallisce (es. FK):** l’utente non deve perdere il profilo prima che la delete auth sia confermata; con il safety net, utenti già zombie vedono la UI e ottengono un profilo minimale al prossimo boot.
- **Se delete riesce:** auth user e profilo rimossi; redirect a login.

### 4.2 Verifica DB (per user test)

```sql
select count(*) from auth.users where id = '<USER_ID>';
select count(*) from public.profiles where id = '<USER_ID>';
```

### 4.3 Build e sync

- Build web + `cap sync ios` eseguiti dopo le patch (vedi sotto).

---

## 5) Riepilogo

- **Causa:** Delete Account cancellava `profiles` prima di `deleteUser`; se `deleteUser` falliva, restavano utenti in auth senza profilo (zombie) → PGRST116 e loop.
- **Fix:** (1) Estesa cleanup nella Edge Function (`user_roles`, `antifraud_log`); (2) Safety net in `useAccessControl`: in caso di profilo mancante si tenta insert minimale e si sblocca sempre lo state.
- **Rollback:** tag `ROLLBACK_DELETE_ACCOUNT_PROFILE_INTEGRITY_20260227_0644`.
