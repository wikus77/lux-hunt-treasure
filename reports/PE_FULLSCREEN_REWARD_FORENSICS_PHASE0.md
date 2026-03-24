# PE Global Fullscreen Reward System — FASE 0 Forensics (READ-ONLY)

**Data:** 2026-03-06  
**Scope:** Analisi architetturale e inventario PE/Pulse per un futuro sistema di reward fullscreen PE. Nessuna modifica al codice; solo lettura e report.

---

## 1. Executive Summary

- **Accredito PE oggi:** avviene principalmente via RPC client `award_pulse_energy` (chiamata dall’hook `useAwardPE`). Le fonti sono: Buzz, Buzz Map, Pulse Breaker, Battle, Map time, AION chat, Forum, Daily login (StreakWidget), onboarding. La ruota (Fortune Wheel) e le daily missions server-side **non** accreditano PE oggi (la wheel ha segmenti PE ma l’Edge `spin-wheel` non chiama `award_pulse_energy`; claim-daily-phase accredita solo M1U). I clue milestones aggiornano `pulse_energy` in `profiles` in scrittura diretta client-side, senza passare da `useAwardPE` né da `pe:awarded`.
- **Evento globale PE:** esiste un solo evento custom `pe:awarded` (detail: `{ success, oldPE, newPE, deltaPE, rankChanged, action }`), emesso da `useAwardPE` dopo RPC riuscita. Lo ascoltano: `PulseBarPersonal` (refetch + animazione “+N PE”), e in Vera Bomb viene emesso manualmente dopo run. **Non** esiste un overlay globale tipo M1U (nessun “pe-credit-event” unificato, nessun modale fullscreen PE).
- **Pulse Bar / UI PE:** componente principale `PulseBarPersonal` (gerarchia/rank + PE), usato in CommandCenterHome; `AgentEnergyPill` (pill + RankDetailModal) nello stesso contesto; `PulseBar` (usePulseRealtime, altro flusso); `GlobalPulseBar` (landing); `VeraBombPulseBarOverlay` (delta PE post-win/lose in modale). Nessuno di questi è un modale fullscreen globale per “ogni guadagno PE”.
- **Punto unico di aggancio:** oggi **non** esiste un singolo punto equivalente a `emitM1UCreditEvent` per i PE. L’unico evento è `pe:awarded`, emesso solo da `useAwardPE` (e da Vera Bomb). Per un sistema “fullscreen modale PE” andrebbe introdotto un evento tipo `pe-credit-event` e un listener globale (fullscreen modal) che mostri la Pulse Bar animata, senza reindirizzare alla Home.
- **Architettura consigliata (solo teorica):** duplicare il pattern M1U: evento `pe-credit-event`, helper `emitPECreditEvent(amount, source)`, componente headless `GlobalPECreditOverlay` che ascolta e apre un modale fullscreen con variante “Reward” della Pulse Bar (o componente dedicato “PulseBarReward”). Whitelist/blacklist e rischi sono indicati sotto.

---

## 2. Inventario completo dei PE

### 2.1 Sorgenti di accredito (dove i PE vengono assegnati)

