# PE Flow Master Audit — Chi assegna davvero i PE, chi no, e come unificare

**Data:** 2026-03-07  
**Tipo:** Forensics read-only. Nessuna modifica al codice.  
**Scope:** Tutti i flussi PE nell’app (iOS Capacitor WKWebView).  
**Obiettivo:** Mappa definitiva e non ambigua per unificare il sistema PE.

---

## 1. Executive Summary

- **Canale unico “ufficiale”:** `useAwardPE` → `awardPE(action)` → RPC `award_pulse_energy` → dispatch `pe:awarded` + (se delta > 0) `emitPECreditEvent`. Solo i flussi che passano da qui hanno accredito coerente, eventi globali e possibilità di aprire il fullscreen PE.
- **Flussi che assegnano PE reali oggi:** (A) BUZZ, BUZZ MAP, StreakModal, StreakWidget, BattleCreationForm (attaccante), Map time (4min/10min), Pulse Breaker (play/win), AION chat, Forum (post/comment), Onboarding (update diretto), PracticeMode (update diretto), BattleDefenseModal (update diretto), Clue milestone (update diretto), Vera Bomb (RPC server + emit client).
- **Flussi che NON assegnano PE:** Daily Mission (claimDailyPhase) accredita solo M1U lato server; Fortune Wheel accredita M1U/PE lato Edge ma il client emette solo M1U → per segmenti PE il fullscreen PE **non** si apre.
- **Doppio canale:** Diversi flussi usano **update diretto** su `profiles.pulse_energy` (BattleDefenseModal, PracticeMode, Clue milestone, Onboarding) invece di `awardPE`. Alcuni di questi poi emettono `emitPECreditEvent` (e a volte `pe:awarded`), altri no → incoerenza e rischio doppia scrittura se in futuro si aggiunge anche awardPE.
- **UI cosmetiche:** StreakWidget mostra ancora “PE Bonus +X%” (percentuale da xp_multiplier) accanto al check-in che accredita 10 PE via awardPE. StreakModal dopo il fix mostra “+10 PE” reale.
- **Strategia consigliata:** Un solo canale per tutti i PE: far passare tutto da `awardPE` (o da un wrapper che scrive solo via RPC e poi emette eventi). Eliminare gli update diretti su `pulse_energy` dove possibile; per RPC server-only (Vera Bomb, eventuale wheel PE) mantenere emit manuale di `pe:awarded` + `emitPECreditEvent` dopo risposta.

---

## 2. Inventario completo PE

Risultati grep e lettura codice sui termini richiesti.

### 2.1 Chiamate a `awardPE(`

| File | Funzione / contesto | Action | Note |
|------|---------------------|--------|------|
| `StreakWidget.tsx` | handleCheckIn | DAILY_LOGIN | Dopo update profile e award_xp. |
| `StreakModal.tsx` | handleCheckIn | DAILY_LOGIN | Dopo award_xp; .catch non bloccante. |
| `useMapTimeTracking.ts` | checkMilestones | MAP_TIME_240S, MAP_TIME_600S | 4 min +15 PE, 10 min +30 PE. |
| `PulseBreaker.tsx` | post-game | PULSE_BREAKER_PLAY, PULSE_BREAKER_WIN | Partecipazione + vittoria. |
| `useIntelAnalyst.ts` | (dopo analisi AION) | AION_CHAT | .catch non bloccante. |
| `useBuzzHandler.ts` | handleBuzz (dopo clue) | BUZZ_CLICK | .catch non bloccante. |
| `BuzzMapButtonSecure.tsx` | (azione mappa) | BUZZ_MAP_CLICK | |
| `useForum.ts` | createPost, addComment | FORUM_POST, FORUM_COMMENT | .catch non bloccante. |
| `BattleCreationForm.tsx` | handleCountdownComplete (dopo battaglia) | BATTLE_WIN / BATTLE_LOSE | Solo lato attaccante. |
| `OnboardingOverlay.tsx` | — | **Nessuna** | Usa nome locale `awardPE` ma è una funzione interna che fa update diretto + emit, **non** useAwardPE. |

