# PE Fullscreen Reward + Pulse Bar Readability + BattlePush Error — FASE 0 Forensics (READ-ONLY)

**Data:** 2026-03-06  
**Scope:** Analisi forense reale su dispositivi iOS (Capacitor WKWebView). Nessuna modifica al codice. Solo lettura e report.

---

## 1. Executive Summary

- **Perché il fullscreen PE non appare nei test reali:** (1) **Battle:** il flusso attaccante chiama `awardPE` dopo un update diretto di `pulse_energy`; se l’RPC `award_pulse_energy` fallisce (es. conflitto, trigger DB), non si emette mai `emitPECreditEvent`. In più il **difensore** (BattleDefenseModal) aggiorna solo `profiles.pulse_energy` e **non chiama mai** `awardPE` né `emitPECreditEvent` → fullscreen PE **non coperto** per il difensore. (2) **Streak / daily login:** se il limite giornaliero è già raggiunto (`check_pe_daily_limit` → `can_award: false`), `awardPE` ritorna senza chiamare l’RPC e senza emettere evento → niente modale. (3) **Daily mission “commit”:** il completamento fase (claim-daily-phase) accredita solo M1U, **nessun PE** → fullscreen PE non previsto.
- **BattlePush:** l’errore viene da `sendBattleInvite` → Edge `battle-push-send` (notifica push all’avversario). Si verifica alla **creazione** dell’attacco, non alla risoluzione. **Nessun legame** con accredito PE o fullscreen reward.
- **Pulse Bar leggibilità:** sulla Home il valore PE è mostrato da **PulseBarPersonal** (testo piccolo `text-xs` / `text-[10px]`, contrasto basso `text-white/40`–`text-white/50`) e da **AgentEnergyPill** (solo icona rank + arco, **nessun numero PE** sulla pill; il numero è solo nel modale RankDetailModal al tap). Risultato: valore PE poco evidente e poco leggibile.

---

## 2. Inventario fonti PE reali

| File | Funzione / trigger | Accredito reale | Evento locale | Evento globale pe-credit-event | UI che reagisce | Copertura fullscreen PE |
|------|--------------------|-----------------|---------------|--------------------------------|-----------------|--------------------------|
| **useAwardPE** (chiamato da vari) | awardPE(action) | RPC `award_pulse_energy` | pe:awarded | emitPECreditEvent se delta > 0 | PulseBarPersonal, overlay | **Coperta** (se RPC ok) |
| StreakWidget | handleCheckIn | RPC via awardPE('DAILY_LOGIN') | pe:awarded | emitPECreditEvent(5, 'daily_login') | come sopra | **Coperta** (se limite non raggiunto) |
| BattleCreationForm | handleCountdownComplete | (1) Update diretto profiles.pulse_energy (stakePercent) (2) awardPE('BATTLE_WIN'/'BATTLE_LOSE') | pe:awarded (solo se RPC ok) | emitPECreditEvent(50, 'battle_win') solo se RPC ok e delta>0 | come sopra | **Parziale:** solo attaccante; RPC può fallire dopo update diretto |
| **BattleDefenseModal** | resolve (CONTROMISURE/RESA) | **Solo** update diretto profiles (defender + attacker) | **Nessuno** | **Mai** | — | **NON coperta** (difensore mai integrato) |
| useClueMilestones | claimMilestone | Update diretto profiles + emitPECreditEvent | — | emitPECreditEvent(milestone.pe, 'clue_milestone') | overlay | **Coperta** |
| OnboardingOverlay | awardPE (50 PE) | Update/rpc diretto + emit | — | emitPECreditEvent(50, 'onboarding') | overlay | **Coperta** |
| useBombMissionRun | finalizeRun | Edge + dispatch pe:awarded + emit | pe:awarded | emitPECreditEvent(res.delta_pe, 'vera_bomb') | overlay | **Coperta** |
| Buzz, Buzz Map, Pulse Breaker, Map time, AION, Forum | vari | RPC via awardPE | pe:awarded | emitPECreditEvent (in useAwardPE) | overlay | **Coperta** |
| Daily mission (claim-daily-phase) | complete_phase1/2 | Edge: solo M1U | — | — | — | **N/A** (nessun PE) |

---

## 3. Battle / M1SSION WAR forensic

### 3.1 Call graph Battle (attaccante)

