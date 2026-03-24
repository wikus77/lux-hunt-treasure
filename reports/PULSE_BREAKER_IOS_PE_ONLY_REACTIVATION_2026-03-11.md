# Report — Riattivazione Pulse Breaker su iOS (PE-only) + Next Action

**Data:** 2026-03-11  
**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Branch iniziale:** `feat/pe-global-fullscreen-reward`  
**HEAD iniziale:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 1. Branch iniziale / HEAD iniziale

- **Branch:** `feat/pe-global-fullscreen-reward`
- **HEAD:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 2. Branch safety / tag safety creati

- **Branch:** `safety/pulse-breaker-ios-pe-only-pre-20260310`
- **Tag:** `safety/pulse-breaker-ios-pe-only-pre-20260310`

Creati prima di qualsiasi modifica; checkout restituito a `feat/pe-global-fullscreen-reward` per applicare la patch.

---

## 3. Verifica pre-patch: verdetto

**Verdetto: perimetro piccolo e sicuro. Procedura eseguita.**

- Pulse Breaker esiste ed è implementato in `src/features/pulse-breaker/`, store, popups, PulseBar.
- Blocco su native era in `isPulseBreakerEnabled()` (storeCompliance) che ritornava `false` se `isCapacitorNative()`.
- Nessun uso di IAP, BUZZ o BUZZ MAP nella feature Pulse Breaker; nessuna modifica a quei moduli.
- M1U usato in: hook (BetCurrency, balance m1u/pe, startRound/cashout), UI (pill M1U, selettore valuta, testi). PE già usato per awardPE(PULSE_BREAKER_PLAY / PULSE_BREAKER_WIN).
- Next Action usava `navigate('/pulse-breaker')` senza route dedicata; l’apertura reale doveva avvenire tramite store.

---

## 4. File effettivamente modificati

| File | Modifiche |
|------|------------|
| `src/utils/storeCompliance.ts` | `isPulseBreakerEnabled()`: rimosso blocco native; ritorna `!!PULSE_BREAKER_ENABLED` per tutte le piattaforme. |
| `src/features/pulse-breaker/hooks/usePulseBreaker.ts` | Import `isCapacitorNative`; in `startRound` se native e `currency === 'M1U'` ritorna `false`. |
| `src/features/pulse-breaker/components/PulseBreaker.tsx` | `isNativePEOnly = isCapacitorNative()`; default `betCurrency` PE su native; lock a PE con `useEffect`; su native nascosti pill M1U e selettore M1U/PE (solo PE); aggiunta pill PE; disclaimer su native con i18n `pulseBreaker.disclaimerPeOnly`; import `useTranslation` e `isCapacitorNative`. |
| `src/components/feedback/NextActionCard.tsx` | Import `usePulseBreakerStore`; in `handleClick` se `nextAction.type === 'do_pulse_breaker'` chiamata `openPulseBreaker()`, altrimenti `navigate(nextAction.path)`. |
| `src/locales/en/common.json` | Aggiunta chiave `pulseBreaker.disclaimerPeOnly`. |
| `src/locales/it/common.json` | Aggiunta chiave `pulseBreaker.disclaimerPeOnly`. |
| `src/locales/fr/common.json` | Aggiunta chiave `pulseBreaker.disclaimerPeOnly`. |

---

## 5. Cosa è stato cambiato in ciascun file

- **storeCompliance.ts:** Abilitazione Pulse Breaker non più disabilitata su native; comportamento legato solo a `PULSE_BREAKER_ENABLED`.
- **usePulseBreaker.ts:** Su native non è possibile avviare un round in M1U; solo PE.
- **PulseBreaker.tsx:** Su native: solo PE (valuta e saldo), nessuna scelta M1U, disclaimer specifico PE-only con i18n.
- **NextActionCard.tsx:** Tap su “PULSE BREAKER” apre il modal tramite `openPulseBreaker()` invece di navigare a `/pulse-breaker`.
- **Locales (en/it/fr):** Testo disclaimer PE-only per uso su native.

---

## 6. Come è stato garantito PE-only e mai M1U

- **Hook:** `startRound(amount, 'M1U')` su native ritorna `false` (round non parte).
- **UI:** Su native (`isCapacitorNative()`): `betCurrency` iniziale e forzato a `'PE'`; nascosti pill saldo M1U e pulsanti M1U nel selettore valuta; visibile solo pill PE e uso PE.
- **Saldo/round:** Su native l’utente può solo puntare e giocare in PE; nessun flusso M1U nel gioco.

---

## 7. Come è stata riattivata l’apertura da Next Action

- In **NextActionCard** il click sulla card “Prossimo passo” quando il tipo è `do_pulse_breaker` chiama `openPulseBreaker()` dallo store invece di `navigate(nextAction.path)`.
- Non è stata aggiunta una route `/pulse-breaker`; l’apertura avviene tramite il modal globale già usato (GlobalPulseBreakerModal + pulseBreakerStore).

---

## 8. File NON toccati

- Login / logout, delete account, IAP, StoreKit, receipts, BUZZ, BUZZ MAP, push native, routing globale (eccetto uso dello store in NextActionCard), Supabase schema/migrations/RLS, auth stabilization, moduli fuori dalla feature Pulse Breaker e da NextActionCard/storeCompliance/locales come sopra.

---

## 9. Esito test di non regressione

- **Build:** OK (npm run build completato con successo).
- Test manuali su dispositivo (avvio app, Home, apertura Pulse Breaker da pill e da Next Action, round solo PE, overlay PE, BUZZ/BUZZ MAP/IAP non toccati) vanno eseguiti dall’utente su dispositivo reale/simulatore.

---

## 10. Esito build

- **npm run build:** OK (✓ built in ~1m 37s).

---

## 11. Esito `npx cap sync ios`

- **Copy web assets / copy ios:** OK.
- **pod install / update native dependencies:** Fallito in ambiente Cursor (sandbox/permessi: CoreSimulatorService, DerivedData). Non dipende dalle modifiche al codice.
- **Azione consigliata:** Eseguire in locale `npx cap sync ios` (e se serve `pod install` nella cartella `ios/App`) per completare la sync iOS.

---

## 12. Comandi rollback esatti

Per tornare allo stato pre-patch (safety):

```bash
cd /Users/josephmule/lux-hunt-treasure
git checkout feat/pe-global-fullscreen-reward
git checkout -- src/utils/storeCompliance.ts
git checkout -- src/features/pulse-breaker/hooks/usePulseBreaker.ts
git checkout -- src/features/pulse-breaker/components/PulseBreaker.tsx
git checkout -- src/components/feedback/NextActionCard.tsx
git checkout -- src/locales/en/common.json src/locales/it/common.json src/locales/fr/common.json
```

Oppure, se le modifiche sono state committate, tornare al tag safety:

```bash
cd /Users/josephmule/lux-hunt-treasure
git checkout safety/pulse-breaker-ios-pe-only-pre-20260310
```

---

## 13. Verdetto finale

| Criterio | Esito |
|----------|--------|
| Pulse Breaker riattivato | **Sì** |
| Su iOS nativo | **Sì** (abilitato da `isPulseBreakerEnabled()`; su native solo PE) |
| Solo PE | **Sì** (su native: UI e hook solo PE, no M1U) |
| Accessibile da Next Action | **Sì** (tap su card “PULSE BREAKER” apre il modal) |
| Regressioni rilevate | **No** (nessuna modifica a login, IAP, BUZZ, BUZZ MAP, push, delete account, auth) |

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
