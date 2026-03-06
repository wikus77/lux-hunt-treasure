# PE Fullscreen Reward Fix + Home PE Readability Hardening — Fase 1 Report

**Data:** 2026-03-06  
**Branch:** feat/pe-global-fullscreen-reward  
**HEAD iniziale:** 6d6cee87f909fcf375ebe681f7e6b4991e9dd32a  
**Tag safety:** safety/pe-practicemode-readability-fix-pre  

**Rollback:** `git reset --hard safety/pe-practicemode-readability-fix-pre`

---

## 1. Executive Summary

- **PracticeMode (battle dalla Home):** Dopo vittoria con stake PE, l’update su Supabase è ora awaited; a successo viene emesso `emitPECreditEvent(payout, 'practice_mode_win', { preValue, postValue })`. Il fullscreen PE si apre quando l’utente vince PE nel ramo reale usato dalla Home.
- **Readability:** PulseBarPersonal mostra il valore PE in un box evidenziato (label "PE" + valore `text-lg font-black`, bordo e glow). AgentEnergyPill mostra il valore PE in un badge sotto l’orb (testo `text-sm font-black`, bordo/glow rank). Modifiche nette e visibili.
- **Build:** PASS. **Cap sync ios:** PASS. **Commit:** eseguito (solo file modificati, nessun push).

---

## 2. Branch iniziale + HEAD iniziale

- **Branch:** feat/pe-global-fullscreen-reward  
- **HEAD iniziale:** 6d6cee87f909fcf375ebe681f7e6b4991e9dd32a  

---

## 3. Tag safety + rollback

- **Tag:** safety/pe-practicemode-readability-fix-pre  
- **Rollback:** `git reset --hard safety/pe-practicemode-readability-fix-pre`  

---

## 4. Root cause confermata

Il ramo battle usato dalla Home passa da **PracticeMode.tsx**. In quel ramo i PE venivano aggiornati con update diretto su `profiles.pulse_energy` ma **non** veniva mai chiamato `emitPECreditEvent`, quindi il modale fullscreen PE non poteva apparire. Root cause confermata e corretta.

---

## 5. File toccati

| File | Modifica |
|------|----------|
| src/components/battle/PracticeMode.tsx | `updateBalanceAsync` restituisce la promise; in caso di vittoria con stake PE, dopo update riuscito viene emesso `emitPECreditEvent(payout, 'practice_mode_win', { preValue, postValue })`. |
| src/features/pulse/peCreditEvent.ts | Aggiunti i tipi `practice_mode_win` e `battle_defense_win` in `PECreditSource`. |
| src/features/pulse/components/PulseBarPersonal.tsx | Box PE con label "PE" e valore in `text-lg font-black`, bordo, glow e sfondo per leggibilità immediata; footer con `text-sm font-medium text-white/90`. |
| src/features/pulse/components/AgentEnergyPill.tsx | Valore PE spostato in un badge sotto l’orb: `text-sm font-black`, bordo/glow rank, sfondo scuro; layout `flex-col` per orb + badge. |
| src/locales/it/common.json | Aggiunto `pe_reward.source_practice_mode_win`: "Vittoria Battle Arena". |
| src/locales/en/common.json | Aggiunto `pe_reward.source_practice_mode_win`: "Battle Arena win". |
| src/locales/fr/common.json | Aggiunto `pe_reward.source_practice_mode_win`: "Victoire Battle Arena". |

**GlobalPERewardOverlay.tsx:** non modificato (già in ascolto di `pe-credit-event`; la source `practice_mode_win` è gestita via i18n).

---

## 6. Cosa è stato fatto in PracticeMode

