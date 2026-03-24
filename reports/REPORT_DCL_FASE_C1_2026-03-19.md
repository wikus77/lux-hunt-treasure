# Report — M1SSION™ DCL Fase C1  
## DCL → Core gameplay link (verifica + implementazione)

**Data:** 2026-03-19  
**Target:** App nativa wrappata iOS (Capacitor WKWebView).

---

## STEP C — REPORT FINALE

### 1. Cosa è stato verificato

- **Flusso BUZZ:** Route `/buzz`, pagina `BuzzPage`, pulsante `BuzzActionButton`. Nessun launcher tipo DCL per BUZZ; entry point = navigazione alla pagina.
- **Soglia “abbastanza per un BUZZ”:** Fonte reale = `useBuzzCounter(userId)` → `getCurrentBuzzCostM1U()` (costo progressivo 20–110 M1U da `buzzPricingM1U.ts`). DCL usava la costante 20; ora allineato alla stessa fonte.
- **Opzione safe per collegare DCL → BUZZ:** Navigazione a `/buzz` con CTA “Vai al BUZZ” quando il saldo è sufficiente. Nessuna modifica al flow BUZZ.
- **Coerenza gameplay:** Messaggio “Ora hai abbastanza per un nuovo BUZZ” solo quando `m1uBalance >= getCurrentBuzzCostM1U()`. Fallback “Continua a costruire le tue risorse” quando il saldo non basta.
- **Rischi:** Nessun tocco a logica BUZZ, auth, IAP, header, nav; hook aggiunti in cima (nessun hook dopo early return).

---

### 2. Cosa è stato implementato

| Modifica | Dettaglio |
|----------|-----------|
| **Soglia reale** | In `DailyControlLoopCard`: uso di `useBuzzCounter(user?.id)` e `buzzCostReal = getCurrentBuzzCostM1U()`. Sostituzione di ogni uso di `MIN_M1U_FOR_BUZZ` (rimossa) con `buzzCostReal` in card e overlay celebrativo. |
| **Messaggi contestuali** | Stessi testi i18n esistenti; condizione aggiornata: “Ora hai abbastanza per un nuovo BUZZ” / “Continua a costruire” in base a `m1uBalance >= buzzCostReal` (card) e `(m1uBalance + celebrationAmount) >= buzzCostReal` (overlay). |
| **CTA “Vai al BUZZ”** | Quando `daily_completion_count === 3` e `m1uBalance >= buzzCostReal`: bottone sotto il messaggio M1U/BUZZ che chiama `buttonClickFeedback()` e `navigate('/buzz')`. Testo da i18n `home_daily_control_loop_go_buzz`. |
| **Fallback** | Se il saldo non basta, non viene mostrata la CTA BUZZ; resta solo il messaggio “Continua a costruire le tue risorse” (già presente). |
| **Path dopo claim** | Dopo claim 3/3, `refetch()` aggiorna lo stato; `useM1UnitsRealtime` e `useBuzzCounter` forniscono saldo e costo aggiornati; se il nuovo saldo ≥ costo BUZZ, la CTA “Vai al BUZZ” appare senza cambiare pagina. |

---

### 3. File toccati

| File | Modifiche |
|------|-----------|
| `src/components/home/DailyControlLoopCard.tsx` | Import `useBuzzCounter`, `useLocation` (wouter). Hook `useBuzzCounter(user?.id)`, `useLocation()`, variabile `buzzCostReal = getCurrentBuzzCostM1U()`. Soglia da `buzzCostReal` in messaggio card e in overlay. CTA “Vai al BUZZ” (solo se 3/3 e saldo ≥ buzzCostReal) con `navigate('/buzz')`. Rimossa costante `MIN_M1U_FOR_BUZZ`. |
| `src/locales/it/common.json` | Aggiunta chiave `home_daily_control_loop_go_buzz`: "Vai al BUZZ". |
| `src/locales/en/common.json` | Aggiunta chiave `home_daily_control_loop_go_buzz`: "Go to BUZZ". |
| `src/locales/fr/common.json` | Aggiunta chiave `home_daily_control_loop_go_buzz`: "Aller au BUZZ". |

---

### 4. Perché è safe

- **Nessun tocco al flow BUZZ:** Solo `navigate('/buzz')`; nessuna modifica a `BuzzPage`, `BuzzActionButton`, pricing, debito M1U.
- **Nessun tocco ad auth / IAP / header / nav / routing globale:** Solo uso del router wouter già usato in Home.
- **Soglia allineata al sistema:** Stessa fonte di `BuzzActionButton` (`useBuzzCounter` + `buzzPricingM1U`); niente “abbastanza per BUZZ” quando il costo reale è superiore al saldo.
- **Hook order:** `useBuzzCounter` e `useLocation` in cima al componente, prima di qualsiasi `return`; `buzzCostReal` è una variabile derivata, non un hook.
- **Fasi A, B1, B2:** Realtime, CTA Commit/Streak/Mission, progressione visiva, overlay celebrativo, weekly, reminder, claim bonus e SectionErrorBoundary restano invariati.

---

### 5. Cosa NON è stato toccato

- `BuzzPage.tsx`, `BuzzActionButton.tsx`, `useBuzzHandler`, logica BUZZ e BUZZ MAP.
- `UnifiedHeader.tsx`, `BottomNavigation.tsx`, routing globale, auth, IAP, cancellazione account, notifiche push.
- `DclLauncherContext` (nessun `openBuzz`).
- RPC, SQL, backend.
- Commit, Streak, Daily Mission (business logic).
- Altri componenti Home (StreakPill, NextActionContainer, CommitNodesContainer, ecc.).

---

### 6. Come verificare su iPhone

1. **Home load:** Aprire la Home; il DCL è visibile, nessun fallback.
2. **0/3, 1/3, 2/3:** Nessuna CTA BUZZ (solo quando 3/3 e saldo sufficiente).
3. **3/3 + saldo < costo BUZZ:** Messaggio “Continua a costruire le tue risorse”; nessun bottone “Vai al BUZZ”.
4. **3/3 + saldo ≥ costo BUZZ:** Messaggio “Le risorse di oggi sono pronte. Usa le M1U per il BUZZ.” + bottone “Vai al BUZZ”; tap porta a `/buzz`.
5. **Claim bonus 3/3:** Overlay celebrativo; messaggio “Ora hai abbastanza per un nuovo BUZZ” solo se `(saldo + 10) ≥ costo prossimo BUZZ`. Dopo chiusura overlay, in card la CTA “Vai al BUZZ” appare se il saldo aggiornato è sufficiente.
6. **Lingua:** Verificare IT/EN/FR per il testo della CTA.

---

### 7. GO / NO GO per la fase successiva

**GO.** Il DCL è collegato al core gameplay con soglia reale e CTA navigazione; nessuna regressione sulle fasi precedenti e sui paletti. Si può procedere con fasi successive (es. C2 o altre estensioni DCL) mantenendo le stesse regole (hook order, nessun tocco a BUZZ/auth/IAP).

---

## STEP D — COMANDI FINALI

Eseguire in sequenza:

```bash
npm run build
npm run cap:ios:incremental
```

Poi aprire il progetto in Xcode e testare su dispositivo o simulatore iOS.