| File | Funzione / punto | Ruolo | Meccanismo | Evento globale |
|------|------------------|--------|------------|----------------|
| `src/features/pulse/hooks/useAwardPE.ts` | `awardPE(action, customAmount?, metadata)` | Hook centrale: chiama RPC `award_pulse_energy`, poi dispatch `pe:awarded` | Client → Supabase RPC | Sì: `pe:awarded` |
| `src/components/gamification/StreakWidget.tsx` | login/day check | Daily login PE | `awardPE('DAILY_LOGIN', …)` | Via useAwardPE → pe:awarded |
| `src/features/pulse-breaker/components/PulseBreaker.tsx` | win/play | Pulse Breaker PE | `awardPE('PULSE_BREAKER_WIN'|'PULSE_BREAKER_PLAY', …)` | Via useAwardPE → pe:awarded |
| `src/components/battle/BattleCreationForm.tsx` | post-battle | Battle win/lose PE | `awardPE('BATTLE_WIN'|'BATTLE_LOSE', …)` | Via useAwardPE → pe:awarded |
| `src/hooks/useMapTimeTracking.ts` | 240s/600s in map | Map time PE | `awardPE('MAP_TIME_240S'|'MAP_TIME_600S', …)` | Via useAwardPE → pe:awarded |
| `src/hooks/useIntelAnalyst.ts` | AION chat | AION chat PE | `awardPE('AION_CHAT', …)` | Via useAwardPE → pe:awarded |
| `src/hooks/useForum.ts` | post/comment | Forum PE | `awardPE('FORUM_POST'|'FORUM_COMMENT', …)` | Via useAwardPE → pe:awarded |
| `src/components/map/BuzzMapButtonSecure.tsx` | Buzz Map click | Buzz Map PE | `awardPE('BUZZ_MAP_CLICK', …)` | Via useAwardPE → pe:awarded |
| `src/hooks/buzz/useBuzzHandler.ts` | Buzz click | Buzz PE | `awardPE('BUZZ_CLICK', …)` | Via useAwardPE → pe:awarded |
| `src/components/onboarding/OnboardingOverlay.tsx` | onboarding | PE iniziale | Update diretto `pulse_energy` + rpc increment (non useAwardPE) | No pe:awarded |
| `src/hooks/useClueMilestones.ts` | claim milestone | Milestone M1U+PE | Update diretto `profiles` (m1_units, pulse_energy) | No pe:awarded |
| `supabase/functions/spin-wheel/index.ts` | segment PE | Ruota segmenti 4,6,7 = PE | **Nessun accredito PE** (solo M1U e clue) | N/A |
| `supabase/functions/claim-daily-phase/index.ts` | daily win | Reward daily | Solo M1U (`admin_credit_m1u`), nessun PE | N/A |
| `src/features/vera-missions/bomb/useBombMissionRun.ts` | Vera Bomb run | Delta PE mission | Scrittura + dispatch manuale `pe:awarded` | Sì: pe:awarded |

### 2.2 Aggiornamento stato / lettura PE

| File | Ruolo | Meccanismo |
|------|--------|------------|
| `src/hooks/useHierarchyRank.ts` | Rank + PE da profiles | Select `pulse_energy`, Realtime su `profiles`, calcolo livello/percentuale |
| `src/features/pulse/hooks/useAgentEnergy.ts` | Stato agente (PE + rank) | Select + Realtime `pulse_energy` |
| `src/hooks/usePulseEnergy.ts` | Bridge XP / rank / PE | useXpSystem + agent_ranks, espone pulseEnergy/rank |
| DB: `profiles.pulse_energy` | Sorgente di verità | Aggiornato da RPC `award_pulse_energy` o update diretto (milestone, onboarding) |

### 2.3 Visualizzazione UI / animazione

| File | Ruolo | Collegamento eventi |
|------|--------|---------------------|
| `src/features/pulse/components/PulseBarPersonal.tsx` | Barra PE + rank (CommandCenter) | Ascolta `pe:awarded` → refetch; animazione “+N PE” su aumento `pulseEnergy` |
| `src/features/pulse/components/AgentEnergyPill.tsx` | Pill PE (CommandCenter) | useHierarchyRank; animazione “+N PE” su aumento PE (nessun listener evento) |
| `src/features/pulse/components/PulseBar.tsx` | Barra Pulse (usePulseRealtime) | Ascolta `pulse:contributed` (contributi PULSE, non PE personali) |
| `src/features/pulse/components/PulseRewardNotification.tsx` | Fullscreen threshold M1U | Realtime `pulse_rewards_log` (M1U soglie PULSE), **non** PE |
| `src/features/vera-missions/bomb/ui/VeraBombPulseBarOverlay.tsx` | Overlay delta PE in modale Bomb | Props `deltaPe`; nessun evento globale |
| `src/components/pulse/GlobalPulseBar.tsx` | Barra landing | Solo UI landing |
| `src/components/profile/ProfileInfo.tsx` | Profilo: PE | usePulseEnergy |
| `src/components/rank/RankDetailModal.tsx` | Dettaglio rank / PE | useHierarchyRank / state |

### 2.4 Eventi esistenti (sintesi)

- **`pe:awarded`** (CustomEvent): emesso da `useAwardPE` (e Vera Bomb) dopo accredito; detail: `{ success, oldPE, newPE, deltaPE, rankChanged, action }`. Listener: `PulseBarPersonal` (refetch + nessun modale fullscreen).
- **`pulse:contributed`**: per contributi PULSE (altro flusso), usato da `PulseBar` (usePulseRealtime).
- **Nessun** `pe-credit-event` unificato né overlay globale PE come per M1U.