### 2.2 `useAwardPE` (chi usa l’hook)

Usato in: StreakModal, StreakWidget, useForum, useIntelAnalyst, useBuzzHandler, BuzzMapButtonSecure, BattleCreationForm, useMapTimeTracking, PulseBreaker.  
**Non** usato in: OnboardingOverlay, BattleDefenseModal, PracticeMode, useClueMilestones, useBombMissionRun (Vera).

### 2.3 RPC `award_pulse_energy`

- **Chiamata client:** solo da `useAwardPE.ts` (riga 172) dopo check limite giornaliero.
- **Chiamate server:** migration/trigger buzz, buzz_map; `finalize_vera_mission_run`; altre migration (leaderboard/battle, ecc.). Il client non chiama l’RPC fuori da useAwardPE.

### 2.4 Update diretto `profiles.pulse_energy`

| File | Contesto | Come |
|------|----------|------|
| `OnboardingOverlay.tsx` | CelebrationOverlay | .update({ pulse_energy: (profile.pulse_energy \|\| 0) + 50 }) (fallback; primo tentativo con RPC inside update è invalido). |
| `BattleDefenseModal.tsx` | handleDefenseResult, handleSurrender | .update({ pulse_energy: defenderNewPE }) e .update({ pulse_energy: attackerNewPE }). |
| `PracticeMode.tsx` | updateBalanceAsync | .update({ [field]: newBalance }) con field = 'pulse_energy' per stake PE. |
| `useClueMilestones.ts` | claim milestone | .update({ pulse_energy: newPEBalance }) con newPEBalance = (profile.pulse_energy \|\| 0) + milestone.pe. |

### 2.5 `pe:awarded`

- **useAwardPE.ts:** dispatch dopo successo RPC award_pulse_energy.
- **PracticeMode.tsx:** dispatch dopo updateBalanceAsync (stake PE, vittoria).
- **useBombMissionRun.ts:** dispatch dopo finalize_vera_mission_run (res.delta_pe).
- **PulseBarPersonal.tsx:** solo listener.

### 2.6 `emitPECreditEvent`

- **useAwardPE.ts:** se delta > 0 dopo RPC success.
- **BattleDefenseModal.tsx:** se defender vince e peAmount > 0 (dopo update diretto).
- **PracticeMode.tsx:** dopo update + pe:awarded (stake PE win).
- **useClueMilestones.ts:** se milestone.pe > 0 dopo update diretto.
- **OnboardingOverlay.tsx:** 50 PE dopo update diretto (fallback).
- **useBombMissionRun.ts:** se res.delta_pe > 0 dopo RPC finalize.

### 2.7 `PE_CREDIT_EVENT` / GlobalPERewardOverlay

- **peCreditEvent.ts:** definisce `PE_CREDIT_EVENT = 'pe-credit-event'`; `emitPECreditEvent` fa dispatch.
- **GlobalPERewardOverlay.tsx:** ascolta `PE_CREDIT_EVENT`; se amount > 0 e supera guard/dedupe, mostra modale fullscreen.

### 2.8 DAILY_LOGIN, streak, PE Bonus UI

- **DAILY_LOGIN:** PE_VALUES = 10, PE_DAILY_LIMITS = 1. Chiamato da StreakModal e StreakWidget.
- **StreakModal:** mostra `t('streak_pe_bonus_amount')` → "+10 PE" (testo reale dopo fix).
- **StreakWidget:** mostra "PE Bonus" + "+{Math.round((xp_multiplier-1)*100)}%" (cosmetico; l’accredito reale è 10 PE via awardPE).

---

## 3. Classificazione A/B/C/D per ogni flusso

### CATEGORIA A — Assegna PE reali via awardPE / RPC

