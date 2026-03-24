# PE Unification Phase 1 — Report

**Data:** 2026-03-07  
**Scope:** Allineamento eventi PE (pe:awarded + emitPECreditEvent) per BattleDefenseModal, useClueMilestones, OnboardingOverlay. Nessun cambio al metodo di accredito.

---

## 1. Executive summary

Sono stati allineati al sistema globale PE tre flussi che già assegnavano PE reali ma non emettevano `pe:awarded`:
- **BattleDefenseModal:** dopo vittoria del difensore, oltre a `emitPECreditEvent` ora viene emesso anche `pe:awarded` con payload coerente (oldPE, newPE, deltaPE, action `BATTLE_DEFENSE_WIN`).
- **useClueMilestones:** dopo update PE per milestone, oltre a `emitPECreditEvent` ora viene emesso anche `pe:awarded` quando `milestone.pe > 0` (action `CLUE_MILESTONE`).
- **OnboardingOverlay:** nel ramo fallback (update diretto 50 PE), dopo update riuscito ora viene emesso `pe:awarded` e `emitPECreditEvent` con preValue/postValue; nel ramo senza errori viene emesso solo `emitPECreditEvent(50, 'onboarding')` per evitare doppia emissione.

Metodo di accredito reale (update diretto) **non modificato**. BUZZ, Streak, PracticeMode, BattleCreationForm, ecc. **non toccati**.

---

## 2. Branch iniziale

`feat/pe-global-fullscreen-reward`

## 3. HEAD iniziale

`650dd59420ef19c93e8f6ff4236b5c744a375761`

## 4. Tag safety creato

```bash
git tag safety/pe-unification-phase1-pre
```

Eseguito prima di qualsiasi modifica.

## 5. Comando rollback

```bash
git reset --hard safety/pe-unification-phase1-pre
```

---

## 6. File modificati

| File | Modifica |
|------|----------|
| `src/components/battle/BattleDefenseModal.tsx` | Aggiunto dispatch `pe:awarded` nel ramo defender wins (peAmount > 0), prima di `emitPECreditEvent`. Payload: success, oldPE, newPE, deltaPE, rankChanged: false, action: 'BATTLE_DEFENSE_WIN'. |
| `src/hooks/useClueMilestones.ts` | Aggiunto dispatch `pe:awarded` quando milestone.pe > 0 dopo update profilo, prima di `emitPECreditEvent`. Payload: success, oldPE, newPE, deltaPE, rankChanged: false, action: 'CLUE_MILESTONE'. |
| `src/components/onboarding/OnboardingOverlay.tsx` | Nel fallback (update diretto): dopo update calcolo oldPE/newPE, dispatch `pe:awarded` (action 'ONBOARDING'), poi `emitPECreditEvent(50, 'onboarding', { preValue, postValue })`. Ramo else (primo update senza error): solo `emitPECreditEvent(50, 'onboarding')` per evitare doppia emissione. |

---

## 7. Cosa è stato fatto in BattleDefenseModal

- **Prima:** in caso di vittoria del difensore (defenderWins && peAmount > 0) veniva emesso solo `emitPECreditEvent(peAmount, 'battle_defense_win', { preValue, postValue })`.
- **Dopo:** nello stesso ramo viene emesso anche `pe:awarded` con:
  - success: true
  - oldPE: defenderCurrentPE
  - newPE: defenderNewPE
  - deltaPE: peAmount
  - rankChanged: false (non disponibile da update diretto; documentato)
  - action: 'BATTLE_DEFENSE_WIN'
- Calcolo battaglia, update DB, push/invite **invariati**. Surrender **non toccato** (attaccante guadagna PE ma il modale è lato difensore; eventuale allineamento attaccante fuori scope Fase 1).

---

## 8. Cosa è stato fatto in useClueMilestones

- **Prima:** dopo update `pulse_energy` con milestone.pe, se milestone.pe > 0 veniva emesso solo `emitPECreditEvent(milestone.pe, 'clue_milestone', { preValue, postValue })`.
- **Dopo:** nello stesso blocco viene emesso anche `pe:awarded` con:
  - success: true
  - oldPE: profile.pulse_energy || 0
  - newPE: newPEBalance
  - deltaPE: milestone.pe
  - rankChanged: false
  - action: 'CLUE_MILESTONE'
- Logica milestone, M1U, localStorage **invariati**.

---

## 9. Cosa è stato fatto in OnboardingOverlay

- **Prima:** tentativo update con RPC inside (invalido); in fallback update diretto (profile.pulse_energy + 50), poi sempre `emitPECreditEvent(50, 'onboarding')` fuori dal blocco.
- **Dopo:** 
  - Nel fallback con profile: dopo update vengono emessi `pe:awarded` (oldPE, newPE, deltaPE: 50, action: 'ONBOARDING') e `emitPECreditEvent(50, 'onboarding', { preValue: oldPE, postValue: newPE })`.
  - Nel ramo senza error (else): solo `emitPECreditEvent(50, 'onboarding')` (nessun pe:awarded perché non abbiamo oldPE/newPE da DB e il primo update è comunque anomalo).
- Nessun refactor della logica onboarding; nessun cambio UX. Solo allineamento eventi post-accredito nel ramo in cui l’accredito avviene davvero (fallback).

---

## 10. Conferma esplicita di cosa NON è stato toccato

- **BUZZ** (useBuzzHandler, BuzzActionButton, ecc.): **non toccato**
- **BUZZ MAP** (BuzzMapButtonSecure): **non toccato**
- **StreakModal / StreakWidget**: **non toccato**
- **BattleCreationForm**: **non toccato**
- **PracticeMode**: **non toccato**
- **FortuneWheel**: **non toccato**
- **Vera Bomb** (useBombMissionRun): **non toccato**
- **Map time** (useMapTimeTracking): **non toccato**
- **Pulse Breaker**: **non toccato**
- **AION** (useIntelAnalyst): **non toccato**
- **Forum** (useForum): **non toccato**
- **useAwardPE**, **peCreditEvent**, **GlobalPERewardOverlay**: **non toccati**
- IAP, login, M1U engine, routing, push: **non toccati**
- **Nessuna modifica al metodo di accredito reale** (resta update diretto dove già presente); solo aggiunta emissione eventi post-accredito.

---

## 11. Esito build

**PASS.** `npm run build` completato con exit code 0.

## 12. Esito cap sync ios

**PASS.** `npx cap sync ios`: Copying web assets, Creating capacitor.config.json, copy ios, Updating iOS plugins — completati con successo.

## 13. Commit hash finale

`7012170a1` — commit eseguito dopo build e cap sync passati.

## 14. Eventuali limiti residui reali

- **BattleDefenseModal:** in caso di resa (handleSurrender) l’attaccante guadagna PE via update diretto; in questa fase non è stato aggiunto pe:awarded/emit per l’attaccante (modale è lato difensore; eventuale estensione in fase successiva).
- **Onboarding:** il ramo “primo update senza error” usa ancora la forma `update({ pulse_energy: supabase.rpc(...) })` (invalida); in quel ramo viene emesso solo emitPECreditEvent, senza pe:awarded (mancano oldPE/newPE). Il flusso reale che accredita è il fallback.
- **rankChanged:** in tutti e tre i flussi è impostato a `false` perché l’accredito è client-side diretto e non passa da RPC award_pulse_energy che restituisce rank_changed.
