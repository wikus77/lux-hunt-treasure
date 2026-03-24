# PE Fullscreen Reward + Home Sync + Pulse Bar AAA — Fix Report

**Data:** 2026-03-07  
**Tipo:** Implementazione chirurgica con rollback immediato disponibile  
**Scope:** iOS Capacitor WKWebView. Modale PE fullscreen, animazione reward visibile, sync Home, feedback post-reward, leggibilità PE.

---

## 1. Executive Summary

È stato applicato un fix coerente e in-scope per ottenere:

1. **Modale PE davvero fullscreen e premium** — Il contenuto non è più una card `max-w-md` centrata; è un layout full-viewport (flex-col flex-1) con header, zona centrale animazione, valore reward, CTA, rispettando safe area iOS.
2. **Animazione barra reward chiaramente visibile** — La barra nel modale ora si basa sul **delta** (0% → 100% per il solo amount del reward), non sul totale PE utente; +5 / +10 PE riempiono visivamente la barra. Fasi: orb → inject → fill → pulse → done; beam/glow e impulso finale.
3. **Sync Home immediato** — PracticeMode dopo update `profiles.pulse_energy` emette anche `pe:awarded` con payload coerente, così PulseBarPersonal (e useHierarchyRank refetch) aggiornano subito la Home senza dipendere solo da Realtime.
4. **Feedback visivo post-reward in Home** — Badge “+N PE” con delta catturato (`displayDelta`) visibile per 2.8s; sweep/glow sulla barra quando `showPEGain`; contrasto e dimensione aumentati per il badge.
5. **Leggibilità PE in Home** — PulseBarPersonal: totale PE in `text-xl` font-black, box con bordo/ombra; AgentEnergyPill: valore PE in `text-base`, label “PE” in `text-xs`; badge delta più grande e leggibile.

**BattlePush, IAP, M1U, BUZZ core, auth, push, subscriptions:** non toccati.

---

## 2. Branch iniziale + HEAD iniziale

- **Branch:** `feat/pe-global-fullscreen-reward`
- **HEAD iniziale:** `03c1bd80b5fc894a4f645ce8ec4c9a04a22fd404`

---

## 3. Tag safety + rollback

- **Tag safety creato:** `safety/pe-fullscreen-home-sync-aaa-pre`
- **Rollback (comando esatto):**
  ```bash
  git reset --hard safety/pe-fullscreen-home-sync-aaa-pre
  ```

---

## 4. File effettivamente toccati

| File | Modifiche |
|------|-----------|
| `src/features/pulse/components/GlobalPERewardOverlay.tsx` | Layout true fullscreen (no card max-w-md), struttura header / zona centrale / CTA |
| `src/features/pulse/components/PulseBarReward.tsx` | Animazione delta-based, fasi orb/inject/fill/pulse/done, beam/glow, nuovo totale opzionale |
| `src/features/pulse/components/PulseBarPersonal.tsx` | displayDelta per badge 2.8s, sweep/glow su barra, totale PE text-xl, badge +N PE più evidente |
| `src/features/pulse/components/AgentEnergyPill.tsx` | displayDelta per badge, valore PE text-base, badge delta text-sm |
| `src/components/battle/PracticeMode.tsx` | Dopo update PE: dispatch `pe:awarded` con success, oldPE, newPE, deltaPE, action PRACTICE_MODE_WIN |
| `src/locales/en/common.json` | Aggiunta chiave `pe_reward.new_total`: "New total" |
| `src/locales/it/common.json` | Aggiunta chiave `pe_reward.new_total`: "Nuovo totale" |
| `src/locales/fr/common.json` | Aggiunta chiave `pe_reward.new_total`: "Nouveau total" |
| `reports/PE_FULLSCREEN_HOME_SYNC_AAA_FIX_REPORT.md` | Questo report |

**Non toccati:** `useHierarchyRank.ts`, `peCreditEvent.ts` (sync ottenuto con pe:awarded da PracticeMode; useHierarchyRank già refetch su pe:awarded).

---

## 5. Cosa è stato fatto in GlobalPERewardOverlay

- **Prima:** Container `fixed inset-0 flex items-center justify-center` con **card** interna `max-w-md w-full mx-4 rounded-2xl` (contenuto piccolo centrato).
- **Dopo:** Container `fixed inset-0 flex flex-col` con padding safe-area; **nessuna card** a larghezza limitata. Contenuto:
  - Backdrop fullscreen `bg-black/90 backdrop-blur-md` con glow cyan sottile.
  - Area contenuto `flex flex-col flex-1 min-h-0 w-full items-center justify-center` (usa tutta l’altezza utile).
  - Header: titolo “Pulse Energy” (h2, uppercase, tracking-widest).
  - Zona centrale: `PulseBarReward` in `max-w-lg` (solo per non far esplodere la barra su tablet).
  - CTA “Continua” con delay 0.6s, stile premium.
- Portal su `document.body` e z-index 999998 invariati; chiusura con timeout e bottone invariata.

---

## 6. Cosa è stato fatto in PulseBarReward

- **Fill della barra:** Da `(displayAmount / targetDisplay) * 100` a **solo delta:** `(displayAmount / amount) * 100`. La barra va da 0% a 100% in base al reward, non al totale PE → +10 PE riempie sempre tutta la barra in modo visibile.
- **Fasi:** `orb` (0–400ms) → `inject` (400–900ms) → `fill` (900–2200ms) → `pulse` (2200–2600ms) → `done`. Orb entra da destra e si muove con il fill; fase `pulse` con glow che si espande e scompare.
- **Beam / light sweep:** Durante fill (e non in orb/done) è presente un layer con gradiente cyan che attraversa la barra (effetto sweep).
- **Testo:** “+N PE” in primo piano (text-4xl/5xl, font-black, glow); sotto, se `postValue != null`, riga “New total X PE” (i18n `pe_reward.new_total`); source in basso.
- **Dimensioni:** BAR_WIDTH 320, SPHERE_SIZE 40 per maggiore impatto visivo.

