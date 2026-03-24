# PE Reward System — Runtime Global Audit (Read-Only Forensics)

**Data:** 2026-03-07  
**Tipo:** Verifica reale, nessuna modifica al codice, nessun commit/push/build/cap sync  
**Obiettivo:** Capire perché il modale PE appare solo con BUZZ e non con gli altri flussi.  
**Scope:** iOS Capacitor WKWebView.

---

## 1. Executive Summary

- **Fatto osservato:** Sul device il modale fullscreen PE appare quando si preme BUZZ; non appare con gli altri flussi provati dall’utente.
- **Causa principale (runtime):** I flussi che **emettano** `emitPECreditEvent` con `amount > 0` sono integrati col modale. BUZZ è l’unico flusso che l’utente attiva spesso, che passa da **useAwardPE** (RPC + evento) e che **non** è limitato a una volta al giorno o a condizioni rare (es. 4 min in mappa, vittoria battle da mappa, check-in streak).
- **Flussi che assegnano PE ma non emettono evento (o non passano da useAwardPE):** Nessuno tra quelli verificati “manca” l’evento, a patto che il flusso sia effettivamente eseguito e che non ci siano guard/limit che bloccano prima dell’RPC o dell’emit.
- **Flussi che non danno PE o non sono attivi in test:** Daily Mission (claim-daily-phase) accredita solo M1U lato server, non PE. Map time richiede 4/10 min sulla mappa (MapTiler3D). Streak/DAILY_LOGIN: limite 1/giorno e richiede check-in esplicito. Battle da Home (PracticeMode) emette evento solo dopo il fix recente; su build precedente il modale non appariva.
- **Overlay globale:** Listener su `pe-credit-event`, guard `amount <= 0`, dedupe/lock (animatingRef, lastIdRef, DEDUPE_MS 2500). Nome evento coerente. Il “problema” non è l’overlay ma **quali flussi chiamano davvero** `emitPECreditEvent` e in quali condizioni.
- **Verdetto:** Il modale appare solo con BUZZ perché (1) BUZZ è il flusso più usato e immediato che passa da useAwardPE con delta > 0; (2) gli altri flussi sono o poco usati in test (map time, forum, AION, battle da mappa, defense, pulse breaker, clue milestone), o limitati a 1 volta al giorno (DAILY_LOGIN, streak), o non danno PE (daily mission); (3) la battle dalla Home (PracticeMode) ora emette evento solo dopo il fix; su build senza fix il modale non poteva apparire da lì.

---

## 2. Inventario completo flussi PE

Verifica effettuata con grep su `awardPE(`, `useAwardPE`, `pulse_energy` (update), `pe:awarded`, `emitPECreditEvent`, `PE_CREDIT_EVENT`.

