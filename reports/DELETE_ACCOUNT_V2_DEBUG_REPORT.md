# delete-account-v2 — Debug internal_error + fix minimale

**Branch:** `fix/delete-account-v2-debug`  
**Tag rollback:** `pre-delete-account-v2-debug-20260302-1205`  
**Rollback:** `git checkout pre-delete-account-v2-debug-20260302-1205 -- supabase/functions/delete-account-v2/index.ts`

---

## FASE 1 — Read-only (analisi)

### A) Punti nel codice

| Cosa | Riga/e | Note |
|------|--------|------|
| `req.json()` | **Nessuna** | La function non leggeva il body; nessun crash da body vuoto. Aggiunto comunque parsing sicuro. |
| Admin client (service role) | 45-46 (prima) | `createClient(url, serviceKey)` poi `admin.auth.admin.deleteUser(userId)` |
| `deleteUser` | 46 (prima) | `const { error: deleteError } = await admin.auth.admin.deleteUser(userId)` |

### B) Secrets in runtime

- **SUPABASE_URL:** letto da `Deno.env.get("SUPABASE_URL")` — va impostato in Edge Function secrets.
- **SUPABASE_ANON_KEY:** letto da `Deno.env.get("SUPABASE_ANON_KEY")`.
- **SUPABASE_SERVICE_ROLE_KEY:** letto da `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")**.

Se `SERVICE_ROLE_KEY` (o URL/ANON_KEY) manca in runtime, la function ora restituisce 500 con `config_missing` (log `step: "config_missing"`) invece di procedere.

### C) Possibili throw path

- Prima: nessun `req.json()`, quindi nessun throw da body. Unico fallimento esplicito: `deleteError` da `deleteUser` → 500.
- Dopo patch: body vuoto/invalido → 400 `bad_json`; config mancante → 500; deleteError → 500 `delete_failed` + log strutturato.

---

## FASE 2 — Patch applicata (diff summary)

1. **Body parsing sicuro**
   - `safeParseBody(req)`: se `content-length` è 0/assente → ritorna `{}` senza chiamare `req.json()`.
   - Se `content-length > 0` → `await req.json()` in try/catch; in catch → ritorna `null` → response 400 `{ ok: false, error: "bad_json" }`.

2. **Logging strutturato (no PII)**
   - `rid = crypto.randomUUID()` per ogni richiesta.
   - Log con `[delete-account-v2]` + `{ rid, step, user_id?, deleteError? }`.
   - Step: `auth_ok`, `delete_start`, `delete_ok`, `delete_fail`.
   - In `delete_fail`: `deleteError` con solo `name`, `message`, `status`, `code`, e `details` solo se stringa e senza `@` (evita PII).

3. **Config check**
   - Se mancano `url`, `anonKey` o `serviceKey` → log `step: "config_missing"` e 500 (no PII).

4. **DeleteUser e response**
   - Se `deleteError` → log + `return json(500, { ok: false, error: "delete_failed", rid })`.
   - Se ok → `return json(200, { ok: true, rid })`.

5. **CORS**
   - `json()` applica sempre `corsHeaders`; OPTIONS → 204 con `corsHeaders`. Tutte le response includono CORS.

---

## FASE 3 — Deploy + test

### Deploy
```bash
supabase functions deploy delete-account-v2
```

### Test curl (body `{}`, Content-Type)
```bash
curl -i -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/delete-account-v2" \
  -H "Authorization: Bearer <JWT>" \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  --data '{}'
```

**Risultato atteso**
- 200: `{ "ok": true, "rid": "<uuid>" }`
- 500: `{ "ok": false, "error": "delete_failed", "rid": "<uuid>" }`

### Se 500
1. Prendi `rid` dal body della response.
2. In Supabase Dashboard → Edge Functions → delete-account-v2 → **Logs**, filtra per quel `rid` (o cerca `[delete-account-v2]` e il rid).
3. Copia l’oggetto `deleteError` dal log (name, message, status, code, details se presente) e incollalo sotto.

**Output log (incolla qui dopo il test):**
```
[ incolla qui la riga di log con delete_fail e deleteError ]
```

---

## FASE 4 — Fix root cause (solo se FK/constraint)

Se dal log risulta **"Database error deleting user"** o errore di constraint/FK:

1. Identificare le tabelle che referenziano `auth.users.id` senza `ON DELETE CASCADE` (o con `SET NULL` ma colonna NOT NULL).
2. Fix minimo possibile:
   - **Opzione A:** migration che aggiusta FK (CASCADE o SET NULL + colonna nullable) solo per le tabelle che bloccano.
   - **Opzione B:** nella function, cleanup esplicito (delete su tabelle app per quel `user_id`) **prima** di `deleteUser`, solo per le tabelle che bloccano.

**Proposta (da compilare dopo aver visto deleteError):**
```
[ es. "Migration: ALTER TABLE public.admin_logs ALTER COLUMN user_id DROP NOT NULL; ADD FK ON DELETE SET NULL" ]
```

---

## File toccati

Solo: `supabase/functions/delete-account-v2/index.ts`

Nessuna modifica a: delete-account v1, UI app, altre Edge Functions.
