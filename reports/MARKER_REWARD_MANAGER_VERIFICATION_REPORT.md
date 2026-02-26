# Report — Marker Reward Manager: i marker creati dalla card vengono letti dal DB?

**Tipo:** Verifica read-only (nessuna modifica a codice o DB).  
**App:** iOS nativa wrappata (Capacitor WKWebView).  
**Firma:** Lovable Agent JLENIA

---

## 1) Tabelle coinvolte (INSERT / READ / CLAIM)

| Ruolo | Tabella | Uso |
|-------|---------|-----|
| **INSERT (card "Crea Marker")** | `public.markers` | Card inserisce: `lat`, `lng`, `title`, `active`, `visible_from`, `visible_to`. |
| **INSERT (card "Crea Marker")** | `public.marker_rewards` | Card inserisce: `marker_id` (ritornato da `markers`), `reward_type`, `payload`, `description`. |
| **READ (card lista)** | `public.markers` | SELECT id, lat, lng, title, active, created_at, visible_from, visible_to, order by created_at desc, limit 200. |
| **READ (card lista)** | `public.marker_rewards` | SELECT marker_id, reward_type, payload WHERE marker_id IN (ids da markers). |
| **READ (mappa produzione)** | `public.markers` | SELECT con filtri: `active = true`, `visible_from`/`visible_to` (ora nel range). |
| **CLAIM (Edge + DB)** | `public.marker_rewards` | Edge `claim-marker-reward` legge reward per marker_id. |
| **CLAIM (premio fisico)** | `public.prize_claims` | Edge inserisce riga con `marker_id`, `user_id`, `claim_code`, `prize_name`, ecc. Trigger email legge `prize_claims`. |

**Conclusione tabelle:** La card scrive nelle stesse tabelle usate in runtime: **markers** (posizione/visibilità) e **marker_rewards** (tipo premio/payload). Il claim e la pipeline email usano **marker_rewards** e **prize_claims**; **prize_claims.marker_id** riferisce **markers.id**.

---

## 2) Risultato verifica

| Domanda | Esito | Note |
|---------|--------|------|
| **I marker creati dalla card vengono inseriti (nelle tabelle reali)?** | **SÌ** | La card fa INSERT su `markers` poi su `marker_rewards`. Stesse tabelle usate da mappa e claim. |
| **Il codice li legge?** | **SÌ** (a patto di filtri/RLS) | Card e mappa leggono da `markers` (+ `marker_rewards`). Se un marker non appare in mappa: controllare **active**, **visible_from**, **visible_to** e RLS. |
| **Se NO: perché?** | N/A (qui SÌ) | Possibili cause se in altri ambienti risultasse NO: mismatch nome tabella, filtri (active/visible), RLS che nega SELECT, colonna temporale diversa (es. `created_at` assente). |

---

## 3) Evidenze (query + cosa aspettarsi)

Eseguire in **Supabase SQL Editor** (read-only). Sostituire `<TABLE_MARKERS_DA_FASE_A>` con **markers** (nome reale usato dalla card).

### FASE A — Tabelle usate dalla card (da codice)

- **INSERT target:** `public.markers` (poi `public.marker_rewards`).
- **SELECT/read (card):** `public.markers` + `public.marker_rewards` (join logico su marker_id).

Payload inserito dalla card in **markers**:  
`lat`, `lng`, `title` (o 'Reward Marker'), `active: true`, `visible_from` (now), `visible_to` (now + visibilityHours).

Payload in **marker_rewards**:  
`marker_id`, `reward_type` (minuscolo, es. physical_prize), `payload` (con min_zoom), `description`.

---

### FASE B — Verifica DB: schema e ultimi marker

```sql
-- 1) Schema colonne markers
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'markers'
ORDER BY ordinal_position;
```

**Nota:** Se non esiste `created_at`, usare per “recenti” un’altra colonna temporale se presente (es. nessuna in alcune migration; in quel caso ordinare per `id` o filtrare per titolo/coordinate).

```sql
-- 2) Ultimi 50 marker (ordinamento: id desc o created_at desc se esiste)
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
ORDER BY id DESC
LIMIT 50;
```

Se in schema esiste **created_at**:

```sql
SELECT id, lat, lng, title, active, created_at, visible_from, visible_to
FROM public.markers
ORDER BY created_at DESC
LIMIT 50;
```

```sql
-- 3) Marker vicini a Roma (41.9028, 12.4964) con tolleranza
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
WHERE abs(lat - 41.9028) < 0.01 AND abs(lng - 12.4964) < 0.01
ORDER BY id DESC
LIMIT 50;
```

**Deliverable:** Estratto di una riga marker appena creata dalla card (stesso id che compare dopo “Crea Marker” e refresh lista).

---

### FASE C — Verifica lettura: stessa tabella e stessi filtri

**Codice card (loadMarkers):**  
`from('markers').select('id, lat, lng, title, active, created_at, visible_from, visible_to').order('created_at', { ascending: false }).limit(200)`  
Nessun filtro su active/visible nella card (legge tutti).

**Codice mappa (MapMarkers.tsx):**  
`from('markers').select('*').eq('active', true).or('visible_from.is.null', 'visible_from.lte.' + now).or('visible_to.is.null', 'visible_to.gte.' + now)`  
Quindi la mappa mostra solo marker con `active = true` e finestra `visible_from` / `visible_to` valida.

**Query equivalente in SQL (stessi filtri della mappa):**