1. **UI:** BattleCreationForm → utente avvia attacco → (sendBattleInvite → **BattlePush** qui può fallire) → countdown.
2. **Risoluzione:** handleCountdownComplete → `won` = random vs winChance.
3. **Aggiornamento PE (primo):** fetch profile → `newPE = won ? currentPE + stakePercent : currentPE - stakePercent` → `supabase.from('profiles').update({ pulse_energy: newPE })`. **Accredito reale già fatto qui (client-side).**
4. Toast vittoria/sconfitta.
5. Domination: log_battle_result RPC (opzionale).
6. **Award PE (secondo):** `awardPE('BATTLE_WIN' | 'BATTLE_LOSE', undefined, {...}).catch(...)`.  
   - useAwardPE chiama RPC `award_pulse_energy` con `p_delta_pe`: 50 (WIN) o -100 (LOSE).  
   - Se RPC **success:** dispatch `pe:awarded` + `emitPECreditEvent(delta, 'battle_win')` (solo se delta > 0, quindi solo WIN).  
   - Se RPC **fallisce:** nessun emit → **fullscreen non appare**, pur avendo l’utente già ricevuto PE dall’update diretto (e possibilmente doppio accredito se anche l’RPC va a buon fine).

### 3.2 Battle difensore (BattleDefenseModal)

- Risoluzione (CONTROMISURE o RESA): aggiornamento **solo** diretto di `profiles.pulse_energy` per difensore e attaccante (select + update).  
- **Nessuna** chiamata a `awardPE`, **nessun** `pe:awarded`, **nessun** `emitPECreditEvent`.  
- **Conclusione:** il flusso difensore **non è integrato** con il sistema fullscreen PE.

### 3.3 Verdetto Battle

- **Battle PE è integrata col fullscreen?** **Parziale.**
- **Attaccante:** sì, a patto che l’RPC `award_pulse_energy` vada a buon fine dopo l’update diretto (rischio di fallimento RPC o doppio accredito).
- **Difensore:** no; nessun evento PE globale emesso.
- **Motivo per cui l’utente potrebbe non vedere il modale:** (1) giocava come difensore, oppure (2) RPC `award_pulse_energy` fallisce (es. constraint, trigger, concorrenza) dopo l’update diretto, quindi nessun emit.

---

## 4. Streak / daily check-in / “commit” forensic

### 4.1 StreakWidget (daily check-in)

- **Trigger:** handleCheckIn (tap check-in nel widget).
- **Flusso:** update profiles (streak, last_check_in_date) → RPC award_xp → **awardPE('DAILY_LOGIN', undefined, {...}).catch(...)**.
- **useAwardPE:** DAILY_LOGIN ha `PE_DAILY_LIMITS['DAILY_LOGIN'] = 1`. Prima dell’RPC viene chiamato `check_pe_daily_limit`. Se `!limitCheck.can_award` → return con `limitReached: true` **senza** chiamare `award_pulse_energy` e **senza** emettere eventi → **fullscreen non appare**.
- **Quando il fullscreen appare:** solo al **primo** DAILY_LOGIN del giorno (limite 1). Se l’utente ha già fatto check-in oggi (o il limite è già consumato), nessun modale.

### 4.2 “Commit” giornaliero / daily mission

- **Completamento fase daily mission:** claimDailyPhase('complete_phase1' | 'complete_phase2') → Edge `claim-daily-phase` → reward **solo M1U** (admin_credit_m1u). **Nessun PE** in questo flusso.
- **Conclusione:** il “commit” della missione giornaliera **non** accredita PE → fullscreen PE **non** previsto.

### 4.3 Tabella riepilogativa

| Flusso | Reward reale PE | Fullscreen atteso | Fullscreen attuale | Root cause probabile |
|--------|------------------|-------------------|--------------------|-----------------------|
| Streak check-in (primo del giorno) | Sì (+5) | Sì | Sì (se RPC ok) | Limite giornaliero: dal secondo check-in stesso giorno niente evento. |
| Streak check-in (già fatto oggi) | No (bloccato da limite) | No | No | Comportamento corretto. |
| Daily mission complete phase | No (solo M1U) | No | No | Edge non accredita PE. |
| Battle attaccante WIN | Sì (update + RPC 50) | Sì | Solo se RPC ok | RPC può fallire; nessun emit su fallimento. |
| Battle difensore | Sì (solo update diretto) | Sì (se si volesse) | **No** | BattleDefenseModal non chiama awardPE né emitPECreditEvent. |

---

