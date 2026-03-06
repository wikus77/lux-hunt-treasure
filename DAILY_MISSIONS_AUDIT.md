# Daily Missions — Read-Only Deep Dive Audit

**Target:** M1SSION™ · iOS Capacitor WKWebView  
**Modalità:** SOLO LETTURA — nessuna patch, nessuna modifica  
**Data:** 2026-03-03

---

## 1) Cosa sono oggi le Daily Missions in M1SSION™?

Le **Daily Missions** sono un sistema di missioni a **due fasi (Phase 1 + Phase 2)** che:

- Assegnano **una missione al giorno** in modo deterministico (stesso giorno = stessa missione per tutti, in base al giorno dell’anno).
- Richiedono all’utente di **completare Phase 1 oggi** (input testuale, conferma, o counter) e **Phase 2 il giorno successivo** (stesso tipo di azione).
- Offrono **reward in M1U** (split 50/50 tra Phase 1 e Phase 2).
- Sono **completamente client-side**: stato in `localStorage`, reward in safe mode solo in `localStorage`. **Nessuna tabella Supabase dedicata** alle daily missions; nessuna Edge Function per validare o accreditare.

Sono quindi “daily” nel senso **calendario** (una missione per giorno, Phase 2 sbloccata il giorno dopo) ma **non** nel senso di “missioni verificate dal server” o “economia persistente”.

---

## 2) Quali missioni esistono (tipi, fasi, regole, rewards)?

- **Registry:** `src/missions/missionsRegistry.ts` — **MISSIONS_REGISTRY** con ~30 missioni (open_source_intel, urban_riddle, pulse_breaker_challenge, signal_trace, code_fragment, area_observation_lite, pattern_break, chain_of_intel, time_distortion, false_signal, shadow_zone, …).
- **Missione del giorno:** `getMissionOfTheDay()` = `MISSIONS_REGISTRY[dayOfYear % MISSIONS_REGISTRY.length]` (stesso indice per tutti gli utenti nello stesso giorno).
- **Fasi:**  
  - **Phase 0:** non iniziata.  
  - **Phase 1:** attiva oggi (istruzione + azione).  
  - **Phase 2:** in attesa (ritorna domani) oppure **disponibile** se è già il giorno dopo e Phase 1 era completata.  
  - **Phase 3:** missione completata (niente più UI daily).
- **Tipi di azione:**  
  - **input:** testo validato (exact / regex / any).  
  - **confirm:** un tap per completare.  
  - **counter:** raggiungere un target (es. 5 vittorie Pulse Breaker) — counter in `localStorage` con prefisso `m1_mission_counter_`.
- **Rewards:** `calculatePhaseRewards(totalRewardM1U)` → 50% Phase 1, 50% Phase 2. Range per difficulty: base 10–20, logic 20–40, complex 40–80, special 20–60 M1U.

---

## 3) Cosa succede quando l’utente apre “Daily Mission” dalla Next Action?

- **Entrypoint:** Next Action modal (Home) → card “Daily Mission” (o equivalente) → `handleDailyMissionClick` in `NextActionContent.tsx` → `setShowMissionModal(true)` → si apre **DailyMissionFlipOverlay** con **DailyMissionContent**.
- **Analytics:** `track('daily_mission_click_from_next_action', { screen, primary_action, days_left, is_urgent, mission_phase })`.
- **Contenuto del modale:** header “DAILY MISSION”, titolo missione, descrizione, blocchi per stato:
  - **Not started:** Phase 1 today / Phase 2 tomorrow (reward), CTA “START MISSION”.
  - **Phase 1 active:** istruzione Phase 1, CTA “COMPLETE PHASE 1”.
  - **Phase 2 pending:** “Phase 2 unlocks tomorrow”, messaggio di ritorno.
  - **Phase 2 ready:** istruzione Phase 2, CTA “COMPLETE PHASE 2”.
- **Azioni:** Start → `startMission(mission.id)` (localStorage); Complete P1/P2 → `creditM1USafe` + `completePhase1`/`completePhase2` + `markPhase1Credited`/`markPhase2Credited` → toast completamento e chiusura.

