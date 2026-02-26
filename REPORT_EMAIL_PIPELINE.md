# Report — Email pipeline bloccata (pg_net → Edge Functions)

**Progetto:** vkjrqirvdvjbemsfzxof (produzione) | **App:** iOS nativa (Capacitor WKWebView).  
**Firma:** Lovable Agent JLENIA

---

## In parole semplici

I trigger che devono inviare le email (premio marker / vincitore Final Shoot) **scrivono** la riga in `public.email_sends` (status = queued) e **chiamano** l’Edge Function via pg_net. La chiamata HTTP però **fallisce** prima di arrivare alla logica di invio: il gateway risponde **401** (header mancante o token non valido) o a volte **503** (funzione che non parte). In più in `email_sends` il campo **recipient_email** resta vuoto (solo audit).  
Quindi: **non è un problema di SMTP o di logica app**, ma di **configurazione** (URL sbagliato, token sbagliato o assente) e, se presenti, **env mancanti** in avvio Edge.

---

## Evidenze (query + cosa aspettarsi)

**Eseguire in Supabase SQL Editor. Non stampare mai il valore di auth_token.**

### 1) Stato email_send_config (auth_token solo stato: EMPTY / PLACEHOLDER / SET)

```sql
SELECT id, base_url,
  CASE WHEN auth_token IS NULL OR trim(auth_token) = '' THEN 'EMPTY'
       WHEN auth_token LIKE '%IL_TUO_%' OR auth_token LIKE '%placeholder%' OR auth_token LIKE '%SERVICE_ROLE_KEY%' AND length(auth_token) < 50 THEN 'PLACEHOLDER'
       ELSE 'SET' END AS auth_token_status,
  updated_at
FROM public.email_send_config;
```

**Cosa aspettarsi (pre-fix):** base_url con `.functions.supabase.co`; auth_token_status = PLACEHOLDER o EMPTY.

### 2) Ultime 30 net._http_response

```sql
SELECT id, status_code, created, left(content::text, 300) AS content_preview
FROM net._http_response
ORDER BY id DESC
LIMIT 30;
```

**Cosa aspettarsi (pre-fix):** status_code 401 o 503; content_preview con "Missing authorization header", "Invalid JWT" o "BOOT_ERROR".

### 3) Ultime 20 email_sends

```sql
SELECT id, template_id, status, error_code, created_at, recipient_user_id, recipient_email
FROM public.email_sends
ORDER BY created_at DESC
LIMIT 20;
```

**Cosa aspettarsi (pre-fix):** status = queued; error_code tipo pg_net:48029; recipient_email = NULL.

---

## Root cause (401 vs 503)

| Codice | Causa | Dove si rompe |
|--------|--------|----------------|
| **401 Missing authorization header** | auth_token in `email_send_config` è NULL o vuoto → l’header `Authorization: Bearer ` arriva vuoto. Il gateway Supabase richiede un Bearer valido. | Config: auth_token non valorizzato. |
| **401 Invalid JWT** | auth_token è valorizzato ma con una **stringa non JWT** (es. placeholder tipo "IL_TUO_EMAIL_INVOKE_SECRET_..."). Con **Verify JWT = ON** il gateway valida il Bearer come JWT e rifiuta → Invalid JWT. Anche "SET" in auth_token_status non implica "valido": se non è un JWT e Verify JWT è ON, si ottiene 401 Invalid JWT. | Config: token non coerente con Verify JWT (serve JWT se Verify JWT ON). |
| **503 BOOT_ERROR** | La Edge Function non si avvia (crash in bootstrap), ad es. per **env mancanti** (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) usati senza controllo all’avvio. | Edge: mancano variabili d’ambiente o uso di `!` su env non impostati. |

**base_url errato:** Se base_url è `https://vkjrqirvdvjbemsfzxof.functions.supabase.co` la richiesta va all’host sbagliato. L’URL corretta è `https://vkjrqirvdvjbemsfzxof.supabase.co` (path `/functions/v1/<nome>`).

---

## Strategia auth (unica, obbligatoria)

- **Verifica in Dashboard:** Edge Functions → send-marker-prize-email / send-final-shoot-winner-email → opzione **Verify JWT** (ON/OFF).
- **Strategia unica adottata:**  
  **Usare come auth_token la SUPABASE_SERVICE_ROLE_KEY (JWT) e mantenere Verify JWT ON.**  
  Motivazione: il gateway Supabase con Verify JWT ON accetta solo un JWT valido (es. service role key). Le due Edge nel codice accettano già il Bearer se uguale a `EMAIL_INVOKE_SECRET` **oppure** `SUPABASE_SERVICE_ROLE_KEY`. Quindi impostare auth_token = SUPABASE_SERVICE_ROLE_KEY (copia dal Dashboard, mai committata) soddisfa sia il gateway sia il controllo in codice. Una sola strategia, nessuna ambiguità.

---

## Ordine degli step di fix (1 → 4)

1. **Backup e rollback** — Copiare i due file Edge in `_backup_before_email_fix/` e generare `EMAIL_PIPELINE_ROLLBACK.sql` per ripristinare `email_send_config`.
2. **Fix config (priorità massima)** — Eseguire `supabase/patches/EMAIL_PIPELINE_APPLY.sql` dopo aver sostituito `<AUTH_TOKEN>` con la **SUPABASE_SERVICE_ROLE_KEY** (JWT). Imposta base_url corretta e auth_token coerente con Verify JWT ON.
3. **Verifica** — Controllare net._http_response (status_code 200), email_sends (status sent/failed, non più queued), log Edge (nessun BOOT_ERROR).
4. **Se 503 BOOT_ERROR** — Deploy delle Edge con guard su env (già presenti se patch applicate): se SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancano → 500 con messaggio tecnico, senza crash in bootstrap. Opzionale: UPDATE recipient_email in Edge per audit (già previsto se patch applicate).
