# PE Global Fullscreen Reward — FASE 1 Implementation Report

**Data:** 2026-03-06  
**Branch:** feat/pe-global-fullscreen-reward  
**Tag safety:** safety/pe-global-fullscreen-reward-pre  

---

## 1. Executive Summary

Implementato il sistema globale PE fullscreen (Opzione C — Energy Injection): ogni accredito PE reale apre un modale fullscreen con Pulse Bar reward, animazione “sfera che entra nella barra” e valore PE in evidenza. Nessun redirect alla Home; modale in portal con z-index 999998; dedupe/lock per evitare doppio trigger; copertura di tutte le fonti PE (useAwardPE, clue milestone, onboarding, Vera Bomb). Build e cap sync iOS passati; commit eseguito.

---

## 2. Branch e tag

- **Branch iniziale:** fix/m1u-slotloop-anim  
- **Branch usato:** feat/pe-global-fullscreen-reward  
- **Tag safety:** safety/pe-global-fullscreen-reward-pre (creato su HEAD pre-modifica)  
- **HEAD iniziale:** 127ddf028fe80bea70141fc99b99917e6a965c56  

---

## 3. File toccati

| File | Modifica |
|------|----------|
| `src/features/pulse/peCreditEvent.ts` | **Nuovo** — evento `pe-credit-event`, `emitPECreditEvent(amount, source, metadata?)` |
| `src/features/pulse/components/GlobalPERewardOverlay.tsx` | **Nuovo** — listener globale, modale fullscreen, dedupe, portal |
| `src/features/pulse/components/PulseBarReward.tsx` | **Nuovo** — componente reward Energy Injection (barra + sfera + valore PE) |
| `src/App.tsx` | Import + montaggio `GlobalPERewardOverlay` sotto AuthProvider (dopo GlobalM1UCreditOverlay) |
| `src/features/pulse/hooks/useAwardPE.ts` | Dopo `pe:awarded`, se delta > 0 chiamata `emitPECreditEvent(delta, source, { preValue, postValue })` |
| `src/hooks/useClueMilestones.ts` | Dopo update profiles riuscito e milestone.pe > 0, `emitPECreditEvent(milestone.pe, 'clue_milestone', …)` |
| `src/components/onboarding/OnboardingOverlay.tsx` | Dopo accredito 50 PE, `emitPECreditEvent(50, 'onboarding')` |
| `src/features/vera-missions/bomb/useBombMissionRun.ts` | Dopo `pe:awarded`, se res.delta_pe > 0, `emitPECreditEvent(res.delta_pe, 'vera_bomb', …)` |
| `src/locales/it/common.json` | Aggiunto blocco `pe_reward` (title, cta_continue, source_*) |
| `src/locales/en/common.json` | Idem |
| `src/locales/fr/common.json` | Idem |
| `reports/PE_FULLSCREEN_REWARD_PHASE1_IMPLEMENTATION.md` | **Nuovo** — questo report |

---

## 4. Fonti PE coperte

- **useAwardPE:** tutte le azioni che usano l’hook (Buzz, Buzz Map, Pulse Breaker, Battle, Map time, AION, Forum, Daily login, Daily mission, Marker claim, ecc.) emettono `pe-credit-event` dopo successo con delta > 0 (centralizzato in useAwardPE).
- **Clue milestone:** dopo update profiles con milestone.pe > 0 viene emesso `emitPECreditEvent(milestone.pe, 'clue_milestone')`.
- **Onboarding:** dopo accredito 50 PE viene emesso `emitPECreditEvent(50, 'onboarding')`.
- **Vera Bomb:** dopo finalize run con res.delta_pe > 0 viene emesso `emitPECreditEvent(res.delta_pe, 'vera_bomb')`.

---

## 5. Fonti PE non coperte (con motivazione)

- **Wheel / FortuneWheel:** la ruota oggi non accredita PE lato server (spin-wheel Edge non chiama award_pulse_energy per segmenti PE). Per regola richiesta non si introduce il modale fullscreen PE per reward non realmente accreditati. Quando il backend accrediterà PE dalla wheel, l’evento andrà emesso dal flusso che gestisce la risposta (es. client dopo risposta Edge con credited_pe).
- **Daily missions (claim-daily-phase):** l’Edge accredita solo M1U; nessun PE. Nessun cambiamento.

