# Incident: delete-account-v2 — 401 "Invalid JWT" (Gateway JWT verify ON)

**Repo:** lux-hunt-treasure  
**Project ref:** vkjrqirvdvjbemsfzxof  
**Function:** delete-account-v2  
**Sintomo:** 401 `{"code":401,"message":"Invalid JWT"}` o "invalid claim: missing sub claim" — richiesta bloccata dal **gateway** (verify_jwt default true), non arriva al codice.

---

## Safety / Rollback

- **Tag creato prima della modifica:** `pre-delete-account-v2-verifyjwt-off`
- **Rollback:** `git checkout pre-delete-account-v2-verifyjwt-off -- supabase/functions/delete-account-v2/config.toml` (e rimuovere il file se si vuole tornare allo stato senza config)

---

## File creati/modificati

**Solo questo file è stato creato:**

| File | Azione |
|------|--------|
| `supabase/functions/delete-account-v2/config.toml` | **Creato** |

**Diff (contenuto):**
```diff
--- /dev/null
+++ b/supabase/functions/delete-account-v2/config.toml
@@ -0,0 +1 @@
+verify_jwt = false
```

---

## Patch applicata

- **Path:** `supabase/functions/delete-account-v2/config.toml`
- **Contenuto esatto:**
  ```toml
  verify_jwt = false
  ```
- In questo modo il gateway **non** verifica il JWT; la function valida il token con `anonClient.auth.getUser(jwt)` nel codice.

---

## Deploy (da eseguire a mano)

Il deploy automatico ha restituito:
```
Access token not provided. Supply an access token by running supabase login or setting the SUPABASE_ACCESS_TOKEN environment variable.
```

**Azioni obbligatorie:**
1. Eseguire `supabase login` (o impostare `SUPABASE_ACCESS_TOKEN`).
2. Eseguire:
   ```bash
   supabase functions deploy delete-account-v2
   ```
3. Verificare in dashboard che sia presente una nuova deployment/version.

**Output deploy (incollare qui dopo l’esecuzione):**
```
[ incolla output di: supabase functions deploy delete-account-v2 ]
```

---

## Test curl (da eseguire dopo il deploy)

Sostituire `<JWT_UTENTE>` con un JWT valido (es. da session Supabase) e `<SUPABASE_ANON_KEY>` con la anon key del progetto.

```bash
curl -i -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/delete-account-v2" \
  -H "Authorization: Bearer <JWT_UTENTE>" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  --data '{}'
```

**Risultato atteso:**
- **Non** deve più comparire: `{"code":401,"message":"Invalid JWT"}` (gateway).
- Se il token è valido: **200** con payload della function (es. `{"ok":true}`).
- Se il token è invalido: **401** con messaggio prodotto dalla function (es. `{"ok":false}`), non il messaggio standard "Invalid JWT".

**Output curl (incollare qui dopo il test):**
```
[ incolla status + body ]
```

---

## Verifica dashboard

- [ ] In Supabase → Edge Functions → delete-account-v2 → **Invocations** / **Logs**: la richiesta risulta gestita dalla function (non bloccata dal gateway con "Invalid JWT").

---

## Stop conditions

- Se dopo il deploy il curl continua a dare "Invalid JWT": verificare che la dashboard mostri la nuova deployment e che `config.toml` contenga `verify_jwt = false`; in caso affermativo segnalare con screenshot/log invocation.
