# DELETE-ACCOUNT-V2 — Verifica cancellazione reale + test E2E

**Repo:** lux-hunt-treasure  
**Branch:** `fix/delete-account-v2-e2e-verify`  
**Tag rollback:** `pre-delete-account-v2-e2e-verify-20260302-1126`  
**Function:** `delete-account-v2`  
**Stato:** curl con JWT valido → 200 `{"ok":true}`

---

## Safety

- **Branch:** `fix/delete-account-v2-e2e-verify`
- **Tag:** `pre-delete-account-v2-e2e-verify-20260302-1126`
- **Rollback:** `git checkout pre-delete-account-v2-e2e-verify-20260302-1126 -- supabase/functions/delete-account-v2/`

---

## FASE 1 — READ-ONLY FORENSICS

### 1.1 File analizzati

| File | Contenuto rilevante |
|------|----------------------|
| `supabase/functions/delete-account-v2/config.toml` | `verify_jwt = false` → gateway non verifica JWT; richiesta arriva alla function. |
| `supabase/functions/delete-account-v2/index.ts` | Verifica JWT con anon client; delete con service role; **nessun controllo sul risultato di deleteUser**. |

### 1.2 Config

- **verify_jwt = false:** confermato. La richiesta non viene bloccata dal gateway per JWT invalido/missing sub.

### 1.3 Verifica token nel codice

- Header: `Authorization: Bearer <token>` obbligatorio; altrimenti 401.
- Client anon: `createClient(url, anonKey)` → `anonClient.auth.getUser(jwt)`.
- Se `error || !data?.user?.id` → 401 `{ ok: false }`.
- Quindi 200 viene restituito solo se il JWT è valido e restituisce un `user.id`.

### 1.4 Parte DELETE

- **Auth:** `admin.auth.admin.deleteUser(userId)` con client service role (`createClient(url, serviceKey)`).
- **Cleanup tabelle app:** **assente**. La function **non** cancella esplicitamente `profiles`, `user_roles`, `user_notifications`, storage, ecc. Solo `auth.admin.deleteUser(userId)`. Eventuale pulizia dipende da FK (CASCADE/SET NULL) nel DB.

### 1.5 Success path (step-by-step)

1. `OPTIONS` → 204 (CORS).
2. `POST` → continua.
3. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` letti da env (non hardcoded).
4. Header `Authorization: Bearer <jwt>` presente → altrimenti 401.
5. JWT estratto, `anonClient.auth.getUser(jwt)` → se errore o nessun user.id → 401.
6. `userId = data.user.id`.
7. `admin = createClient(url, serviceKey)`.
8. **`await admin.auth.admin.deleteUser(userId);`** — **risultato non usato**.
9. **`return json(200, { ok: true });`** — **sempre eseguito**, indipendentemente da esito di `deleteUser`.

### 1.6 Tabelle cancellate dalla function

- **Dalla function:** nessuna tabella applicativa. Solo Auth: `auth.users` (tramite GoTrue `deleteUser`).
- **Da DB:** eventuali righe in `profiles`, `user_*`, ecc. vengono gestite solo da FK (CASCADE/SET NULL) se configurate; la function non fa `delete().eq('id', userId)` su tabelle app.

### 1.7 Errori che possono far tornare `ok: true` senza cancellare (BUG)

- **BLOCKER:** il risultato di `admin.auth.admin.deleteUser(userId)` **non viene letto**. In Supabase JS v2, `deleteUser` restituisce `{ data, error }`. Se `error` è valorizzato (es. 500 "Database error deleting user" per FK/constraint), la function **ignora l’errore** e restituisce comunque **200 `{ ok: true }**.
- Quindi: **sì, `ok: true` può uscire senza che l’utente sia stato cancellato da Auth.**

---

## BLOCKER (FASE 1)

**Problema:** La risposta 200 `{ ok: true }` può essere restituita anche quando `auth.admin.deleteUser()` fallisce (es. errore DB/FK, constraint, RLS).

**Azione richiesta:** Applicare **PATCH 1** (FASE 3): controllare il risultato di `deleteUser` e restituire 500 in caso di errore; 200 solo se `!authResult.error`.

### PATCH 1 applicata (BLOCKER)

Per evitare 200 senza delete reale, in `delete-account-v2/index.ts` è stato aggiunto il controllo sul risultato di `deleteUser`:

- `const { error: deleteError } = await admin.auth.admin.deleteUser(userId);`
- Se `deleteError` → `return json(500, { ok: false, error: "internal_error" });`
- 200 `{ ok: true }` solo se `deleteUser` non restituisce errore.

**Ridistribuire la function** e ripetere TEST A/B dopo il deploy.

