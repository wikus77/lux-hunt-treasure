# PGRST204 notification_type — Verifica e decision gate (claim-marker-reward)

**Edge:** claim-marker-reward  
**Branch:** fix/edge-claim-marker-reward-typecol  
**Tag rollback:** rollback/claim-marker-reward-pre-typefix-20260226-0539  
**Backup file:** reports/rollback/claim-marker-reward.index.ts.20260226-0539.bak  
**Firma:** Lovable Agent JLENIA

---

## 0) Rollback immediato (completato)

| Azione | Stato |
|--------|--------|
| Branch `fix/edge-claim-marker-reward-typecol` | ✅ Creato / checkout |
| Tag `rollback/claim-marker-reward-pre-typefix-20260226-0539` | ✅ Creato |
| Snapshot file Edge | ✅ `reports/rollback/claim-marker-reward.index.ts.20260226-0539.bak` |

**STOP rispettato:** nessuna patch applicata prima della verifica e del decision gate.

---

## 1) Verifica forense

### A) Schema DB (read-only)

Eseguire in Supabase SQL Editor (PROD) e incollare l’output nel report:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_notifications'
ORDER BY ordinal_position;
```

```sql
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_notifications'
    AND column_name = 'notification_type'
) AS has_notification_type;
```

**Da migration nel repo (non eseguite in PROD da Cursor):**

- Colonne attese: `id`, `user_id`, `message`, `is_read`, `created_at`, `read_at`, `type`, `title`, `is_deleted`, `metadata`.
- Colonna **`type`** esiste (migration 20251120075734).
- Colonna **`notification_type`** non è presente nelle migration → **has_notification_type = false** (da confermare in PROD con la query sopra).

### B) Verifica codice Edge (read-only)

**File:** `supabase/functions/claim-marker-reward/index.ts`

**Grep:** `notification_type` in tutto il file:

```
Risultato: 0 occorrenze.
```

**Grep:** `user_notifications` + payload insert:

- Tutti gli insert verso `admin.from("user_notifications").insert([{ ... }])` usano la chiave **`type`** (non `notification_type`).
- Righe con `type:` negli insert user_notifications: 199–204, 229–235, 246–252, 296–302, 331–337, 363–369, 425–431, 477–483, 531–537 (premio fisico).

**Conclusione codice:** Nel repo attuale **non** viene mai usata la chiave `notification_type`; viene usata solo **`type`**.

---

## 2) Decision gate

Applicare patch **solo se** tutte e tre le condizioni sono vere:

| # | Condizione | Verifica (repo / attese) | Esito |
|---|------------|---------------------------|--------|
| 1 | DB: has_notification_type = false | Migration: colonna non definita. PROD: da confermare con query A. | Atteso **true** (condizione soddisfatta) |
| 2 | DB: colonna `type` esiste | Migration 20251120075734: ADD COLUMN type. | **true** |
| 3 | Codice: usa `notification_type` almeno 1 volta | Grep: **0 occorrenze** di notification_type. | **false** |

**Decisione:** **STOP — patch non applicata.**

La condizione 3 non è soddisfatta: nel codice attuale non c’è alcun uso di `notification_type`. Una patch che sostituisca `notification_type` → `type` non modificherebbe nulla (non c’è nulla da sostituire). L’errore PGRST204 in produzione può dipendere da:

- **Versione deployata diversa** (build vecchia che ancora invia `notification_type`).
- **Schema cache PostgREST** stantia (cache che si aspetta o rifiuta una colonna).
- **Altro chiamante** (altra Edge o servizio) che scrive su `user_notifications` con `notification_type`.

---

## 3) Diff patch (NON applicata)

Non è stata applicata alcuna modifica. Nel codice attuale non esiste `notification_type` da sostituire con `type`; tutti gli insert usano già `type`.

**Se in produzione la Edge deployata fosse una versione che usa `notification_type`:** la patch sarebbe sostituire ogni `notification_type: '...'` con `type: '...'` negli oggetti passati a `admin.from("user_notifications").insert([{ ... }])`. Nel repo attuale non c’è nulla da cambiare per questo.

---

## 4) Prova deploy + logs / prova DB (N/A)

Patch non applicata → nessun deploy di fix, nessun test funzionale eseguito. Dopo un eventuale fix (es. ri-deploy della versione attuale del repo o refresh schema cache), verificare:

- Log Edge: assenza PGRST204, presenza di “notification created successfully” (o equivalente).
- DB: una riga in `public.user_notifications` con `type = 'prize'` (o `reward` / `clue`) e `metadata` coerente.

---

## 5) Istruzioni rollback

### Comando / tag

- **Tag di sicurezza:** `rollback/claim-marker-reward-pre-typefix-20260226-0539`
- Ripristinare il file Edge dal tag (prima di eventuali modifiche successive):
  ```bash
  git show rollback/claim-marker-reward-pre-typefix-20260226-0539:supabase/functions/claim-marker-reward/index.ts > supabase/functions/claim-marker-reward/index.ts
  ```
- Oppure ripristinare dalla copia di backup:
  ```bash
  cp reports/rollback/claim-marker-reward.index.ts.20260226-0539.bak supabase/functions/claim-marker-reward/index.ts
  ```

### Ripristino file da backup

- **Backup:** `reports/rollback/claim-marker-reward.index.ts.20260226-0539.bak`
- Ripristino:
  ```bash
  cp reports/rollback/claim-marker-reward.index.ts.20260226-0539.bak supabase/functions/claim-marker-reward/index.ts
  ```
- Poi rideploy della Edge `claim-marker-reward` da Supabase Dashboard (o CLI).

---

## 6) Alternative (nessuna patch applicata)

1. **Confermare in PROD** l’output delle query A (schema + has_notification_type). Se has_notification_type = false e esiste `type`, e **in produzione** la Edge deployata è diversa dal repo (es. build vecchia con `notification_type`), allora:
   - **Opzione A:** Ri-deploy della Edge dalla versione attuale del repo (che usa già `type`).
   - **Opzione B:** Se avete ancora il sorgente della versione deployata che usa `notification_type`, applicare lì la sostituzione `notification_type` → `type` e rideploy.

2. **Refresh schema cache PostgREST:** Dashboard Supabase → Settings → API → “Reload schema cache” (o equivalente). Utile se la colonna in DB è corretta ma la cache è vecchia.

3. **Verificare altri chiamanti:** Cercare in altre Edge o servizi eventuali insert su `user_notifications` che usano `notification_type` e allinearli a `type` (o alla colonna reale in DB).

---

## Riepilogo

- **Rollback:** branch, tag e backup file creati; nessuna patch applicata.
- **Verifica:** schema da migration ha `type`, non `notification_type`; grep su claim-marker-reward: **0** occorrenze di `notification_type`.
- **Decision gate:** STOP (condizione 3 falsa).
- **Istruzioni rollback:** ripristino da tag o da `reports/rollback/claim-marker-reward.index.ts.20260226-0539.bak` + rideploy Edge.
