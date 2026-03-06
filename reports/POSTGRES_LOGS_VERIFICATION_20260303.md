# Verifica errori Postgres (Supabase) — 03 Mar 2026

Dai log che hai incollato e dagli screenshot emergono **3 errori principali** (più un quarto “permission denied” su `public.subscriptions` se presente in altri log). Sono **gravi** nel senso che bloccano le operazioni coinvolte; tutti sono risolvibili con migrazioni/trigger/policy.

---

## 1) `record "new" has no field "meta"` (GRAVE — blocca INSERT su buzz_map_actions)

**Log id:** 5b41ec4d-d11b-429d-a760-745242abe668  
**Contesto:** Trigger `handle_buzz_map_pe()` su tabella `public.buzz_map_actions`, riga 4:  
`PERFORM public.award_pulse_energy(NEW.user_id, 10, 'buzz_map', COALESCE(NEW.meta, '{}'::jsonb));`

**Causa:**  
La funzione del trigger usa `NEW.meta`, ma nella tabella `buzz_map_actions` (migration `20251120035636`) le colonne sono: `id`, `user_id`, `cost_eur`, `cost_m1u`, `radius_generated`, `clue_count`, `created_at`. **Non esiste la colonna `meta`**, quindi `NEW.meta` non è definito e Postgres solleva l’errore.

**Gravità:** Ogni INSERT in `buzz_map_actions` (es. dopo un’azione Buzz Map) fallisce a causa del trigger.

**Come risolvere:**  
Modificare la funzione `handle_buzz_map_pe()` in modo che **non** usi `NEW.meta`. Opzioni:

- **A) (consigliata)** Non usare affatto un campo meta nel trigger: nella chiamata a `award_pulse_energy` passare sempre `'{}'::jsonb` come ultimo argomento invece di `COALESCE(NEW.meta, '{}'::jsonb)`.
- **B)** Aggiungere la colonna `meta JSONB DEFAULT '{}'::jsonb` a `buzz_map_actions` e lasciare il trigger com’è.

Esempio per A (nuova migration):

```sql
-- Fix: handle_buzz_map_pe uses NEW.meta but buzz_map_actions has no meta column
CREATE OR REPLACE FUNCTION public.handle_buzz_map_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.award_pulse_energy(NEW.user_id, 10, 'buzz_map', '{}'::jsonb);
  PERFORM public.award_xp(NEW.user_id, 10, 'buzz_map');
  RETURN NEW;
END;
$$;
```

Eseguire questa migration sul progetto Supabase (Dashboard → SQL Editor o `supabase db push`).

---

## 2) `column mission_enrollments.id does not exist` (GRAVE — blocca query enrollment)

**Log id:** e2bf3a74-ff59-4e71-ab83-d6243b3ed6cb  
**Query:**  
`SELECT "public"."mission_enrollments"."id", "mission_id", "created_at", "state" FROM "public"."mission_enrollments" WHERE "user_id" = $1 ...`

**Causa:**  
Nel repo ci sono **due** definizioni di `mission_enrollments`:

- **20251004124325:** crea la tabella con `(mission_id, user_id, joined_at)` e **PK (mission_id, user_id)** — **nessuna colonna `id`**.
- **20251120124137:** fa `CREATE TABLE IF NOT EXISTS ... mission_enrollments (id UUID PRIMARY KEY, user_id, mission_id, state, created_at)`.

Se la migration più vecchia è stata applicata per prima, la tabella esiste già e `CREATE TABLE IF NOT EXISTS` non modifica la struttura: in DB resta lo schema **senza** `id`, `state`, `created_at`. L’app e i tipi TypeScript invece si aspettano `id`, `mission_id`, `created_at`, `state`, quindi la query generata da PostgREST chiede `id` e va in errore.

**Gravità:** Tutte le letture di enrollment (es. “Start Mission”, stato missione) che selezionano `id` falliscono.

**Come risolvere:**  
Aggiungere le colonne mancanti alla tabella esistente con una migration (solo se non ci sono già):

```sql
-- Add id, state, created_at to mission_enrollments if table has old schema (no id)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'id') THEN
    ALTER TABLE public.mission_enrollments ADD COLUMN id UUID DEFAULT gen_random_uuid() NOT NULL;
    UPDATE public.mission_enrollments SET id = gen_random_uuid() WHERE id IS NULL;
    ALTER TABLE public.mission_enrollments ADD UNIQUE (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'state') THEN
    ALTER TABLE public.mission_enrollments ADD COLUMN state TEXT DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'created_at') THEN
    ALTER TABLE public.mission_enrollments ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    UPDATE public.mission_enrollments SET created_at = joined_at WHERE created_at IS NULL AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mission_enrollments' AND column_name = 'joined_at');
  END IF;
END $$;
```

(Se la tabella ha ancora `joined_at` e non `created_at`, adatta il backfill come sopra; altrimenti adatta i nomi colonna allo schema reale.) Eseguire la migration su Supabase.

---

## 3) `new row violates row-level security policy for table "admin_logs"` (GRAVE — blocca INSERT admin_logs)

