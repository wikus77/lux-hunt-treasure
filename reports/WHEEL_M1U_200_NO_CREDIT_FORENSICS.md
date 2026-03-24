# Wheel +200 M1U visibile ma nessun accredito / nessuna slot animation — Forensics (READ-ONLY)

**Data:** 2026-03-06  
**Scope:** Analisi forense del flusso ruota della fortuna → reward UI → accredito wallet → global slot engine. Nessuna modifica al codice.

---

## 1. Summary esecutivo (max 12 righe)

La ruota mostra il reward in UI usando il **segmento client** indicizzato da `segment_id` restituito dal server; l’accredito M1U e l’animazione slot partono **solo** se il server restituisce `credited_amount > 0`. Il server imposta `credited_amount` solo per segmenti di tipo `m1u` e solo dopo il successo di `admin_credit_m1u`. **Nel codice attuale non esiste alcun segmento “+200 M1U”** (client e server hanno al massimo 50 M1U per segmento; il segmento 6 è “+200 PE”). Se l’utente ha visto “+200 M1U” è probabile confusione con “+200 PE” oppure bug di visualizzazione. In ogni caso: se `credited_amount` è 0 (segmento non M1U o RPC fallita), il client **non** chiama `emitM1UCreditEvent`, quindi nessuna animazione pill e nessun aggiornamento wallet. Root cause più probabile: **reward reale non M1U (es. +200 PE)** oppure **segmento M1U ma `admin_credit_m1u` fallita** → `credited_amount: 0` → nessun evento globale.

---

## 2. Call graph completo: FortuneWheel → reward → wallet → global slot engine

```
[Utente gira ruota]
       ↓
FortuneWheel: handleSpin() → supabase.functions.invoke('spin-wheel', { action: 'spin' })
       ↓
Edge spin-wheel/index.ts
  → seed = user.id|dayKey|wheel_v1 → segmentId = hash(seed) % 16 + 1
  → seg = SEGMENT_MAP[segmentId-1]
  → se seg.type === 'm1u' && seg.value > 0: admin.rpc('admin_credit_m1u', …) → creditedAmount = seg.value se OK, altrimenti 0
  → insert daily_wheel_runs (segment_id, reward_type, credited_amount, …)
  → return { ok, segment_id, reward_type, credited_amount, reward_payload }
       ↓
FortuneWheel (client): data.segment_id → segmentIndex = segmentId - 1 → winningSegment = WHEEL_SEGMENTS[segmentIndex]
       ↓
setResult(winningSegment)  →  UI mostra getResultMessage() = "+{value} {type} sbloccati!" (da result.type / result.value)
       ↓
SE data.credited_amount != null && data.credited_amount > 0:
  → emitM1UCreditEvent(data.credited_amount, 'wheel')
  → toast.success(…)
ALTRIMENTI: nessuna chiamata a emitM1UCreditEvent
       ↓
emitM1UCreditEvent(amount, 'wheel')
  → amount <= 0: return (no-op)
  → window.__m1u_pending_credit__ = payload
  → window.dispatchEvent(M1U_CREDIT_EVENT, detail)
       ↓
GlobalM1UCreditOverlay (listener)
  → detail.amount <= 0 / dedupe / animatingRef: skip
  → dopo OVERLAY_DISPATCH_DELAY_MS: dispatch 'm1u-credited' + 'm1u-balance-changed'
       ↓
M1UPill (sulla pagina, es. Home)
  → listener 'm1u-credited' → animazione PRE→POST; sync con Realtime/wallet
```

**Punto critico:** la catena da `emitM1UCreditEvent` in poi viene eseguita **solo** se `data.credited_amount > 0`. Se il server restituisce `credited_amount: 0`, il client non emette l’evento e quindi non parte né l’animazione né l’aggiornamento visivo del wallet (che dipende da Realtime + eventuale pending).

---

## 3. Dove la UI decide la reward mostrata

