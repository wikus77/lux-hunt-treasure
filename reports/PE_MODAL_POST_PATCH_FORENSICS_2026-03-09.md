# PE MODAL POST-PATCH FORENSICS — MODALE NON APPARE PIÙ

**Data:** 2026-03-09  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Modalità:** Solo lettura. Nessuna modifica, nessun commit, nessun build.  
**Problema:** Dopo la patch queue/dedupe, il modale PE fullscreen non appare più da nessuna parte.

---

## 1. Executive Summary

L’analisi del codice attuale di **GlobalPERewardOverlay.tsx**, **peCreditEvent.ts**, **useAwardPE.ts**, mount in **App.tsx** e tutti i callsite di **emitPECreditEvent** non mostra un bug logico **evidente** che spieghi da solo “modale sparito ovunque”. La logica della coda e del dedupe è coerente: primo evento con `amount > 0` non viene bloccato dal dedupe (id univoco, lastIdRef iniziale null), `showingRef` viene settato a true e `setPayload(detail)` viene chiamato, quindi il modale dovrebbe renderizzare.  
**Cause certe da codice:** nessuna che spieghi da sola il sintomo.  
**Cause molto probabili:** (1) **Evento scartato alla prima guard** nel listener: su iOS WKWebView il `detail` del CustomEvent potrebbe essere serializzato/clonato in modo tale che `detail?.amount` sia `undefined` o `0`, quindi `if (!detail?.amount || detail.amount <= 0) return` fa uscire sempre. (2) **Listener non attaccato** al momento del dispatch (race di mount/effect).  
**Ipotesi non dimostrabili senza log:** ordine di mount, timing del primo evento, stato reale di `detail` su device.  
**Raccomandazione:** primo file da toccare per un fix è **GlobalPERewardOverlay.tsx** (es. log temporanei su `detail` nel listener, o fallback meno aggressivo sulla guard `amount`, o ripristino parziale della logica pre-patch con coda opzionale).

---

## 2. Stato mount overlay

- **Dove è montato:** `src/App.tsx` righe 265–266, dentro `AuthProvider`, subito dopo `GlobalM1UCreditOverlay`:
  ```tsx
  <GlobalM1UCreditOverlay />
  <GlobalPERewardOverlay />
  ```
- **Condizioni:** Nessuna condizione che nasconda l’overlay: non è dentro `{condition && <GlobalPERewardOverlay />}`. È sempre renderizzato quando il ramo `AuthProvider` è montato.
- **createPortal:** Il componente restituisce `createPortal(modal, document.body)` (riga 163); prima c’è `if (typeof document === 'undefined') return null` (riga 162). Su iOS Capacitor `document` esiste, quindi il portal viene creato.
- **Conclusione:** **L’overlay è montato** in App in modo incondizionato (salvo SSR). Nessuna prova da codice che il mount sia impedito.

---

## 3. Stato listener evento

- **Registrazione:** In `useEffect(() => { ... window.addEventListener(PE_CREDIT_EVENT, handle); return () => { window.removeEventListener(...); ... }; }, []);` (righe 47–72). Effetto con dipendenze `[]` → eseguito una volta dopo il primo render, cleanup alla unmount.
- **Nome evento:** `PE_CREDIT_EVENT = 'pe-credit-event'` (peCreditEvent.ts). Coerente con `emitPECreditEvent` che fa `window.dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail: payload }))`.
- **Cleanup:** Rimozione listener e clear del timeout. Corretto.
- **Conclusione:** **Il listener è attaccato** in modo corretto. L’unico rischio è una **race**: se il primo evento PE viene dispatchato **prima** che l’effect abbia eseguito (es. subito al boot), l’evento viene perso. Non spiega da solo “non appare mai” a meno che tutti i test avvengano in quella finestra.

---

## 4. Call graph completo evento PE

1. **Emitter** (es. useAwardPE dopo RPC success): `emitPECreditEvent(delta, source, { preValue, postValue })`.
2. **peCreditEvent.ts:** `if (amount <= 0) return;` → altrimenti crea `payload` con `id: \`pe-credit-${Date.now()}-${random}\``, `amount`, `source`, ecc., e `window.dispatchEvent(new CustomEvent('pe-credit-event', { detail: payload }))`.
3. **Listener** in GlobalPERewardOverlay:
   - `detail = (e as CustomEvent).detail`
   - **Punto di rottura 1:** `if (!detail?.amount || detail.amount <= 0) return` → se `detail` è undefined o `detail.amount` è assente/0, l’evento viene scartato.
   - **Punto di rottura 2:** `if (lastIdRef.current === detail.id && now - lastIdTimeRef.current < SAME_ID_DEDUPE_MS) return` → per il primo evento `lastIdRef.current` è `null`, quindi il confronto è falso; per eventi successivi con **id diverso** non si esce. Solo stesso id entro 300 ms viene scartato.
   - **Punto di rottura 3:** `if (showingRef.current)` → se true, si accoda e si ritorna; non si mostra nulla di nuovo finché non viene chiamato `close()`.
   - Altrimenti: `lastIdRef.current = detail.id`, `lastIdTimeRef.current = now`, `showingRef.current = true`, `setPayload(detail)`, `setTimeout(close, 3500)`.
