# PGRST204 notification_type — Fix mirato (safe) — Report finale

**Edge:** claim-marker-reward  
**Branch:** fix/edge-claim-marker-reward-typecol  
**Commit:** 357b1f5ae — fix(edge): user_notifications column type (no notification_type)  
**Firma:** Lovable Agent JLENIA

---

## FASE 0 — Baseline & scope

- **pwd:** `/Users/josephmule/lux-hunt-treasure`
- **Branch:** fix/edge-claim-marker-reward-typecol
- **git status (prima):** Modificati ios/App/App/public/*, send-welcome-email/index.ts, claim-marker-reward/index.ts
- **Azione:** Ripristinati file fuori scope: `git checkout HEAD -- ios/App/App/public/bundle-analysis.html ios/App/App/public/index.html supabase/functions/send-welcome-email/index.ts`
- **git status (dopo):** Modificato solo `supabase/functions/claim-marker-reward/index.ts`

---

## FASE 1 — Verifica tecnica (read-only)

### Grep pre-patch (versione HEAD committed)

```text
# notification_type: in HEAD
git show HEAD:supabase/functions/claim-marker-reward/index.ts | grep -n "notification_type\s*:"
```
**Output:** 9 occorrenze (righe 147, 178, 195, 245, 280, 312, 372, 421, 475).

```text
# .from("user_notifications") in HEAD
git show HEAD:supabase/functions/claim-marker-reward/index.ts | grep -n 'from("user_notifications")'
```
**Output:** 9 occorrenze (righe 144, 175, 192, 242, 277, 309, 370, 418, 472).

**Evidenza:** notification_type: esiste (≥1); gli insert sono su user_notifications. Causa confermata.

### Verifica DB (da eseguire in Supabase SQL Editor PROD)

Eseguire e incollare output nel report:

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

### Decision gate

- has_notification_type = false (atteso da migration)
- has_type = true (atteso da migration)
- Nel file Edge (HEAD) ci sono 9 occorrenze di notification_type:

→ **Procedi con FIX.** Patch applicata.

---

## FASE 2 — Rollback immediato (prima della patch)

- **Branch:** fix/edge-claim-marker-reward-typecol (checkout)
- **Tag creato:** rollback/claim-marker-reward-pre-notifcolfix-20260226-0601
- **Backup file:** reports/rollback/claim-marker-reward.index.ts.pre-notifcolfix-20260226-0601.bak (copia di HEAD pre-patch)

**Comandi rollback (se serve):**
- Da tag: `git checkout rollback/claim-marker-reward-pre-notifcolfix-20260226-0601 -- supabase/functions/claim-marker-reward/index.ts`
- Da backup: `cp reports/rollback/claim-marker-reward.index.ts.pre-notifcolfix-20260226-0601.bak supabase/functions/claim-marker-reward/index.ts`

---

## FASE 3 — Patch mirata

- Sostituzione applicata: **notification_type:** → **type:** in tutti e 9 gli insert su user_notifications.
- Nessun altro cambiamento (logica, tabella, routing, payload, metadata).

### Grep post-patch

```text
rg -n 'notification_type\s*:' supabase/functions/claim-marker-reward/index.ts
```
**Output:** 0 occorrenze.

```text
rg -n 'from("user_notifications")' supabase/functions/claim-marker-reward/index.ts
```
**Output:** 9 occorrenze. Insert con **type:** (reward, clue, prize) confermati.

---

## FASE 4 — Commit minimo

- **git status:** modificato solo `supabase/functions/claim-marker-reward/index.ts`
- **git diff:** solo 9 sostituzioni (notification_type → type), nessun’altra modifica
- **Commit:** 357b1f5ae — `fix(edge): user_notifications column type (no notification_type)` — 1 file changed, 9 insertions(+), 9 deletions(-)

---

## FASE 5 — Deploy Edge

- **Comando eseguito:** `supabase functions deploy claim-marker-reward --no-verify-jwt`
- **Esito:** Access token non fornito. Eseguire `supabase login` oppure impostare `SUPABASE_ACCESS_TOKEN`, poi:
  - **CLI:** `supabase functions deploy claim-marker-reward --no-verify-jwt`
  - **Oppure:** Supabase Dashboard → Edge Functions → claim-marker-reward → Deploy (da repo/source secondo setup progetto)

---

## FASE 6 — Test E2E (da eseguire dopo deploy)

1. **Da app iOS:** claim marker con reward physical_prize; claim marker con reward m1u o buzz_free.
2. **Logs Edge:** non deve comparire PGRST204 notification_type; devono comparire log di successo sulle notification (o assenza errori insert).
3. **DB (read-only):**
```sql
SELECT id, user_id, type, title, message, created_at, metadata
FROM public.user_notifications
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180'
ORDER BY created_at DESC
LIMIT 30;
```
**Atteso:** nuove righe con type in ('reward','prize','clue') e metadata coerente.

---

## Deliverable (output richiesti)

| # | Richiesto | Esito |
|---|-----------|--------|
| 1 | Grep occorrenze pre-patch (notification_type) | **9** (HEAD) |
| 2 | Grep occorrenze post-patch (notification_type) | **0** |
| 3 | Output SQL has_notification_type / has_type | Da eseguire in PROD (query in FASE 1) |
| 4 | git status prima del commit (solo file in scope) | Solo `supabase/functions/claim-marker-reward/index.ts` modificato |
| 5 | Log deploy function | Deploy non completato (token mancante); istruzioni in FASE 5 |
| 6 | Log test claim senza PGRST204 | Da verificare dopo deploy (FASE 6) |
| 7 | Query finale user_notifications con nuove righe e colonna type | Query in FASE 6; eseguire dopo claim di test |

---

## Rollback (se qualcosa va storto)

1. **Ripristino file:**  
   `git checkout rollback/claim-marker-reward-pre-notifcolfix-20260226-0601 -- supabase/functions/claim-marker-reward/index.ts`  
   oppure  
   `cp reports/rollback/claim-marker-reward.index.ts.pre-notifcolfix-20260226-0601.bak supabase/functions/claim-marker-reward/index.ts`

2. **Commit revert e redeploy:**  
   `git add supabase/functions/claim-marker-reward/index.ts`  
   `git commit -m "revert(edge): rollback claim-marker-reward typecol fix"`  
   `supabase functions deploy claim-marker-reward --no-verify-jwt`

---

## Riepilogo

- **Scope:** solo claim-marker-reward/index.ts; nessuna modifica a iOS, altre Edge, DB.
- **Patch:** 9 sostituzioni notification_type → type negli insert su user_notifications.
- **Commit:** 357b1f5ae.
- **Deploy:** da completare con `supabase login` (o token) + `supabase functions deploy claim-marker-reward --no-verify-jwt` oppure da Dashboard.
- **Test:** dopo deploy, claim physical_prize / m1u / buzz_free da app iOS; verifica logs e query user_notifications.