Non viene usato il flusso **DailyMissionsController** (Briefing → Actions → Phase2Resume → Completion) quando si entra dalla Next Action: lì si usa solo il flusso **DailyMissionContent** (card/modal unico con stesso stato da `getMissionState()` / `isPhase2Available()`).

---

## 4) Cosa valida la missione (client vs server)?

- **Solo client.**
- **Input:** `validateInput(value, mission.phase1.inputValidation)` / `mission.phase2.inputValidation` (exact, regex, any) in `missionsRegistry.ts`.
- **Counter:** lettura/scrittura `localStorage` con chiave `m1_mission_counter_<key>`; nessuna verifica lato server che le vittorie Pulse Breaker (o altro) siano reali.
- **Tempo Phase 2:** `isPhase2Available()` = `phase === 2 && isNewDay() && phase1CompletedAt !== null` con `isNewDay()` = `storedDayKey !== getTodayKey()` (confronto data in locale).
- **Nessuna** chiamata Supabase/Edge per validare completamento o accredito M1U per le daily. La tabella `mission_enrollments` in Supabase è usata da altri flussi (missioni mappa/campagna), non da questo sistema.

---

## 5) Cosa viene salvato (localStorage, Supabase, RPC, Edge)?

| Dove | Cosa |
|------|------|
| **localStorage** | `m1_daily_missions_*`: active_id, phase, phase1_completed_at, day_key, credited_phase1, credited_phase2, progress_data, pending_rewards, briefing_shown. |
| **localStorage** | `m1_mission_counter_<key>` per missioni tipo counter (es. pulse_breaker_wins). |
| **localStorage** | `m1_daily_missions_pending_credits`: array di { amount, reason, timestamp } quando `MISSIONS_REWARD_SAFE_MODE === true`. |
| **Supabase** | Nessuna tabella dedicata alle daily. `mission_enrollments` è per altre missioni (mappa/campagna). |
| **Edge / RPC** | Nessuna chiamata per stato o reward delle daily. `creditM1USafe` in safe mode non scrive su DB. |

Quindi: stato, progressi e “crediti” missioni daily sono **solo locali**; cancellando app o cambiando device tutto si perde e non c’è idempotenza server-side.

---

## 6) Cosa manca per farle sembrare “vere” daily missions?

- **Validazione server-side:** nessun check che l’azione sia reale (es. Pulse Breaker davvero giocato, input non copiato).
- **Economia persistente:** M1U da daily non vengono scritti su profilo/crediti Supabase; restano “pending” in localStorage.
- **Antifrode:** nessun rate-limit, replay protection, o verifica temporale lato server (il “domani” è solo data locale).
- **Tensione/tempo:** nessun timer, scadenza visibile, o penalità; Phase 2 può essere completata in qualsiasi momento il giorno dopo.
- **World interaction:** quasi tutto è input testuale o conferma; solo pochi tipi (counter) legano a feature app (es. Pulse Breaker); niente geolocalizzazione o azioni sulla mappa per le daily.
- **Progressione/feedback:** nessuna leaderboard daily, streak, o differenziazione per segmento utente; nessun “mission engine” adattivo.

---

## 7) Come migliorarle in modo world-class senza rompere i paletti FROZEN?

Si veda il **Piano di miglioramento** nelle sezioni FASE 3 e FASE 4 sotto: livelli Quick Wins, Real Daily Missions e World-Class System, con impatti e rischi esplicitati e con **nessun tocco** a Login/Logout, Delete account, IAP, BUZZ, BUZZ MAP, Push (né ad altri flussi FROZEN).

---

# FASE 0 — Mappa filescope

