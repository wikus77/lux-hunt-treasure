# Report forense — PGRST204: notification_type su user_notifications (claim-marker-reward)

**Tipo:** Verifica read-only (nessuna modifica applicata).  
**App:** iOS nativa wrappata (Capacitor / WKWebView).  
**Edge:** claim-marker-reward.  
**Firma:** Lovable Agent JLENIA

---

## Sintomo

- Claim premio fisico completa con successo (✅ CLAIM COMPLETE … rewards:1).
- Subito dopo: errore creazione notifica → **PGRST204: Could not find the 'notification_type' column of 'user_notifications' in the schema cache**.
- Evidenza: "notification creation error for physical prize (PGRST204)".

---

## A) Forensics sul DB (SQL read-only)

Eseguire in **Supabase SQL Editor** (produzione) le query sotto e annotare l’output.

### A1) Colonne reali di public.user_notifications

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_notifications'
ORDER BY ordinal_position;
```

**Output atteso (da migration nel repo):**  
`id`, `user_id`, `message`, `is_read`, `created_at`, `read_at`, `type`, `title`, `is_deleted`, `metadata` (se presenti le migration 20251120073459, 20251120075734, 20250804065628).  
**Nessuna colonna `notification_type`** nelle migration attuali.

### A2) Esistenza colonna notification_type (true/false)

```sql
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_notifications'
    AND column_name = 'notification_type'
) AS has_notification_type;
```

**Output atteso:** `false` (se lo schema è quello delle migration; in produzione può essere diverso).

### A3) Ultime 5 righe (per conferma colonne)

```sql
SELECT *
FROM public.user_notifications
ORDER BY created_at DESC
LIMIT 5;
```

Se `created_at` non esiste (colonna assente dall’A1), usare:

```sql
SELECT *
FROM public.user_notifications
ORDER BY id DESC
LIMIT 5;
```

**Nel report:** indicare l’elenco colonne restituito e se `has_notification_type` è true/false; se avete usato `ORDER BY id DESC` perché mancava `created_at`, segnalarlo.

---

## B) Forensics sul codice Edge (read-only)

Analisi di **supabase/functions/claim-marker-reward/index.ts** (solo lettura).

### Tabella usata

- Nome: **`user_notifications`** (stringa `"user_notifications"` in `.from("user_notifications")`).
- Schema: default `public` (client Supabase senza schema esplicito → public).

### Oggetto insert su user_notifications (tutti i rami)

Tutti gli insert nel file usano **stesso insieme di chiavi**:

| Chiave     | Tipo   | Esempio / nota                          |
|-----------|--------|-----------------------------------------|
| `user_id` | UUID   | id utente                               |
| `type`    | string | `'reward'`, `'prize'`, `'clue'`         |
| `title`   | string | titolo notifica                         |
| `message` | string | corpo messaggio                         |
| `metadata`| object | `{ source, reward_type, ... }`         |

**Nessuna chiave `notification_type`** nel codice attuale di claim-marker-reward.

### Insert ramo premio fisico (physical_prize) — righe 529–544

```ts
await admin.from("user_notifications").insert([{
  user_id,
  type: 'prize',
  title: `🎉 PREMIO VINTO: ${prizeName}!`,
  message: `Congratulazioni! Hai vinto ${prizeName}! Il tuo codice...`,
  metadata: {
    source: `marker:${markerId}`,
    reward_type: 'physical_prize',
    prize_name: prizeName,
    claim_code: claimCode,
    status: 'pending'
  }
}]);
```

Conferma: viene usata solo la chiave **`type`**, non `notification_type`.

---

## C) PostgREST / schema cache

- L’Edge chiama PostgREST tramite **Supabase client** (`admin.from('user_notifications').insert(...)`), quindi REST API PostgREST.
- **PGRST204** indica che PostgREST, nel validare la richiesta, cerca la colonna **`notification_type`** nello schema in cache per `user_notifications` e non la trova.

Possibili cause coerenti con “schema cache”:

1. **Colonna non esiste in DB e non è in cache**  
   La richiesta (da qualche parte) invia `notification_type` → PostgREST risponde PGRST204. Nel repo attuale claim-marker-reward **non** invia `notification_type`, quindi o la build deployata è diversa (vecchia) o un altro chiamante invia quel campo.

2. **Schema cache stantia**  
   Dopo una migration che ha rinominato/rimosso `notification_type`, PostgREST non ha ricaricato lo schema e potrebbe ancora aspettarsi quella colonna, o viceversa: la cache ha una versione vecchia della tabella. In entrambi i casi il messaggio può riferirsi a `notification_type`.

3. **Tabella/schema diverso**  
   Improbabile se la tabella è proprio `public.user_notifications` e il nome è corretto; da codice è così.

---

## D) Correlazione con i log

| Fase          | Evidenza                                              | Conclusione                    |
|---------------|--------------------------------------------------------|--------------------------------|
| Fetch rewards | "RAW REWARDS from DB … physical_prize …"              | marker_rewards letto OK        |
| Claim         | "✅ CLAIM COMPLETE … rewards:1"                        | Pipeline claim OK              |
| Notifica      | "PGRST204 … notification_type … schema cache"         | Rottura su insert user_notifications |

La rottura è isolata all’insert in `user_notifications`; reward e claim DB sono coerenti.

---

## Root cause candidate (da confermare con A+B)

1. **DB non ha la colonna `notification_type` (Edge/schema fuori sync)**  
   - Nel repo: la tabella ha **`type`**, non `notification_type`.  
   - Se in produzione qualcosa (Edge deployata o altro servizio) invia **`notification_type`**, PostgREST risponde PGRST204 perché la colonna non esiste.  
   - **Conferma:** A2 = false e nessun insert nel repo usa `notification_type` → probabile che la build in produzione sia vecchia o che un altro client invii `notification_type`.

2. **La colonna esiste in DB ma la schema cache di PostgREST è stantia**  
   - Es. migration recente che ha aggiunto `notification_type` o rinominato `type` → cache non aggiornata.  
   - **Conferma:** A2 = true e A1 mostra `notification_type` → suggerito refresh schema cache (vedi piano fix).

3. **Tabella/schema diverso**  
   - Edge punta a `user_notifications` ma in prod c’è una view o tabella con nome uguale e schema diverso.  
   - Da codice è `public.user_notifications`; da verificare in DB che non ci siano view/alias che espongono `notification_type` mentre la tabella base ha `type`.

---

## Diagnosi (in base al repo, senza eseguire le query)

- **Schema da migration:** `public.user_notifications` ha **`type`** (e title, metadata, …), **nessuna** `notification_type`.
- **Codice claim-marker-reward:** usa solo **`type`** (mai `notification_type`).

Quindi, **se** l’errore in produzione è proprio su questa Edge e su questo insert:

- O la **versione deployata** della Edge è vecchia e invia ancora `notification_type`,
- O **PostgREST** ha in cache uno schema in cui `user_notifications` ha `notification_type` (es. vecchia migration o DB modificato a mano) e la richiesta è generata da qualcosa che si aspetta quella colonna.

Dopo aver eseguito A1 e A2 in produzione, si può attribuire con più sicurezza una delle tre root cause sopra.

---

## Piano fix (NON APPLICATO)

### Opzione 1: Allineare Edge al nome colonna reale (se mismatch)

- **Quando:** A2 = false (la colonna `notification_type` non esiste) e in produzione l’insert che fallisce è quello che invia `notification_type`.
- **Cosa fare:** Assicurarsi che **tutti** gli insert in `user_notifications` dalla Edge usino solo colonne presenti nello schema (in particolare **`type`**, non `notification_type`). Nel repo attuale è già così; se in produzione la Edge è diversa, ri-deploy della versione che usa solo `type`.
- **Non eseguito:** nessuna modifica al codice in questa sessione.

### Opzione 2: Refresh schema cache PostgREST (se cache stantia)

- **Quando:** A2 = true (la colonna `notification_type` esiste in DB) ma PostgREST continua a restituire PGRST204, oppure dopo migration che hanno cambiato colonne di `user_notifications`.
- **Cosa fare:** Eseguire il reload dello schema cache PostgREST (Dashboard Supabase → Settings → API → “Reload schema cache”, o equivalente; oppure restart del progetto se necessario). **Non eseguire** in questa sessione: solo proposta.

### Checklist verifica post-fix (da eseguire dopo un eventuale fix)

- [ ] Eseguire A1 e A2 e annotare `has_notification_type` e elenco colonne.
- [ ] Dopo fix (Opzione 1 o 2): effettuare un claim premio fisico di test e verificare che non compaia più PGRST204.
- [ ] Controllare che esista una riga in `user_notifications` per l’utente di test con `type = 'prize'` (e titolo/message coerenti).
- [ ] Verificare nei log Edge assenza di "notification creation error for physical prize" e presenza di "Physical prize notification created" (o equivalente).

---

## File SQL di verifica (solo lettura)

Le query A1, A2 e A3 sono ripetute in forma eseguibile in:  
**reports/verify_user_notifications_schema.sql** (creato sotto).