| Nome flusso | File | Funzione / trigger | Accredito reale | Metodo accredito | Emette pe:awarded | Emette emitPECreditEvent | Fullscreen atteso | Fullscreen possibile | Note |
|-------------|------|-------------------|-----------------|------------------|-------------------|---------------------------|-------------------|----------------------|------|
| **BUZZ_CLICK** | useBuzzHandler.ts | handleBuzz dopo clue_text ricevuto | Sì | useAwardPE → RPC award_pulse_energy | Sì | Sì (delta 10) | Sì | Sì | Limite 5/giorno. Unico flusso “sempre a portata” e usato spesso. |
| **BUZZ_MAP_CLICK** | BuzzMapButtonSecure.tsx | Click su Buzz Map in mappa | Sì | useAwardPE → RPC | Sì | Sì (delta 15) | Sì | Sì | Limite 3/giorno. Richiede mappa e tap su bottone. |
| **DAILY_LOGIN** | StreakWidget.tsx | handleCheckIn (check-in giornaliero) | Sì | useAwardPE → RPC | Sì | Sì (delta 5) | Sì | Sì | Limite **1/giorno**. Se già fatto oggi, non si chiama awardPE. |
| **MAP_TIME_240S** | useMapTimeTracking.ts | Dopo 240s in mappa | Sì | useAwardPE → RPC | Sì | Sì (delta 15) | Sì | Sì | Limite 1/giorno. Hook usato **solo in MapTiler3D**. Richiede 4 min sulla mappa. |
| **MAP_TIME_600S** | useMapTimeTracking.ts | Dopo 600s in mappa | Sì | useAwardPE → RPC | Sì | Sì (delta 30) | Sì | Sì | Limite 1/giorno. Stesso hook, 10 min in mappa. |
| **BATTLE_WIN** | BattleCreationForm.tsx | handleCountdownComplete (vittoria) | Sì | useAwardPE → RPC | Sì | Sì (delta 50) | Sì | Sì | Nessun limite. Flusso: battle **da mappa** (BattleModal / countdown). |
| **BATTLE_LOSE** | BattleCreationForm.tsx | handleCountdownComplete (sconfitta) | Sì (delta -100) | useAwardPE → RPC | Sì | **No** (delta ≤ 0) | No | No | useAwardPE emette evento solo se delta > 0. |
| **PULSE_BREAKER_PLAY** | PulseBreaker.tsx | gameState status cashed_out/crashed | Sì | useAwardPE → RPC | Sì | Sì (5) | Sì | Sì | Limite 10/giorno. Richiede gioco Pulse Breaker. |
| **PULSE_BREAKER_WIN** | PulseBreaker.tsx | Se cashed_out | Sì | useAwardPE → RPC | Sì | Sì (10) | Sì | Sì | Limite 10/giorno. |
| **AION_CHAT** | useIntelAnalyst.ts | Dopo conversazione AION | Sì | useAwardPE → RPC | Sì | Sì (20) | Sì | Sì | Limite 3/giorno. |
| **FORUM_POST** | useForum.ts | Dopo creazione post | Sì | useAwardPE → RPC | Sì | Sì (25) | Sì | Sì | Limite 5/giorno. |
| **FORUM_COMMENT** | useForum.ts | Dopo commento | Sì | useAwardPE → RPC | Sì | Sì (10) | Sì | Sì | Limite 10/giorno. |
| **PracticeMode (Battle Arena Home)** | PracticeMode.tsx | Vittoria con stake PE | Sì | Update diretto profiles.pulse_energy | Sì (dopo fix) | Sì | Sì | Sì (con fix) | **Non** useAwardPE. Emette pe:awarded + emitPECreditEvent dopo update. Senza fix non emetteva evento. |
| **BattleDefenseModal** | BattleDefenseModal.tsx | handleDefend (difensore vince) | Sì | Update diretto profiles | **No** | Sì | Sì | Sì | Emette solo emitPECreditEvent. Non pe:awarded → Home non refetch da evento. |
| **Clue milestone** | useClueMilestones.ts | Claim milestone con PE | Sì | Update diretto profiles | **No** | Sì (se milestone.pe > 0) | Sì | Sì | Update + emitPECreditEvent. Nessun pe:awarded. |
| **Onboarding** | OnboardingOverlay.tsx | onComplete (dopo 4s) | Sì | Update diretto + emitPECreditEvent(50) | No (awardPE() chiamato senza action → bug) | Sì (esplicito) | Sì | Sì | awardPE() senza argomenti non è valido; accredito reale è update + emit in onComplete. |
| **Vera Bomb** | useBombMissionRun.ts | Fine missione bomb (RPC server) | Sì | Edge/RPC + pe:awarded + emitPECreditEvent | Sì | Sì (se delta_pe > 0) | Sì | Sì | Flusso server-side, poi eventi client. |
| **Daily Mission (claim-daily-phase)** | claimDailyPhase.ts + modali missioni | complete_phase1/2 | **No PE** | Edge function: reward M1U | N/A | N/A | No | No | La daily mission accredita **solo M1U** (reward phase), non PE. Nessun awardPE('DAILY_MISSION') nel client. |

