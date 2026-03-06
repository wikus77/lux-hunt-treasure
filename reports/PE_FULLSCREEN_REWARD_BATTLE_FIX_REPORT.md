# PE Fullscreen Reward + Battle PE Flow + Pulse Bar Readability — Fix Report

**Data:** 2026-03-06  
**Branch:** feat/pe-global-fullscreen-reward  
**HEAD iniziale:** c61baf64e859631064f7038bb998b77c5e6713f6  
**Tag safety:** safety/pe-battle-readability-fix-pre  

**Rollback:** `git reset --hard safety/pe-battle-readability-fix-pre`

---

## 1. Executive Summary

- **Battle attaccante:** rimosso l’update diretto di `pulse_energy`; un solo canale: `awardPE('BATTLE_WIN'|'BATTLE_LOSE')` (RPC). Fullscreen PE parte dopo successo RPC; niente doppio accredito.
- **Battle difensore:** dopo update diretto PE in BattleDefenseModal, se il difensore vince (guadagna PE) viene emesso `emitPECreditEvent(peAmount, 'battle_defense_win', { preValue, postValue })`. Aggiunta chiave i18n `pe_reward.source_battle_defense_win` (it/en/fr).
- **Pulse Bar:** aumentate dimensione e contrasto del valore PE in PulseBarPersonal (label "PE" text-xs font-semibold text-white/80, valore text-sm font-bold + glow); footer "X / Y PE" in text-xs text-white/70. Su AgentEnergyPill mostrato il valore PE sotto l’icona (text-[10px] font-bold, colore rank, glow) per lettura “al primo colpo d’occhio”.
- **GlobalPERewardOverlay:** nessuna modifica; dedupe/lock lasciati invariati.
- **BattlePush:** nessun fix applicato; Edge `battle-push-send` non presente nel repo; causa probabile lato backend/rete; documentato come issue separata.
- **Build:** PASS. **Cap sync ios:** PASS. **Commit:** eseguito (hash in §14).

---

## 2. Branch iniziale + HEAD iniziale

- **Branch:** feat/pe-global-fullscreen-reward  
- **HEAD iniziale:** c61baf64e859631064f7038bb998b77c5e6713f6  

---

## 3. Tag safety + rollback

- **Tag:** safety/pe-battle-readability-fix-pre  
- **Rollback:** `git reset --hard safety/pe-battle-readability-fix-pre`  

---

## 4. Diagnosi battle attaccante

- **Prima:** doppio canale: (1) update diretto `profiles.pulse_energy` con `stakePercent`, (2) `awardPE('BATTLE_WIN'|'BATTLE_LOSE')` (RPC +50/-100). Rischio doppio accredito e, se l’RPC falliva, fullscreen non partiva.
- **Scelta:** un solo canale affidabile: **solo** `awardPE` (RPC). Rimossi fetch profile e update diretto di `pulse_energy` in handleCountdownComplete. Mantenuti: update `battle_sessions`, toast, domination log, `awardPE`. L’RPC `award_pulse_energy` è l’unica scrittura PE; useAwardPE emette `pe:awarded` e `emitPECreditEvent` dopo successo (delta > 0).

---

## 5. Diagnosi battle difensore

- **Prima:** BattleDefenseModal aggiornava solo `profiles.pulse_energy` (difensore e attaccante); nessun evento globale → fullscreen PE mai mostrato al difensore.
- **Dopo:** dopo update riuscito del difensore, se `defenderWins && peAmount > 0` viene chiamato `emitPECreditEvent(peAmount, 'battle_defense_win', { preValue: defenderCurrentPE, postValue: defenderNewPE })` (dynamic import). Nessun doppio trigger; source `battle_defense_win` aggiunta in peCreditEvent e i18n.

---

## 6. Scelta architetturale

- **Attaccante:** “solo awardPE” — meno rischi di regressione rispetto a “solo update + emit”, perché non si tocca la catena RPC/limit/rank già usata ovunque; si elimina solo la doppia scrittura lato client.
- **Difensore:** “update diretto + emitPECreditEvent dopo successo” — il difensore non usa awardPE (il flusso è già solo update diretto); aggiungere solo l’emit evita di introdurre RPC e doppio accredito.

---

## 7. File toccati