4. **Render:** `payload` stato → `{payload && (...)}` in AnimatePresence → modale visibile finché `payload` non è null.
5. **close():** `setPayload(null)`, clear timer, `next = queueRef.current.shift()`; se `next` → `setPayload(next)`, nuovo setTimeout(close); altrimenti `showingRef.current = false`.

**Dove può rompersi (in teoria):** (1) `detail` o `detail.amount` non validi → scarto alla prima guard. (2) Listener non ancora attaccato → evento perso. (3) `showingRef` bloccato a true senza mai chiamata a `close()` → tutti gli eventi solo in coda e nessun modale visibile se `payload` fosse sempre null (ma l’unico modo sarebbe non chiamare mai `setPayload` nel handler, che contraddice la logica del primo evento).

---

## 5. Analisi queue

- **Enqueue:** Solo quando `showingRef.current === true` (righe 52–56). Si fa `queueRef.current = [...queueRef.current, detail]`.
- **Drain:** Solo in `close()` (righe 28–45): `setPayload(null)`, poi `next = queueRef.current.shift()`. Se c’è `next`, si fa `setPayload(next)` e si riavvia il timer che richiama `close()`.
- **Deadlock teorico:** Per avere “modale mai mostrato” con la coda bisognerebbe: (a) non mostrare mai il primo evento (es. scartato dalla prima guard), e (b) tutti gli eventi successivi vedere `showingRef.current === true`. Ma `showingRef` diventa true **solo** quando mostriamo il primo evento (riga 59). Quindi se il primo evento viene scartato, `showingRef` resta false e il secondo evento non verrebbe accodato ma mostrato. L’unica eccezione è se il **primo** evento passa le guard e imposta `showingRef = true` e `setPayload(detail)`, ma per qualche motivo **payload non viene mai renderizzato** (es. bug React/portal). In quel caso sì: `showingRef` resta true, tutti gli altri eventi vanno in coda, e `close()` non viene mai chiamato (né da timer né da tap) se il modale non è visibile. Ma `close()` viene chiamato dal timer dopo 3,5 s, indipendentemente dalla visibilità del modale. Quindi dopo 3,5 s `close()` scatterebbe, farebbe `setPayload(null)`, drenerebbe la coda e mostrerebbe il prossimo. Quindi un deadlock “coda piena e modale mai mostrato” richiederebbe che **il timer non scatti mai** (es. cleanup effect che cancella il timeout prima dei 3,5 s, e poi nessun altro evento che faccia ripartire il ciclo). Non c’è un bug ovvio nella logica della coda che spieghi “non appare mai”.

---

## 6. Analisi dedupe

- **Condizione:** `if (lastIdRef.current === detail.id && now - lastIdTimeRef.current < SAME_ID_DEDUPE_MS) return` (riga 51). `SAME_ID_DEDUPE_MS = 300`.
- **Primo evento:** `lastIdRef.current` è `null`. `detail.id` è una stringa (es. `"pe-credit-1234567890-abc12"`). `null === "pe-credit-..."` è false → non si esce.
- **Id univoci:** In `peCreditEvent.ts` l’id è `pe-credit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`. Ogni chiamata a `emitPECreditEvent` produce un id diverso.
- **Aggiornamento lastIdTimeRef:** Settato quando si **accetta** un evento (righe 57–58). Non viene aggiornato quando si mostra un elemento dalla coda in `close()` (lì si aggiorna solo `lastIdRef.current = next.id`). Questo non fa sì che tutti gli eventi vengano scartati: il dedupe scarta solo **stesso id** entro 300 ms.
- **Conclusione:** Il dedupe **non** può spiegare da solo lo scarto del primo evento né di tutti gli eventi con id diversi. **Unica causa da codice in cui il dedupe blocca tutto:** se per qualche motivo **tutti** gli eventi avessero lo **stesso** `detail.id` (es. `undefined` o valore costante). In tal caso il secondo e successivi entro 300 ms sarebbero scartati; il primo passerebbe (perché `lastIdRef.current` è null la prima volta). Se `detail.id` fosse sempre `undefined`, allora `lastIdRef.current === undefined` dopo il primo evento (dove abbiamo fatto `lastIdRef.current = detail.id` cioè `undefined`), e tutti i successivi con `detail.id === undefined` entro 300 ms sarebbero scartati. Ma `emitPECreditEvent` assegna sempre un id stringa; non è dimostrabile da codice che su iOS il `detail` arrivi con `id` assente senza log runtime.