---

## 7. Cosa è stato fatto per sync Home

- **PracticeMode:** Subito dopo `updateBalanceAsync(stake.currency, newBalance)` risolta (e prima di `emitPECreditEvent`), viene fatto `window.dispatchEvent(new CustomEvent('pe:awarded', { detail: { success: true, oldPE: preValue, newPE: postValue, deltaPE: payout, action: 'PRACTICE_MODE_WIN' } }))`. PulseBarPersonal ascolta già `pe:awarded` e chiama `refetch()` (+ refetch dopo 500ms); la Home si aggiorna subito senza dipendere solo da Realtime.

---

## 8. Cosa è stato fatto per PracticeMode

- Unica modifica: dopo update riuscito di `pulse_energy` per vittoria PE, in aggiunta a `emitPECreditEvent(...)` viene emesso l’evento `pe:awarded` con payload compatibile (success, oldPE, newPE, deltaPE, action). Nessun altro cambiamento a logica di gioco, stake, M1U, o altro.

---

## 9. Cosa è stato fatto per PulseBarPersonal

- **displayDelta:** Introdotto state `displayDelta`. Quando `pulseEnergy > lastPE` si imposta `displayDelta = pulseEnergy - lastPE`, `showPEGain = true`, `lastPE = pulseEnergy`; dopo 2.8s si resettano `showPEGain` e `displayDelta`. Il badge mostra “+{displayDelta} PE” per tutta la durata (niente più “+0” al frame successivo).
- **Sweep/glow sulla barra:** Quando `showPEGain && displayDelta > 0`, sulla barra a segmenti: (1) `boxShadow` con glow rankColor; (2) un `motion.div` con gradiente che attraversa da sinistra a destra (sweep 1.2s).
- **Badge +N PE:** Testo `text-base`, padding `px-4 py-2`, `border-2`, font-black, tabular-nums, colore emerald e text-shadow per leggibilità.
- **Totale PE:** Contenitore con `text-xl font-black` per il valore, `bg-black/50`, bordo `border-white/30`, boxShadow con rankColor; “PE” label invariata.

---

## 10. Cosa è stato fatto per AgentEnergyPill

- **displayDelta:** Stessa logica di PulseBarPersonal: `displayDelta` impostato al guadagno, mostrato per 2.8s, poi azzerato.
- **Valore PE:** Da `text-sm` + “PE” in `text-[10px]` a valore in `text-base` e “PE” in `text-xs`; `min-w-[3rem]`, `px-2.5 py-1.5`, bordo e ombra rinforzati per leggibilità su iPhone.
- **Badge delta:** `text-sm`, `px-3 py-1.5`, icon Zap 3.5, colore emerald; condizione `showPEGain && displayDelta > 0`.

---

## 11. Conferma: BattlePush NON toccato

- **Confermato:** Nessuna modifica a `src/lib/battle/pushNotifications.ts` né a `BattleCreationForm` per quanto riguarda `sendBattleInvite` / BattlePush. BattlePush resta escluso dallo scope del fix.

---

## 12. Conferma: IAP / M1U / BUZZ / auth / push / subscriptions NON toccati

- **Confermato:** Nessuna modifica a:
  - IAP / StoreKit / receipts / purchase flow
  - Login / logout / delete-account
  - BUZZ / BUZZ MAP core
  - Push native / BattlePush
  - Subscriptions
  - M1U global engine
  - Route / navigation

---

## 13. Esito build

- **Comando:** `npm run build`
- **Esito:** **OK** (`✓ built in 2m 48s`)

---

## 14. Esito cap sync ios

- **Comando:** `npx cap sync ios`
- **Esito:** **OK**  
  - ✔ Copying web assets from dist to ios/App/App/public  
  - ✔ Creating capacitor.config.json in ios/App/App  
  - ✔ copy ios  
  - ✔ Updating iOS plugins  

---

## 15. Commit hash finale

- **Commit:** Eseguito (build e cap sync passati).
- **Messaggio:** `feat(pulse): true fullscreen PE reward with visible animation and home sync feedback`
- **Hash:** `3a1de40c5`

---

## 16. Eventuali limiti residui REALI

- **Realtime:** Se in ambienti particolari il Realtime Supabase non arriva, l’aggiornamento dipende da `pe:awarded` (PracticeMode ora lo emette). Altri flussi con update diretto (es. BattleDefenseModal, clue milestone) non emettono `pe:awarded` in questo fix; la Home per quelli continua ad aggiornarsi via Realtime.
- **Altri flussi PE:** Il report forensics indicava anche BattleDefenseModal e useClueMilestones come flussi con update diretto senza `pe:awarded`. Per coerenza massima si potrebbero far emettere anche loro `pe:awarded` in un successivo intervento; non incluso in questo fix per rispettare la whitelist e il principio “solo PracticeMode per sync immediato” richiesto.
- **Verifica su dispositivo:** Il fix è stato validato da build e sync; la verifica visiva su iPhone reale (modale fullscreen, animazione barra, badge e sweep in Home) resta da fare in QA.

---

*Fine report.*