---

## 3. Call graph PE

### 3.1 Flusso generico (useAwardPE)

1. **Trigger:** azione utente (Buzz, Map click, Battle end, Forum, AION, Streak login, Pulse Breaker, Map time).
2. **Chiamata:** `awardPE(action, customAmount?, metadata)`.
3. **Client:** `useAwardPE` → optional daily limit RPC → `supabase.rpc('award_pulse_energy', { p_user_id, p_delta_pe, p_reason: action, p_metadata })`.
4. **Server:** RPC `award_pulse_energy` aggiorna `profiles.pulse_energy` (e eventuale rank); ritorno `{ success, old_pe, new_pe, delta_pe, rank_changed, … }`.
5. **Client:** se success → `window.dispatchEvent(new CustomEvent('pe:awarded', { detail: { …awardResult, action } }))`.
6. **UI:** `PulseBarPersonal` in ascolto → refetch (useHierarchyRank) + animazione “+delta PE” locale sulla barra. Realtime `profiles` aggiorna altri consumer (AgentEnergyPill, RankDetailModal, ecc.).
7. **Sync:** Realtime su `profiles`; nessun “pending” PE come per M1U.
8. **Animazione:** solo piccolo badge “+N PE” su PulseBarPersonal/AgentEnergyPill; nessun modale fullscreen.

### 3.2 Tabella per fonte

| Fonte | Cosa scatena | Dove accredito | Sync/Realtime | UI che scopre | Animazione attuale |
|-------|--------------|----------------|---------------|---------------|---------------------|
| **Wheel** | Spin ruota | **Nessuno** (Edge non accredita PE) | N/A | N/A | Messaggio “+N PE sbloccati!” ma saldo invariato |
| **Daily missions** | Claim phase | Solo M1U (Edge) | Realtime | Pill M1U | Nessun PE |
| **Buzz / Buzz Map** | Click | useAwardPE → RPC | Realtime | PulseBarPersonal, pill | +N PE su barra |
| **Pulse Breaker** | Win/Play | useAwardPE → RPC | Realtime | PulseBarPersonal, pill | +N PE su barra |
| **Battle** | Win/Lose | useAwardPE → RPC | Realtime | Come sopra | Come sopra |
| **Map time** | 240s/600s | useAwardPE → RPC | Realtime | Come sopra | Come sopra |
| **AION / Forum** | Chat/post/comment | useAwardPE → RPC | Realtime | Come sopra | Come sopra |
| **Streak (daily login)** | Login giornaliero | useAwardPE → RPC | Realtime | Come sopra | Come sopra |
| **Clue milestone** | Claim milestone | Update diretto `profiles.pulse_energy` | Realtime | Come sopra | Nessun pe:awarded |
| **Vera Bomb** | Fine run | Scrittura + dispatch `pe:awarded` | Realtime | VeraBombPulseBarOverlay + listener | Overlay barra in modale |
| **Onboarding** | Completamento | Update/rpc diretto | Realtime | Varie | No pe:awarded |

---

## 4. Analisi Pulse Bar (target UI)

### 4.1 Dove è implementata

- **PulseBarPersonal:** `src/features/pulse/components/PulseBarPersonal.tsx` — componente principale “barra PE” con rank, livello, PE, segmenti riempimento. Usato in **CommandCenterHome** (`variant="inline"`).
- **PulseBar:** `src/features/pulse/components/PulseBar.tsx` — barra basata su `usePulseRealtime` (valore 0–100), altro flusso (contributi PULSE).
- **AgentEnergyPill:** `src/features/pulse/components/AgentEnergyPill.tsx` — pill circolare con arc progress, apre RankDetailModal; stesso stato `useHierarchyRank` di PulseBarPersonal.
- **GlobalPulseBar:** `src/components/pulse/GlobalPulseBar.tsx` — barra landing (Power Buzz).
- **VeraBombPulseBarOverlay:** `src/features/vera-missions/bomb/ui/VeraBombPulseBarOverlay.tsx` — overlay con delta PE animato (win/lose) dentro modale Bomb.