## 5. Global PE overlay forensic

### 5.1 Implementazione analizzata

- **peCreditEvent.ts:** `PE_CREDIT_EVENT = 'pe-credit-event'`; `emitPECreditEvent(amount, source, metadata)`; non emette se `amount <= 0` o `typeof window === 'undefined'`.
- **GlobalPERewardOverlay.tsx:** listener su `window` per `PE_CREDIT_EVENT`; stato `payload`; ref `animatingRef`, `lastIdRef`, `lastTimeRef`; `createPortal(modal, document.body)`; z-index 999998; safe-area; AUTO_CLOSE_MS 3500; DEDUPE_MS 2500.

### 5.2 Risposte puntuali

1. **Listener montato?** Sì, in App.tsx sotto AuthProvider (dopo GlobalM1UCreditOverlay).
2. **Provider corretti?** Sì, dentro AuthProvider.
3. **createPortal(document.body)?** Sì. In WKWebView document.body esiste; possibile (da verificare su device) che in alcuni contesti il portal non sia visibile (es. altro stacking context).
4. **Nome evento:** `pe-credit-event` usato in modo coerente (peCreditEvent.ts e GlobalPERewardOverlay).
5. **Payload amount > 0:** sì; emitPECreditEvent ha guard `amount <= 0`; overlay ha guard `!detail?.amount || detail.amount <= 0`.
6. **Guard che bloccano:** (1) `animatingRef.current === true` → ignora evento (un modale alla volta). (2) `lastIdRef.current === detail.id` → stesso evento. (3) `now - lastTimeRef.current < DEDUPE_MS` (2500 ms) → ignora eventi ravvicinati.
7. **Dedupe aggressiva:** 2.5 s di finestra: due reward PE a meno di 2.5 s → il secondo ignorato.
8. **Lock bloccato a true:** `animatingRef` viene messo a false solo in `close()` (tap “Continua” o timeout AUTO_CLOSE_MS). Se `close()` non viene chiamata (bug, o timeout non scatta), il lock resta true e i successivi eventi vengono ignorati.
9. **Overlay si chiude subito?** Solo se `close()` viene invocata (timeout 3.5 s o tap). Non c’è chiusura automatica legata alla navigazione; il timeout è gestito con setPayload(null) e clearTimeout.
10. **Z-index / safe-area:** z-index 999998; padding con env(safe-area-inset-*). Teoricamente sopra gli altri layer; da verificare su device se altri overlay (es. modale battle, video) hanno z-index maggiori o stacking context che coprono il portal.
11. **Timing:** AUTO_CLOSE_MS 3500; DEDUPE_MS 2500. Se un evento arriva mentre il modale è aperto → ignorato (animatingRef). Se arriva entro 2.5 s dalla chiusura → ignorato.
12. **Punti che emettono pe:awarded ma non emitPECreditEvent:** BattleDefenseModal non emette nessuno dei due. Onboarding, clue milestone, Vera Bomb emettono emitPECreditEvent. useAwardPE emette entrambi (pe:awarded + emitPECreditEvent) solo dopo RPC success e delta > 0.
13. **Sistema “globale” o parziale:** **Parzialmente integrato:** tutte le fonti che passano da useAwardPE (e le altre esplicitamente agganciate) emettono, ma (1) Battle difensore non emette, (2) se l’RPC fallisce (es. Battle attaccante) non si emette pur con PE già accreditati da update diretto.

### 5.3 Verdetto architettura

- **Architettura corretta ma incompleta:** sì.
- **Bug / blocchi:** (1) Battle difensore fuori dal sistema. (2) Battle attaccante: doppio scrittura (update + RPC) e possibile fallimento RPC dopo update → niente evento. (3) Streak: limite giornaliero può far sì che non si emetta pur avendo l’utente “fatto” il check-in (se già fatto oggi). (4) Dedupe/lock: eventi ravvicinati o lock non resettato possono nascondere il modale.

---

## 6. BattlePush error forensic

### 6.1 Origine

- **File:** `src/lib/battle/pushNotifications.ts`
- **Funzione:** `sendBattleInvite(opponentId, battleId, creatorName, ...)`
- **Chiamata:** da BattleCreationForm quando l’**attaccante** avvia l’attacco (prima del countdown), per inviare la push all’avversario.
- **Edge:** `supabase.functions.invoke('battle-push-send', { body: { defender_id, battle_id, ... } })`.

### 6.2 Errore

