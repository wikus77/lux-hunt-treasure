# Verifica forense — Perché "Delete account" dà sempre 500 (Apple Store)

**Obiettivo:** Capire una volta per tutte perché delete-account-v2 restituisce 500 "Database error deleting user" e cosa fare per soddisfare il requisito Apple ("delete account permanently").

---

## 1. Catena dell’errore (dove si blocca)

```
[App iOS] → Tap "Elimina account"
    → POST /functions/v1/delete-account-v2 (JWT + apikey)
        → Edge Function: verifica JWT, poi admin.auth.admin.deleteUser(userId)
            → GoTrue (Supabase Auth) esegue DELETE su auth.users WHERE id = userId
                → PostgreSQL: qui fallisce se un vincolo blocca la DELETE
                    → Errore: "Database error deleting user" (500, unexpected_failure)
```

Il 500 arriva **solo** quando PostgreSQL rifiuta la `DELETE` su `auth.users`. Le cause possibili sono **solo** queste:

1. **Foreign key** — Una tabella (in qualsiasi schema) ha una FK verso `auth.users(id)` con:
   - **ON DELETE RESTRICT / NO ACTION** (default): la DELETE viene bloccata.
   - **ON DELETE SET NULL** ma la colonna è **NOT NULL**: Postgres non può mettere NULL → blocco.

2. **Trigger** — Un trigger su `auth.users` (BEFORE/AFTER DELETE) o su una tabella collegata che fallisce o blocca la transazione.

3. **Permessi/RLS** — Meno probabile con service role; possibile solo con ruoli/RLS particolari.

Quindi: **non è un bug della function** (quella arriva a `delete_start` e chiama correttamente `deleteUser`). Il blocco è **solo a livello DB** (vincolo o trigger).

---

## 2. Perché “sempre gli stessi SQL” non risolvono

- Gli script che hai eseguito (e che ChatGPT ripete) correggono quasi sempre **solo lo schema `public`** (es. migration `20260302122000` ha `AND n.nspname = 'public'`).
- Se il vincolo che blocca sta in **auth** o **storage**, quello script **non lo tocca** e il 500 resta.
- In più, senza **un’unica diagnosi** (tutte le FK + tutti i trigger) non si sa quale sia il vincolo/trigger esatto; si continua a indovinare.

Per uscire dal loop serve:

1. **Una sola volta**: eseguire lo script di **diagnostica** (tutte le FK verso `auth.users` in **tutti** gli schemi + trigger su `auth.users`).
2. Dall’output capire **chi** blocca (schema + tabella + constraint/trigger).
3. Applicare **solo** il fix per quello (e, se serve, per storage; auth solo se in diagnostica risulta davvero quello il problema).

---

## 3. Cosa fare (3 passi)

### Passo 1 — Diagnostica (una sola esecuzione)

Nel **Supabase Dashboard → SQL Editor**:

1. Apri il file **`supabase/migrations/20260302130000_forensic_fk_and_triggers_auth_users.sql`** (è nel repo).
2. Copia **tutto** il contenuto e incollalo nell’editor.
3. Esegui (Run). Otterrai **due risultati**:
   - **Risultato 1:** tutte le FK verso `auth.users` (ogni schema) con colonna `esito` = `OK` o `BLOCCA ...`.
   - **Risultato 2:** tutti i trigger su `auth.users`.
4. Salva l’output (screenshot o copia/incolla). Le righe con **`esito` = BLOCCA** sono i vincoli da correggere.

Quello script:

- Restituisce **tutte le FK** che referenziano `auth.users` in **ogni schema** (auth, public, storage, realtime, ecc.) con:
  - schema, tabella, colonna, nome constraint
  - azione ON DELETE (RESTRICT, CASCADE, SET NULL, ecc.)
  - se la colonna è NOT NULL (bloccante se ON DELETE SET NULL).
- Restituisce **tutti i trigger** su `auth.users` e su tabelle auth (per vedere se un trigger blocca la DELETE).

**Salva l’output** (screenshot o copia/incolla in un file). Da lì si vede:

- Quale **FK** è bloccante (RESTRICT/NO ACTION oppure SET NULL + colonna NOT NULL).
- Se ci sono **trigger** sospetti su `auth.users`.

### Passo 2 — Interpretare il risultato

- **Righe con `on_delete_action` = RESTRICT o NO ACTION** → quella FK blocca la DELETE. Va portata a CASCADE (dati utente) o SET NULL (audit) + colonna nullable.
- **Righe con SET NULL e `col_nullability` = NOT NULL** → quella FK blocca. Va resa la colonna nullable e tenere ON DELETE SET NULL.
- **Trigger su `auth.users`** (soprattutto BEFORE/AFTER DELETE) → possono bloccare o far fallire la DELETE; vanno controllati (rimozione o correzione con SECURITY DEFINER se toccano tabelle fuori da auth).

Se lo schema è **auth** (es. `auth.identities`, `auth.sessions`):

- In progetti Supabase standard queste tabelle di solito hanno già CASCADE. Se in diagnostica risultano RESTRICT/NO ACTION, il fix va fatto con attenzione (Supabase gestisce lo schema auth). In SQL Editor con ruolo con permessi adeguati si può provare ad aggiungere CASCADE (stesso pattern degli altri fix), sapendo che modifiche allo schema auth sono a tuo rischio.