| Flusso | File principale | Evidenza |
|--------|-----------------|----------|
| BUZZ | useBuzzHandler.ts | awardPE('BUZZ_CLICK', …) → useAwardPE → RPC award_pulse_energy. |
| BUZZ MAP | BuzzMapButtonSecure.tsx | awardPE('BUZZ_MAP_CLICK', …). |
| StreakWidget | StreakWidget.tsx | awardPE('DAILY_LOGIN', …). |
| StreakModal | StreakModal.tsx | awardPE('DAILY_LOGIN', …). |
| Map time 4min/10min | useMapTimeTracking.ts | awardPE('MAP_TIME_240S'/'MAP_TIME_600S', …). |
| Pulse Breaker | PulseBreaker.tsx | awardPE('PULSE_BREAKER_PLAY'), awardPE('PULSE_BREAKER_WIN'). |
| AION chat | useIntelAnalyst.ts | awardPE('AION_CHAT', …). |
| Forum post/comment | useForum.ts | awardPE('FORUM_POST'), awardPE('FORUM_COMMENT'). |
| Battle attaccante | BattleCreationForm.tsx | awardPE('BATTLE_WIN'/'BATTLE_LOSE', …). |
| Vera Bomb | useBombMissionRun.ts | RPC finalize_vera_mission_run (server chiama award_pulse_energy); client emette pe:awarded + emitPECreditEvent. |

### CATEGORIA B — Assegna PE reali via update diretto

| Flusso | File | Evidenza |
|--------|------|----------|
| Onboarding | OnboardingOverlay.tsx | .update({ pulse_energy: (profile.pulse_energy \|\| 0) + 50 }); poi emitPECreditEvent(50, 'onboarding'). **Non** pe:awarded. |
| PracticeMode | PracticeMode.tsx | updateBalanceAsync → .update({ pulse_energy }); poi pe:awarded + emitPECreditEvent. |
| BattleDefenseModal | BattleDefenseModal.tsx | .update({ pulse_energy: defenderNewPE/attackerNewPE }); se defender vince, emitPECreditEvent. **Non** pe:awarded per difensore. |
| Clue milestone | useClueMilestones.ts | .update({ pulse_energy: newPEBalance }); se milestone.pe > 0, emitPECreditEvent. **Non** pe:awarded. |

### CATEGORIA C — Non assegna PE reali, mostra UI/testi/bonus PE

| Flusso | File | Evidenza |
|--------|------|----------|
| StreakWidget box “PE Bonus” | StreakWidget.tsx | Label "PE Bonus" + "+{xp_multiplier*100-100}%". Solo descrittivo; l’accredito è 10 PE fissi via awardPE. |
| Daily Mission | claimDailyPhase, DailyMissionCard | Server Edge claim-daily-phase; reward in UI è M1U (reward_p1, reward_p2, total M1U). **Nessun** PE client-side. |
| Fortune Wheel (segmenti PE) | FortuneWheel.tsx | Edge spin-wheel può accreditare PE lato server; client su result fa solo emitM1UCreditEvent(credited_amount) e toast M1U. **Nessun** emitPECreditEvent per PE → fullscreen PE **non** si apre per vincite PE. |

### CATEGORIA D — Non c’entra con i PE

| Flusso | Note |
|--------|------|
| claimDailyPhase / Daily Mission | Accredita solo M1U (Edge); nessun pulse_energy. |
| M1U reward ovunque | M1U Bonus, shop, wheel M1U, ecc. |
| Rank/XP | award_xp, rank_id, recompute_rank non sono PE. |

---

## 4. Tabella madre “Chi assegna PE e chi no”