Flussi non trovati nel codice (nessuna chiamata a awardPE o update PE per questi contesti): MARKER_CLAIM, COUNTRY_CONQUEST, REFERRAL_SIGNUP, FINAL_SHOOT_WIN, FORTUNE_WHEEL (client non emette per segmenti PE ruota).

---

## 3. Matrice “Perché appare solo con BUZZ”

| Flusso | Assegna PE davvero? | Emette pe:awarded? | Emette pe-credit-event? | Modale dovrebbe apparire? | Modale appare dal codice? | Perché sì/no |
|--------|---------------------|--------------------|--------------------------|----------------------------|----------------------------|--------------|
| **BUZZ** | Sì | Sì | Sì | Sì | **Sì** | useAwardPE → RPC ok → delta 10 → emitPECreditEvent. Limite 5/giorno. Flusso usato spesso. |
| **BUZZ MAP** | Sì | Sì | Sì | Sì | Sì | Come sopra, limite 3/giorno. Richiede di essere in mappa e premere Buzz Map. |
| **Battle Home / PracticeMode** | Sì | Sì (dopo fix) | Sì | Sì | Sì (con fix) | Update diretto + pe:awarded + emitPECreditEvent. **Senza fix** non emetteva → modale non appariva. |
| **BattleCreationForm / BattleModal** | Sì | Sì | Sì (solo win) | Sì (win) | Sì (win) | awardPE('BATTLE_WIN'/'BATTLE_LOSE'). Lose: delta -100 → nessun emit. Win: sì. Flusso battle **da mappa**. |
| **BattleDefenseModal** | Sì | No | Sì (se defender vince) | Sì | Sì | Update diretto + emitPECreditEvent. Non emette pe:awarded. |
| **Streak / Daily Check-In** | Sì | Sì | Sì | Sì | Sì | awardPE('DAILY_LOGIN'). **Limite 1/giorno**. Se utente ha già fatto check-in oggi, handleCheckIn non viene richiamato. |
| **Daily Mission / claim-daily-phase** | **No** | N/A | N/A | No | No | Edge function accredita **M1U**, non PE. Nessun awardPE('DAILY_MISSION') nel client. |
| **Pulse Breaker** | Sì | Sì | Sì | Sì | Sì | useAwardPE PLAY + WIN. Limiti 10/giorno. Richiede apertura e gioco Pulse Breaker. |
| **Map time 4min/10min** | Sì | Sì | Sì | Sì | Sì | useAwardPE. **Solo in MapTiler3D**, richiede 4 min o 10 min **sulla mappa**. Limite 1 per milestone. |
| **AION chat** | Sì | Sì | Sì | Sì | Sì | useAwardPE. Limite 3/giorno. Richiede uso AION. |
| **Forum post/comment** | Sì | Sì | Sì | Sì | Sì | useAwardPE. Limiti 5/10. Richiede uso forum. |
| **Clue milestone** | Sì | No | Sì | Sì | Sì | Update diretto + emitPECreditEvent. Richiede claim milestone con PE. |
| **Onboarding** | Sì | No (bug awardPE) | Sì | Sì | Sì | Update + emitPECreditEvent in onComplete (dopo 4s). Una tantum. |
| **Vera Bomb** | Sì | Sì | Sì | Sì | Sì | RPC/Edge + eventi client. Richiede missione bomb. |

Sintesi: il modale **può** apparire per tutti i flussi che emettono `emitPECreditEvent` con amount > 0. Appare **solo con BUZZ** in pratica perché: (1) BUZZ è l’unico flusso che l’utente attiva spesso e che non è “una volta al giorno” o “dopo N minuti”; (2) gli altri sono o non provati (mappa 4 min, forum, AION, battle da mappa, defense, pulse breaker, clue, onboarding, Vera), o già consumati (streak 1/giorno), o non danno PE (daily mission).

