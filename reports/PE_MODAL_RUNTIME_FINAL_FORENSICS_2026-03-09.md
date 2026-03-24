# PE Modal — Verifica runtime forense finale (read-only, nessuna patch)

**Data:** 2026-03-09  
**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Piattaforma:** app nativa iOS (Capacitor WKWebView)  
**Obiettivo:** diagnosi certa sul perché il modale fullscreen PE non appare (solo tracing, nessun fix).

---

## 1. Rollback e safety

| Item | Valore |
|------|--------|
| Branch iniziale | `feat/pe-global-fullscreen-reward` |
| HEAD iniziale | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Branch safety creato | `safety/pe-modal-runtime-forensics-pre` |
| Tag safety creato | `safety/pe-modal-runtime-forensics-pre` |

**Comandi rollback (da eseguire se si vuole annullare tutto):**
```bash
git reset --hard safety/pe-modal-runtime-forensics-pre
# oppure
git checkout safety/pe-modal-runtime-forensics-pre
```

---

## 2. File toccati (solo tracing)

Sono stati modificati **solo** per aggiungere log diagnostici temporanei, chiaramente prefissati:

| File | Modifiche |
|------|-----------|
| `src/features/pulse/peCreditEvent.ts` | Costante `PE_FORENSICS_LOG`, helper `pf()`, log a inizio `emitPECreditEvent`, uscita per no-window/amount<=0, payload prima/dopo `dispatchEvent`. |
| `src/features/pulse/components/GlobalPERewardOverlay.tsx` | Costante `PE_OVERLAY_FORENSICS`, helper `po()`, log RENDER, MOUNT/UNMOUNT, close() (enter/after shift/done), handle (ENTER, e.detail RAW, guard exit, ENQUEUED, ACCEPTED, TIMER STARTED/FIRE), listener REGISTERED/CLEANUP, RENDER BRANCH MODAL, createPortal CALL. |
| `src/features/pulse/hooks/useAwardPE.ts` | Log dopo award RPC success: `[PE-FORENSICS] useAwardPE: awardPE success` (action, delta, willEmit), e prima di `emitPECreditEvent`: `[PE-FORENSICS] useAwardPE: calling emitPECreditEvent`. |

**Nessuna** modifica alla logica (guard, queue, dedupe, timer, UI).  
**Nessuna** patch funzionale applicata.

---

## 3. Build e Cap Sync

| Step | Esito |
|------|--------|
| `npm run build` | ✅ OK (build completata) |
| `npx cap sync ios` | ✅ OK (sync completato) |

---

## 4. Log runtime (da raccogliere su device)

Eseguire l’app su **iPhone** (Xcode / device reale), triggerare almeno:
- un BUZZ che accredita PE;
- (opzionale) un secondo evento PE ravvicinato o un’altra sorgente (onboarding/milestone/practice).

Raccogliere dalla **Console Xcode** (e da eventuale console Web) tutti i log che contengono:
- `[PE-FORENSICS]`
- `[PE-FORENSICS-OVERLAY]`

Incollare qui sotto i log chiave (o allegare screenshot) per compilare la tabella domande/risposte e il verdetto.

```
[ incollare qui i log da Xcode / console Web ]
```

---

## 5. Call graph (da confermare con i log)

Flusso atteso dal codice:

1. **useAwardPE**: `awardPE(action)` → RPC `award_pulse_energy` → success → `delta = awardResult.deltaPE` → se `delta > 0` → `emitPECreditEvent(delta, source, { preValue, postValue })`.
2. **peCreditEvent.ts**: `emitPECreditEvent(amount, source, metadata)` → se `window` e `amount > 0` → costruisce `payload` → `window.dispatchEvent(new CustomEvent('pe-credit-event', { detail: payload }))`.
3. **GlobalPERewardOverlay**: listener `pe-credit-event` → `handle(e)` → `detail = e.detail` → guard `!detail?.amount || detail.amount <= 0` → dedupe same-id → se showing: accoda → altrimenti `setPayload(detail)`, timer → dopo AUTO_CLOSE_MS → `close()`.
4. **Render**: `payload` non null → branch modale fullscreen → `createPortal(modal, document.body)`.

---

## 6. Tabella domanda → risposta

Le risposte **certamente vere** sono basate sul codice; le altre vanno compilate con i log su device.

