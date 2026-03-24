# Verifica implementativa — M1SSION™ DCL Fase C1  
## DCL → Core gameplay link (read-only prima di implementazione)

**Data:** 2026-03-19  
**Target:** App nativa wrappata iOS (Capacitor WKWebView).

---

## STEP A — REPORT DI VERIFICA (PRIMA DI OGNI MODIFICA)

### 1. Dove vive oggi il flusso BUZZ

| Elemento | Dettaglio |
|----------|-----------|
| **Route** | `/buzz` (definita in `WouterRoutes.tsx`, `AppRoutes.tsx`, `UserRoutes.tsx`) |
| **Pagina** | `src/pages/BuzzPage.tsx` — layout, M1UPill, gate opzionale, contenuto principale |
| **Pulsante reale** | `BuzzActionButton` (`src/components/buzz/BuzzActionButton.tsx`) — usato in `BuzzPage` come unico CTA BUZZ. Gestisce tier free, grants, pricing M1U, refetch saldo, debito su `profiles.m1_units` |
| **Modal/overlay** | Nessun modal “launcher” BUZZ dalla Home; l’entry point è la **navigazione alla pagina** `/buzz` |
| **Context/store** | Nessun context tipo DclLauncher per BUZZ. `BuzzActionButton` usa: `useBuzzCounter`, `useBuzzGrants`, `useTierFreeBuzz`, `useDailyFreeBuzz`, `useM1UnitsRealtime`, `useBuzzHandler` |
| **CTA safe da DCL** | Non esiste oggi una CTA “apri BUZZ” dalla Home. Il modo safe è **navigare a `/buzz`** (stesso pattern di altri link in app) |
| **Launcher riusabile** | `DclLauncherContext` espone solo `openCommit`, `openStreak`, `openMission`. Non c’è `openBuzz`; il flusso BUZZ è una **pagina** e non un overlay/modal sulla Home |
| **Dipendenze critiche** | Auth (user), saldo M1U (o free buzz), `user_buzz_counter` per pricing. Nessun obbligo di location/rate limit specifici per “mostrare” la CTA; la validazione reale avviene sul `BuzzActionButton` al tap |

**Conclusione:** Il collegamento DCL → core gameplay si fa **navigando a `/buzz`** (es. `navigate('/buzz')` da wouter). Non serve (e non esiste) un launcher tipo DCL per BUZZ.

---

### 2. Come si determina “hai abbastanza per un BUZZ”

| Punto | Dettaglio |
|-------|-----------|
| **Soglia reale** | **Non fissa.** Il costo del prossimo BUZZ è **progressivo** in base ai click giornalieri: `src/lib/constants/buzzPricingM1U.ts` — `BUZZ_M1U_COST`: click 1–10 → 20 M1U, 11–20 → 40, 21–30 → 60, 31–40 → 80, 41–50 → 100, 51+ → 110 |
| **Fonte di verità** | `useBuzzCounter(userId)` → `getCurrentBuzzCostM1U()` che chiama `calculateBuzzCostM1U(dailyBuzzCounter)`. Il counter viene letto da Supabase `user_buzz_counter` (per data + user) |
| **DCL oggi** | In `DailyControlLoopCard` è usata la costante **`MIN_M1U_FOR_BUZZ = 20`** (hardcoded). È la soglia **minima** (primo tier). Quindi: messaggio “enough for BUZZ” può essere **falso** se l’utente ha già fatto 10+ BUZZ oggi (costo successivo 40+) |
| **Allineamento** | Per essere coerenti con il sistema reale il DCL deve usare **la stessa logica**: `m1uBalance >= getCurrentBuzzCostM1U()`. Richiede l’uso di `useBuzzCounter(user?.id)` nel card (un hook in più, chiamato in cima, prima di qualsiasi return) |

**Conclusione:** “Hai abbastanza per un BUZZ” è implementabile in modo corretto **solo** usando `getCurrentBuzzCostM1U()` da `useBuzzCounter`. La costante 20 è una stima conservativa; per C1 è preferibile allinearsi alla fonte reale.

---

### 3. Cosa possiamo aprire in modo safe dal DCL

| Opzione | Rischio | Impatto UX | Complessità | Paletti | Verdict |
|---------|--------|------------|-------------|---------|--------|
| **A. Aprire direttamente il flow BUZZ** | Il “flow” è la pagina `/buzz`. Aprire = navigare. Nessun modal BUZZ sulla Home da “aprire” senza cambio route. | Ottimo: un tap porta alla schermata BUZZ. | Bassa: `navigate('/buzz')`. | Nessun tocco a logica BUZZ. | **Consigliata** (equivale a “navigare a /buzz”) |
| **B. Launcher/interstitial dedicato** | Nuovo componente e stato; possibile duplicazione messaggi e confusione. | Intermedio. | Media. | Rischio refactor e scope creep. | Evitare |
| **C. Navigare alla sezione con CTA forte** | Minimo: si usa il router esistente. | Ottimo: CTA “Vai al BUZZ” → `/buzz`. | Bassa. | Rispettati. | **Consigliata** (stessa di A) |
| **D. Solo CTA contestuale senza apertura** | Zero. | Meno forte: l’utente deve cercare il BUZZ. | Bassa. | Ok. | Possibile ma meno efficace di A/C |

**Scelta raccomandata:** **C (navigazione con CTA forte)**. In pratica: in DCL, quando `daily_completion_count === 3` e `m1uBalance >= getCurrentBuzzCostM1U()`, mostrare un bottone/link “Vai al BUZZ” che chiama `navigate('/buzz')`. Nessun nuovo flow, nessuna modifica al BUZZ.

---

