// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ

# CONTEXT (DO NOT REMOVE)
- Backend: Supabase Postgres + Edge Functions.
- Obiettivo: risolvere errori CORS/403 su chiamate a `/functions/v1/redeem-qr` e “QR non valido” pur essendo valido. Garantire validate/redeem rock-solid.
- Non modificare logiche blindate (Buzz, pricing, pagamenti). Le funzioni devono solo VALIDARE e instradare l’accredito attraverso RPC già esistenti.
- Nessun riferimento a “Lovable” nei sorgenti. Codice firmato con: `// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ`.

# ISSUES OSSERVATI (da console)
- `Failed to send a request to the Edge Function` + `CORS policy: No 'Access-Control-Allow-Origin'`.
- 403 su `/functions/v1/redeem-qr`.
- Navigazione /qr?c=<CODE> → “codice non valido” anche se creato dall’admin.

# TASKS
1) **CORS UNIVERSALE per Edge Functions validate-qr e redeem-qr**
   - Gestire `OPTIONS` restituendo `204` con header:
     - `Access-Control-Allow-Origin: https://m1ssion.com https://www.m1ssion.com https://m1ssion.pages.dev` (lista domini app, includere localhost in dev).
     - `Access-Control-Allow-Methods: GET,POST,OPTIONS`
     - `Access-Control-Allow-Headers: authorization,apikey,content-type,x-client-info`
     - `Access-Control-Max-Age: 86400`
   - In tutte le risposte `GET/POST`, riflettere lo stesso `Access-Control-Allow-Origin`.

2) **Funzione `validate-qr`**
   - Input: query `c` (string).
   - Normalizza codice: trim, case-insensitive se previsto, `decodeURIComponent`.
   - Fonte dati: tabella `qr_codes` (o KV gateway interno se già in uso). Verifica: esiste, non scaduto, non disabilitato.
   - Output: `{ valid: true, reward: { buzz:number }, one_time:boolean, tag?:string }` oppure 404 `{ valid:false }`.

3) **Funzione `redeem-qr`**
   - Input JSON: `{ code:string, user_id:uuid }` con header Auth utente (JWT Supabase).
   - Verifica RLS:
     - La funzione deve essere `security definer` e validare token user → `auth.uid()` deve combaciare con `user_id`.
   - One-time redemption:
     - Usa tabella `qr_redemptions` con unique `(code)` per one_time.
     - Se già presente → 409 `{ error:"already_redeemed" }`.
   - Invoca RPC esistente `grant_buzz_from_qr(p_user_id, p_amount, p_source, p_code)` per accreditare (senza modificare logiche Buzz).
   - Insert log su `qr_redemptions` con `meta` (ip opzionale da header `X-Forwarded-For`).
   - Output 200 `{ ok:true, reward, tag }`.

4) **Sicurezza e RLS**
   - `qr_redemptions`: RLS ON, policy che consenta `insert` alla funzione (definer) e lettura solo all’owner (se necessario).
   - Nessuna chiave service role esposta al client.

5) **Affidabilità**
   - Idempotenza: doppio click deve restituire 409 senza effetti collaterali.
   - Log: `console.log` strutturati in funzione (success, codes).
   - Tasso limite (opzionale): 10/min per IP su `redeem-qr`.

6) **Test**
   - cURL:
     - `curl -I -X OPTIONS https://<project>.supabase.co/functions/v1/validate-qr` → deve contenere CORS Allow.
     - `curl "…/validate-qr?c=M1-TEST"` → `200 {valid:true}` per un codice attivo.
     - `curl -H "Authorization: Bearer <user_jwt>" -H "Content-Type: application/json" -d '{"code":"M1-TEST","user_id":"<uid>"}' https://<project>.supabase.co/functions/v1/redeem-qr` → `200 {ok:true}`.
     - Riprova seconda volta → `409 already_redeemed`.

# DELIVERABLES
- `supabase/functions/validate-qr/index.ts`
- `supabase/functions/redeem-qr/index.ts`
- Migrazioni/tabelle: `qr_codes` (se mancante), `qr_redemptions` (unique code).
- Aggiornamento sicurezza RLS/RPC.
- Documentare variabili env richieste dalle funzioni.
- Tutti i file firmati.
// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