| Flusso | File | Funzione | Assegna PE reali? | Metodo | Emette pe:awarded? | Emette pe-credit-event? | Fullscreen PE possibile? | Note critiche |
|--------|------|----------|-------------------|--------|--------------------|--------------------------|---------------------------|----------------|
| BUZZ | useBuzzHandler.ts | handleBuzz | **SÌ** | awardPE → RPC | **SÌ** | **SÌ** | **SÌ** | Limite 5/giorno. |
| BUZZ MAP | BuzzMapButtonSecure.tsx | (handler click) | **SÌ** | awardPE → RPC | **SÌ** | **SÌ** | **SÌ** | Limite 3/giorno. |
| StreakWidget | StreakWidget.tsx | handleCheckIn | **SÌ** | awardPE('DAILY_LOGIN') | **SÌ** | **SÌ** | **SÌ** | Non montato su Home; 10 PE. |
| StreakModal | StreakModal.tsx | handleCheckIn | **SÌ** | awardPE('DAILY_LOGIN') | **SÌ** | **SÌ** | **SÌ** | 10 PE, 1/giorno. |
| BattleCreationForm | BattleCreationForm.tsx | handleCountdownComplete | **SÌ** | awardPE(BATTLE_WIN/LOSE) | **SÌ** | **SÌ** (se win) | **SÌ** (win) | Solo attaccante. |
| BattleDefenseModal | BattleDefenseModal.tsx | handleDefenseResult / handleSurrender | **SÌ** | Update diretto profiles.pulse_energy | **NO** | **SÌ** (solo se defender vince) | **SÌ** (difensore win) | Difensore: nessun pe:awarded. |
| PracticeMode | PracticeMode.tsx | (flash result, stake PE) | **SÌ** | Update diretto pulse_energy | **SÌ** | **SÌ** | **SÌ** | Stake PE; win 2x. |
| Pulse Breaker | PulseBreaker.tsx | (post game) | **SÌ** | awardPE(PLAY/WIN) | **SÌ** | **SÌ** | **SÌ** | |
| Map time 4min/10min | useMapTimeTracking.ts | checkMilestones | **SÌ** | awardPE(MAP_TIME_240S/600S) | **SÌ** | **SÌ** | **SÌ** | 1/giorno ciascuno. |
| AION chat | useIntelAnalyst.ts | (dopo analisi) | **SÌ** | awardPE('AION_CHAT') | **SÌ** | **SÌ** | **SÌ** | |
| Forum post | useForum.ts | createPost | **SÌ** | awardPE('FORUM_POST') | **SÌ** | **SÌ** | **SÌ** | |
| Forum comment | useForum.ts | addComment | **SÌ** | awardPE('FORUM_COMMENT') | **SÌ** | **SÌ** | **SÌ** | |
| Clue milestone | useClueMilestones.ts | checkAndClaimMilestones | **SÌ** | Update diretto pulse_energy | **NO** | **SÌ** | **SÌ** | |
| Onboarding | OnboardingOverlay.tsx | CelebrationOverlay awardPE locale | **SÌ** | Update diretto (fallback) | **NO** | **SÌ** | **SÌ** | Nessun pe:awarded → Home solo Realtime. |
| Vera Bomb | useBombMissionRun.ts | finalizeRun | **SÌ** | RPC finalize (server award_pulse_energy) | **SÌ** | **SÌ** (se delta_pe>0) | **SÌ** | |
| Daily Mission | claimDailyPhase.ts, modali mission | — | **NO — NON ASSEGNA PE REALI** | Solo M1U server | **NO** | **NO** | **NO** | Reward solo M1U. |
| Fortune Wheel | FortuneWheel.tsx | handleSpin | **Server può dare PE; client no** | Edge spin-wheel; client solo M1U emit | **NO** | **NO** (per PE) | **NO** | Client emette solo M1U; segmenti PE non aprono fullscreen. |
| StreakWidget “PE Bonus %” | StreakWidget.tsx | UI | **NO — SOLO COSMETICO** | Nessuno | — | — | — | Percentuale xp_multiplier. |

Azioni in PE_VALUES/PE_DAILY_LIMITS ma **non** invocate nei flussi client auditi: MARKER_CLAIM, REFERRAL_SIGNUP, FINAL_SHOOT_WIN, COUNTRY_CONQUEST (mapping presente; eventuale uso altrove non verificato in questo audit).