### 4.2 Componente principale per “reward fullscreen”

- **PulseBarPersonal** è il candidato più vicino: già usa `useHierarchyRank` (pulse_energy, rank, progressPercent), ha animazione “+N PE”, ascolta `pe:awarded`. Non è un modale; è inline in CommandCenter.
- **File principale:** `PulseBarPersonal.tsx` (e stili `pulse-bar.css` / `animations/index.css`).

### 4.3 Unico vs duplicato

- **PulseBarPersonal** e **PulseBar** sono due componenti distinti (dati diversi: HierarchyRank vs PulseRealtime).
- **AgentEnergyPill** condivide lo stato (useHierarchyRank) con PulseBarPersonal ma è solo la pill; non è duplicato della barra.

### 4.4 Riusabilità fuori da Home

- PulseBarPersonal è usato solo in CommandCenterHome. Non dipende da HomeLayout/AppHome in senso stretto; dipende da `useHierarchyRank` (auth + Supabase). Teoricamente riusabile in un modale fullscreen se montato dentro un provider con auth (es. sotto AuthProvider come il resto app).

### 4.5 Props e dati

- **PulseBarPersonal:** `onTap?`, `variant?: 'inline'|'fixed'|'floating'`. Dati: `useHierarchyRank()` → state (pulseEnergy, progressPercent, currentLevel, nextLevel, …).
- **PulseBar:** `onTap?`, `variant?`. Dati: `usePulseRealtime()` → value 0–100.
- **AgentEnergyPill:** nessuna prop; legge tutto da useHierarchyRank.

### 4.6 Dipendenze

- **PulseBarPersonal:** useHierarchyRank, PULSE_ENABLED, PulseBreaker (condizionale), framer-motion.
- **useHierarchyRank:** useAuth, Supabase (select + Realtime su profiles), hierarchyConfig (livelli/rank).

### 4.7 Animazioni già presenti

- PulseBarPersonal: motion.div, animazione “+N PE” (showPEGain) con framer-motion, segmenti riempimento in base a progressPercent.
- PulseBar: smooth counter, segmenti circolari.
- VeraBombPulseBarOverlay: animazione incrementale del delta PE (setInterval), barra colorata.

### 4.8 Uso in modale fullscreen

- **Possibile:** montare PulseBarPersonal (o una variante “Reward” con stesse props/dati) dentro un modale fullscreen (createPortal o React root) e passare un valore “delta” da mostrare (es. da evento `pe-credit-event`). Servirebbe una **variante dedicata** (es. `PulseBarReward`) che accetti `amount: number` e mostri solo la barra + animazione “+N PE” senza dipendere dal tap/PulseBreaker, per evitare side-effect e per controllare meglio l’animazione “fill” cinematografica.

---

## 5. Architettura M1U attuale (riferimento)

- **Evento:** `m1u-credit-event` (CustomEvent), detail: `{ amount, source, id, issuedAt }`.
- **Helper:** `emitM1UCreditEvent(amount, source)` in `m1uCreditEvent.ts`; setta anche `window.__m1u_pending_credit__` per sync PRE→POST pill.
- **Overlay:** `GlobalM1UCreditOverlay.tsx` — headless: ascolta `m1u-credit-event`, dedupe/lock, dopo delay dispatch `m1u-credited` e `m1u-balance-changed`. Non renderizza UI (Strategy B).
- **Pill:** `M1UPill` (es. su Home) ascolta `m1u-credited` / `m1u-balance-changed` e anima PRE→POST.
- **Fonti:** Shop, Wheel (se credited_amount>0), Daily missions, Lottery, Scratch, Referral, Welcome, Streak, Clue milestone, Micro mission, Cashback, Weekly challenge, ecc. — tutte chiamano `emitM1UCreditEvent` dopo accredito reale.
- **Nessun** redirect a Home; la pill già in pagina anima.

---

## 6. Architettura PE consigliata (solo teorica)