---

## 4. Analisi Global PEReward Overlay / peCreditEvent

**File:** `src/features/pulse/peCreditEvent.ts`, `src/features/pulse/components/GlobalPERewardOverlay.tsx`.

1. **Listener montato correttamente?** Sì. GlobalPERewardOverlay è montato in App (AuthProvider); `useEffect` registra `window.addEventListener(PE_CREDIT_EVENT, handle)`.
2. **Nome evento coerente?** Sì. `PE_CREDIT_EVENT = 'pe-credit-event'`; `emitPECreditEvent` fa `dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail: payload }))`.
3. **Guard che bloccano l’apertura:**  
   - `if (!detail?.amount || detail.amount <= 0) return;`  
   - `if (animatingRef.current) return;`  
   - `if (lastIdRef.current === detail.id) return;`  
   - `if (now - lastTimeRef.current < DEDUPE_MS) return;` (DEDUPE_MS = 2500).
4. **amount <= 0 blocca?** Sì. Nessun modale se amount <= 0.
5. **animatingRef blocca eventi successivi?** Sì. Finché il modale è “in animazione” (payload non nullo), i successivi eventi vengono ignorati.
6. **lastIdRef / lastTimeRef / DEDUPE_MS:** Stesso id non riprocessato; eventi a meno di 2.5 s vengono scartati. Due reward ravvicinati: il secondo può essere perso.
7. **Due reward ravvicinati:** Il secondo viene perso se arriva prima della chiusura del modale o entro 2.5 s dall’ultimo.
8. **Modale solo se emitPECreditEvent chiamato?** Sì. Nessun altro path apre il modale.
9. **Path con reward reale ma nessun evento?** Sì: (1) useAwardPE ritorna prima di chiamare RPC (limit reached, not authenticated) → nessun emit; (2) useAwardPE chiama RPC ma fallisce → nessun emit; (3) BATTLE_LOSE: RPC con delta -100 → success ma delta ≤ 0 → nessun emitPECreditEvent. Flussi con update diretto: PracticeMode e BattleDefenseModal e Clue e Onboarding e Vera emettono tutti emitPECreditEvent (a patto di essere nel ramo che accredita e, dove previsto, con delta > 0).
10. **Sistema globale corretto o difettoso?** Il sistema globale (listener, nome evento, guard) è **corretto**. Il “problema” è lato **sorgenti**: quali flussi vengono effettivamente eseguiti, con delta > 0 e senza guard/limit che impediscono l’emit.

---

## 5. Analisi useAwardPE / daily limits / guard

**File:** `src/features/pulse/hooks/useAwardPE.ts`.

- **Guard iniziale:** `if (!user?.id) return { success: false, error: 'Not authenticated' };` → nessun RPC, nessun evento.
- **Determinazione amount:** `PE_VALUES[action]`; per CUSTOM/FORTUNE_WHEEL serve `customAmount`. Se action non in PE_VALUES (es. undefined come in Onboarding) → `peAmount` undefined → RPC con valore non valido.
- **check_pe_daily_limit:** Se `dailyLimit !== undefined`, viene chiamato RPC `check_pe_daily_limit`. Se `!limitCheck.can_award` → **return** con `limitReached: true` **senza** chiamare `award_pulse_energy` e **senza** emettere eventi.
- **Errore RPC award_pulse_energy:** return con success: false, **nessun** pe:awarded e **nessun** emitPECreditEvent.
- **result.success falso:** idem, nessun evento.
- **Success:** dispatch `pe:awarded` e, **solo se** `delta > 0`, `emitPECreditEvent(delta, source, { preValue, postValue })`. BATTLE_LOSE ha delta -100 → nessun emitPECreditEvent.

Tabella **PE_DAILY_LIMITS** (estratta):