---

## 5. Call graph flussi reali

### BUZZ

1. Utente completa BUZZ → handleBuzz (useBuzzHandler).
2. Dopo ricezione clue_text: awardPE('BUZZ_CLICK', undefined, { price }).
3. useAwardPE: PE_VALUES.BUZZ_CLICK = 10; check_pe_daily_limit(5); RPC award_pulse_energy(10, 'BUZZ_CLICK', …).
4. Success: pe:awarded; emitPECreditEvent(10, 'buzz_click', …).
5. GlobalPERewardOverlay riceve pe-credit-event → fullscreen possibile.
6. Home: refetch su pe:awarded (PulseBarPersonal, useHierarchyRank) + Realtime.

### DAILY LOGIN (StreakModal / StreakWidget)

1. Check-in giornaliero in StreakModal o StreakWidget → handleCheckIn.
2. Update profile (streak, last_check_in_date); award_xp; awardPE('DAILY_LOGIN', undefined, { streakDays, streakBroken }).
3. useAwardPE: 10 PE; check_pe_daily_limit(1); RPC award_pulse_energy(10, 'DAILY_LOGIN', …).
4. Success: pe:awarded; emitPECreditEvent(10, 'daily_login', …).
5. Fullscreen possibile. Guard: limite 1/giorno può bloccare prima dell’RPC.

### BattleCreationForm (attaccante)

1. Fine countdown → handleCountdownComplete; update battle_sessions; se stake PE, awardPE('BATTLE_WIN' o 'BATTLE_LOSE', …).
2. useAwardPE: 50 / -100; nessun daily limit; RPC award_pulse_energy.
3. Success + delta > 0 (solo win): pe:awarded; emitPECreditEvent(50, 'battle_win', …).
4. Fullscreen possibile solo in vittoria.

### BattleDefenseModal (difensore)

1. handleDefenseResult / handleSurrender: fetch profile pulse_energy; calcolo defenderNewPE/attackerNewPE; .update({ pulse_energy }) per entrambi.
2. **Non** awardPE; **non** pe:awarded.
3. Se defender vince e peAmount > 0: emitPECreditEvent(peAmount, 'battle_defense_win', …).
4. Fullscreen possibile per difensore vincente. Home aggiornata solo da Realtime (nessun pe:awarded).

### PracticeMode

1. Vittoria con stake PE: payout = 2*stake; updateBalanceAsync('PE', newBalance) → .update({ pulse_energy: newBalance }).
2. Dopo update: pe:awarded; emitPECreditEvent(payout, 'practice_mode_win', …).
3. Fullscreen possibile. Nessun awardPE; nessun RPC.

### Map time

1. useMapTimeTracking: interval checkMilestones; a 240s awardPE('MAP_TIME_240S'); a 600s awardPE('MAP_TIME_600S').
2. useAwardPE → RPC → pe:awarded + emitPECreditEvent.
3. Fullscreen possibile. Limite 1/giorno per azione.

### Pulse Breaker

1. Dopo partita: awardPE('PULSE_BREAKER_PLAY'); se win awardPE('PULSE_BREAKER_WIN').
2. useAwardPE → RPC → pe:awarded + emitPECreditEvent.
3. Fullscreen possibile.

### Clue milestone

1. checkAndClaimMilestones: fetch profile; newPEBalance = pulse_energy + milestone.pe; .update({ pulse_energy: newPEBalance }).
2. Se milestone.pe > 0: emitPECreditEvent(milestone.pe, 'clue_milestone', …).
3. **Nessun** pe:awarded. Fullscreen possibile. Home solo Realtime/refetch indiretto.

### Onboarding

1. CelebrationOverlay: funzione locale awardPE: tentativo update con RPC inside (invalido); fallback .update({ pulse_energy: current + 50 }); emitPECreditEvent(50, 'onboarding').
2. **Nessun** pe:awarded. Fullscreen possibile. Home solo Realtime.

### Vera Bomb

