# PE Modal — Causa certa / verifica finale (tracing runtime + eventuale fix)

**Data:** 2026-03-09  
**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Ambiente:** app nativa iOS (Capacitor WKWebView)  
**Obiettivo:** diagnosi certa sul perché il modale fullscreen PE non appare; fix solo se evidenza inequivocabile.

---

## 1. Branch iniziale / HEAD iniziale / safety

| Item | Valore |
|------|--------|
| Branch iniziale | `feat/pe-global-fullscreen-reward` |
| HEAD iniziale | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Safety branch | `safety/pe-modal-certainty-pre` |
| Safety tag | `safety/pe-modal-certainty-pre` |

**Comandi rollback (esatti):**
```bash
git reset --hard safety/pe-modal-certainty-pre
git checkout safety/pe-modal-certainty-pre
```

---

## 2. File toccati

Solo per **tracing runtime** e **error trap** (nessuna modifica di logica business):

| File | Modifiche |
|------|-----------|
| `src/features/pulse/peCreditEvent.ts` | Sostituiti log `[PE-FORENSICS]` con `[PE-TRACE-EMIT]` **sempre attivi**. Log: CALLED (rawAmount, numAmount, typeof amount, source, metadata), EXIT no-window, EXIT amount<=0, BEFORE/AFTER dispatchEvent con payload. |
| `src/features/pulse/hooks/useAwardPE.ts` | Log `[PE-TRACE-AWARD]` **sempre attivi** (rimosso `import.meta.env?.DEV`): ENTRY (action), RPC success (action, delta, limitReached, willEmit), calling emitPECreditEvent (delta, source). |
| `src/features/pulse/components/GlobalPERewardOverlay.tsx` | Sostituiti log con `[PE-TRACE-OVERLAY]`, `[PE-TRACE-RENDER]`, `[PE-TRACE-CLOSE]` sempre attivi. Log: MOUNT/UNMOUNT, RENDER (hasPayload, showingRef, queueLen), handle ENTER + DUMP completo (e.type, e.detail, typeof detail, detail.amount, typeof detail.amount, detail.id, detail.source), guard exit (detail assente / amount falsy / same-id dedupe), ENQUEUED, ACCEPTED setPayload, timer STARTED/FIRED, close ENTER/AFTER shift/DONE, listener REGISTERED/CLEANUP, RENDER BRANCH MODAL, createPortal CALL. |
| `src/App.tsx` | Aggiunto **error trap** temporaneo: `window.onerror` e `unhandledrejection` che loggano con `[PE-TRACE-JS-ERROR]` (message, source, lineno, colno, stack; reason per rejection). Cleanup on unmount. |

**Nota critica (Fase 1):** I vecchi marker `[PE-FORENSICS]` e `[PE-FORENSICS-OVERLAY]` in useAwardPE erano condizionati da `import.meta.env?.DEV !== false`. In **build di produzione** (e quindi su app iOS da Xcode) `DEV` è `false`, quindi quei log **non venivano mai eseguiti**. Per questo nei log Xcode non comparivano. I nuovi marker `[PE-TRACE-*]` sono **unconditional** e appariranno in console anche in release.

---

## 3. Fase 1 — Audit read-only (risultati)

- **GlobalPERewardOverlay** è montato in `App.tsx` (linea ~266, dentro `AuthProvider`).
- **Listener** è `pe-credit-event` (costante `PE_CREDIT_EVENT`).
- **useAwardPE** chiama `emitPECreditEvent(delta, source, { preValue, postValue })` dopo RPC success quando `delta > 0`.
- **Prima guard** nel listener: `if (!detail?.amount || detail.amount <= 0) return;`
- **Marker precedenti:** presenti nel codice ma in useAwardPE dietro `DEV` → **non visibili su device in build prod**. Ora sostituiti con PE-TRACE-* sempre attivi.

---

## 4. Log runtime (da raccogliere su device)

Dopo build e `npx cap sync ios`:

1. Aprire l’app su **iPhone** con Xcode collegato (Run da Xcode).
2. In Console Xcode filtrare per: **PE-TRACE**
3. Generare almeno:
   - **1 BUZZ** che accredita PE (tasto BUZZ dalla Home/Command Center).
   - **1 secondo evento PE** ravvicinato (es. altro BUZZ o altra azione che dà PE).
4. Copiare **l’ordine reale** dei log e incollarlo sotto.

```
[ incollare qui i log filtrati PE-TRACE da Xcode ]
```

Se compare **`[PE-TRACE-JS-ERROR]`**, copiare anche quel blocco (message, stack, reason).

---

## 5. Tabella step → atteso / osservato / esito

Da compilare dopo il test su device (sostituire "…" con sì/no o breve nota).

| Step | Atteso | Osservato | Esito |
|------|--------|-----------|--------|
| useAwardPE success (RPC) | [PE-TRACE-AWARD] RPC success | … | … |
| emitPECreditEvent CALLED | [PE-TRACE-EMIT] CALLED | … | … |
| dispatch BEFORE/AFTER | [PE-TRACE-EMIT] BEFORE/AFTER dispatchEvent | … | … |
| overlay MOUNT | [PE-TRACE-OVERLAY] MOUNT | … | … |
| listener REGISTERED | [PE-TRACE-OVERLAY] listener REGISTERED | … | … |
| handle ENTER | [PE-TRACE-OVERLAY] handle ENTER | … | … |
| detail RAW valido | handle DUMP con amount/id/source | … | … |
| handle ACCEPTED | [PE-TRACE-OVERLAY] handle ACCEPTED setPayload | … | … |
| RENDER BRANCH MODAL | [PE-TRACE-RENDER] RENDER BRANCH MODAL | … | … |
| createPortal CALL | [PE-TRACE-RENDER] createPortal CALL hasPayload: true | … | … |
| close TIMER FIRED | [PE-TRACE-OVERLAY] timer FIRED | … | … |

