# PGRST204 notification_type — Fix mirato claim-marker-reward (Report finale)

**Edge:** claim-marker-reward  
**Branch:** fix/edge-claim-marker-reward-typecol  
**Firma:** Lovable Agent JLENIA

---

## Rollback immediato (completato)

| Azione | Stato |
|--------|--------|
| Branch `fix/edge-claim-marker-reward-typecol` | ✅ Checkout |
| Tag `rollback/claim-marker-reward-pre-typefix-20260226-EDGE` | ✅ Esiste |
| Backup `reports/rollback/claim-marker-reward.index.ts.pre-typefix.bak` | ✅ Creato |

**Comandi rollback (se serve):**
- Da tag: `git checkout rollback/claim-marker-reward-pre-typefix-20260226-EDGE -- supabase/functions/claim-marker-reward/index.ts`
- Da backup: `cp reports/rollback/claim-marker-reward.index.ts.pre-typefix.bak supabase/functions/claim-marker-reward/index.ts`

---

## FASE 1 — Verifica (grep)

### A) Output grep pre-patch

```bash
rg -n 'from\("user_notifications"\)' supabase/functions/claim-marker-reward/index.ts
```
**Risultato:** 9 occorrenze (righe 198, 229, 246, 296, 331, 363, 425, 477, 531).

```bash
rg -n 'notification_type\s*:' supabase/functions/claim-marker-reward/index.ts
```
**Risultato: 0 occorrenze.**

```bash
rg -n 'type\s*:' supabase/functions/claim-marker-reward/index.ts
```
**Risultato:** 26 occorrenze (incluse `type: 'reward'`, `type: 'prize'`, `type: 'clue'` negli insert su user_notifications).

### B) Decision gate

- **Condizione:** "Se rg trova ≥ 1 occorrenza di notification_type: → CAUSA CONFERMATA → FASE 2."
- **Esito:** **0 occorrenze** di `notification_type:` nel file.
- **Decisione:** **STOP.** Nessuna patch applicata. L’errore PGRST204 in produzione proviene da **versione deployata diversa** (build che ancora invia `notification_type`) oppure da **altro chiamante** che scrive su `user_notifications` con `notification_type`.

### C) Schema DB (read-only, da eseguire in PROD)

Query da eseguire in Supabase SQL Editor (salvare output):

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='user_notifications'
ORDER BY ordinal_position;
```

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='user_notifications' AND column_name='notification_type'
) AS has_notification_type;
```

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='user_notifications' AND column_name='type'
) AS has_type;
```

**Atteso (da migration repo):** has_notification_type = false, has_type = true.

---

## FASE 2 — Patch (NON applicata)

Nel codice attuale **non** è presente alcuna chiave `notification_type` negli insert su `user_notifications`; tutti gli insert usano già **`type`**. Non è stata eseguita alcuna sostituzione.

Se in produzione è deployata una **versione vecchia** del file che usa `notification_type`, le opzioni sono:
1. **Ri-deploy** della versione attuale del repo (già allineata a `type`).
2. Oppure applicare la sostituzione `notification_type:` → `type:` nella versione deployata e rideployare.

---

## Output grep “post-patch” (verifica)

Dopo eventuale patch su un file che contenga `notification_type:`:

```bash
rg -n 'notification_type\s*:' supabase/functions/claim-marker-reward/index.ts
```
**Atteso:** 0 occorrenze.

**Stato attuale (senza patch):** già 0 occorrenze.

---

## FASE 3 — Commit + deploy (se avessi applicato patch)

Non essendo stata applicata alcuna modifica, non è stato eseguito commit né deploy. Se in un altro ambiente applicherai la sostituzione:

```bash
git add supabase/functions/claim-marker-reward/index.ts
git commit -m "fix(edge): user_notifications uses type instead of notification_type"
supabase functions deploy claim-marker-reward --no-verify-jwt
```

Oppure deploy da Supabase Dashboard → Edge Functions → claim-marker-reward.

---

## FASE 4 — Test (logs + DB read-only)

### A) Test funzionale

- Da app iOS: claim su marker con reward **physical_prize** oppure **buzz_free** / **m1u**.
- **Atteso:** nessun PGRST204 nei log Edge.

### B) Logs Edge

- Logs di **claim-marker-reward**: non deve comparire "PGRST204 notification_type"; deve comparire "notification created successfully" (o assenza errori su insert).

### C) Verifica DB (read-only)

Dopo un claim, in PROD:

```sql
SELECT id, user_id, type, title, message, created_at, metadata
FROM public.user_notifications
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180'
ORDER BY created_at DESC
LIMIT 20;
```

**Atteso:** righe con `type` in ('reward','prize','clue') e `metadata` coerente.

---

## Deliverable (riepilogo)

| # | Richiesto | Esito |
|---|-----------|--------|
| 1 | Output grep pre-patch (occorrenze notification_type) | **0 occorrenze** (rg su notification_type\s*:) |
| 2 | Output grep post-patch (0 occorrenze) | **Già 0** (nessuna patch; codice usa solo type) |
| 3 | Conferma deploy (id/version) | **N/A** — nessun deploy (nessuna modifica) |
| 4 | Evidence test: logs senza PGRST204 + query user_notifications | Istruzioni in FASE 4; da eseguire dopo ri-deploy versione attuale o fix su versione deployata |

---

## Se qualcosa va storto (dopo un eventuale fix futuro)

1. **Rollback immediato** (scegli uno):
   - **A) Da tag:**  
     `git checkout rollback/claim-marker-reward-pre-typefix-20260226-EDGE -- supabase/functions/claim-marker-reward/index.ts`
   - **B) Da backup:**  
     `cp reports/rollback/claim-marker-reward.index.ts.pre-typefix.bak supabase/functions/claim-marker-reward/index.ts`

2. **Commit rollback e redeploy Edge:**
   ```bash
   git add supabase/functions/claim-marker-reward/index.ts
   git commit -m "revert(edge): rollback claim-marker-reward typecol fix"
   supabase functions deploy claim-marker-reward --no-verify-jwt
   ```

---

## Conclusione

- **Repo attuale:** tutti gli insert su `user_notifications` usano già la chiave **`type`** (nessun `notification_type`).
- **Decision gate:** STOP (0 occorrenze di notification_type) → nessuna patch applicata.
- **Raccomandazione:** se in produzione compare ancora PGRST204, ri-deployare la Edge dalla versione attuale del repo oppure verificare che la build deployata sia questa (e che non ci siano altri chiamanti che usano `notification_type`).