1. finalizeRun: supabase.rpc('finalize_vera_mission_run', …); server chiama award_pulse_energy; response con delta_pe, old_pe, new_pe.
2. Client: pe:awarded (detail con res); se res.delta_pe > 0 emitPECreditEvent(res.delta_pe, 'vera_bomb', …).
3. Fullscreen possibile. Nessun useAwardPE client; accredito solo server.

---

## 6. Flussi/UI che sembrano dare PE ma non li danno davvero (o non emettono)

### 6.1 StreakWidget — “PE Bonus +X%”

- **File:** `StreakWidget.tsx` (grid Bonuses).
- **Testo UI:** "PE Bonus" + "+{Math.round((streakInfo?.xp_multiplier || 1) * 100 - 100)}%".
- **Logica:** xp_multiplier da stato streak; **non** usato per accredito. L’accredito è 10 PE fissi via awardPE('DAILY_LOGIN').
- **Perché cosmetico:** La percentuale è solo descrittiva; non modifica il delta PE.
- **Rischio UX:** L’utente può pensare che il bonus % sia il reward; in realtà è +10 PE fissi.

### 6.2 Daily Mission — reward “P1/P2/totale”

- **File:** DailyMissionCard, claimDailyPhase.
- **Testo UI:** "+X M1U" per P1, P2, totale.
- **Logica:** Edge claim-daily-phase accredita M1U; **nessun** PE.
- **Perché non PE:** Il flusso è solo M1U.
- **Rischio UX:** Basso; le label sono M1U. PE_VALUES.DAILY_MISSION esiste ma non è usato da claimDailyPhase.

### 6.3 Fortune Wheel — segmenti PE

- **File:** FortuneWheel.tsx.
- **Testo UI:** Segmenti tipo "+50 PE", "+200 PE"; getResultMessage può mostrare "PE sbloccati".
- **Logica:** Edge spin-wheel può accreditare PE lato DB; client su result fa solo `emitM1UCreditEvent(data.credited_amount, 'wheel')` e toast M1U.
- **Perché fullscreen non si apre:** Il client **non** chiama emitPECreditEvent per reward_type PE; non c’è pe:awarded per PE.
- **Rischio UX:** Se il server accredita PE, l’utente non vede il fullscreen PE e può non accorgersi del credito fino a Realtime/refetch.

### 6.4 StreakModal (storico)

- Dopo il fix: accredita 10 PE e mostra "+10 PE". Non è più “solo cosmetico”.

---

## 7. Eventi globali PE — tabella dedicata

| Flusso | PE reali? | pe:awarded | pe-credit-event | Home refetch immediato? | Fullscreen PE? | Problema |
|--------|-----------|------------|------------------|--------------------------|----------------|----------|
| BUZZ | **SÌ** | **SÌ** | **SÌ** | **SÌ** (listener pe:awarded) | **SÌ** | — |
| BUZZ MAP | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| StreakModal | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| StreakWidget | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| BattleCreationForm | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** (win) | — |
| BattleDefenseModal | **SÌ** | **NO** | **SÌ** (defender win) | Solo Realtime | **SÌ** (defender win) | Difensore: nessun pe:awarded. |
| PracticeMode | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| Map time | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| Pulse Breaker | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| AION / Forum | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| Clue milestone | **SÌ** | **NO** | **SÌ** | Solo Realtime | **SÌ** | Nessun pe:awarded. |
| Onboarding | **SÌ** | **NO** | **SÌ** | Solo Realtime | **SÌ** | Nessun pe:awarded. |
| Vera Bomb | **SÌ** | **SÌ** | **SÌ** | **SÌ** | **SÌ** | — |
| Daily Mission | **NO** | **NO** | **NO** | — | **NO** | Solo M1U. |
| Fortune Wheel (PE) | Server sì, client no emit | **NO** | **NO** | — | **NO** | Client non emette per PE. |

---

## 8. Problemi architetturali reali