- **File:** `src/components/feedback/FortuneWheel.tsx`
- **Flusso:** Dopo la risposta di `spin-wheel`, il client calcola:
  - `segmentId = data.segment_id ?? 1`
  - `segmentIndex = Math.max(0, Math.min(segmentId - 1, WHEEL_SEGMENTS.length - 1))`
  - `winningSegment = WHEEL_SEGMENTS[segmentIndex]`
  - `setResult(winningSegment)` (righe 343–357)
- **Messaggio finale:** `getResultMessage()` (righe 392–402) usa `result.type` e `result.value` (cioè il segmento client):
  - `m1u` → `+${result.value} M1U sbloccati!`
  - `pe` → `+${result.value} PE sbloccati!`
  - ecc.
- **Conclusione:** La reward mostrata in UI è **sempre** quella del segmento client alla posizione `segment_id - 1`. Non esiste in `WHEEL_SEGMENTS` alcun segmento con `type: 'm1u'` e `value: 200`; il valore M1U massimo per segmento è 50. L’unico “+200” è il segmento 6, con **type: 'pe'** (label “+200 PE”).

---

## 4. Dove il backend decide la reward reale

- **File:** `supabase/functions/spin-wheel/index.ts`
- **Logica:** Stesso indice 1..16, mappa `SEGMENT_MAP` (allineata ai segmenti client). Per ogni spin:
  - `segmentId = (simpleHash(seed) % 16) + 1`
  - `seg = SEGMENT_MAP[segmentId - 1]`
  - Se `seg.type === "m1u" && seg.value > 0` → chiamata `admin_credit_m1u`; se **non** c’è errore, `creditedAmount = seg.value`, altrimenti resta 0.
  - Risposta: `reward_type: seg.type`, `credited_amount: creditedAmount`.
- **Conclusione:** Il backend accredita M1U **solo** per segmenti con `type "m1u"` e solo se la RPC riesce. Non esiste alcun segmento server con tipo M1U e valore 200; il segmento 6 è `{ type: "pe", value: 200 }` → `credited_amount` resta 0.

---

## 5. Confronto UI vs reward reale

| segment_id | Client (WHEEL_SEGMENTS)   | Server (SEGMENT_MAP)     | credited_amount server | Evento M1U client |
|------------|---------------------------|---------------------------|-------------------------|--------------------|
| 1          | +50 M1U                   | m1u, 50                  | 50 se RPC OK            | Sì se > 0          |
| 2          | +5 M1U                    | m1u, 5                   | 5 se RPC OK             | Sì se > 0          |
| 3          | +5 PT                     | progress, 5              | 0                       | No                 |
| 4          | +50 PE                    | pe, 50                   | 0                       | No                 |
| 5          | +50 M1U                   | m1u, 50                  | 50 se RPC OK            | Sì se > 0          |
| **6**      | **+200 PE**               | **pe, 200**              | **0**                   | **No**             |
| 7          | +100 PE                   | pe, 100                  | 0                       | No                 |
| 8          | +50 M1U                   | m1u, 50                  | 50 se RPC OK            | Sì se > 0          |
| …          | …                         | …                         | …                       | …                  |
| 16         | +2 M1U                    | m1u, 2                   | 2 se RPC OK             | Sì se > 0          |

- **Segmento UI:** determinato da `segment_id` e da `WHEEL_SEGMENTS[segmentIndex]` (label e tipo mostrati).
- **Reward reale server:** `reward_type` e `credited_amount` dalla Edge; M1U solo per tipo `m1u` e se `admin_credit_m1u` ha successo.
- **Azione wallet:** il client aggiorna il “wallet” visivo solo tramite Realtime (profiles.m1_units) e/o evento `m1u-credited`; l’evento viene emesso **solo** se `data.credited_amount > 0`.
- **Evento globale M1U:** emesso **solo** quando `data.credited_amount != null && data.credited_amount > 0` (righe 378–379 FortuneWheel).

