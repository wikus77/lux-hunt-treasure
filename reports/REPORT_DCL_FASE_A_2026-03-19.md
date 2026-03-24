# REPORT FASE A — DCL Realtime + CTA che aprono i flow (iOS)

**Data:** 2026-03-19  
**Progetto:** M1SSION™ — App nativa wrappata iOS (Capacitor WKWebView)

---

## 1. FORENSICS SUMMARY

### Cause vere trovate
- **Non-realtime:** La card refetchava solo su mount, visibility/focus (solo commit+streak) e dopo claim bonus. Nessun listener per “Commit completato”, “Streak completata”, “Missione completata”.
- **CTA solo scroll:** Le CTA chiamavano solo `scrollToCommit/Streak/Mission`; l’open state di Commit/Streak/Mission vive in componenti diversi (CommitNodeTrigger, StreakPill, NextActionContainer) senza API per aprire da fuori.

### Perché prima il DCL non era realtime
- useTodayDailyState non ascoltava alcun evento al completamento delle tre azioni; i modali/flow non emettevano eventi consumati dalla card.

### Perché prima le CTA facevano solo scroll
- DailyControlLoopCard non aveva accesso a funzioni “apri modal X”; solo `document.getElementById(...).scrollIntoView()`.

---

## 2. FIX APPLICATO

### File toccati

| File | Modifica |
|------|----------|
| **Nuovo:** `src/contexts/DclLauncherContext.tsx` | Context + DclLauncherProvider con 3 ref e funzioni openCommit/openStreak/openMission; registerOpen* per registrare la funzione di apertura (con cleanup). |
| `src/pages/AppHome.tsx` | Import DclLauncherProvider; wrap del contenuto (da M1SSION PRIZE a NextActionContainer) in `<DclLauncherProvider>`. |
| `src/components/home/DailyControlLoopCard.tsx` | useDclLauncher(); CTA chiamano openCommit/openStreak/openMission e, se ritornano false, fallback scroll; useEffect che ascolta `dcl-commit-done`, `streak-updated`, `dcl-mission-done` e chiama refetch(). |
| `src/components/commit/CommitNodeTrigger.tsx` | useDclLauncher(); useEffect che registra registerOpenCommit(() => { setOriginRect(triggerRef); setIsModalOpen(true); return true; }) con cleanup. |
| `src/components/gamification/StreakPill.tsx` | useDclLauncher(); useEffect che registra registerOpenStreak(() => { setShowModal(true); return true; }) con cleanup. |
| `src/components/feedback/NextActionContainer.tsx` | useDclLauncher(); useEffect che registra registerOpenMission(() => { setOriginRect(null); setIsModalOpen(true); return true; }) con cleanup. |
| `src/components/commit/CommitModal.tsx` | Su success (response.success && response.outcome === 'success') dopo setState('reward') dispatch di `dcl-commit-done`. |
| `src/components/feedback/DailyMissionContent.tsx` | In handleCompletePhase1 e handleCompletePhase2 dopo setShowCompletion(true) dispatch di `dcl-mission-done`. |

### Pattern scelto
- **Realtime:** Custom events (`dcl-commit-done`, riuso `streak-updated`, `dcl-mission-done`) + un solo useEffect nella card con addEventListener e cleanup.
- **CTA:** Context locale **DclLauncherContext**: ref per le tre funzioni “open”, registrazione dai componenti che possiedono i modali, card che chiama open* e in caso di false fa fallback scroll.

### Perché è la scelta più safe
- Nessuna modifica alla business logic di Commit, Streak, Mission; solo emissione eventi e registrazione di funzioni di apertura.
- Context limitato alla Home (provider solo sul contenuto rilevante); nessun cambiamento a routing, auth, IAP, BUZZ.
- Listener con cleanup per evitare leak; open* no-op se ref non impostato; fallback scroll se open ritorna false.

---

## 3. REALTIME MATRIX

| Evento | Card aggiorna? | Come |
|--------|-----------------|------|
| **Commit completato** | Sì | CommitModal dispatch `dcl-commit-done` → card listener → refetch() |
| **Streak completata** | Sì | StreakPill già dispatch `streak-updated` → card listener → refetch() |
| **Missione completata** | Sì | DailyMissionContent dispatch `dcl-mission-done` (phase 1 e 2) → card listener → refetch() |
| **Bonus claimato** | Sì | handleClaimBonus già chiama refetch() dopo claim |

---

## 4. CTA MATRIX

| Riga DCL | Cosa apre ora |
|----------|----------------|
| **Commit** | openCommit() → CommitNodeTrigger setIsModalOpen(true) + setOriginRect(trigger) → CommitModal |
| **Streak** | openStreak() → StreakPill setShowModal(true) → StreakModal |
| **Missione** | openMission() → NextActionContainer setOriginRect(null); setIsModalOpen(true) → NextActionFlipOverlay |

Se la registrazione non è ancora avvenuta (ref null), open* ritorna false e la card esegue il fallback scroll come prima.

---

## 5. RISCHI RESIDUI

- **NextActionContainer:** apertura programmatica con `originRect = null`; l’overlay potrebbe usare un rect salvato in precedenza o animazione “senza origine”. Comportamento accettabile; in caso di problemi si può passare un rect di default (es. centro schermo).
- **Mission:** `dcl-mission-done` è emesso anche al completamento phase 1 (oltre che phase 2); refetch è idempotente e la card mostrerà lo stato corretto (mission done solo quando phase 3 sul server).

### Miglioramenti consigliati per Fase B
- Overlay celebrativo al 3/3 e al claim bonus (template tipo StreakModal success).
- Animazioni leggere sulla card (transizione count, highlight “prossima azione”).
- Eventuale haptic/suono al completamento daily.

---

## 6. GO / NO GO

**GO.** Fase A implementata: realtime tramite eventi e refetch; CTA aprono i flow tramite DclLauncherContext; fallback scroll; nessun tocco a logica Commit/Streak/Mission/BUZZ; typecheck ok. Build e sync iOS da eseguire in locale.

---

## 7. PROSSIMA FASE CONSIGLIATA (Fase B AAA+)

1. **Animazioni card:** transizione 0/3 → 3/3 (barra o numero con motion); evidenza visiva della prima riga “da fare” (bordo/pulse).
2. **Overlay success 3/3:** al claim bonus (e opzionalmente alla chiusura modal dopo 3/3) mostrare overlay “Giornata completata” / “+10 M1U” riusando il pattern di StreakModal success o ClaimRewardModal.
3. **Haptic/suono:** breve feedback al completamento daily (opzionale).
4. **Near-completion (2/3):** messaggio e eventuale glow sulla riga mancante (copy già presente).

Nessuna implementazione extra in questo report; solo raccomandazioni.

---

© 2026 Joseph MULÉ – M1SSION™