### 4. Coerenza gameplay e casi A/B/C

- **Frase “Ora hai abbastanza per un nuovo BUZZ”**  
  Implementabile in modo corretto: mostrarla **solo** quando `m1uBalance >= getCurrentBuzzCostM1U()` (e, in overlay, `(m1uBalance + celebrationAmount) >= getCurrentBuzzCostM1U()` dopo il claim). Fonte: stesso hook/pricing usato da `BuzzActionButton`.

- **Caso A — DCL completato + saldo sufficiente**  
  Mostrare messaggio “Ora hai abbastanza per un nuovo BUZZ” + **CTA “Vai al BUZZ”** che fa `navigate('/buzz')`. Implementabile senza toccare la logica BUZZ.

- **Caso B — DCL completato + saldo non sufficiente**  
  Mostrare messaggio tipo “Continua a costruire le tue risorse” (già presente: `home_daily_control_loop_m1u_build` / `dcl_celebration_build`). **Nessuna** CTA BUZZ. Già supportato; basta usare la condizione reale sul costo.

- **Caso C — Missione più rilevante del BUZZ**  
  Non esiste oggi in DCL (né altrove) una logica che confronti “priorità missione vs BUZZ”. Per C1 si mantiene solo la distinzione **saldo sufficiente → CTA BUZZ** vs **saldo insufficiente → messaggio build**. Eventuali priorità missione sono fuori scope e non bloccano.

---

### 5. File da toccare — proposta minima

| File | Modifica |
|------|----------|
| `src/components/home/DailyControlLoopCard.tsx` | (1) Import `useLocation` (wouter) e `useBuzzCounter`. (2) Chiamare `useBuzzCounter(user?.id)` e `useLocation()` in cima (prima di ogni return). (3) Sostituire l’uso di `MIN_M1U_FOR_BUZZ` con `getCurrentBuzzCostM1U()` (soglia reale). (4) Aggiungere, quando `daily_completion_count === 3` e `m1uBalance >= buzzCostReal`, una CTA “Vai al BUZZ” con `onClick={() => { buttonClickFeedback(); navigate('/buzz'); }}`. (5) In overlay celebrativo usare la stessa soglia reale per messaggio e eventuale CTA. |
| `src/locales/it/common.json` | Una chiave per la CTA, es. `home_daily_control_loop_go_buzz`: "Vai al BUZZ". |
| `src/locales/en/common.json` | Stessa chiave: "Go to BUZZ". |
| `src/locales/fr/common.json` | Stessa chiave: "Aller au BUZZ". |

**Nessun altro file:** non si toccano `BuzzPage`, `BuzzActionButton`, routing, auth, IAP, UnifiedHeader, BottomNavigation, DclLauncherContext (salvo non aggiungere openBuzz, che non serve).

---

### 6. Rischi reali

| Rischio | Valutazione |
|---------|-------------|
| Rompere il flow BUZZ | **No.** Si usa solo `navigate('/buzz')`. Nessuna modifica a BuzzPage/BuzzActionButton. |
| Rompere il saldo M1U | **No.** DCL legge già `useM1UnitsRealtime`; in più legge solo `useBuzzCounter` (getCurrentBuzzCostM1U). Nessuna scrittura. |
| Rompere CTA esistenti DCL | **No.** Commit/Streak/Mission restano invariate; si aggiunge solo una CTA condizionale in più. |
| CTA “false” che promettono BUZZ ma non aprono | **No.** La CTA viene mostrata solo se `m1uBalance >= getCurrentBuzzCostM1U()`. Il tap apre `/buzz`; la pagina BUZZ gestisce eventuali casi “non sufficiente” con la logica esistente. |
| Comportamenti incoerenti DCL vs gameplay | **Ridotti.** Allineando alla soglia reale (`getCurrentBuzzCostM1U`) si evita di dire “hai abbastanza” quando il prossimo BUZZ costa 40+. |
| Coupling pericoloso Home ↔ BUZZ | **Basso.** Solo dipendenza da `navigate` (wouter) e da `useBuzzCounter` (già usato altrove). Nessuna logica BUZZ spostata in Home. |

**Rischio aggiuntivo (hook order):** Aggiungere `useBuzzCounter` e `useLocation` **sempre in cima** al componente, prima di `if (loading) return ...`, per rispettare le Rules of Hooks e evitare un nuovo React #310.

---

### 7. GO / NO GO

**GO.**

- Root cause / realtà: BUZZ è una pagina `/buzz`; la soglia “abbastanza per un BUZZ” è data da `useBuzzCounter` + `buzzPricingM1U`; DCL oggi usa 20 M1U fissi.
- Strategia: usare **navigazione a `/buzz`** come unica “apertura” del flow; usare **`getCurrentBuzzCostM1U()`** come soglia reale; aggiungere **una CTA “Vai al BUZZ”** solo quando il saldo è sufficiente; messaggi già esistenti (m1u_ready / m1u_build e overlay) basati sulla stessa soglia.
- Implementazione minima: card + overlay con soglia reale; una CTA in card (e opzionale in overlay) che fa `navigate('/buzz')`; i18n per la CTA; nessun refactor e nessun tocco a BUZZ/auth/IAP/header/nav.
- Da non fare: non introdurre launcher/interstitial dedicati; non cambiare logica di BUZZ/BuzzActionButton; non usare più la costante 20 come unica soglia per il messaggio “enough for BUZZ”.

---

## Prossimo passo

Con **GO** confermato, si procede con **STEP B — Implementazione minima** come da obiettivi C1 e linee guida (messaggi contestuali, CTA reale, fallback intelligente, path dopo claim, nessuna regressione).