| File | Ruolo | Chiamato da | Side effects | Rischi / gap |
|------|--------|--------------|--------------|--------------|
| `src/missions/missionState.ts` | Stato phase, dayKey, credited, progress_data | Engine, Controller, UI (Card, Content, NextAction, Pill) | local (localStorage) | Unica source of truth; cancellabile; nessun sync server |
| `src/missions/missionsRegistry.ts` | Registry missioni, getMissionOfTheDay, calculatePhaseRewards, validateInput | Engine, Controller, tutti i modal/card | none | getMissionOfTheDay deterministico globale; niente personalizzazione |
| `src/missions/missionEngine.ts` | getEngineState, handlePhase1Complete, handlePhase2Complete | DailyMissionsController | local (missionState + creditM1USafe) | Nessuna validazione server |
| `src/missions/rewards/creditM1U.ts` | creditM1USafe, getPendingCredits | Engine, DailyMissionCard, DailyMissionContent, MissionPill | local (localStorage se SAFE_MODE) | LIVE_MODE non implementato; reward non su DB |
| `src/missions/DailyMissionsController.tsx` | Orchestra Briefing / Phase2Resume / Actions / Completion | App.tsx (mount globale) | none (solo setState modali) | Gated da micro-missions; 2s delay; MissionProgressPill importato ma non usato in render |
| `src/missions/ui/MissionBriefingModal.tsx` | Modal “briefing” missione, Start / Dismiss | DailyMissionsController | none | Solo UI |
| `src/missions/ui/MissionActionsModal.tsx` | Modal azioni Phase 1 (input/confirm/counter) | DailyMissionsController | none (callback → handlePhase1Complete) | Validazione client only |
| `src/missions/ui/Phase2ResumeModal.tsx` | Modal Phase 2 (input/counter/confirm), Remind me later | DailyMissionsController | none (callback → handlePhase2Complete) | Idem |
| `src/missions/ui/MissionCompletionModal.tsx` | Modal “Phase complete” con reward | DailyMissionsController | none | Solo UI |
| `src/missions/ui/MissionPill.tsx` | Pill sulla mappa (MapTiler3D) e Home; click apre **modale proprio** (stato locale showModal) | MapTiler3D.tsx, Home.tsx | local (stesso missionState + creditM1USafe) | Terzo flusso UI: pill con modale inline (Start/Complete P1/P2); non usa DailyMissionsController. Tre entrypoint separati (Controller, Next Action/DailyMissionContent, MissionPill) |
| `src/missions/ui/MissionProgressPill.tsx` | Pill floating (orb) | Importato in Controller ma non renderizzato | none | Non usato nel DOM |
| `src/components/feedback/DailyMissionFlipOverlay.tsx` | Overlay full-screen per modal Daily Mission | NextActionContent | none | Solo layout/portal |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto modal Daily (header, fasi, CTA, toast) | DailyMissionFlipOverlay (da Next Action) | local (missionState + creditM1USafe) | Stesso stato del Controller ma flusso UI diverso (card unica) |
| `src/components/feedback/DailyMissionCard.tsx` | Card Home + modal inline + toast + LongPress info | Home (se presente) / export in feedback/index | local (missionState + creditM1USafe) | Duplicazione logica con DailyMissionContent |
| `src/components/feedback/NextActionContainer.tsx` | Container Next Action, decide se mostrare card Daily | Next Action flow | none | Legge MISSIONS_ENABLED, getMissionState, isPhase2Available |
| `src/components/feedback/NextActionContent.tsx` | Contenuto Next Action, card Daily Mission, handleDailyMissionClick | NextActionContainer | none (track) | track('daily_mission_click_from_next_action') |
| `src/config/firstSessionConfig.ts` | areMissionsCompleted (micro-missions) | DailyMissionsController | none | Controller aspetta micro-missions prima di mostrare Briefing/Phase2Resume |
| `src/stores/entityOverlayStore.ts` | registerActivePopup / unregisterActivePopup | DailyMissionsController | none | Solo coordinamento overlay |
| Supabase `mission_enrollments` | Enrollments missioni (mappa/campagna) | Edge Functions (handle-buzz-press, launch-new-mission, ecc.) | db | Non usato dalle Daily Missions |
| Nessuna Edge Function | — | — | — | Nessuna chiamata per daily state/reward |

---

# FASE 1 — Cosa fanno esattamente (SPEC)

## 1) ENTRYPOINT