```sql
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
WHERE active = true
  AND (visible_from IS NULL OR visible_from <= now())
  AND (visible_to IS NULL OR visible_to >= now())
ORDER BY id DESC
LIMIT 200;
```

**Confronto:**

| Dove | Tabella | Filtri |
|------|---------|--------|
| Card lista | markers | Nessuno (tutti i marker) |
| Mappa | markers | active = true, visible_from/visible_to nel range |
| Codice legge | markers | SÌ, stessa tabella |
| DB contiene | markers | SÌ (se INSERT dalla card va a buon fine) |

Se un marker **esiste** in `markers` ma **non appare in mappa**: è filtrato da `active` o da `visible_from`/`visible_to` (o da RLS sulla SELECT).

---

### FASE D — Collegamento con claim (marker_id → markers)

Claim di esempio:  
`id = 0865aca5-3aaa-4d1c-ae06-c31e580a046d`, `marker_id = 55d4bc74-4de8-464d-a3eb-b7240b47b4ec`.

```sql
-- Verifica claim
SELECT pc.id AS claim_id, pc.marker_id, pc.status, pc.claimed_at, pc.prize_name
FROM public.prize_claims pc
WHERE pc.id = '0865aca5-3aaa-4d1c-ae06-c31e580a046d';

-- Verifica che marker_id punti a markers (tabella “vera” usata dalla card)
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
WHERE id = '55d4bc74-4de8-464d-a3eb-b7240b47b4ec';
```

**Deliverable:**  
- Se la seconda SELECT restituisce una riga → **marker_id resolve = OK** (marker creato dalla card o da altro flusso che scrive in `markers`).  
- Se nessuna riga → **marker_id resolve = KO** (marker_id potrebbe puntare a un’altra tabella o a un marker cancellato).

---

### FASE E — net.* (solo verifica colonne, no created_at)

L’errore **"column created_at does not exist"** su `net.http_request_queue` indica che la colonna temporale ha nome diverso. Usare sempre `information_schema` prima di ordinare.

```sql
-- 1) Colonne reali net.http_request_queue
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net' AND table_name = 'http_request_queue'
ORDER BY ordinal_position;
```

```sql
-- 2) Esempio query corretta (usare una colonna esistente, es. id se numerico)
SELECT * FROM net.http_request_queue ORDER BY id DESC LIMIT 20;
```

Se `id` non esiste, usare il nome colonna restituito dallo schema (es. un bigint o timestamp presente).

```sql
-- 3) Colonne reali net.http_response (può essere composite type / view)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net' AND table_name = 'http_response'
ORDER BY ordinal_position;
```

```sql
-- 4) Esempio su response (campo ordine reale dallo schema)
SELECT * FROM net._http_response ORDER BY id DESC LIMIT 20;
```

**Nota:** In alcuni setup pg_net espone `net._http_response` come tipo composito; non usare `FROM net._http_response` come se fosse una tabella con tutte le colonne se il driver restituisce errore. Usare solo colonne/campo confermati da information_schema o dalla doc pg_net.

**Deliverable:** Evidenza che la trigger email ha enqueueato la request (es. presenza di una riga in coda o in response con id/request_id coerente), senza incollare messaggi “Error: …” dentro il SQL editor.

---

## 4) Root-cause candidate (ordine di probabilità)

1. **Filtri di visibilità / active**  
   Marker inserito con `active = true` e `visible_from`/`visible_to` corretti; la mappa applica filtri stretti. Se `visible_to` è nel passato o `active` è false, il marker non appare in mappa ma esiste in DB.  
   **Verifica:** Eseguire la SELECT “FASE C” senza filtri e confrontare con la SELECT con filtri.

2. **RLS (Row Level Security)**  
   Policy su `markers` che consente SELECT solo a certi ruoli o in certe condizioni. La card potrebbe inserire con un contesto (es. service_role/admin) e la mappa leggere con utente autenticato; se la policy non permette SELECT per quell’utente, il marker non appare.  
   **Verifica:** Controllare policy su `markers` (e `marker_rewards`) e ripetere le SELECT con l’utente di test (es. user_id 495246c1-9154-4f01-a428-7f37fe230180).

3. **Colonna temporale / ordinamento**  
   Se `created_at` non esiste su `markers`, la card che fa `.order('created_at', …)` può fallire o comportarsi in modo inatteso; la lista “recenti” potrebbe essere vuota o errata.  
   **Verifica:** FASE B query 1; se non c’è `created_at`, la card dovrebbe usare un altro campo (es. `id`) o la tabella va estesa con `created_at`.

---

## 5) Riepilogo finale

- **INSERT dalla card:** va in **markers** e **marker_rewards** (tabelle reali di runtime).  
- **READ:** card e mappa leggono da **markers** (e **marker_rewards**); stessa tabella.  
- **Claim/email:** **prize_claims.marker_id** riferisce **markers.id**; pipeline email legata a **prize_claims**.  
- Per evitare falsi positivi su **net.***: non assumere `created_at`; usare sempre `information_schema.columns` per schema `net` e ordinare solo su colonne esistenti; non incollare output “Error: …” come SQL.

**Conclusione:** I marker creati dalla card “Marker Reward Manager” vengono scritti nelle tabelle corrette (**markers** + **marker_rewards**) e il resto del sistema li legge dalla stessa tabella. Se in produzione qualcosa “non si vede”, le cause più probabili sono filtri (active/visible), RLS o assenza/uso errato di una colonna temporale.
