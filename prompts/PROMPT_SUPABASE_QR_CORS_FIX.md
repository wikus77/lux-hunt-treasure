// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
# 🛡️ M1SSION™ – FIX BACKEND **IMMEDIATO** (Supabase Edge + CORS + QR)
**Non modificare** logiche Buzz/Pagamenti: le funzioni fanno SOLO validate/redeem.  
**Firma obbligatoria** su ogni file. **Nessun riferimento a Lovable**.

## 1) CORS CORRETTI su validate-qr e redeem-qr
- **Gestire OPTIONS** con `204` e headers:
  - `Access-Control-Allow-Origin: https://m1ssion.com https://www.m1ssion.com https://m1ssion.pages.dev http://localhost:5173`
  - `Access-Control-Allow-Methods: GET,POST,OPTIONS`
  - `Access-Control-Allow-Headers: authorization,apikey,content-type,x-client-info`
  - `Access-Control-Max-Age: 86400`
- In **tutte** le risposte GET/POST aggiungere lo stesso `Access-Control-Allow-Origin`.
- Vietato `mode: no-cors`.

## 2) Funzione `validate-qr`
- Input: query `c` (string).
- Normalizza: `decodeURIComponent`, trim; case sensitivity coerente con la tabella `qr_codes`.
- Fonte: tabella `qr_codes` (o storage esistente); condizioni: esiste, `enabled=true`, `expires_at IS NULL OR now()<expires_at`.
- Output:
  - `200 { valid:true, reward:{buzz:int}, one_time:boolean, tag?:string }`
  - `404 { valid:false }`
- Log chiaro: `console.log({ op:"validate", code, valid, reason })`.

## 3) Funzione `redeem-qr`
- Input JSON: `{ code:string, user_id:uuid }` + header `Authorization: Bearer <user_jwt>`.
- Verifiche:
  - `auth.uid()` deve combaciare con `user_id`, altrimenti `403`.
  - Se `one_time=true` imporre **unique** su `qr_redemptions(code)` → conflitto → `409 { error:"already_redeemed" }`.
- Accredito:
  - Invoca RPC **esistente** `grant_buzz_from_qr(p_user_id, p_amount, p_source, p_code)` → `source="qr"`.
  - `insert` su `qr_redemptions(code,user_id,meta)` con ip da `X-Forwarded-For`.
- Output:
  - `200 { ok:true, reward, tag }` se tutto ok.
  - `404 { error:"invalid_or_expired" }` se non valido.
  - `403/409/5xx` dedicati.

## 4) Schema/RLS (idempotente)
- Assicurare:
  - `create unique index if not exists qr_redemptions_code_key on qr_redemptions(code);`
  - RLS ON; policy che consenta `insert` alla funzione (SECURITY DEFINER) e **non** esponga service role al client.
- Nessuna SELECT pubblica sui dati sensibili.

## 5) Test **obbligatori** (incollare output in chat)
Eseguire e incollare:
Preflight
curl -I -X OPTIONS "$SUPABASE_URL/functions/v1/validate-qr"

Validate presente
curl "$SUPABASE_URL/functions/v1/validate-qr?c=M1-TEST"
-H "apikey: $SUPABASE_ANON_KEY"

Redeem OK
curl "$SUPABASE_URL/functions/v1/redeem-qr" -X POST
-H "authorization: Bearer $USER_JWT" -H "apikey: $SUPABASE_ANON_KEY"
-H "content-type: application/json"
--data '{"code":"M1-TEST","user_id":"<UID>"}'

Redeem doppio → 409
curl "$SUPABASE_URL/functions/v1/redeem-qr" -X POST
-H "authorization: Bearer $USER_JWT" -H "apikey: $SUPABASE_ANON_KEY"
-H "content-type: application/json"
--data '{"code":"M1-TEST","user_id":"<UID>"}' 

- Mostrare headers CORS nelle risposte.
- Incollare snippet di log funzione con `op`, `code`, `uid`, `result`.

## Deliverables
- `supabase/functions/validate-qr/index.ts`
- `supabase/functions/redeem-qr/index.ts`
- Migrazioni: unique index su `qr_redemptions(code)` (se mancante).
- RLS/SECURITY DEFINER corretti.
- Prove (cURL output + log).
// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