- **Da dove si apre:**  
  - **Next Action** (Home): tap su card “Daily Mission” → `DailyMissionFlipOverlay` + `DailyMissionContent`.  
  - **Mappa (MapTiler3D) / Home:** `MissionPill` → click apre un **modale proprio** (stato locale `showModal`), con stesso stato `getMissionState()` e stesse azioni (Start, Complete P1/P2, creditM1USafe); non usa i modal del Controller.  
  - **Controller (App):** dopo 2s da login, se `areMicroMissionsCompleted()` e `getEngineState()` → `shouldShowBriefing` o `shouldShowPhase2Resume` → apre **MissionBriefingModal** o **Phase2ResumeModal** (flusso separato con MissionActionsModal e MissionCompletionModal).
- **Condizioni:**  
  - `MISSIONS_ENABLED === true`.  
  - Utente autenticato (per Controller e per card Next Action che dipendono da `user`/mission ready).  
  - Micro-missions completate (solo per il Controller che mostra Briefing/Phase2Resume automatici).  
  - Per “P2 ready”: `isPhase2Available()` = phase 2 + nuovo giorno + phase1CompletedAt non null.

## 2) STATI / FASI

- **Phase 0:** missione non iniziata. `dayKey` può essere vuoto. Briefing mostrabile.  
- **Phase 1:** missione iniziata oggi. `startMission()` setta active_id, phase=1, day_key=today. L’utente deve completare Phase 1 (input/confirm/counter).  
- **Phase 2 (pending):** `completePhase1()` setta phase=2, phase1_completed_at=now. Phase 2 “si sblocca” il **giorno dopo** (isNewDay() = true).  
- **Phase 2 (ready):** stesso giorno successivo, `isPhase2Available()` true → utente può completare Phase 2.  
- **Phase 3:** `completePhase2()` setta phase=3. Missione finita; card/pill nascondono la daily.

Transizioni: Start → P1; Complete P1 → P2 (pending); (next day) → P2 ready; Complete P2 → P3.

## 3) OBIETTIVO UTENTE

- Oggi: leggere istruzione Phase 1, eseguire azione (testo, conferma, o counter).  
- Domani: stessa cosa per Phase 2.  
- La maggior parte delle missioni è **solo input testuale** (risposta esatta/regex/any) o **confirm**; poche usano **counter** (es. Pulse Breaker).  
- Nessuna azione “nel mondo” obbligatoria (mappa, geolocalizzazione, Buzz) per le daily; durata è “quando l’utente compila” (minuti), senza timer o scadenza visibile.

## 4) VALIDAZIONE

- **Solo client:** `validateInput()` in registry; counter in localStorage.  
- **Nessun** controllo server, nessun antifrode, nessun rate-limit, nessuna protezione replay (es. stesso completamento inviato due volte).

## 5) REWARD / ECONOMY

- M1U per Phase 1 e Phase 2 (split 50/50 da `totalRewardM1U`).  
- Con **MISSIONS_REWARD_SAFE_MODE = true**: `creditM1USafe` scrive in `m1_daily_missions_pending_credits` e chiama `addPendingReward(amount)` nello state. **Nessun** write su profilo Supabase o tabelle crediti.  
- Non idempotente lato server (il “già accreditato” è solo `credited_phase1`/`credited_phase2` in localStorage).  
- “Giornaliera” solo per scelta della missione (dayOfYear) e sblocco Phase 2 (confronto date in locale); nessun dayKey/timezone inviato al server.

## 6) UI/UX

- **Modali:** MissionBriefingModal (Start / Dismiss), MissionActionsModal (Phase 1: input/confirm/counter + Complete), Phase2ResumeModal (Phase 2 + Remind me later), MissionCompletionModal (reward + next steps).  
- **Altro:** DailyMissionContent (flusso Next Action: stesso stato, un solo modal con tutte le fasi), DailyMissionCard (card + modal + toast + LongPress).  
- CTA: Start Mission, Complete Phase 1, Complete Phase 2, Remind me later, Close.  
- Dopo completamento: toast/conclusion modal poi chiusura; l’utente resta sulla schermata corrente (Home o Next Action).

## 7) TELEMETRIA

- **Esistente:** `daily_mission_click_from_next_action` (screen, primary_action, days_left, is_urgent, mission_phase).  
- **Mancante:** eventi espliciti per start_mission, complete_phase1, complete_phase2, dismiss_briefing, remind_later; funnel (briefing_view → start → phase1_complete → phase2_complete); tempo tra Phase 1 e Phase 2; abbandono per fase.

