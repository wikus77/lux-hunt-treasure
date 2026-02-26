# Apple Rejection 5.1.1(v) — Account Deletion: Forensics + Piano Fix

**Data:** 2026-02-26  
**Target:** iOS Capacitor WKWebView  
**Repo:** lux-hunt-treasure

---

## FASE 0 — Rollback safety (completata)

- **Tag creato:** `safety/apple-account-deletion-20260226_110747`
- **Rollback immediato:**  
  `git reset --hard safety/apple-account-deletion-20260226_110747`  
  (poi eventuale redeploy Edge `delete-account` se già deployata)

---

## FASE 1 — Verifica forense (read-only)

### 1) UI e handler attuali (Danger Zone / Delete Account)

| Dove | Cosa fa | Handler | Chiamate |
|------|---------|---------|----------|
| **SettingsContent.tsx** (righe 277–305) | Danger Zone: "Request Account Deletion" | `handleRequestAccountDeletion` (riga 65) | Apre **mailto:contact@m1ssion.com** con subject/body (email utente + user_id). Nessuna delete su DB. |
| **LegalSectionContent.tsx** (righe 184–211) | Stessa Danger Zone | `handleRequestAccountDeletion` (riga 65) | Stesso **mailto**. |
| **LegalSettings.tsx** (righe 252–314) | Card "Zona Pericolosa" + bottone "Elimina Account Permanentemente" | `handleDeleteAccount` (riga 92) | **Client-side:** `supabase.from('user_clues').delete().eq('user_id', user.id)` + idem per `user_buzz_counter`, `user_notifications`, `subscriptions`; poi `profiles.delete().eq('id', user.id)`; poi `supabase.auth.signOut()`, `localStorage.clear()`, redirect `/login`. **NON** chiama auth.admin.deleteUser né Edge. |

**Conclusione:** In due posti la “cancellazione” è solo richiesta via email (mailto). In un posto (LegalSettings) c’è una delete lato client su 4 tabelle + profilo, ma **l’utente Auth non viene mai eliminato** (nessuna chiamata a `auth.admin.deleteUser` o Edge che lo faccia).

### 2) Viene cancellato l’utente Auth?

- **admin-delete-user** (`supabase/functions/admin-delete-user/index.ts`): usa `supabaseAdmin.auth.admin.deleteUser(user_id)` (riga 88). È **solo admin**: richiede JWT + hash email autorizzato; non è self-service e non è invocata dall’app.
- **Client:** nessuna chiamata a `deleteUser`, RPC `delete_user`, né Edge che elimini auth.
- **Evidenza:** l’unico flusso “delete” in-app (LegalSettings) elimina solo dati in public e fa signOut; **auth.users non viene toccato** → l’utente può fare di nuovo login.

### 3) Copertura cancellazione dati