**Log id:** 00deac67-ebe9-47eb-96ac-c3b563060234  
**Query:** INSERT in `public.admin_logs` con colonne `context`, `event_type`, `note`, `user_id`.

**Causa:**  
La tabella `admin_logs` ha RLS attivo. L’INSERT arriva dal client con ruolo `authenticator`/JWT (utente autenticato). Se le policy INSERT esistenti consentono solo a `service_role` o ad altri ruoli specifici, l’insert dall’app viene bloccato. In più lo schema che hai in migration (es. `admin_id`, `event_type`, `target_user_id`, `details`, `created_at`) non coincide con i campi della query (`context`, `event_type`, `note`, `user_id`): potrebbe esserci un altro schema reale (o view) che espone `context`, `note`, `user_id`. In ogni caso l’errore è di **RLS**: nessuna policy INSERT permette a quel ruolo di inserire la riga.

**Gravità:** Ogni tentativo dell’app (o di un Edge Function con ruolo sbagliato) di scrivere in `admin_logs` fallisce.

**Come risolvere:**  
- **Opzione A (consigliata):** Inserire in `admin_logs` **solo** da Edge Functions (o da backend) usando la chiave **service_role**, che bypassa RLS. Verificare che nessun client con chiave `anon`/`authenticated` chiami direttamente INSERT su `admin_logs`; se lo fa, spostare quella logica in una Edge Function con `service_role`.
- **Opzione B:** Aggiungere una policy INSERT su `admin_logs` che permetta agli utenti autenticati di inserire solo righe “proprie”, ad es.  
  `WITH CHECK (auth.uid() = user_id)`  
  (e solo se lo schema della tabella ha davvero `user_id` e va bene che gli utenti inseriscano log “admin”). Spesso gli admin_logs sono riservati al backend, quindi A è più sicura.

Verificare anche che lo **schema** della tabella (nomi colonne) sia allineato a ciò che l’app/Edge Function invia (`context`/`note`/`user_id` vs `admin_id`/`details`/`target_user_id`). Se la tabella ha colonne diverse, adattare la definizione della tabella o le insert.

---

## 4) `permission denied for table public.subscriptions` (se presente)

**Causa:** Il ruolo usato dalla sessione (es. `authenticated` o `anon`) non ha il privilegio necessario (SELECT/INSERT/…) sulla tabella `public.subscriptions`.

**Come risolvere:**  
In Supabase (SQL Editor o migration):

```sql
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
-- oppure ai ruoli che devono usarla:
-- GRANT ... TO anon;
```

E, se serve, verificare le policy RLS su `subscriptions` in modo che siano coerenti con l’uso dell’app.

---

## Riepilogo gravità e priorità

| Errore | Gravità | Effetto | Priorità fix |
|--------|--------|---------|----------------|
| `record "new" has no field "meta"` | **Alta** | Buzz Map actions non si registrano, trigger fallisce | 1 |
| `column mission_enrollments.id does not exist` | **Alta** | Enrollment/missioni non caricano | 2 |
| `new row violates row-level security policy for table "admin_logs"` | **Alta** | Scrittura log admin bloccata | 3 |
| `permission denied for table public.subscriptions` | **Media/Alta** | Funzionalità che usano `subscriptions` falliscono | 4 |

---

## Cosa fare in pratica

1. **Trigger `handle_buzz_map_pe`:** Eseguire la migration che sostituisce `COALESCE(NEW.meta, '{}'::jsonb)` con `'{}'::jsonb` (o aggiungere colonna `meta` a `buzz_map_actions`).
2. **mission_enrollments:** Eseguire la migration che aggiunge `id` (e eventualmente `state`, `created_at`) se assenti.
3. **admin_logs:** Decidere se gli insert devono avvenire solo da backend (service_role) e, in caso positivo, rimuovere gli INSERT diretti dal client e spostarli in Edge Function; oppure aggiungere una policy INSERT adeguata e allineare lo schema alla query.
4. **subscriptions:** Verificare ruoli e `GRANT` su `public.subscriptions` (e RLS se attivo).

Dopo aver applicato le fix, ripetere le stesse operazioni (Buzz Map, mission enrollment, scrittura admin_logs, uso subscriptions) e controllare di nuovo i log Postgres per confermare che gli errori non compaiano più.

---

## Migrazioni create in repo (fix 1 e 2)

Sono state aggiunte due migration da applicare su Supabase:

- **`supabase/migrations/20260303100000_fix_handle_buzz_map_pe_no_meta.sql`** — Corregge il trigger `handle_buzz_map_pe` rimuovendo l’uso di `NEW.meta`.
- **`supabase/migrations/20260303100001_mission_enrollments_add_id_if_missing.sql`** — Aggiunge le colonne `id`, `state` e `created_at` a `mission_enrollments` se mancanti (schema legacy).

Per applicarle: da Supabase Dashboard → SQL Editor incolla ed esegui il contenuto di ciascun file, oppure usa `supabase db push` se usi la CLI. Per **admin_logs** e **subscriptions** serve un intervento manuale (policy RLS / GRANT) come descritto sopra.