---

## 7. Tabella emitter aggiornata

| File | Funzione / contesto | Emette emitPECreditEvent | Import | Condizione |
|------|---------------------|--------------------------|--------|------------|
| useAwardPE.ts | awardPE (dopo RPC success) | Sì | Statico | `delta > 0` |
| OnboardingOverlay.tsx | awardPE (fallback / path senza errore) | Sì | Dynamic import | 50 PE |
| BattleDefenseModal.tsx | handleDefenseResult (difensore vince) | Sì | Dynamic import | `defenderWins && peAmount > 0` |
| useClueMilestones.ts | claim milestone | Sì | Dynamic import | `milestone.pe > 0` |
| PracticeMode.tsx | dopo updateBalanceAsync (win PE) | Sì | Dynamic import | `stake.currency === 'PE' && payout > 0` |
| useBombMissionRun.ts | dopo finalize RPC | Sì | Dynamic import | `res.delta_pe` |
| Daily Mission | — | No | — | Nessun PE client |
| Fortune Wheel | — | No (per PE) | — | Client non emette per PE |

I flussi BUZZ, BUZZ MAP, Streak, Map time, Pulse Breaker, AION, Forum, Battle (attaccante) passano tutti da **useAwardPE** → `emitPECreditEvent` con import statico quando `delta > 0`. Nessuna modifica a questi file nella patch queue/dedupe. Quindi **gli emitter continuano a chiamare emitPECreditEvent**; il problema, se è lato overlay, è nel ricevere o nel processare l’evento.

---

## 8. Confronto pre-patch vs post-patch

**Pre-patch (comportamento dal report):**
- Un solo modale alla volta.
- Dedupe: stesso `id` **oppure** evento entro **2500 ms** dall’ultimo → scartato.
- Se modale aperto o in animazione (`animatingRef.current`): evento scartato (nessuna coda).
- Primo evento con amount > 0 e fuori dalla finestra 2500 ms: mostrato.

**Post-patch:**
- Coda: se `showingRef.current` è true, evento accodato; altrimenti mostrato subito.
- Dedupe: solo stesso `detail.id` **e** entro **300 ms** → scartato.
- `showingRef` sostituisce `animatingRef`; `close()` drena la coda e mostra il prossimo.

**Breakpoint logico più probabile introdotto dalla patch:**  
Non è un errore di “scarto sempre” del dedupe (il primo evento non viene scartato dalla nuova condizione). È plausibile invece che:
- La **prima guard** `if (!detail?.amount || detail.amount <= 0) return` scarti l’evento se su iOS il `detail` del CustomEvent arriva in forma diversa (es. serializzato, `amount` assente o 0). Questo sarebbe **ambiente-specifico**, non un cambiamento di logica della patch, ma la patch non ha toccato quella guard.
- Oppure un problema di **timing**: listener attaccato dopo il primo (e unico) evento che Joseph genera nel test, quindi evento perso; senza coda non c’è “seconda chance”. Con la coda, se il primo evento fosse perso, anche i successivi andrebbero in coda solo se `showingRef` fosse true, che non lo è se non abbiamo mai mostrato nulla. Quindi il comportamento “primo evento perso, tutti gli altri mostrati” sarebbe possibile; “tutti persi” richiederebbe o tutti scartati dalla prima guard, o listener non attaccato per tutti i test.

**Conclusione confronto:** La patch **non** introduce una condizione che scarta esplicitamente il primo evento valido. Introduce coda e dedupe per id+300ms. Il sospetto più forte è **ricezione del payload** (detail/amount) o **ordine di esecuzione** (listener vs primo dispatch), non la logica interna della coda/dedupe.

---

## 9. Cause certe (da codice)

- **GlobalPERewardOverlay** è montato in App senza condizioni che lo nascondano.
- Il listener **pe-credit-event** è registrato in un `useEffect([])` e rimosso in cleanup.
- **emitPECreditEvent** fa `window.dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail: payload }))` con `payload` contenente `amount`, `id`, `source`; non viene emesso nulla se `amount <= 0`.
- useAwardPE (e quindi BUZZ) chiama ancora **emitPECreditEvent** quando `delta > 0` dopo RPC riuscito.
- Il dedupe post-patch **non** può scartare il primo evento (lastIdRef null, id univoco).
- La coda non introduce un deadlock ovvio: il timer chiama `close()` dopo 3,5 s e drena la coda.