- **A) Duplicare il pattern M1U (consigliato):**
  - Nuovo evento: `pe-credit-event` (detail: `amount`, `source`, `id`, `issuedAt`).
  - Helper: `emitPECreditEvent(amount, source)` (solo dopo accredito reale, es. dopo RPC o dopo conferma server).
  - Componente: `GlobalPERewardOverlay` (o `GlobalPECreditOverlay`) — ascolta `pe-credit-event`, optional lock/dedupe, apre **modale fullscreen** (createPortal) con contenuto: variante Pulse Bar “reward” (barra + animazione “+N PE” + eventuale glow/fill).
  - Le fonti che oggi chiamano `awardPE` e poi emettono `pe:awarded` potrebbero in futuro chiamare anche `emitPECreditEvent(deltaPE, source)` dopo successo, così il modale fullscreen si apre da qualsiasi contesto (Map, Buzz, Battle, Wheel quando/se PE saranno accreditati, ecc.).
- **B) Orchestrator generico:** un solo “reward orchestrator” che ascolta sia m1u-credit-event che pe-credit-event e decide se mostrare pill M1U o modale PE. Più complesso e accoppiamento maggiore.
- **C) Fullscreen modal globale che ascolta evento PE:** come in A, ma enfasi su “un solo modale fullscreen” per PE, senza cambiare il flusso M1U.
- **D) Aggancio a provider/context:** esporre “last PE reward” in un context e far aprire il modale da un provider; possibile ma meno coerente con l’event-driven M1U.

**Raccomandazione:** **A** — evento `pe-credit-event` + `emitPECreditEvent` + componente fullscreen che mostra variante Pulse Bar (o componente “PulseBarReward”) con animazione AAA, senza redirect.

---

## 7. Rischi e regressioni

| Rischio | Descrizione | Probabilità | Impatto | Mitigazione futura |
|--------|-------------|-------------|---------|---------------------|
| Doppio trigger | Due fonti emettono pe-credit-event per lo stesso reward | Media | Doppio modale / confusione | Lock/dedupe per (user, amount, source, timestamp) come in M1U overlay |
| Modal sopra modali critici | Fullscreen PE sopra login/shop/payment | Media | Blocco UX / sicurezza | z-index e “stack” modali; non mostrare se già aperto modale critico |
| Race con cambio route | Evento PE mentre si naviga via | Media | Modale su pagina sbagliata / unmount | Portal in root (es. come M1U); cleanup on route change |
| Conflitto con Home | Utente su Home e modale PE | Bassa | Solo sovrapposizione | Modale sopra tutto; chiusura con CTA “Continua” |
| Conflitto con PulseBar esistente | Due barre visibili | Bassa | Rumore visivo | Modale fullscreen è contesto separato; chiudendo si torna alla barra di pagina |
| Mismatch stato reale PE / animazione | Modale mostra +N ma Realtime non ancora aggiornato | Media | Dubbio utente | Usare amount da evento; opzionale refetch dopo chiusura modale |
| Safe-area iOS | Notch / Dynamic Island | Media | Tagli / overlap | safe-area-inset-* nel modale e nel layout della barra |
| z-index | Sotto header / sotto altri overlay | Media | Modale non visibile | z-index alto (es. 999998) e stacking context come M1U |
| Portal overlay | createPortal target | Bassa | Modale non in root | Portal su document.body o div#root |
| Realtime Supabase | Doppio aggiornamento (evento + Realtime) | Bassa | Doppia animazione | Modale usa solo payload evento; barra di pagina si aggiorna con Realtime |
| Reward mentre in Map/Buzz/Shop/Mission | Modale PE durante azioni sensibili | Media | Interruzione flusso | Accettabile se modale è “celebrativo” e si chiude con un tap; evitare durante IAP/payment |

---

## 8. Whitelist file futuri

### File sicuramente da toccare (per sistema fullscreen PE)

- **Nuovo:** `src/features/pulse/peCreditEvent.ts` (o sotto `src/features/pulse/`) — costante evento `pe-credit-event`, tipo detail, `emitPECreditEvent(amount, source)`.
- **Nuovo:** `src/features/pulse/components/GlobalPERewardOverlay.tsx` (o `GlobalPECreditOverlay.tsx`) — listener `pe-credit-event`, modale fullscreen, contenuto PulseBar reward (o variante).
- **Nuovo (opzionale):** `src/features/pulse/components/PulseBarReward.tsx` — variante Pulse Bar solo per reward (amount prop, animazione fill/glow).
- **Modifica:** `src/App.tsx` — montare `GlobalPERewardOverlay` dentro AuthProvider (stesso livello concettuale di GlobalM1UCreditOverlay).
- **Modifica:** ogni chiamata a `awardPE` che deve aprire il fullscreen — dopo successo, chiamare `emitPECreditEvent(result.deltaPE ?? result.newPE - result.oldPE, source)` (es. in `useAwardPE` stesso dopo dispatch `pe:awarded`, o in ogni consumer). Oppure centralizzare in useAwardPE: se success, oltre a `pe:awarded` emettere `pe-credit-event` con amount.