| Action | Limite | Effetto se raggiunto |
|--------|--------|----------------------|
| BUZZ_CLICK | 5 | Nessun RPC, nessun evento, modale non parte |
| BUZZ_MAP_CLICK | 3 | Idem |
| PULSE_BREAKER_WIN | 10 | Idem |
| PULSE_BREAKER_PLAY | 10 | Idem |
| AION_CHAT | 3 | Idem |
| FORUM_POST | 5 | Idem |
| FORUM_COMMENT | 10 | Idem |
| MAP_TIME_240S | 1 | Idem |
| MAP_TIME_600S | 1 | Idem |
| DAILY_LOGIN | **1** | Idem (check-in già fatto oggi = nessun award) |
| DAILY_MISSION | 1 | Idem (e comunque daily mission non accredita PE dal client) |
| BATTLE_WIN / BATTLE_LOSE | Nessun limite | — |
| MARKER_CLAIM, ecc. | Nessun limite | — |

Flussi che il tester può credere “attivi” ma che **non** aprono il modale:
- **DAILY_LOGIN:** già fatto oggi → nessuna chiamata awardPE.
- **MAP_TIME_240S / 600S:** non si resta 4/10 min sulla mappa, oppure limite già consumato.
- **Daily mission:** non dà PE (solo M1U).
- **BATTLE_LOSE:** delta negativo, nessun emitPECreditEvent.
- **PracticeMode (prima del fix):** non emetteva evento → modale non partiva.

---

## 6. Battle forensics definitiva

**A) BattleCreationForm**  
- **Dove si accredita PE:** Solo via `awardPE('BATTLE_WIN')` o `awardPE('BATTLE_LOSE')` in `handleCountdownComplete` (dopo countdown e risoluzione battle).  
- **Accredito:** RPC `award_pulse_energy`.  
- **pe:awarded:** Sì (da useAwardPE in caso di success).  
- **emitPECreditEvent:** Solo se vittoria (delta 50 > 0). In sconfitta no.  
- **Modale:** Dovrebbe apparire in vittoria.  
- **Ramo utente:** Battle **avviata dalla mappa** (tap su agente → BattleModal → countdown). Non dalla Home.

**B) BattleDefenseModal**  
- **Dove si accredita PE:** Update diretto `profiles.pulse_energy` per difensore e attaccante in `handleDefend` (e in handleSurrender).  
- **emitPECreditEvent:** Sì, se difensore vince e `peAmount > 0` (`battle_defense_win`).  
- **pe:awarded:** **No.**  
- **Modale:** Dovrebbe apparire quando il difensore vince. Home non fa refetch da pe:awarded per questo flusso.

**C) PracticeMode**  
- **Dove si accredita PE:** Update diretto in `updateBalanceAsync('PE', newBalance)` dopo vittoria con stake PE.  
- **pe:awarded:** Sì (dopo fix).  
- **emitPECreditEvent:** Sì, dopo update.  
- **Modale:** Dovrebbe apparire con build che include il fix. **Senza fix** non emetteva evento → modale non appariva.  
- **Ramo utente:** Battle **dalla Home** (Battle Console → Start Battle → Game) = PracticeMode.

**D) Altri rami battle**  
- Nessun altro componente battle trovato che assegni PE in modo diverso dai tre sopra.

Conseguenze:
- Battle **dalla mappa** (BattleCreationForm): integrata; modale in vittoria.  
- Battle **dalla Home** (PracticeMode): integrata **solo dopo il fix** (pe:awarded + emitPECreditEvent).  
- **Difensore** (BattleDefenseModal): integrata per il modale (emitPECreditEvent); Home non riceve pe:awarded.  
- **BattlePush:** Invocato in BattleCreationForm alla **creazione** battaglia (invite). Non alla risoluzione. **Non c’entra** con reward PE o modale.

---

## 7. Home sync forensic