---

## FASE 2 — Riproduzione controllata (istruzioni)

*Eseguire a mano; sotto i tre test e cosa annotare.*

### TEST A — Auth deletion (Dashboard)

1. Supabase Dashboard → **Authentication** → **Users**.
2. Identificare l’utente target (email o user_id usato nel curl che dà 200).
3. **Prima:** confermare che l’utente **è presente** (screenshot o nota).
4. Eseguire la chiamata alla function con lo stesso JWT che dà 200 (curl o Dashboard Test).
5. **Dopo:** refresh lista utenti; confermare che l’utente **non è più presente** (screenshot o nota).

**Output da incollare nel report:**
- [ ] Prima: utente presente (screenshot/nota)
- [ ] Dopo: utente assente (screenshot/nota)
- **Risultato TEST A:** PASS / FAIL

---

### TEST B — Login fallisce

1. Dopo il TEST A (utente cancellato).
2. Dall’app o da Auth UI: tentare login con le stesse credenziali (email/password o provider).
3. **Atteso:** login fallisce (utente inesistente) o viene richiesto sign-up.

**Output:**
- [ ] Risultato login: OK (fallisce come atteso) / FAIL (login ancora possibile)
- **Risultato TEST B:** PASS / FAIL

---

### TEST C — Tabelle app (solo se previsto dal prodotto)

- La function **delete-account-v2** non cancella esplicitamente tabelle app; solo Auth.
- Se il prodotto richiede che `profiles`, `user_roles`, ecc. siano puliti per quell’user_id, ciò dipende da:
  - FK `ON DELETE CASCADE` su tabelle che referenziano `auth.users`, oppure
  - Un’altra function (es. `delete-account` v1) che fa cleanup esplicito.
- **Verifica (opzionale):** In SQL Editor, dopo la delete, controllare che non restino righe con quel `user_id` nelle tabelle applicative (es. `profiles`, `user_clues`, …). Se le FK sono CASCADE, le righe saranno già rimosse; se SET NULL, `user_id` sarà NULL.

**Output:**
- Tabelle controllate: _______________
- [ ] Record user_id assenti / coerenti con policy
- **Risultato TEST C:** PASS / FAIL / N/A

---

## Call-site app (per E2E da app)

- **Attuale:** l’app invoca **`delete-account`** (v1), non `delete-account-v2`.
  - `DeleteAccountModalContent.tsx`: `supabase.functions.invoke('delete-account', { ... })`, controlla `data?.success !== true`.
  - `LegalSettings.tsx`: idem.
- **delete-account-v2** restituisce `{ ok: true }`, non `success: true`. Quindi, per usare delete-account-v2 dall’app:
  1. Cambiare invoke in `'delete-account-v2'`, e
  2. Controllare `data?.ok !== true` (oppure far restituire anche `success: true` dalla function per compatibilità).

Header già corretti nei call-site: `Authorization: Bearer ${session.access_token}` (nome header corretto).

---

## Riepilogo PASS/FAIL (da compilare dopo i test)

| Test | Descrizione | Risultato |
|------|-------------|-----------|
| A | Utente rimosso da Auth (Dashboard) | [ ] PASS / [ ] FAIL |
| B | Login con stesso utente fallisce | [ ] PASS / [ ] FAIL |
| C | Tabelle app pulite (se previsto) | [ ] PASS / [ ] FAIL / [ ] N/A |

**BLOCKER codice:** 200 può essere restituito anche se `deleteUser` fallisce → **richiesta PATCH 1 (controllo risultato deleteUser + 500 su errore).**

---

## Prossimi step (FASE 3)

1. **PATCH 1:** ✅ Applicata (controllo `deleteUser` result + 500 su errore).
2. **Deploy:** `supabase functions deploy delete-account-v2` e ripetere TEST A/B.
3. **PATCH 2:** Verificare che i secret (SERVICE_ROLE_KEY, ANON_KEY, SUPABASE_URL) siano impostati in Supabase Edge Function secrets.
4. **PATCH 3 (opzionale):** Logging minimo: request_id, user_id, step, outcome; niente token/PII.

### Test E2E dall’app (se si passa a delete-account-v2)

- L’app oggi chiama `delete-account` (v1) e controlla `data?.success === true`.
- Per usare **delete-account-v2** dall’app: cambiare `invoke('delete-account', ...)` in `invoke('delete-account-v2', ...)` e controllare `data?.ok === true` (oppure far restituire anche `success: true` dalla function per compatibilità).
- Header: `Authorization: Bearer ${session.access_token}` è già corretto; `supabase.functions.invoke` aggiunge automaticamente `apikey` dal client.