### File forse da toccare

- `src/features/pulse/components/PulseBarPersonal.tsx` — solo se si vuole riusare la barra nel modale (estratta come variante) o per evitare doppia animazione (barra inline + modale).
- `src/features/pulse/hooks/useAwardPE.ts` — aggiungere emissione `pe-credit-event` dopo successo (un solo punto per tutte le fonti che usano l’hook).
- `src/features/vera-missions/bomb/useBombMissionRun.ts` — dopo dispatch `pe:awarded`, eventuale `emitPECreditEvent(deltaPe, 'vera_bomb')` se si vuole fullscreen anche lì.
- `src/hooks/useClueMilestones.ts` — oggi non emette pe:awarded; se si vuole fullscreen PE per milestone, dopo update profiles emettere `emitPECreditEvent(milestone.pe, 'clue_milestone')`.
- Stili: `src/features/pulse/styles/pulse-bar.css`, `src/styles/animations/index.css` — se si aggiungono animazioni “cinematografiche” per la variante reward.

### File da non toccare (assoluto)

- IAP / StoreKit / receipt / purchase flow (qualsiasi path acquisti).
- Login / logout / auth flow (solo uso di useAuth/context come già fatto).
- Delete-account.
- BUZZ / BUZZ MAP (logica core; solo eventuale aggiunta di emitPECreditEvent dopo awardPE già esistente).
- Push native.
- Subscriptions.
- `supabase/functions/credit-m1u-purchase`, `stripe-webhook`, `verify-iap-purchase`, ecc.
- `PulseRewardNotification` (soglie M1U PULSE) — non confondere con PE; opzionale non toccare.

---

## 9. Blacklist file intoccabili

- **IAP / StoreKit / receipts / purchase:** tutti i file in `src/iap`, `supabase/functions/credit-m1u-purchase`, `verify-iap-purchase`, stripe-webhook, Capgo, receipt validation.
- **Login / logout:** flussi in `AuthProvider`, `use-auth`, login page, session.
- **Delete-account:** flusso cancellazione account, Edge delete-account, delete-account-v2.
- **BUZZ (core):** logica tasto Buzz (eccetto eventuale chiamata già esistente a awardPE).
- **BUZZ MAP (core):** logica mappa Buzz (idem).
- **Push native:** configurazione e invio notifiche push.
- **Subscriptions:** gestione abbonamenti.
- **M1U global engine (logica):** non modificare comportamento di M1UPill/GlobalM1UCreditOverlay/m1uCreditEvent per il flusso M1U; eventuale solo coordinamento z-index con nuovo modale PE.

---

## 10. Conclusione tecnica

- **Dove e come si accreditano i PE oggi:** principalmente via `useAwardPE` → RPC `award_pulse_energy`; in più update diretto su `profiles.pulse_energy` (clue milestone, onboarding). La ruota e le daily server-side non accreditano PE.
- **Eventi PE:** solo `pe:awarded`; nessun evento unificato “pe-credit-event” né overlay globale.
- **Pulse Bar:** componente principale è PulseBarPersonal (CommandCenter); AgentEnergyPill condivide lo stato; VeraBombPulseBarOverlay è overlay in modale mission. Nessun fullscreen globale “reward PE”.
- **Punto di aggancio:** introdurre `pe-credit-event` + `emitPECreditEvent` e un componente globale che ascolta e apre modale fullscreen con barra/animazione PE; centralizzare l’emissione in `useAwardPE` (e in punti che oggi scrivono PE senza evento, se si vogliono includere).
- **Architettura consigliata:** replicare il pattern M1U (evento + overlay headless/fullscreen) per PE, con modale dedicato e variante “Reward” della Pulse Bar per animazione AAA, senza redirect a Home e rispettando whitelist/blacklist sopra.

**Fine report. Nessuna modifica al codice; solo analisi e raccomandazioni.**