| File | Modifica |
|------|----------|
| src/components/battle/BattleCreationForm.tsx | Rimosso blocco update diretto `pulse_energy`; lasciato solo awardPE + battle_sessions + toast + domination. |
| src/components/battle/BattleDefenseModal.tsx | Dopo update PE difensore, se defenderWins && peAmount > 0 → emitPECreditEvent(peAmount, 'battle_defense_win', …). |
| src/features/pulse/components/PulseBarPersonal.tsx | Label "PE" e valore PE: dimensione/contrasto aumentati (text-xs/text-sm, white/80, glow). Footer: text-xs text-white/70. |
| src/features/pulse/components/AgentEnergyPill.tsx | Valore PE sotto l’icona rank (formatPE(pulseEnergy)) con text-[10px] font-bold, colore rank, glow. |
| src/locales/it/common.json | Aggiunto pe_reward.source_battle_defense_win: "Difesa vittoriosa". |
| src/locales/en/common.json | Aggiunto pe_reward.source_battle_defense_win: "Defense win". |
| src/locales/fr/common.json | Aggiunto pe_reward.source_battle_defense_win: "Défense victorieuse". |
| reports/PE_FULLSCREEN_REWARD_BATTLE_FIX_REPORT.md | Questo report. |

---

## 8. Diff logico per file

- **BattleCreationForm:** rimosse ~28 righe: fetch profile, calcolo newPE, update `pulse_energy`. Restano try/catch, update battle_sessions, toast, domination, awardPE.
- **BattleDefenseModal:** inserite ~12 righe dopo update defender: `if (defenderWins && peAmount > 0) { import('@/features/pulse/peCreditEvent').then(({ emitPECreditEvent }) => emitPECreditEvent(peAmount, 'battle_defense_win', { preValue, postValue })); }` in try/catch non bloccante.
- **PulseBarPersonal:** "PE:" → "PE" text-xs font-semibold text-white/80; valore → text-sm font-bold + textShadow rank; footer → text-xs text-white/70.
- **AgentEnergyPill:** nuovo span assoluto sotto l’icona con formatPE(pulseEnergy), stile 10px font-bold, rankColor, textShadow.

---

## 9. Eventuali fix su GlobalPERewardOverlay

- **Nessuna modifica.** Dedupe (DEDUPE_MS 2500), lock (animatingRef), AUTO_CLOSE_MS 3500 e cleanup lasciati invariati. Nessun problema reale identificato che blocchi reward validi.

---

## 10. Miglioramenti Pulse Bar readability

- **PulseBarPersonal:** valore PE più grande e contrastato; label "PE" più leggibile; footer "X / Y PE" con testo più leggibile.
- **AgentEnergyPill:** valore PE visibile sulla pill senza aprire il modale; posizione sotto l’icona rank, font compatto ma leggibile, colore e glow coerenti con il tema.

---

## 11. BattlePush: fix eseguito oppure issue documentata

- **Nessun fix.** L’Edge `battle-push-send` non è presente nel repo (supabase/functions). L’errore `FunctionsHttpError` è tipicamente rete/CORS/assenza Edge. Modifiche possibili richiederebbero backend o catena push; fuori scope per un fix “minimo e sicuro”. **Documentato come issue separata:** verificare deploy Edge `battle-push-send`, CORS e payload atteso; client in `src/lib/battle/pushNotifications.ts` invia defender_id, battle_id, attacker_agent_code, attacker_weapon_power, stake_type, stake_amount, arena_name.

---

## 12. Esito build

- **Comando:** npm run build  
- **Esito:** PASS (exit 0).  

---

## 13. Esito cap sync ios

- **Comando:** npx cap sync ios  
- **Esito:** PASS (Sync finished; pod install ok).  

---

## 14. Commit hash finale

- **Commit eseguito:** sì.  
- **Hash:** f80fe7c88 (`fix(pulse): stabilize PE fullscreen rewards in battle and improve pulse readability`)  

---

## 15. Cosa NON è stato toccato

- IAP / StoreKit / receipts / purchase flow  
- Login / logout / delete-account  
- BUZZ / BUZZ MAP  
- Push native (configurazione generale)  
- Subscriptions  
- m1uCreditEvent, GlobalM1UCreditOverlay, M1UPill  
- useAwardPE (nessuna modifica; solo uso da Battle)  
- peCreditEvent.ts (nessuna modifica)  
- GlobalPERewardOverlay.tsx  
- claim-daily-phase, daily missions, streak widget  
- src/lib/battle/pushNotifications.ts (nessuna modifica)  
- Qualsiasi file fuori dalla whitelist indicata nel prompt  

---

Fine report.
