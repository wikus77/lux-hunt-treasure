# Report — Pulse Breaker result flow + premium outcome modals

**Data:** 2026-04-04  
**Piattaforma:** Capacitor / WKWebView (web build condiviso)

---

## A. Executive summary

Il problema era **ordine e stacking UX**: al termine della run il gioco restava in stato `crashed` / `cashed_out` con i **banner legacy** e il pulsante «GIOCA ANCORA» sotto il fullscreen PE. Chiudendo il PE, l’utente **rivedeva il contenitore del gioco** prima di poter chiudere o rileggere l’esito.

**Intervento:** pipeline **sequenziale** `PULSE_BREAKER_PLAY` → (attesa `PE_REWARD_OVERLAY_SETTLED`) → `PULSE_BREAKER_WIN` se cashout → (seconda attesa se serve) → **layer bridge** durante i reward → **modale outcome fullscreen** (stile allineato al PE) → CTA **Continua** che esegue `resetGame` + `onClose`. I banner `pb-result-controls` sono **rimossi** dal flusso.

---

## B. Root cause del flow sbagliato

1. `awardPE` veniva chiamato **due volte in parallelo** nello stesso `useEffect` (PLAY + WIN), generando **due overlay PE in coda** senza coordinamento lato Pulse Breaker.
2. Il **modale gioco** (`SettingsFlipOverlay` / `pb-container`) restava **aperto e visibile** sotto/al di sotto del PE; al dismiss del PE l’utente tornava sulla **stessa vista terminale** con UI «verde/rosso» integrata nei controlli (`pb-result-controls`).
3. Non esisteva uno **stato di handoff** (`postRunPhase`) tra «run finita», «reward» e «esito finale premium».

---

## C. File modificati / creati

| File | Ruolo |
|------|--------|
| `src/features/pulse-breaker/components/PulseBreaker.tsx` | Pipeline PE sequenziale, `postRunPhase`, bridge layer, rimozione `pb-result-controls`, `handleClose` unificato |
| `src/features/pulse-breaker/components/PulseBreakerPremiumOutcome.tsx` | **Nuovo** — outcome win/lose fullscreen premium |
| `src/locales/en/common.json` | Stringhe outcome + bridge |
| `src/locales/it/common.json` | Idem |
| `src/locales/fr/common.json` | Idem |
| `reports/REPORT_PULSE_BREAKER_RESULT_FLOW_2026-04-04.md` | Questo report |

**Non toccati:** backend, `usePulseBreaker` logica crash/cashout, `useAwardPE` importi globali, daily engine, conductor M1U/rank.

---

## D. Nuovo flow finale Pulse Breaker

1. **Run end** (`crashed` | `cashed_out`) → ~**480 ms** di feedback visivo sul canvas (CRASH! / ESTRATTO!) senza strip legacy sotto.  
2. **`pe_bridge`** → pannello scuro blur («Sincronizzazione ricompense») **copre tutto il modale** (header incluso nel layout `Global`).  
3. **`awardPE(PULSE_BREAKER_PLAY)`** → se `deltaPE > 0`, attesa **`m1-pe-reward-overlay-settled`**.  
4. Se **win** → `awardPE(PULSE_BREAKER_WIN)` → stessa attesa se `deltaPE > 0`.  
5. **`outcome`** → `PulseBreakerPremiumOutcome` fullscreen.  
6. **CTA Continua** → `peAwardedRef` reset, `postRunPhase` none, `resetGame()`, `onClose()`.

---

## E. Strategia handoff reward → result

- **Evento:** `PE_REWARD_OVERLAY_SETTLED_EVENT` da `@/features/victoryOrchestration/constants` (stesso contratto di `GlobalPERewardOverlay`).
- **Nessuna modifica** al componente PE: solo **consumo** dell’evento per sincronizzare la catena.
- **PLAY e WIN** non sono più parallelizzati nel client; riduce race e rende deterministico l’ordine degli overlay.

---

## F. Nuovo design modali win/lose

- Fullscreen **quasi-PE**: `bg-black/92`, `backdrop-blur`, alone **cyan** (win) / **rose** (lose), card riepilogo vetro, **CTA gradient** unica.
- Copy in **it/en/fr** tramite `pulseBreaker.outcome.*` e `pulseBreaker.peBridge*`.
- Near-miss (solo win) riportato nel pannello riepilogo se presente.

---

## G. Test eseguiti con esito

| Test | Esito |
|------|--------|
| `npx tsc --noEmit` | **Pass** |
| Parse JSON `en` / `it` / `fr` common | **Pass** |
| TEST 1–4 su iPhone / smoke manuali | **Non eseguiti in sede** (richiesti sul device) |

---

## H. Conferma: contenitore gioco non riappare nel mezzo

- Durante **`pe_bridge`** e **`outcome`**, layer **assoluti** coprono l’intero shell del modale (`renderAsContentOnly`) o il `pb-container` (modal standalone).
- I controlli legacy **`pb-result-controls`** non sono più renderizzati: **non** c’è più il passaggio «chiudi PE → vedi strip verde/rossa + GIOCA ANCORA → poi altro».

---

## I. Go / No-Go finale (iPhone)

| Criterio | Stato |
|----------|--------|
| Ordine UX corretto in codice | **Go** (logica implementata) |
| Coerenza visiva con PE | **Go** (stesso linguaggio blur/glow/motion leggera) |
| Nessun tocco a business logic gioco / RPC PE | **Go** |
| Verifica reale su iPhone | **Go condizionato** — eseguire TEST 1–2 sul device |

**Verdetto:** **Go merge** con validazione device obbligatoria prima di dichiarare chiusura produzione.

---

© 2026 M1SSION™ — Pulse Breaker result flow