**PulseBarPersonal.tsx**  
- Legge PE da `useHierarchyRank()` (state.pulseEnergy).  
- Refetch: ascolta `pe:awarded` → `refetch()` + refetch dopo 500 ms.  
- Non ascolta `pe-credit-event`.  
- Badge “+N PE”: stato `displayDelta` / `showPEGain`, visibile 2.8 s dopo aumento PE (con fix recente).

**AgentEnergyPill.tsx**  
- Legge da `useHierarchyRank()`.  
- Non ascolta eventi; si aggiorna solo quando lo state di useHierarchyRank cambia.  
- Stesso meccanismo displayDelta/showPEGain per badge.

**useHierarchyRank.ts**  
- Fetch: `supabase.from('profiles').select('pulse_energy')`.  
- Realtime: subscription su `profiles` UPDATE per `id=eq.${user.id}` → su cambio `pulse_energy` chiama `fetchEnergy()`.  
- Refetch esplicito: esposto come `refetch`; chiamato da PulseBarPersonal su `pe:awarded`.

Chi emette **pe:awarded:** useAwardPE (dopo RPC ok), PracticeMode (dopo fix), Vera Bomb.  
Chi **non** emette pe:awarded: BattleDefenseModal, useClueMilestones, Onboarding (solo emitPECreditEvent). Quindi per defense, clue milestone, onboarding la Home si aggiorna **solo** via Realtime (e refetch non parte da evento).

**Verdetto Home:**  
- “Home sync **parzialmente completo**”: aggiornamento immediato solo quando qualcuno emette `pe:awarded` (useAwardPE, PracticeMode, Vera). Negli altri casi dipende da Realtime.  
- Layer post-reward (badge +N PE, sweep) esiste ed è stato rinforzato con il fix; resta dipendente dall’aggiornamento dello state (refetch o Realtime).  
- BattlePush non influisce su Home sync.

---

## 8. Verdetto finale

1. **Perché il modale PE oggi appare solo con BUZZ?**  
   Perché BUZZ è il flusso più usato che (a) passa da useAwardPE, (b) ha delta > 0, (c) non è “una volta al giorno” come lo streak, (d) non richiede tempi lunghi (4/10 min in mappa) o contesti rari (forum, AION, battle da mappa, defense, pulse breaker, clue, Vera, onboarding). Gli altri flussi o non sono stati attivati in test, o hanno già consumato il limite (es. DAILY_LOGIN), o non danno PE (daily mission), o (PracticeMode) prima del fix non emettevano l’evento.

2. **Quali flussi PE sono realmente integrati col modale?**  
   Tutti quelli che chiamano `emitPECreditEvent(amount, source, ...)` con `amount > 0`: useAwardPE (dopo RPC success e delta > 0), PracticeMode (dopo fix), BattleDefenseModal (difensore vince), useClueMilestones (claim con PE), Onboarding (onComplete), Vera Bomb.

3. **Quali flussi PE NON sono integrati?**  
   Nessun flusso che assegna PE “reale” è senza emit; i casi in cui il modale non appare sono: (a) flusso non eseguito (es. nessun check-in, nessun 4 min in mappa), (b) limit reached prima dell’RPC, (c) RPC fallito, (d) delta ≤ 0 (BATTLE_LOSE), (e) build senza fix PracticeMode.

4. **Quali flussi l’utente può testare ma non daranno mai il modale?**  
   Daily mission (nessun PE). BATTLE_LOSE (delta negativo). Qualsiasi azione dopo aver raggiunto il limite giornaliero (BUZZ dopo 5, BUZZ_MAP dopo 3, DAILY_LOGIN dopo 1, ecc.).

5. **Il problema principale è nei source o nell’overlay globale?**  
   Nei **source** (quali flussi vengono eseguiti, limiti, delta, e nel caso PracticeMode l’assenza di emit prima del fix). L’overlay globale è coerente e funziona quando riceve l’evento.