---

## 6. Architettura implementata

- **Event bus:** `pe-credit-event` (CustomEvent), detail: `PECreditEventDetail` (amount, source, id, issuedAt, preValue?, postValue?, metadata?).
- **Helper:** `emitPECreditEvent(amount, source, metadata?)` in `peCreditEvent.ts`; non emette se amount <= 0.
- **Overlay:** `GlobalPERewardOverlay` montato in App sotto AuthProvider; ascolta `pe-credit-event`; mostra modale fullscreen via createPortal(modal, document.body); modale contiene `PulseBarReward` + CTA “Continua”.
- **Componente reward:** `PulseBarReward` — barra orizzontale, sfera che entra da destra (Energy Injection), fill progress, valore “+N PE”, label source opzionale; callback onAnimationComplete; nessun side-effect Buzz/PulseBreaker.

---

## 7. Dedupe / lock

- `animatingRef`: mentre è true non si accettano nuovi eventi (un solo modale alla volta).
- `lastIdRef`: stesso id evento ignorato.
- `lastTimeRef` + `DEDUPE_MS` (2500 ms): eventi a meno di 2.5 s dall’ultimo ignorati.
- Comportamento se un secondo reward arriva con modale aperto: **ignore** (logica stabile, nessuna coda).

---

## 8. Modale fullscreen

- Portal su `document.body`; z-index 999998 (sempre sopra altri overlay/modali).
- Backdrop: `bg-black/85 backdrop-blur-sm`, tap chiude.
- Card centrale: gradient scuro, bordo cyan, padding + safe-area rispettata (env(safe-area-inset-*)).
- Chiusura: tap su “Continua” o auto-close dopo AUTO_CLOSE_MS (3500 ms).
- Nessun redirect; nessun cambio route.

---

## 9. Animazione Energy Injection

- **Entrata modale:** fade-in backdrop; card scale 0.95 → 1, leggero y, ease cinematico.
- **Barra:** traccia scura con bordo/glow cyan; fill che cresce in base a displayAmount/targetDisplay; sfera (gradient radiale bianco/cyan) che parte da destra e attraversa la barra (fase inject → fill → done); micro glow finale.
- **Valore:** “+N PE” in grande, colore REWARD_COLOR (#00e7ff), text-shadow glow.
- **Source:** label opzionale sotto (i18n pe_reward.source_*).
- **CTA:** bottone “Continua” con stile M1SSION (cyan, bordo, glow).

---

## 10. i18n aggiunto

- **Chiavi:** `pe_reward.title`, `pe_reward.cta_continue`, `pe_reward.source_<source>` (buzz_click, buzz_map_click, daily_login, battle_win, battle_lose, clue_milestone, onboarding, vera_bomb, aion_chat, forum_post, forum_comment, map_time_240s, map_time_600s, pulse_breaker_win, pulse_breaker_play).
- **File:** it/common.json, en/common.json, fr/common.json (blocco `pe_reward`).

---

## 11. Build result

- **Comando:** npm run build  
- **Risultato:** PASS (exit 0).  

---

## 12. Cap sync result

- **Comando:** npx cap sync ios  
- **Risultato:** PASS (Sync finished; pod install ok con rete).  

---

## 13. Commit

- **Eseguito:** Sì (dopo build e sync passati).  
- **Hash:** (vedi output git log sotto).  
- **Messaggio:** feat(pulse): global fullscreen PE reward overlay with cinematic pulse animation  

---

## 14. Limiti residui / next step

- **Wheel PE:** quando l’Edge spin-wheel accrediterà PE, aggiungere nel client (es. dove si gestisce la risposta della wheel) la chiamata `emitPECreditEvent(creditedPe, 'fortune_wheel')` solo se creditedPe > 0.
- **Coda reward:** attualmente “ignore” se un secondo evento arriva con modale aperto; in futuro si può valutare una coda semplice (mostrare il successivo alla chiusura) se richiesto.
- **Onboarding:** il flusso attuale ha un possibile bug (update con rpc come valore); l’emit è nella path di successo dopo setPeAwarded; se l’update fallisse silenziosamente l’utente vedrebbe comunque il modale (50 PE). Eventuale refactor dell’onboarding PE è fuori scope Fase 1.

---

Fine report.