### Passo 3 — Applicare il fix mirato

- Nel repo trovi già:
  - **`20260302122000_fix_auth_users_fk_blocking_delete.sql`** — fix solo schema **public**.
  - **`20260227130000_storage_objects_owner_cascade_if_exists.sql`** — fix **storage.objects** (owner_id → CASCADE) se esiste quel constraint.
- Se dalla diagnostica risulta che il blocco è in **storage** e lo script storage non è mai stato eseguito: esegui `20260227130000_storage_objects_owner_cascade_if_exists.sql`.
- Se il blocco è in **public** ma la migration public non è stata applicata: esegui `20260302122000_fix_auth_users_fk_blocking_delete.sql`.
- Se il blocco è in **auth**: nello script di diagnostica aggiungo un commento con il pattern SQL da usare (DROP constraint + ADD con ON DELETE CASCADE) da adattare ai nomi reali che vedi in diagnostica; lo esegui a mano in SQL Editor solo dopo aver verificato i nomi delle tabelle/constraint.

Dopo ogni fix: ritestare delete-account-v2 (curl o da app). Se ancora 500, **ri-leggere i log Postgres** (Dashboard → Logs → Postgres) nel momento del tentativo di delete: l’errore preciso (nome constraint o trigger) indica il prossimo blocco.

---

## 4. Requisito Apple e stato attuale

- Apple richiede che l’utente possa **eliminare l’account in modo permanente** (e che sia chiaro e reversibile solo con una nuova registrazione).
- La tua app già:
  - Chiama delete-account-v2.
  - Usa JWT e service role correttamente.
  - La function arriva a `delete_start` e chiama `deleteUser`.
- L’unico ostacolo è il **database** che rifiuta la DELETE su `auth.users` a causa di uno o più vincoli (e/o trigger). Sistemando tutti i vincoli bloccanti (e eventuali trigger) la DELETE andrà a buon fine e il flusso “Delete account permanently” sarà conforme.

---

## 5. Riepilogo

| Cosa | Dove | Azione |
|------|------|--------|
| Diagnostica completa | Esegui **una volta** lo script `20260302130000_forensic_fk_and_triggers_auth_users.sql` | Salva output: tutte le FK verso auth.users + trigger su auth.users |
| Blocco in public | Migration già in repo (solo public) | Esegui `20260302122000_fix_auth_users_fk_blocking_delete.sql` se non già fatto |
| Blocco in storage | Migration già in repo | Esegui `20260227130000_storage_objects_owner_cascade_if_exists.sql` se non già fatto |
| Blocco in auth | Output diagnostica | Fix a mano in SQL Editor (DROP FK + ADD ON DELETE CASCADE) solo se diagnostica mostra auth.* |
| Trigger su auth.users | Output diagnostica | Verificare in Dashboard → Database → Triggers (schema auth); rimuovere o correggere con SECURITY DEFINER |

Dopo aver eseguito la diagnostica e applicato i fix indicati dall’output, il delete account dovrebbe andare in 200. Se persiste il 500, l’errore nei log Postgres (nome constraint o trigger) indica il prossimo passo preciso invece di ripetere gli stessi SQL generici.

---

## 6. Se Risultato 1 è vuoto e i trigger sono solo AFTER INSERT

- **Risultato 1 vuoto** = nessuna FK bloccante trovata (o la query non vede FK in certi schemi).
- **Trigger solo AFTER INSERT** = non si attivano sulla DELETE, quindi non sono la causa del 500.

**Causa trovata (log 02 Mar 26 13:23:47):** `wheel_spins` ha FK `user_id` → auth.users con **ON DELETE CASCADE** e il trigger **no_update_delete_wheel_spins** (funzione `forbid_update_delete()`) blocca qualsiasi DELETE sulla tabella. Alla cancellazione utente Postgres tenta di eliminare le righe in wheel_spins (CASCADE) e il trigger solleva "IMMUTABLE TABLE — DELETE operation not allowed on wheel_spins". **Fix applicato:** migration `20260302140000_wheel_spins_fk_set_null_for_delete_user.sql` — FK cambiata in ON DELETE SET NULL e colonna `user_id` resa nullable; così alla delete utente non viene eseguito DELETE su wheel_spins (solo SET NULL), il trigger non si attiva e l’audit resta intatto.

---

**Prossimo passo obbligato (se ancora 500):** leggere i **log Postgres** nel momento esatto in cui provi "Elimina account".  
Dashboard → **Logs** → **Postgres** → filtra per l’orario del tentativo. Cerca: `violates foreign key constraint`, `update or delete on table "users"`, nome di un **constraint** o di una **tabella**. Quella riga indica il vincolo esatto da correggere (una sola migration mirata).

Opzionale: nel file `20260302130000_forensic_fk_and_triggers_auth_users.sql` in fondo c’è una **query alternativa (commentata)** che usa `information_schema.referential_constraints`. Decommentala ed eseguila da sola per vedere se compaiono FK verso auth.users con `delete_rule`.