**Risposta alla domanda:** La ruota **non** mostra una reward “fake” in senso di segmento inventato: mostra il segmento client corrispondente a `segment_id`. Però **non esiste un segmento “+200 M1U”** nel codice; l’unico “+200” è **+200 PE** (segmento 6). Se l’utente ha visto “+200 M1U”, o c’è confusione con “+200 PE”, o un bug di visualizzazione/i18n (da verificare altrove). In entrambi i casi, per segmento 6 il server restituisce `credited_amount: 0`, quindi il client non emette l’evento M1U e non parte l’animazione.

---

## 6. Perché i +200 M1U non arrivano al wallet

1. **Nel codice non esiste un segmento “+200 M1U”:** client e server hanno al massimo 50 M1U per segmento; il segmento con valore 200 è **+200 PE** (segmento 6). Quindi il backend **non** accredita mai 200 M1U per la ruota.
2. **Se il segmento uscito è M1U (es. 1, 2, 5, 8, 12, 15, 16)** ma `admin_credit_m1u` **fallisce** (errore RPC, permessi, constraint DB, ecc.), l’Edge lascia `creditedAmount = 0` e restituisce `credited_amount: 0`. Il client allora non chiama `emitM1UCreditEvent` e il wallet non riceve l’aggiornamento da questo flusso (resta solo Realtime, che non vedrebbe incremento perché la RPC non ha scritto).
3. **Se il segmento uscito non è M1U** (es. 6 = PE, 3/9/14 = progress, 10/13 = retry, 11 = clue), il server non chiama nemmeno `admin_credit_m1u` e restituisce sempre `credited_amount: 0` → stesso effetto: nessun evento, nessun accredito visivo M1U.

Quindi: i “+200 M1U” non arrivano al wallet perché (a) non esiste un reward “+200 M1U” nella ruota attuale, e (b) in ogni caso l’accredito e l’evento dipendono da `credited_amount > 0`, che per segmento 6 è sempre 0.

---

## 7. Perché la slot animation non parte

- **Condizione unica:** il client chiama `emitM1UCreditEvent(amount, 'wheel')` **solo** in `if (data.credited_amount != null && data.credited_amount > 0)` (FortuneWheel.tsx 378–379).
- Se `data.credited_amount` è 0 o assente, quella chiamata **non** viene mai fatta → nessun `m1u-credit-event` → `GlobalM1UCreditOverlay` non riceve nulla → non propaga `m1u-credited` / `m1u-balance-changed` → `M1UPill` non avvia l’animazione.
- **Conclusione:** La slot animation non parte perché non viene mai emesso l’evento globale M1U, a sua volta perché il server ha restituito `credited_amount: 0` (segmento non M1U o RPC M1U fallita).

---

## 8. Root cause candidate ordinate per probabilità

| # | Causa | Probabilità | Note |
|---|--------|-------------|------|
| 1 | **Segmento uscito = 6 (+200 PE)** e confusione con “+200 M1U” (o testo mostrato male) | **Alta** | Unico “+200” nel codice è PE; server non accredita M1U; `credited_amount: 0` → nessun evento. |
| 2 | **Segmento uscito = M1U (es. 1, 5, 8) ma `admin_credit_m1u` fallita** | **Media** | Server restituisce `credited_amount: 0`; client mostra comunque il segmento (es. +50 M1U) ma non emette evento. Spiega “vincita M1U” visiva senza accredito. |
| 3 | **Bug di visualizzazione** (es. tipo mostrato come M1U per un segmento PE) | **Bassa** | Da verificare i18n o logica che imposta `result`/testo; in FortuneWheel il messaggio è derivato da `result.type` (winningSegment). |
| 4 | **Mismatch segment_id** (server/client con mappe diverse in deploy) | **Bassa** | Nel repo client e server sono allineati; in produzione andrebbe verificato che la Edge deployata sia la stessa. |

---

## 9. Conclusione finale: cosa sta veramente succedendo