### 8.1 Doppio canale di accredito

- **Descrizione:** Parte dei flussi usa RPC `award_pulse_energy` (useAwardPE), altri usano `.update({ pulse_energy })` diretto.
- **File:** useAwardPE.ts vs OnboardingOverlay, BattleDefenseModal, PracticeMode, useClueMilestones.
- **Impatto:** Logica duplicata; limiti/rank potrebbero non essere applicati negli update diretti; rischio incoerenza se si aggiunge awardPE anche dove si fa già update.
- **Probabilità:** Alta.

### 8.2 Flussi che assegnano PE ma non emettono pe:awarded

- **Descrizione:** BattleDefenseModal (difensore), Clue milestone, Onboarding aggiornano PE ma non fanno dispatch di `pe:awarded`.
- **Impatto:** PulseBarPersonal / useHierarchyRank che ascoltano pe:awarded non refetchano subito; l’utente vede l’aggiornamento solo con Realtime o al prossimo refresh.
- **Probabilità:** Certa.

### 8.3 Fullscreen dipende solo da emitPECreditEvent

- **Descrizione:** GlobalPERewardOverlay ascolta solo `pe-credit-event`. Se un flusso accredita PE ma non emette (es. wheel PE lato server senza emit client), il fullscreen non si apre.
- **Impatto:** Esperienza incoerente tra flussi.
- **Probabilità:** Certa per Fortune Wheel PE.

### 8.4 Bonus “PE” puramente cosmetici

- **Descrizione:** StreakWidget mostra "PE Bonus +X%" che non corrisponde a un accredito variabile; l’accredito è 10 PE fissi.
- **Impatto:** Possibile confusione su cosa si riceve davvero.
- **Probabilità:** Media.

### 8.5 Onboarding: tentativo di update con RPC inside

- **Descrizione:** ` .update({ pulse_energy: supabase.rpc('increment_pulse_energy', { amount: 50 }) })` assegna alla colonna un valore non numerico (Promise/oggetto).
- **Impatto:** Primo tentativo probabilmente fallisce; si usa sempre il fallback (update diretto). Codice fuorviante.
- **Probabilità:** Alta.

### 8.6 Daily Mission: PE_VALUES.DAILY_MISSION non usato

- **Descrizione:** claimDailyPhase non chiama awardPE; DAILY_MISSION (50 PE) è definito ma non usato dal flusso daily mission.
- **Impatto:** Se si voleva dare PE per la missione del giorno, non avviene.
- **Probabilità:** Certa.

---

## 9. Strategia per unificare il sistema PE (solo analisi)

### 9.1 Punto unico per tutti i PE

- **Opzione consigliata:** Un solo canale client per l’accredito: **solo** `awardPE` (useAwardPE → RPC `award_pulse_energy`).  
- Per RPC solo server (Vera Bomb, eventuale wheel): il server accredita; il client dopo la risposta deve emettere **sempre** `pe:awarded` + `emitPECreditEvent` se delta > 0, così overlay e Home restano coerenti.  
- **Non** introdurre un secondo “orchestratore” se non necessario; estendere useAwardPE per le action mancanti (es. CUSTOM per onboarding/milestone) dove ha senso, oppure mantenere emit manuale solo per i casi server-only.

### 9.2 Flussi da riallineare

- **BattleDefenseModal:** sostituire update diretto con awardPE (o RPC dedicato) e usare un’action tipo BATTLE_DEFENSE_WIN/LOSE; oppure mantenere update diretto ma aggiungere **sempre** pe:awarded dopo update (per difensore e attaccante quando ricevono PE).
- **PracticeMode:** opzione A) passare a awardPE con action CUSTOM e customAmount = payout (così rank/limit centralizzati); opzione B) lasciare update diretto ma garantire pe:awarded + emit (già fatto).
- **Clue milestone:** opzione A) awardPE con action CUSTOM e customAmount = milestone.pe (e rimuovere update diretto); opzione B) lasciare update diretto e aggiungere dispatch pe:awarded dopo emitPECreditEvent.
- **Onboarding:** usare awardPE con action CUSTOM, customAmount = 50 (e rimuovere update diretto e RPC inside update); oppure correggere il flusso e aggiungere pe:awarded dopo emit.
- **Fortune Wheel:** se l’Edge accredita PE, nella response il client deve ricevere amount/type; se reward_type === 'pe' e amount > 0, chiamare emitPECreditEvent(amount, 'fortune_wheel', …) e opzionalmente pe:awarded.

