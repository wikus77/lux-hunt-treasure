# Phase 3 — Ordine di esecuzione e comandi

Esegui **in questo ordine**: prima la migration (database), poi il deploy della Edge Function.

---

## STEP 1 — Migration (creare la tabella `antifraud_log`)

Hai **due modi**. Scegline uno.

### Opzione A — Supabase Dashboard (più semplice)

1. Apri **Supabase Dashboard** → il tuo progetto.
2. Menu a sinistra: **SQL Editor**.
3. Clicca **New query**.
4. Copia e incolla **tutto** il contenuto del file:
   ```
   supabase/migrations/20260224130000_add_antifraud_log.sql
   ```
5. Clicca **Run** (o Ctrl+Enter).
6. Deve comparire qualcosa tipo "Success. No rows returned". Se vedi errori, fermati e scrivimi il messaggio.

### Opzione B — Terminale (Supabase CLI)

Se hai già linkato il progetto (`supabase link`):

```bash
cd /Users/josephmule/lux-hunt-treasure
npx supabase db push
```

Oppure, per eseguire solo questa migration:

```bash
cd /Users/josephmule/lux-hunt-treasure
npx supabase migration up
```

(Se non hai mai usato `supabase link`, usa l’**Opzione A**.)

---

## STEP 2 — Deploy della Edge Function `claim-marker-reward`

Solo dopo che STEP 1 è andato a buon fine.

1. Apri il **terminale** nella root del repo.
2. Esegui:

```bash
cd /Users/josephmule/lux-hunt-treasure
npx supabase functions deploy claim-marker-reward
```

3. Se ti chiede la password (Supabase project ref / token), usala.  
4. Alla fine deve comparire qualcosa tipo “Deployed function claim-marker-reward”.

---

## STEP 3 — Verifica (opzionale ma consigliata)

1. Nell’app (o da Postman), fai un **claim di un marker** (anche già claimato va bene).
2. In Supabase: **SQL Editor** → New query. Esegui:

```sql
SELECT event_type, user_id, marker_id, request_id, created_at
FROM public.antifraud_log
ORDER BY created_at DESC
LIMIT 5;
```

3. Dovresti vedere almeno una riga con `event_type = 'marker_claim'` e i campi valorizzati.

---

## Riepilogo ordine

| Ordine | Cosa fare | Dove / comando |
|--------|------------|-----------------|
| 1 | Eseguire la migration (creare tabella `antifraud_log`) | Dashboard → SQL Editor → incolla `20260224130000_add_antifraud_log.sql` → Run **oppure** terminale: `npx supabase db push` |
| 2 | Deploy Edge Function | Terminale: `cd /Users/josephmule/lux-hunt-treasure` poi `npx supabase functions deploy claim-marker-reward` |
| 3 | Verifica | Fare un claim marker, poi in SQL Editor la query sopra |

---

## Se non hai Supabase CLI

1. **Solo migration:** usa **Opzione A** (Dashboard + SQL Editor con il contenuto di `20260224130000_add_antifraud_log.sql`).
2. **Edge Function:** da Dashboard → **Edge Functions** → se c’è “Deploy” da interfaccia usa quello; altrimenti installa Supabase CLI e usa il comando dello STEP 2.

Installazione Supabase CLI (se serve):

```bash
npm install -g supabase
```

Poi:

```bash
cd /Users/josephmule/lux-hunt-treasure
supabase login
supabase link --project-ref TUO_PROJECT_REF
npx supabase functions deploy claim-marker-reward
```

(TUO_PROJECT_REF lo trovi in Supabase Dashboard → Project Settings → General → Reference ID.)