---

## 6. Diagnosi (casi A–H) — da compilare con i log

Discriminare **uno** di questi:

- **A.** emitPECreditEvent non viene mai chiamata → cercare [PE-TRACE-AWARD] RPC success + calling emitPECreditEvent; se manca, problema a monte (RPC o delta).
- **B.** emitPECreditEvent viene chiamata ma non dispatcha → [PE-TRACE-EMIT] CALLED sì, BEFORE sì, AFTER no.
- **C.** Dispatch avviene ma listener non ancora registrato → AFTER prima di listener REGISTERED; allora evento perso (timing).
- **D.** Listener riceve ma e.detail corrotto / amount non valido → handle DUMP con amount undefined o tipo string/0.
- **E.** Listener accetta ma render branch non parte → ACCEPTED sì, RENDER BRANCH MODAL no (setPayload non causa re-render o payload perso).
- **F.** Render branch parte ma portal/CSS/z-index nascondono → createPortal CALL sì, modale non visibile.
- **G.** Modale appare e si chiude subito → timer FIRED troppo presto o close() chiamato subito.
- **H.** Errore JS interrompe il flusso → [PE-TRACE-JS-ERROR] con stack; identificare file/riga.

**Causa certa (da compilare dopo i log):**  
…

**Singolo file da correggere per primo:**  
…

---

## 7. Domande finali (risposte da compilare con i log)

| # | Domanda | Risposta |
|---|--------|----------|
| 1 | emitPECreditEvent() viene chiamata davvero? | … |
| 2 | dispatchEvent parte davvero? | … |
| 3 | Overlay è montato davvero? | … |
| 4 | Listener è registrato prima del dispatch? | … |
| 5 | Listener riceve l’evento? | … |
| 6 | e.detail arriva integro? | … |
| 7 | amount arriva come numero valido? | … |
| 8 | Il listener esce a una guard? Quale? | … |
| 9 | setPayload viene chiamato? | … |
| 10 | Il render branch del modale parte? | … |
| 11 | Il portal viene creato? | … |
| 12 | La causa certa qual è? | … |
| 13 | Qual è il singolo file da correggere? | … |
| 14 | Il fix è stato applicato oppure no? | No (solo tracing in questa fase). |
| 15 | Il problema è risolto sì/no, con quale evidenza? | Da compilare dopo eventuale fix. |

---

## 8. Fix applicato (Fase 6)

In questa fase **non è stata applicata nessuna patch correttiva**. Solo:

- Tracing con `[PE-TRACE-EMIT]`, `[PE-TRACE-AWARD]`, `[PE-TRACE-OVERLAY]`, `[PE-TRACE-RENDER]`, `[PE-TRACE-CLOSE]` sempre attivi (anche in build prod).
- Error trap `[PE-TRACE-JS-ERROR]` in App.tsx.

**Se dai log emerge una causa certa**, esempi di fix ammessi (da applicare in un secondo momento):

- **Detail/amount su iOS:** in `GlobalPERewardOverlay.tsx` usare `const amount = Number(detail?.amount)` e accettare se `amount > 0`.
- **Timing listener:** ritardo minimo prima di emit o “overlay ready” event prima del primo emit.
- **Portal/render:** verificare document.body e z-index se createPortal viene chiamato ma la UI non si vede.

---

## 9. Build e Cap Sync

| Step | Esito |
|------|--------|
| `npm run build` | ✅ OK |
| `npx cap sync ios` | ✅ Avviato; copy web assets e update plugins completati. Se `pod install` è ancora in corso, attendere o rieseguire `npx cap sync ios`. |

---

## 10. Istruzioni di test su device reale (Fase 5)

1. Aprire Xcode, selezionare target iOS e **device reale** (iPhone).
2. Run (⌘R); attendere avvio app.
3. In **Console Xcode** (View → Debug Area → Activate Console), nella barra di filtro digitare: **PE-TRACE**
4. In app: effettuare **login** se necessario, andare dove è disponibile il **tasto BUZZ** (es. Home / Command Center).
5. Toccare **BUZZ** almeno una volta (deve essere un’azione che accredita PE).
6. (Opzionale) Generare un secondo evento PE (altro BUZZ o altra azione) a breve distanza.
7. In Console: **selezionare e copiare** tutti i log che contengono `PE-TRACE` (e eventualmente `PE-TRACE-JS-ERROR`).
8. Incollare i log nella **Sezione 4** di questo report e compilare **Sezione 5** (tabella) e **Sezione 6** (causa certa + file da correggere).

---

## 11. Criterio di successo

- **A.** Causa certa + fix minimo applicato + build OK + cap sync OK → task riuscita.
- **B.** Causa certa senza fix, con log che indicano il punto esatto di rottura → task riuscita (fix in seguito).

Non considerare conclusa con “forse” / “probabilmente” / patch non supportate da log.

---

*Report generato dopo Fase 0–4. Compilare sezioni 4, 5, 6 e 7 con i log raccolti su iPhone.*