### 9.3 Flussi da lasciare stare (o toccare solo emit)

- BUZZ, BUZZ MAP, StreakModal, StreakWidget, Map time, Pulse Breaker, AION, Forum, BattleCreationForm: già allineati a awardPE.
- Vera Bomb: tenere RPC server + emit client; nessun awardPE client.

### 9.4 Come ottenere coerenza

- **Accredito:** Tutti i PE client-side passano da RPC `award_pulse_energy` (tramite awardPE) dove possibile; eccezione: flussi server-only che emettono dopo risposta.
- **pe:awarded:** Ogni flusso che modifica pulse_energy (client o dopo risposta server) deve emettere pe:awarded dopo conferma, così PulseBarPersonal/useHierarchyRank refetchano.
- **Fullscreen:** Ogni flusso che accredita PE con delta > 0 deve chiamare emitPECreditEvent; nessun altro requisito per il fullscreen.
- **Sync Home:** Garantito da listener pe:awarded + eventuale Realtime.
- **Eliminazione bonus fake:** Sostituire "PE Bonus +X%" in StreakWidget con valore reale (es. "+10 PE") come in StreakModal; oppure rimuovere il box se ridondante.

---

## 10. Top 10 file da toccare in una futura implementazione

1. **useAwardPE.ts** — Aggiungere supporto CUSTOM/parametri per onboarding e milestone; eventuale BATTLE_DEFENSE_* se si unifica battle.
2. **BattleDefenseModal.tsx** — Sostituire update diretto con awardPE o aggiungere pe:awarded dopo update.
3. **PracticeMode.tsx** — Opzionale: usare awardPE(CUSTOM, payout) invece di update diretto; altrimenti lasciare e solo verificare emit.
4. **useClueMilestones.ts** — Opzionale: awardPE(CUSTOM, milestone.pe) e rimuovere update; altrimenti aggiungere pe:awarded.
5. **OnboardingOverlay.tsx** — Rimuovere update/RPC errato; usare awardPE(CUSTOM, 50) o aggiungere pe:awarded.
6. **FortuneWheel.tsx** — Se spin-wheel ritorna reward_type e amount PE, chiamare emitPECreditEvent (e opzionale pe:awarded).
7. **StreakWidget.tsx** — Allineare box "PE Bonus" a testo reale (+10 PE) o rimuovere percentuale.
8. **peCreditEvent.ts** — Solo estensioni tipo source; nessun cambio architetturale.
9. **GlobalPERewardOverlay.tsx** — Solo eventuali aggiustamenti dedupe/timeout; nessun cambio di canale.
10. **useHierarchyRank.ts / PulseBarPersonal.tsx** — Verificare che refetch su pe:awarded copra tutti i flussi che emettono.

---

## 11. Blacklist assoluta dei file da non toccare

- IAP, StoreKit, receipts, purchase flow, subscription, native push.
- Login, logout, delete-account.
- BUZZ core (logica clue, prezzo), BUZZ MAP core (azioni mappa).
- M1U engine (admin_credit_m1u, M1U reward, shop M1U).
- Routing, navigazione, missioni (logica missione) fuori da claim/PE.
- Supabase migrations già applicate (non modificare per “aggiungere PE” senza migration dedicata).
- File di report e forensics (solo lettura).

---

*Fine report. Nessuna modifica al codice; nessun commit; nessun build; nessun cap sync. Solo lettura e documentazione basata sul codice reale.*