- **Caso “+200 M1U” mostrato in UI:** Nel codice attuale **non** esiste un segmento con 200 M1U. L’unico “+200” è il segmento 6 (**+200 PE**). Quindi o l’utente ha visto “+200 PE” e l’ha ricordato come M1U, o c’è un problema di testo/UI da indagare (es. i18n o altro componente).
- **Caso “nessun accredito e nessuna animazione”:** È il comportamento **atteso** quando il server restituisce `credited_amount: 0`, cioè quando:
  - il segmento non è M1U (es. PE, progress, retry, clue), oppure  
  - il segmento è M1U ma `admin_credit_m1u` fallisce.  
  In entrambi i casi il client non chiama `emitM1UCreditEvent`, quindi nessuna animazione pill e nessun aggiornamento wallet da questo flusso.

In sintesi: **non c’è “reward UI fake” in senso di segmento inventato**, ma può esserci **disallineamento tra ciò che l’utente crede di aver visto (es. +200 M1U) e ciò che il codice prevede (+200 PE)**. Il “mancato accredito” e la “mancata animazione” sono conseguenza diretta di `credited_amount === 0` e della guard `credited_amount > 0` nel client.

---

## 10. Whitelist file da toccare in eventuale FASE 2 fix

- `src/components/feedback/FortuneWheel.tsx` — unico punto in cui si decide se chiamare `emitM1UCreditEvent` in base a `data.credited_amount`; eventuale log aggiuntivo o gestione esplicita di `reward_type === 'm1u'` con `credited_amount === 0` (solo se si vuole migliorare UX/log senza toccare IAP/auth).
- `supabase/functions/spin-wheel/index.ts` — logica `credited_amount`, chiamata `admin_credit_m1u`, gestione errore RPC; eventuale logging dell’errore e/o ritorno di un campo `credit_error` per il client (solo lettura/audit, nessun cambio comportamento IAP).
- (Opzionale) i18n / stringhe della ruota — se si vuole evitare confusione tra PE e M1U (testi, tooltip, messaggi).

Nessun altro file del flusso M1U globale (m1uCreditEvent, GlobalM1UCreditOverlay, M1UPill) richiede modifiche per questo bug; il blocco è a monte (server non restituisce `credited_amount > 0` oppure segmento non M1U).

---

## 11. Blacklist assoluta (no touch)

- IAP / StoreKit / receipt / purchase flow  
- Login / logout  
- Delete-account  
- BUZZ / BUZZ MAP  
- Push native  
- Subscriptions  
- Qualsiasi logica già funzionante fuori dal flusso wheel → credit → overlay  

---

## 12. Next step consigliato (solo descrizione, nessun fix qui)

1. **Verifica in produzione:** Confermare quale `segment_id` e `reward_type` / `credited_amount` restituisce l’Edge `spin-wheel` per l’utente (log Edge o risposta in network). Se `segment_id === 6` → reward reale è +200 PE; messaggio client dovrebbe essere “+200 PE sbloccati!”. Se l’utente vede davvero “+200 M1U”, cercare in frontend/i18n dove potrebbe essere mostrato “M1U” al posto di “PE”.
2. **Se il segmento è M1U ma accredito mancante:** Controllare i log dell’Edge per eventuale errore di `admin_credit_m1u` (RPC, permessi, constraint). Eventualmente restituire al client un flag `credit_ok: boolean` o `credit_error` (solo per diagnostica) senza cambiare il contratto di risposta per IAP/auth.
3. **Allineamento UX:** Se si vuole evitare confusione, rendere molto espliciti in UI i tipi (es. “+200 PE” vs “+50 M1U”) e, se utile, mostrare un messaggio diverso quando `reward_type === 'm1u'` ma `credited_amount === 0` (es. “Problema temporaneo accredito; contatta supporto”) senza toccare la blacklist.

---

**Fine report. Nessuna modifica al codice eseguita.**