6. **Problema Home: sync, leggibilità o assenza feedback?**  
   Sync: **parzialmente completo** (refetch su pe:awarded; altrimenti Realtime). Alcuni flussi non emettono pe:awarded. Leggibilità e feedback post-reward sono stati migliorati con il fix (displayDelta, sweep, testo PE).

7. **BattlePush c’entra?**  
   **No.** BattlePush è invito battaglia; non tocca reward PE né modale.

8. **TOP 5 file da toccare per una prossima fase fix (se si vuole massimizzare modale e sync):**  
   - `src/components/battle/PracticeMode.tsx` (già fixato: pe:awarded + emit).  
   - `src/components/battle/BattleDefenseModal.tsx` (aggiungere pe:awarded dopo update + emit per refetch Home).  
   - `src/hooks/useClueMilestones.ts` (aggiungere dispatch pe:awarded dopo update + emit per refetch Home).  
   - `src/components/onboarding/OnboardingOverlay.tsx` (correggere awardPE() senza action o rimuoverlo; già emit esplicito).  
   - `src/features/pulse/components/GlobalPERewardOverlay.tsx` (solo se si vogliono modificare dedupe/timeout; opzionale).

9. **TOP 5 root cause ordinate per probabilità:**  
   - (1) **Flussi non attivati in test:** map time, forum, AION, battle da mappa, defense, pulse breaker, clue, Vera, onboarding.  
   - (2) **Limite giornaliero già consumato:** DAILY_LOGIN 1/giorno, BUZZ 5, BUZZ_MAP 3, ecc.  
   - (3) **Battle dalla Home = PracticeMode senza fix:** build senza fix non emetteva evento.  
   - (4) **Daily mission non dà PE:** solo M1U, nessun awardPE lato client.  
   - (5) **BATTLE_LOSE:** delta negativo, nessun emit per design.

---

## 9. Top 5 root causes (sintesi)

1. Flussi che danno PE e emettono evento non sono stati attivati in test (mappa 4/10 min, forum, AION, battle mappa/difensore, pulse breaker, clue, Vera, onboarding).  
2. Limiti giornalieri (DAILY_LOGIN 1, BUZZ 5, BUZZ_MAP 3, …) già consumati.  
3. Battle dalla Home (PracticeMode) prima del fix non emetteva pe:awarded/emitPECreditEvent.  
4. Daily mission accredita solo M1U, non PE.  
5. BATTLE_LOSE: delta ≤ 0, nessun emit per scelta implementativa.

---

## 10. Top 5 file da toccare in un eventuale fix successivo

1. `src/components/battle/BattleDefenseModal.tsx` — Aggiungere dispatch `pe:awarded` dopo update PE (difensore vince) per refetch Home.  
2. `src/hooks/useClueMilestones.ts` — Aggiungere dispatch `pe:awarded` dopo update PE per refetch Home.  
3. `src/components/onboarding/OnboardingOverlay.tsx` — Correggere o rimuovere `awardPE()` senza action.  
4. `src/features/pulse/components/GlobalPERewardOverlay.tsx` — Solo se si vogliono rivedere dedupe/DEDUPE_MS/timeout (opzionale).  
5. `src/features/pulse/hooks/useAwardPE.ts` — Solo per eventuali nuovi action type o log (opzionale).

(PracticeMode è già stato toccato nel fix precedente.)

---

## 11. Blacklist assoluta dei file da non toccare

- IAP / StoreKit / receipts / purchase flow  
- Login / logout / delete-account  
- BUZZ / BUZZ MAP core (logica prezzo, shockwave, clue; non il singolo awardPE già presente)  
- Push native / BattlePush  
- Subscriptions  
- M1U global engine  
- Route / navigation  
- `claimDailyPhase` / Edge daily mission (reward M1U server-side)  
- File fuori dall’ambito PE reward / Home PE display / sync eventi PE

---

*Fine report. Nessuna modifica al codice; nessun commit; nessun push; nessun build; nessun cap sync. Solo lettura e documentazione.*