- `FunctionsHttpError` con `context: {}`: tipico fallimento HTTP della Edge (rete, timeout, 4xx/5xx, CORS, o errore interno Edge).
- **Momento:** alla **creazione** della battaglia (invio invito), non alla risoluzione (vittoria/sconfitta).

### 6.3 Relazione con PE / fullscreen

- **Collegato al fullscreen PE?** **No.** Il fullscreen PE si attiva alla **risoluzione** (handleCountdownComplete → awardPE). BattlePush avviene **prima** (invio invito).
- **Collegato all’accredito PE?** **No.** L’accredito PE avviene in handleCountdownComplete (update + awardPE). BattlePush non tocca profiles né RPC PE.
- **Impatto utente:** l’avversario potrebbe non ricevere la notifica push; la battaglia e i PE dell’attaccante procedono comunque.
- **Priorità fix:** **P2** (UX notifiche); non P0 per reward PE.

---

## 7. Pulse Bar readability forensic

### 7.1 Componenti sulla Home

- **PulseBarPersonal** (inline in CommandCenterHome): barra completa con gauge circolare, rank, livello, **valore PE**, barra a segmenti, “PE nel livello”, next rank.
- **AgentEnergyPill** (fixed bottom-right): pill circolare con icona rank e arco di progresso; **nessun numero PE** sulla pill; al tap apre RankDetailModal (dove compaiono i dettagli PE).

### 7.2 Dove viene mostrato il valore PE

- **PulseBarPersonal:**  
  - Label: `"PE:"` in `text-[10px] text-white/40`.  
  - Valore: `formatPE(pulseEnergy)` in `text-xs font-bold font-mono` con `color: rankColor`.  
  - Footer: `peInCurrentLevel / peNeededForLevel` e `peToNextLevel` in `text-[10px] text-white/50`.
- **AgentEnergyPill:** sulla pill non c’è testo PE; solo icona e arco. Il numero PE è solo in RankDetailModal (tap).

### 7.3 Diagnosi UI/UX

- **Cosa non si capisce / è debole:**  
  - Valore PE poco evidente: font piccolo (10px–12px), label “PE:” a basso contrasto (white/40), valore con colore rank (cyan) su sfondo scuro che può confondersi con altri elementi.  
  - AgentEnergyPill: l’utente non vede il numero PE senza aprire il modale; non c’è “PE” o cifra sulla pill.  
  - Footer PulseBarPersonal: “X / Y PE” e “Z per prossimo” in 10px e white/50 → scarsa leggibilità e gerarchia visiva.
- **Perché:** dimensioni ridotte, contrasto insufficiente, assenza di valore PE sulla pill principale.
- **Elementi deboli:** label “PE:” (10px, white/40), valore PE (text-xs), footer (10px, white/50), pill senza numero.
- **Campi mal presentati / assenti:** sulla pill non è chiaro “quanto PE ho” senza tap; sulla barra il rapporto “livello / massimo / prossimo rank” è compresso e poco leggibile.

### 7.4 Verdetto

- **La Pulse Bar attuale è leggibile per un utente medio?** **Parzialmente no:** valore PE poco in evidenza; pill senza numero; testi piccoli e contrasto basso.

---

## 8. Risposte operative finali

1. **Perché il fullscreen PE non appare nei test reali?**  
   - Battle: (a) difensore non emette mai evento; (b) attaccante: RPC dopo update diretto può fallire → nessun emit.  
   - Streak: limite 1/giorno → dal secondo check-in nessun evento.  
   - Daily “commit”: nessun PE, quindi nessun fullscreen previsto.

2. **Quali fonti PE sono davvero coperte oggi?**  
   Tutte quelle che chiamano `emitPECreditEvent` dopo accredito confermato: useAwardPE (con RPC ok), clue milestone, onboarding, Vera Bomb. Streak (solo primo DAILY_LOGIN del giorno). Battle **solo lato attaccante** e solo se RPC award_pulse_energy riesce.

3. **Quali fonti PE reali NON sono coperte?**  
   **BattleDefenseModal** (difensore): accredito PE con update diretto, zero eventi. Eventuali altri flussi che aggiornano solo `profiles.pulse_energy` senza chiamare awardPE/emitPECreditEvent.

4. **Battle / M1SSION WAR è integrata correttamente?**  
   **No, solo in parte:** attaccante sì (a patto che RPC non fallisca); difensore no (nessuna integrazione).