- **Tabelle con dati utente (esempi):** profiles, user_clues, user_buzz_counter, user_notifications, subscriptions, prize_claims, email_sends (recipient_user_id), user_wallet, iap_transactions, user_entitlements, mission_enrollments, wheel_spins, lottery_tickets, battles, chat_messages, user_settings, push_tokens, ecc.
- **Oggi cancellate dal client (handleDeleteAccount):** solo `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `profiles`. Tutto via JWT utente (RLS); eventuali FK verso auth.users non consentono delete di auth da client.
- **Dati residui:** tutto il resto (prize_claims, email_sends, wallet, iap, mission_enrollments, storage avatars, ecc.) **non** viene cancellato dal flusso attuale. In più, anche il profilo potrebbe non essere cancellato se RLS blocca, e **auth.users resta sempre**.
- **Storage:** bucket `avatars` (path per user) esiste in migrations_legacy; **non** viene pulito dall’app.

### 4) Conclusione FASE 1 — Perché Apple rifiuta

- **“Email required”:** In due schermate (Settings, Legale) la cancellazione è solo “richiesta via email” (mailto): non è self-service in-app e richiede un passaggio esterno (email). Apple 5.1.1 richiede cancellazione **in-app** senza obbligo di email.
- **Deletion non self-service:** Il flusso mailto non completa la cancellazione; l’unico flusso che “cancella” (LegalSettings) non è completo e non rimuove l’account Auth.
- **Auth user non eliminato:** Nessun percorso in-app chiama `auth.admin.deleteUser` (o equivalente). L’utente resta in auth.users e può riaccedere.
- **Dati residui:** Molte tabelle (wallet, iap, prize_claims, email_sends, storage, ecc.) non sono toccate; possibile incoerenza e dati orfani.

**Gap minimi per compliance Apple:**  
(1) Flusso **self-service in-app** che completi la cancellazione senza email.  
(2) **Eliminazione da auth.users** (tramite Edge con Service Role).  
(3) Cancellazione **ordinata e completa** dei dati applicativi (e storage avatars) **prima** della rimozione da Auth.

---

## FASE 2 — Progettazione soluzione minima Apple-compliant

### A) Server-side: Edge Function `delete-account`

- **Path:** `supabase/functions/delete-account/index.ts`
- **Auth:** Solo JWT utente (Authorization: Bearer). Verifica con `supabase.auth.getUser(jwt)`; user_id = utente autenticato (no body user_id da fidarsi).
- **Ordine:**
  1. Autenticare utente (JWT).
  2. user_id = auth.uid.
  3. Cancellare dati applicativi (tabelle con user_id/recipient_user_id) in ordine sicuro; eventuale RPC DB che fa cascade o delete espliciti.
  4. Rimuovere file storage dell’utente (bucket avatars, path per user_id).
  5. Eliminare da auth: `auth.admin.deleteUser(user_id)`.
  6. Risposta: `{ success: true }` + timestamp; in errore messaggio chiaro (senza PII).
- **Sicurezza:** Service Role solo in Edge; idempotenza: se utente già assente in auth, rispondere ok; log minimo senza dati sensibili.

### B) Client-side (UI)

- **LegalSettings.tsx** (punto “Elimina Account Permanentemente”):
  1. Conferma forte: mantenere **AlertDialog** “Conferma Eliminazione” (già presente).
  2. Alla conferma: `supabase.functions.invoke('delete-account')` (senza body; JWT in header).
  3. Se 200 e success: `supabase.auth.signOut()`, pulizia locale minima, redirect `/login`.
  4. Se errore: toast con messaggio leggibile + possibilità retry.
- **SettingsContent.tsx / LegalSectionContent.tsx:** Opzione minima: lasciare il mailto come “alternativa” oppure aggiungere link “Elimina account subito: Impostazioni > Legale”. Per compliance basta che **un** percorso in-app completi la cancellazione (LegalSettings).

### C) Compliance messaging

- Bottone chiaro “Delete Account” / “Elimina Account” che **completa** la cancellazione in-app.
- Conferma (modal) consentita; **nessuno** step obbligatorio via email.

### File da creare/modificare (FASE 3)

| Azione | File |
|--------|------|
| Creare | `supabase/functions/delete-account/index.ts` |
| Modificare | `src/pages/settings/LegalSettings.tsx` (handleDeleteAccount → invoke Edge, poi signOut/redirect) |

---

## FASE 4 — Checklist test (da eseguire su dispositivo)

1. Creare account test.
2. Avviare eliminazione account in-app (Legale > Elimina Account Permanentemente > Conferma).
3. Verificare: utente disconnesso e redirect a login; tentativo login stesso account fallisce (auth eliminato); su DB righe principali per user_id rimosse; storage avatar rimosso se applicabile.
4. Nessun crash su iPad.
5. Nessun loop UI.

**Se un test fallisce:** rollback al tag `safety/apple-account-deletion-20260226_110747`.

---

## FASE 3 — Patch applicata (diff sintetico)

- **Nuovo:** `supabase/functions/delete-account/index.ts`  
  Edge: verifica JWT → user_id da token; pulizia storage avatars; delete su email_sends, user_clues, user_buzz_counter, user_notifications, subscriptions, profiles; auth.admin.deleteUser(user_id); idempotenza se utente già assente.
- **Modificato:** `src/pages/settings/LegalSettings.tsx`  
  `handleDeleteAccount`: sostituiti delete client-side con `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer ... } })`; in caso success → signOut, localStorage.clear, redirect `/login`; gestione errore con toast.

## Output finale

- **Report FASE 1:** questo documento (stato attuale, prove file/righe, conclusione).
- **Piano FASE 2:** questo documento (Edge + UI + file da toccare).
- **Patch FASE 3:** sopra (delete-account/index.ts nuovo, LegalSettings.tsx handleDeleteAccount).
- **Checklist test FASE 4:** sotto.
- **Rollback (pronto):**  
  `git reset --hard safety/apple-account-deletion-20260226_110747`  
  Poi, se la Edge `delete-account` è già deployata, rimuoverla o sostituirla con versione precedente (non presente prima del fix).

---

## Checklist test FASE 4 (iPhone + iPad)

| # | Verifica | Esito (da compilare) |
|---|----------|----------------------|
| 1 | Creare account test | |
| 2 | Impostazioni > Legale > Elimina Account Permanentemente > Conferma | |
| 3 | Utente disconnesso e redirect a login | |
| 4 | Tentativo login stesso account fallisce (auth eliminato) | |
| 5 | Su DB: righe principali per user_id rimosse (profiles, user_clues, …) | |
| 6 | Storage avatar rimosso (se presente) | |
| 7 | Nessun crash iPad | |
| 8 | Nessun loop UI | |

**Se un test fallisce:** eseguire rollback al tag `safety/apple-account-deletion-20260226_110747`.