---

## Diagramma ASCII — Stati e transizioni

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     PHASE 0 (Not started)                │
                    │  dayKey empty or stale; briefing_shown today?            │
                    └─────────────────────────────────────────────────────────┘
                                              │
                              START MISSION   │
                              (startMission)  │
                                              ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │                     PHASE 1 (Active today)                │
                    │  phase=1, day_key=today, instruction + action           │
                    └─────────────────────────────────────────────────────────┘
                                              │
                              COMPLETE P1     │
                              (completePhase1, creditM1USafe, markPhase1Credited)
                                              ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │                 PHASE 2 (Pending)                        │
                    │  phase=2, phase1_completed_at set; "return tomorrow"     │
                    └─────────────────────────────────────────────────────────┘
                                              │
                              NEXT CALENDAR DAY (isNewDay() === true)
                                              ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │                 PHASE 2 (Ready)                         │
                    │  isPhase2Available() === true                           │
                    └─────────────────────────────────────────────────────────┘
                                              │
                              COMPLETE P2     │
                              (completePhase2, creditM1USafe, markPhase2Credited)
                                              ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │                 PHASE 3 (Completed)                      │
                    │  phase=3; daily mission UI hidden                        │
                    └─────────────────────────────────────────────────────────┘
```

## Diagramma ASCII — User journey (semplificato)

```
  [Home / Map]
       │
       │ tap Next Action → "Daily Mission" card
       ▼
  [Next Action Modal] ──► [DailyMissionContent]
       │                        │
       │                        ├─ Not started → "START MISSION" → state P1
       │                        ├─ P1 active   → instruction + "COMPLETE PHASE 1" → credit + P2
       │                        ├─ P2 pending  → "Phase 2 unlocks tomorrow"
       │                        └─ P2 ready    → "COMPLETE PHASE 2" → credit + P3
       │
  [App mount]
       │
       │ 2s after login + micro-missions done
       ▼
  [DailyMissionsController]
       │
       ├─ shouldShowBriefing → [MissionBriefingModal] → Start → [MissionActionsModal] (P1)
       ├─ shouldShowPhase2Resume → [Phase2ResumeModal] → Complete P2 / Remind later
       └─ Completion → [MissionCompletionModal] → Close
       │
       ▼
  [User stays on current screen; state in localStorage only]