5. **Streak / daily check-in è integrato correttamente?**  
   **Sì**, per il primo check-in del giorno; dal secondo dello stesso giorno il limite blocca l’RPC e quindi nessun evento (comportamento coerente con il limite).

6. **Il problema è di:**  
   - **Evento non emesso:** sì (difensore; attaccante se RPC fallisce; streak se limite raggiunto).  
   - **Listener non montato:** no.  
   - **Dedupe/lock:** possibile (eventi ravvicinati o lock non resettato).  
   - **Overlay/z-index:** da verificare su device (portal su body, z-index alto).  
   - **Sorgenti fuori copertura:** sì (BattleDefenseModal).

7. **L’errore BattlePush è collegato al reward system?**  
   **No.** Riguarda solo l’invio della push all’avversario alla creazione battaglia.

8. **La Pulse Bar attuale è leggibile per un utente normale?**  
   **Solo in parte:** valore PE poco evidente; pill senza numero; testi piccoli e contrasto insufficiente.

9. **File da toccare in una futura FASE 1 FIX mirata:**  
   - BattleDefenseModal: dopo update PE, chiamare awardPE o almeno emitPECreditEvent per il difensore (e eventualmente attaccante lato difensore).  
   - BattleCreationForm: valutare un solo canale di accredito (solo RPC o solo update) e emettere evento in modo coerente; in alternativa emettere emitPECreditEvent anche in caso di update diretto riuscito se l’RPC non viene usato.  
   - PulseBarPersonal / AgentEnergyPill: aumentare dimensione e contrasto del valore PE; mostrare il numero PE anche sulla pill (es. sotto l’icona o in badge).  
   - GlobalPERewardOverlay: eventuale review di dedupe/lock e timeout (e comportamento su route change/unmount).

10. **Soluzione architetturale più sicura:**  
    - **Unificare l’accredito PE:** una sola “porta” (RPC o update verificato) per ogni flusso; dopo conferma, un solo punto emette `emitPECreditEvent`.  
    - **Integrare il difensore:** in BattleDefenseModal, dopo l’update diretto di PE, emettere `emitPECreditEvent(amount, 'battle_defense_win' | 'battle_defense_lose', { preValue, postValue })` senza dipendere da awardPE (per evitare doppio accredito).  
    - **Battle attaccante:** rimuovere l’update diretto e usare solo awardPE, oppure mantenere solo l’update diretto ed emettere l’evento lato client dopo update riuscito (senza RPC aggiuntivo).  
    - **Pulse Bar:** migliorare contrasto, dimensioni e posizionamento; esporre il valore PE sulla pill senza obbligo di aprire il modale.

---

## 9. Whitelist futura per fix

- **Da toccare (fix fullscreen + leggibilità):**  
  - `src/features/pulse/components/GlobalPERewardOverlay.tsx` (eventuale review lock/dedupe)  
  - `src/features/pulse/peCreditEvent.ts` (solo se si aggiungono source/types)  
  - `src/components/battle/BattleDefenseModal.tsx` (emissione evento PE dopo update)  
  - `src/components/battle/BattleCreationForm.tsx` (allineare accredito e evento; evitare doppio accredito)  
  - `src/features/pulse/components/PulseBarPersonal.tsx` (leggibilità: font, contrasto, layout)  
  - `src/features/pulse/components/AgentEnergyPill.tsx` (mostrare valore PE sulla pill)  
  - `src/features/pulse/styles/pulse-pill.css` (se servono stili per la pill)

- **Da valutare (no cambiamenti critici):**  
  - `src/features/pulse/hooks/useAwardPE.ts` (solo se si sposta logica emit in un unico posto)  
  - `src/components/gamification/StreakWidget.tsx` (solo se si vuole messaggio UX quando limite raggiunto)

---

## 10. Blacklist assoluta (da non toccare)

- IAP / StoreKit / receipts / purchase flow  
- Login / logout / auth flow  
- Delete-account  
- BUZZ / BUZZ MAP (logica core)  
- Push native (configurazione; BattlePush fix può toccare solo `pushNotifications.ts` e Edge)  
- Subscriptions  
- Motore globale M1U (m1uCreditEvent, GlobalM1UCreditOverlay, M1UPill)  
- claim-daily-phase (reward M1U; nessun PE da aggiungere senza specifica richiesta)

---

Fine report forense. Nessuna modifica al codice; solo analisi e documentazione.