- **updateBalanceAsync:** Ora restituisce `Promise<void>` (la promise della chiamata Supabase) così il chiamante può eseguire logica post-successo.
- **handleTap, ramo vittoria:** Se `stake.currency === 'PE'` e `payout > 0`, viene chiamato `updateBalanceAsync(stake.currency, newBalance).then(() => { import('@/features/pulse/peCreditEvent').then(({ emitPECreditEvent }) => emitPECreditEvent(payout, 'practice_mode_win', { preValue, postValue })); })`. Altrimenti si continua a chiamare `updateBalanceAsync` senza then (comportamento invariato per M1U e per perdite).
- **preValue / postValue:** preValue = saldo prima del credito (currentBalance), postValue = newBalance. amount = payout (2× stake) = delta PE accreditato.

---

## 7. Come viene emesso ora emitPECreditEvent

- **Quando:** Solo dopo che l’update Supabase su `profiles.pulse_energy` è completato con successo (`.then()` sulla promise di `updateBalanceAsync`).
- **Condizione:** Vittoria con stake in PE e `payout > 0`.
- **Chiamata:** `emitPECreditEvent(payout, 'practice_mode_win', { preValue, postValue })` con dynamic import di `peCreditEvent`.
- **Nessun doppio accredito:** L’accredito resta unico (update diretto); l’evento serve solo al fullscreen.

---

## 8. Source scelta e chiavi i18n aggiunte

- **Source:** `practice_mode_win`.
- **i18n:**  
  - it: `pe_reward.source_practice_mode_win`: "Vittoria Battle Arena"  
  - en: "Battle Arena win"  
  - fr: "Victoire Battle Arena"  

---

## 9. Miglioramenti reali applicati a PulseBarPersonal

- **Box PE (header):** Contenitore con `px-2 py-1 rounded-lg bg-black/40 border border-white/20`. Label "PE" in `text-sm font-bold text-white uppercase tracking-wide`. Valore in `text-lg font-black font-mono tabular-nums min-w-[3ch]` con `textShadow` a più livelli (glow rank + ombra). Il numero PE è prioritario visivamente.
- **Footer:** "X / Y PE" in `text-sm font-medium text-white/90 font-mono tabular-nums`.

---

## 10. Miglioramenti reali applicati a AgentEnergyPill

- **Layout:** Il contenitore della pill è ora `flex flex-col items-center gap-1`: orb sopra, badge PE sotto.
- **Badge PE:** Nuovo div sotto l’orb con `px-2 py-1 rounded-md min-w-[2.5rem] text-center font-black font-mono tabular-nums text-sm`, colore rank, sfondo `rgba(0,0,0,0.5)`, bordo e boxShadow/textShadow rank. Testo: `{formatPE(pulseEnergy)}` + " PE" in piccolo. Il valore è leggibile al primo colpo d’occhio senza aprire il modale.

---

## 11. Verifica overlay / event chain

- **GlobalPERewardOverlay:** Non modificato. Resta in ascolto di `PE_CREDIT_EVENT` ('pe-credit-event') e mostra il modale con `PulseBarReward`; la chiave i18n `pe_reward.source_practice_mode_win` è usata per la label della source. Nessun adattamento di dedupe/lock necessario per questo ramo.

---

## 12. Esito npm run build

- **Comando:** npm run build  
- **Esito:** PASS (exit 0).  

---

## 13. Esito npx cap sync ios

- **Comando:** npx cap sync ios  
- **Esito:** PASS (Sync finished; pod install ok).  

---

## 14. Hash commit finale

- **Commit eseguito:** sì.  
- **Hash:** (vedi output di `git log -1 --oneline` dopo il commit.)  

---

## 15. Cosa NON è stato toccato

- IAP / StoreKit / purchase flow  
- Login / logout / delete-account  
- BUZZ / BUZZ MAP  
- Push native / BattlePush client e edge  
- Subscriptions  
- M1U global engine  
- BattleCreationForm / BattleDefenseModal  
- useAwardPE  
- GlobalPERewardOverlay (nessuna modifica)  
- Qualsiasi file fuori dalla whitelist indicata  

---

Fine report.