```

---

# FASE 2 — Perché ora non sembrano “vere” daily missions

- **Solo client, nessuna prova nel mondo:** validazione è stringa/counter in locale; nessun legame verificabile con azioni reali (mappa, Buzz, giochi). Per l’utente (e per il prodotto) sono “quiz” giornalieri, non missioni verificabili.
- **Nessuna economia reale:** reward in safe mode restano in localStorage; non si traducono in saldo M1U su profilo/DB; nessun idempotenza server (doppio claim possibile se si resetta lo storage).
- **Nessuna tensione temporale:** nessun countdown, nessuna scadenza “completa entro le 23:59”, nessun rischio di perdere la missione; Phase 2 può essere fatta in qualsiasi momento il giorno dopo.
- **Poca world interaction:** quasi tutto è testo o conferma; solo i counter (es. Pulse Breaker) legano a feature app, e comunque senza verifica server.
- **Feedback e progressione limitati:** nessuno streak (“hai completato 5 giorni di fila”), nessuna leaderboard daily, nessuna difficoltà adattiva o segmentazione; stessa missione per tutti nello stesso giorno.
- **Antifrode assente:** nessun rate-limit, replay protection, o validazione temporale lato server; il “domani” è solo data locale, manipolabile.
- **Due flussi UI paralleli:** Controller (Briefing → Actions → Phase2Resume → Completion) vs Next Action (DailyMissionContent / DailyMissionCard) leggono lo stesso stato ma con modali e percorsi diversi; possibile confusione e duplicazione di logica.

Questi punti sono tutti riscontrabili nel codice (missionState, creditM1U, missionEngine, getMissionOfTheDay, validateInput, assenza di chiamate Supabase/Edge per daily).

---

# FASE 3 — Piano di miglioramento (non implementato)

## A) Quick Wins (1–2 giorni) — UX e struttura

| Cosa | Perché | Impatto stimato | Rischio | Dipendenze |
|------|--------|------------------|--------|-------------|
| Unificare entrypoint Daily Mission (solo Next Action **oppure** solo Controller + Pill) | Evitare due flussi paralleli e confusione | Chiarezza +5–15% | Basso (solo quale UI mostrare) | Nessuna su FROZEN |
| Progress bar visiva (Phase 1 → Phase 2) e microcopy “Torna domani per Phase 2” già i18n | Maggiore chiarezza su “cosa manca” | Session clarity +10–20% | Basso | Solo UI/copy |
| Animazione/celebration al Complete P1/P2 (già parzialmente presente con toast) | Rafforzare feedback di completamento | Engagement +5–10% | Basso | Solo UI |
| Aggiungere eventi analytics: mission_start, phase1_complete, phase2_complete, briefing_dismiss, remind_later | Misurare funnel e abbandoni | Dati per iterazione | Basso | track() esistente |
| Gating esplicito: “Daily Mission disponibile dopo micro-missions” (copy) | Aspettative corrette | Riduzione frustrazione | Basso | Copy |

**Rischio su FROZEN:** nessuno; solo UX/copy/analytics.

---

## B) Real Daily Missions (1–2 settimane) — Missioni verificabili e robuste

| Cosa | Perché | Impatto stimato | Rischio | Dipendenze |
|------|--------|------------------|--------|-------------|
| Schema DB: `daily_mission_runs` (user_id, mission_id, day_key, phase, phase1_completed_at, phase2_completed_at, progress_data, created_at) | Persistenza e audit | Retention +10–25% (stato non perso) | Medio (migrazioni, RLS) | Supabase; non tocca IAP/BUZZ/Push |
| Edge Function “claim-daily-phase” (phase 1 o 2): verifica day_key, phase, idempotenza (già claimed → 200 ok), poi accredito M1U su profilo/crediti | Reward reali e antifrode base | Fiducia economia +15–30% | Medio (Edge + schema crediti) | Deve integrare con economia M1U esistente senza toccare IAP |
| Validazione server per counter: es. Phase 1 “5 vittorie Pulse Breaker” → query/aggregato da dati reali (se esiste tabella partite/vittorie) | Missioni “vere” per tipo counter | Percezione “reale” +20–40% | Medio (schema partite/vittorie) | Solo se esiste fonte dati; altrimenti solo claim lato server |
| Rate-limit e idempotenza: un claim per (user, mission_id, day_key, phase); replay restituisce 200 con stesso reward | Antifrode minimo | Sicurezza | Basso | Logica Edge |
| Definire 3–5 tipi “veri”: (1) input con validazione server (opzionale), (2) counter verificato da DB, (3) confirm con timestamp server, (4) “visit map zone” (se già esiste evento mappa), (5) “use Buzz once” (se evento Buzz già tracciato) | Differenziazione e verificabilità | Retention +10–20% | Medio | Dipende da eventi/DB esistenti; non creare nuovi flussi BUZZ/MAP invasivi |

**Rischio su FROZEN:** nessuno diretto; l’integrazione M1U deve solo “aggiungere” accredito daily senza modificare flussi IAP/BUZZ/Buzz Map/Push. Attenzione a non duplicare logica di cancellazione account (non legare daily a tabelle che bloccano delete).

---

## C) World-Class System (1–2 mesi) — Mission engine

| Cosa | Perché | Impatto stimato | Rischio | Dipendenze |
|------|--------|------------------|--------|-------------|
| “Mission engine”: generazione missione per segmento (nuovo vs ritornante vs power user), difficoltà adattiva (es. in base a completamenti recenti), reward scaling | Engagement e personalizzazione | Retention D7 +15–30%, session length +10–20% | Alto (logica + A/B) | Backend + feature flags; non tocca FROZEN |
| Streak daily: “Hai completato N giorni di fila”; bonus M1U o badge per streak | Ritorno giornaliero | D1/D7 retention +10–25% | Medio | Schema run + calcolo streak; solo lettura su account |
| Leaderboard daily (top completamenti per day_key, tempo di completamento) | Competizione e socialità | Virality/session +5–15% | Medio | Tabella runs + privacy; no tracking invasivo |
| Push intelligente: “La tua Phase 2 è pronta” (dopo mezzanotte del giorno dopo) o “Manca 1 azione per completare Phase 1” | Recall senza spam | Retention +5–15% | Basso | Push esistente; solo contenuto messaggio |
| i18n e localizzazione completa (timezone per “giorno” se necessario) | Mercati multipli | Compliance e UX | Basso | Copy e opzionale server day_key per timezone |
| Sicurezza Apple-compliant: nessun tracking invasivo; ATT rispettato; dati minimi per leaderboard/streak | App Store e fiducia | Compliance | Basso | Privacy by design |

**Rischio su FROZEN:** nessuno se l’engine è “additivo” (nuove tabelle/Edge, nessuna modifica a Login, Delete account, IAP, BUZZ, Buzz Map, Push). Eventuale uso di “mission_enrollments” o profilo va progettato per non bloccare delete account (es. CASCADE o policy che permettono cancellazione).

---

# FASE 4 — Output finale

## ✅ Cosa sappiamo ora

- Daily Missions sono un sistema **a due fasi (P1 oggi, P2 domani)** con stato e reward **solo in localStorage**.
- **~30 missioni** nel registry; missione del giorno **deterministica** (dayOfYear % N); reward **50/50** M1U tra P1 e P2.
- **Due entrypoint UI:** (1) Next Action → DailyMissionContent / DailyMissionCard, (2) App → DailyMissionsController (Briefing / Phase2Resume / Actions / Completion) dopo micro-missions.
- **Validazione solo client** (validateInput, counter in localStorage); **nessuna** tabella Supabase né Edge Function per daily; **MISSIONS_REWARD_SAFE_MODE** lascia i crediti in `m1_daily_missions_pending_credits`.
- **Telemetria:** solo `daily_mission_click_from_next_action`; mancano eventi di funnel (start, phase1_complete, phase2_complete, dismiss, remind_later).

## ✅ Cosa manca

- Validazione e persistenza **server-side** (stato run, claim idempotente, accredito M1U su DB).
- Antifrode (rate-limit, replay protection, tempo verificato dal server).
- Tensione temporale (timer, scadenza visibile, streak).
- World interaction verificata (mappa, Buzz, giochi) per le daily.
- Un solo flusso UI chiaro (unificazione Next Action vs Controller).
- Analytics completi per funnel e abbandoni.
- Mission engine (segmentazione, difficoltà adattiva, reward scaling, leaderboard, push mirato).

## ✅ Next 3 mosse (ordine safe)

1. **Quick Wins:** Aggiungere eventi analytics (mission_start, phase1_complete, phase2_complete, dismiss, remind_later) e, opzionale, unificare copy/progress visivo (senza toccare logica o FROZEN).
2. **Schema e claim server:** Introdurre tabella `daily_mission_runs` e Edge “claim-daily-phase” con idempotenza; collegare accredito M1U al profilo/crediti senza modificare IAP/BUZZ/Push/Delete account.
3. **Validazione e tipi “reali”:** Per almeno 1–2 tipi (es. counter verificato da DB, confirm con timestamp server), implementare verifica lato server e collegare reward al claim.

## ✅ Rischi su flows FROZEN

- **Read-only:** in questa audit **nessun** flow FROZEN è stato modificato.
- **Miglioramenti futuri:**  
  - Qualsiasi **integrazione M1U** (Edge che accredita su profilo) deve **solo aggiungere** credito e **non** cambiare flussi IAP o cancellazione account.  
  - **Delete account:** eventuali tabelle `daily_mission_runs` (o simili) devono essere incluse nella procedura di cancellazione (CASCADE o job che cancella per user_id) senza bloccare la delete.  
  - **BUZZ / BUZZ MAP / Push / IAP:** non vanno toccati; le “missioni vere” possono **leggere** eventi già esistenti (es. “ha usato Buzz”) solo se già tracciati, senza aggiungere obblighi a quei flussi.

---

*Fine report. Solo lettura; nessuna patch applicata.*
