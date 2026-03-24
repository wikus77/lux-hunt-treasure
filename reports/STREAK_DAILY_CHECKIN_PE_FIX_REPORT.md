# Streak Daily Check-in PE Fix — Report

**Data:** 2026-03-07  
**Scope:** Assegnare 10 PE reali al daily check-in dalla schermata STREAK SYSTEM e sostituire il testo cosmetico con "+10 PE".  
**Paletti:** Solo file in whitelist; nessuna modifica a IAP, BUZZ, login, M1U engine, routing, ecc.

---

## 1. Branch iniziale

`feat/pe-global-fullscreen-reward`

## 2. HEAD iniziale

`3a1de40c53f0847dd6fc4517522cad821333f66f`

## 3. Tag safety creato

```bash
git tag safety/streak-daily-pe-fix-pre
```

Eseguito prima di qualsiasi modifica.

## 4. Comando rollback

In caso di rollback immediato:

```bash
git reset --hard safety/streak-daily-pe-fix-pre
```

## 5. File modificati

| File | Modifica |
|------|----------|
| `src/components/gamification/StreakModal.tsx` | Integrato `useAwardPE`; in `handleCheckIn` chiamata `awardPE('DAILY_LOGIN', undefined, { streakDays, streakBroken })` dopo `award_xp`; sostituito box PE Bonus da percentuale a `t('streak_pe_bonus_amount')` (+10 PE); rimossa variabile non usata `peMultiplier`. |
| `src/features/pulse/hooks/useAwardPE.ts` | `PE_VALUES['DAILY_LOGIN']`: da `5` a `10`. |
| `src/locales/en/common.json` | Aggiunta chiave `"streak_pe_bonus_amount": "+10 PE"`. |
| `src/locales/it/common.json` | Aggiunta chiave `"streak_pe_bonus_amount": "+10 PE"`. |
| `src/locales/fr/common.json` | Aggiunta chiave `"streak_pe_bonus_amount": "+10 PE"`. |

Nessun altro file toccato.

## 6. Spiegazione precisa del fix

- **Problema:** Il check-in dalla modale STREAK SYSTEM (StreakModal) aggiornava streak, XP e M1U ma non assegnava PE e non emetteva eventi globali, quindi il fullscreen PE non poteva aprirsi.
- **Fix:**  
  1. In **StreakModal** è stato importato `useAwardPE` e in `handleCheckIn`, dopo l’update profile e la chiamata `award_xp`, viene chiamato `awardPE('DAILY_LOGIN', undefined, { streakDays: newStreak, streakBroken })` con `.catch(...)` non bloccante, così il check-in UI resta valido anche in caso di errore PE.  
  2. Il valore PE per DAILY_LOGIN è stato portato da 5 a **10** nel mapping centrale **useAwardPE** (`PE_VALUES['DAILY_LOGIN'] = 10`), così sia StreakModal sia eventuale StreakWidget assegnano 10 PE per il daily login.  
  3. Il box "PE Bonus" nella modale non mostra più la percentuale cosmetica (`+25%` / `+30%`) ma il testo reale **"+10 PE"** tramite i18n (`streak_pe_bonus_amount`).

## 7. Dove e come vengono assegnati i 10 PE

- L’assegnazione avviene **solo** attraverso il canale esistente: **useAwardPE** → **awardPE('DAILY_LOGIN')** → RPC **award_pulse_energy** (con `PE_VALUES['DAILY_LOGIN'] = 10`).  
- **Nessuna** scrittura diretta su `profiles.pulse_energy`; nessun duplicato.  
- Il limite **una volta al giorno** è garantito da **PE_DAILY_LIMITS['DAILY_LOGIN'] = 1** e dall’RPC **check_pe_daily_limit** già usato in useAwardPE.

## 8. Conferma fullscreen PE

Sì. Quando `awardPE('DAILY_LOGIN', ...)` ha successo, useAwardPE esegue:
- `window.dispatchEvent(new CustomEvent('pe:awarded', { detail: { ... } }))`
- `emitPECreditEvent(delta, 'daily_login', { preValue, postValue })`

Il **GlobalPERewardOverlay** ascolta `pe-credit-event` emesso da `emitPECreditEvent`, quindi il fullscreen reward può aprirsi dopo il daily check-in dalla STREAK SYSTEM.

## 9. Conferma testo cosmetico sostituito

Sì. Il box che prima mostrava `+{Math.round((peMultiplier - 1) * 100)}%` (es. "+25%", "+30%") ora mostra **`{t('streak_pe_bonus_amount')}`** cioè **"+10 PE"** in en/it/fr. Le chiavi sono state aggiunte in `src/locales/{en,it,fr}/common.json`.

## 10. Esito build

**PASS.**  
`npm run build` completato con exit code 0 (build production Vite ok).

## 11. Esito cap sync ios

**PASS.**  
`npx cap sync ios` ha completato con successo:
- Copying web assets from dist to ios/App/App/public
- Creating capacitor.config.json in ios/App/App
- copy ios
- Updating iOS plugins

## 12. Commit hash finale

`650dd5942` — commit eseguito dopo build e cap sync passati.

## 13. Conferma nessun file fuori scope

Confermato: modificati solo  
`StreakModal.tsx`, `useAwardPE.ts`, `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json`.  
Nessuna modifica a IAP, StoreKit, login, logout, delete-account, BUZZ, BUZZ MAP, push native, subscriptions, M1U global engine, routing, o altri flussi non in scope.

---

*Report generato in seguito al fix streak daily check-in PE. Rollback: `git reset --hard safety/streak-daily-pe-fix-pre`.*