**Nessuna causa certa da solo codice** spiega “modale non appare mai”. Le cause sotto sono **probabili** o **ipotesi**.

---

## 10. Cause probabili

1. **Detail/amount non validi nel listener (es. iOS WKWebView):** Se il CustomEvent su iOS viene gestito con clonazione/serializzazione del `detail` e si perde o si azzera `amount`, la guard `if (!detail?.amount || detail.amount <= 0) return` scarta ogni evento. Spiegherebbe “non appare da nessuna parte” senza cambiare la logica della patch. **Non dimostrabile** senza log di `e.detail` su device.
2. **Race listener vs primo evento:** Se il primo (e unico) evento PE viene dispatchato prima che l’effect dell’overlay abbia eseguito `addEventListener`, l’evento viene perso. Su cold start o navigazione rapida è possibile. Con un solo evento per test, il modale non apparirebbe mai. **Non dimostrabile** senza timeline di mount e dispatch.
3. **showingRef bloccato true senza payload visibile:** Scenario teorico: primo evento passa, si imposta `showingRef = true` e `setPayload(detail)`, ma per un bug di rendering (portal/React) il modale non appare; il timer dopo 3,5 s chiama `close()`, che imposta `payload = null` e drena la coda. Se la coda è vuota, `showingRef` torna false. Quindi non si resta bloccati per sempre. Per “non appare mai” bisognerebbe che **nessun** evento passi la prima guard, non che la coda si blocchi.

---

## 11. Ipotesi runtime (non dimostrabili senza log)

- Su iOS, `CustomEvent` con `detail` non standard o clonato in modo che `detail.amount` non sia disponibile o sia 0.
- Overlay montato dopo che l’unica azione PE del test (es. un BUZZ) ha già emesso l’evento.
- Errore JavaScript prima del listener che impedisce l’esecuzione dell’handler.
- Build/bundle che esclude o altera il modulo dell’overlay (improbabile se la build è OK e il file è unico modificato).

---

## 12. Verdetto finale secco

- **L’overlay è montato e il listener è attaccato** secondo il codice.
- **Gli emitter (incluso BUZZ via useAwardPE) chiamano ancora emitPECreditEvent** con `amount > 0`.
- **La patch queue/dedupe non introduce una condizione che scarta esplicitamente il primo evento valido** (dedupe per id+300ms non blocca il primo evento).
- **Il punto più sospetto è la prima guard del listener** (`!detail?.amount || detail.amount <= 0`): se su device `detail` o `detail.amount` non sono quelli attesi, **tutti** gli eventi vengono scartati. Secondo sospetto: **ordine di esecuzione** (listener non ancora attaccato al primo dispatch).
- **È plausibile una regressione percepita “dopo la patch”** anche se la causa è **esterna** alla logica coda/dedupe (es. comportamento di CustomEvent/detail su iOS o timing di mount). Per confermare una regressione **dovuta alla patch** servirebbero log su device (detail ricevuto, showingRef, payload, chiamate a close).

---

## 13. Top 5 file da toccare DOPO (se si farà il fix)

1. **src/features/pulse/components/GlobalPERewardOverlay.tsx** — Aggiungere log temporanei su `detail` nel listener; eventuale fallback sulla guard amount (es. trattare `detail.amount` undefined come “non mostrare” ma non come unico criterio); oppure ripristino parziale pre-patch (no coda, dedupe solo per id) e test su device.
2. **src/features/pulse/peCreditEvent.ts** — Verificare che il payload sia sempre serializzabile e che `amount` sia esplicitamente numerico (già così; eventuale doppio check per ambienti iOS).
3. **src/features/pulse/hooks/useAwardPE.ts** — Nessuna modifica necessaria per il “non appare”; solo se si volesse loggare prima del dispatch.
4. **App.tsx** — Solo per confermare ordine di mount (GlobalPERewardOverlay subito dopo M1U overlay); nessun cambiamento di logica richiesto.
5. Eventuali **emitter con dynamic import** (OnboardingOverlay, BattleDefenseModal, useClueMilestones, PracticeMode, useBombMissionRun) — Solo in una seconda fase se si volesse garantire emit sincrono o log prima di emit.

---

## 14. Blacklist file da non toccare

- Auth / Home auth unification
- Login, logout, delete account
- IAP, StoreKit, subscription, receipts
- BUZZ (logica handleBuzz, prezzo, clue)
- BUZZ MAP (logica azione mappa)
- Push native, notifiche
- Routing, navigazione
- Supabase schema, migrations, RLS
- M1U engine (salvo stretta necessità per PE modal)

---

*Report forense read-only. Nessuna modifica al codice. Nessun commit, build o cap sync.*