| # | Domanda | Risposta (da codice / da log device) |
|---|--------|--------------------------------------|
| 1 | `emitPECreditEvent()` viene chiamata davvero quando Joseph genera un evento PE? | **Da verificare su device.** Cercare in console: `[PE-FORENSICS] emitPECreditEvent CALLED`. |
| 2 | Se sì, con quale amount, source, metadata reali? | **Da verificare su device.** Stesso log: `{ amount, typeOfAmount, source, hasMetadata }`. |
| 3 | `window.dispatchEvent(...)` viene eseguito davvero? | **Da verificare su device.** Cercare: `BEFORE dispatchEvent` e `AFTER dispatchEvent`. |
| 4 | `GlobalPERewardOverlay` è montato davvero su device nel momento del test? | **Da verificare su device.** Cercare: `[PE-FORENSICS-OVERLAY] MOUNT` all’avvio app. |
| 5 | Il listener `pe-credit-event` è già attaccato quando l’evento viene emesso? | **Da verificare su device.** Ordine log: `listener REGISTERED` prima di `emitPECreditEvent CALLED` (e prima di `handle ENTER`). |
| 6 | Il listener riceve davvero l’evento? | **Da verificare su device.** Se arriva `handle ENTER` dopo un `emitPECreditEvent AFTER dispatchEvent`, sì. |
| 7 | `e.detail` su iOS contiene davvero il payload completo o arriva corrotto/parziale? | **Da verificare su device.** Log: `handle e.detail RAW` → controllare tipo e presenza di `amount`, `id`, `source`. |
| 8 | `detail.amount` nel listener è valido oppure undefined/0/string/null? | **Da verificare su device.** Stesso log RAW + eventuale `handle EXIT` con `guard: 'amount falsy or <=0'`. |
| 9 | Il listener esce alla prima guard? Se sì, con quale motivo preciso? | **Da verificare su device.** Cercare: `handle EXIT` con `guard: ...` (detail absent / amount falsy or <=0 / same-id dedupe). |
| 10 | `setPayload(detail)` viene chiamato oppure no? | **Da verificare su device.** Se compare `handle ACCEPTED` (senza `handle EXIT` prima), allora sì. |
| 11 | Il branch render del modale viene raggiunto oppure no? | **Da verificare su device.** Cercare: `RENDER BRANCH MODAL` e `createPortal CALL` con `hasPayload: true`. |
| 12 | Il problema è: dispatch / mount listener / shape payload / guard amount / queue-dedupe / render portal / timer-close? | **Da compilare dopo i log.** In base a dove si interrompe la sequenza (emissione → handle → ACCEPTED → RENDER BRANCH → createPortal). |
| 13 | Causa più probabile con evidenza runtime concreta? | **Da compilare dopo i log.** |
| 14 | Causa certa, se emerge dai log? | **Da compilare dopo i log.** |
| 15 | Quale singolo file toccare per primo nel fix successivo? | **Da compilare dopo i log.** Possibili candidati: `peCreditEvent.ts` (serializzazione payload per WKWebView), `GlobalPERewardOverlay.tsx` (guard su amount / forma di `detail`). |

---

## 7. Verdetto finale (secco)

**Da completare dopo aver raccolto i log su device.**

In assenza di log device, le ipotesi più plausibili restano:
- **Listener scarta per guard:** `e.detail` su WKWebView iOS non è l’oggetto originale (es. serializzato/plain object) e `detail.amount` risulta undefined o 0.
- **Timing:** evento emesso prima che il listener sia registrato (ordine mount overlay vs primo evento).
- **Dispatch non effettivo:** `dispatchEvent` non propaga correttamente nel contesto WKWebView (meno probabile se gli altri eventi custom funzionano).

Il tracing inserito permette di discriminare con certezza quale di questi (o altro) sia la causa.

---

## 8. Top 3 fix futuri possibili (ordinati per probabilità/efficacia)

**Da raffinare dopo i log.** Intanto, in base alle ipotesi comuni:

1. **Normalizzare/validare `detail` nel listener (GlobalPERewardOverlay.tsx)**  
   Se i log mostrano `e.detail` con shape diversa (es. amount in altro campo o come stringa): leggere `amount` in modo tollerante (es. `Number(detail?.amount)`), e accettare se `> 0`. Stesso per `id`/`source` se necessario.

2. **Ritardare emissione fino a “overlay pronto” (peCreditEvent.ts o useAwardPE)**  
   Se i log mostrano evento emesso prima di `listener REGISTERED`: emettere dopo un breve delay o dopo un evento “overlay mounted” (es. custom event da overlay al mount).

3. **Assicurare payload come plain object per WKWebView (peCreditEvent.ts)**  
   Se i log mostrano `detail` corrotto/parziale: costruire un payload esplicitamente serializzabile (solo proprietà primitive/plain object) prima di `dispatchEvent`, per evitare problemi di serializzazione in WKWebView.

---

## 9. Conferma vincoli

- **Nessuna patch correttiva** applicata in questa fase.
- **Nessun refactor** e **nessuna modifica fuori scope**.
- **Solo** log diagnostici temporanei (DEBUG FORENSICS), rimovibili impostando `PE_FORENSICS_LOG = false` e `PE_OVERLAY_FORENSICS = false` e rimuovendo i due log in `useAwardPE.ts`.
- **Nessuna regressione** voluta; build e cap sync sono OK.

---

*Report generato in fase di verifica runtime forense; compilare sezioni 4, 6 (dettagli), 7 e 8 con i log raccolti su device.*
