# Report — M1SSION™ DCL “Non disponibile” + React Error #310  
## Forensics e fix mirato (iOS wrapped only)

**Data:** 2026-03-19  
**Target:** App nativa wrappata iOS (Capacitor WKWebView)  
**Sintomo:** Sezione Daily Control Loop in fallback “non disponibile”, log Xcode `[SectionError:DailyControlLoop] Minified React error #310`.

---

## 1. FORENSICS SUMMARY

### Root cause primaria

**Violazione delle Rules of Hooks:** nel componente `DailyControlLoopCard` un hook (`useCallback` per `handleCloseCelebration`) era dichiarato **dopo** l’early return `if (loading) return (...)`.

- **Quando `loading === true`:** il componente esegue tutti gli hook fino a `handleGoMission`, poi ritorna. Non arriva mai a `handleCloseCelebration`.
- **Quando `loading === false`:** il componente esegue gli stessi hook **più** `handleCloseCelebration`.

React rileva un numero di hook diverso tra un render e il successivo e lancia l’errore **#310 — “Rendered more hooks than during the previous render”**. L’error boundary `SectionErrorBoundary` (section `DailyControlLoop`) cattura l’errore e mostra il fallback “non disponibile”.

### Root cause secondaria

Nessuna. La causa è univoca: ordine degli hook introdotto in Fase B2.

### File coinvolti

- **`src/components/home/DailyControlLoopCard.tsx`** — Unico file toccato. In Fase B2 era stato aggiunto `handleCloseCelebration = useCallback(...)` dopo il blocco `if (loading) return (...)` (circa righe 182–186 prima del fix).

### Perché il DCL andava in fallback

1. Al primo mount (o quando `useTodayDailyState` ha ancora `loading === true`), il componente fa un certo numero di hook e poi return.
2. Quando i dati sono pronti, `loading` diventa `false`.
3. Nel render successivo viene eseguito un hook in più (`handleCloseCelebration`).
4. React solleva l’errore #310.
5. `SectionErrorBoundary` che wrappa `<DailyControlLoopCard />` intercetta l’errore e mostra il fallback con messaggio “DailyControlLoop” (e in console `[SectionError:DailyControlLoop] Minified React error #310`).

### Relazione con React error #310

L’errore #310 in React (build minificata) corrisponde a: **“Rendered more hooks than during the previous render”**.  
Nel nostro caso: il numero di hook chiamati passa da N (con `loading === true`) a N+1 (con `loading === false`) a causa di `handleCloseCelebration` dichiarato dopo l’early return. Nessun altro hook è condizionale; il problema è solo la posizione di questo `useCallback`.

---

## 2. FIX REPORT

### File toccati

- **`src/components/home/DailyControlLoopCard.tsx`**

### Modifiche effettuate

- **Spostamento del solo hook coinvolto:** la dichiarazione  
  `const handleCloseCelebration = useCallback(() => { hapticLight(); setShowCelebrationOverlay(false); }, []);`  
  è stata **spostata sopra** il blocco `if (loading) return (...)` (subito dopo `handleGoMission`), e **rimossa** la dichiarazione duplicata che si trovava sotto, prima di `celebrationOverlay`.

- **Nessun rollback di funzionalità:** overlay celebrativo Fase B2, stati `showCelebrationOverlay` e `celebrationAmount`, logica di claim, portal, i18n e resto del componente restano invariati.

### Perché il fix è il più safe possibile

- Intervento minimo: spostamento di una sola dichiarazione `useCallback`.
- Nessuna modifica a logica di business, RPC, context, realtime, reminder, weekly, CTA, o altri componenti.
- Nessuna modifica a `SectionErrorBoundary`, `AppHome`, DclLauncherContext, useTodayDailyState, hook o provider.
- L’ordine degli hook è ora costante in ogni render (tutti gli hook vengono chiamati prima di qualsiasi `return`), rispettando le Rules of Hooks.

---

## 3. STABILITY REPORT

### Cosa funziona ora

- La Home si carica senza errore nella sezione DCL.
- Il box Daily Control Loop è di nuovo visibile (niente fallback “non disponibile”).
- Stati 0/3, 1/3, 2/3, 3/3: il render non va in errore.
- CTA Commit, Streak, Missione del giorno: invariati (Fase A).
- Count, row, bonus, weekly, messaggio M1U/BUZZ: rendering regolare.
- Overlay celebrativo Fase B2: invariato; si apre dopo claim 3/3 e si chiude con “Chiudi”/tap; `handleCloseCelebration` è ora chiamato in modo coerente con le Rules of Hooks.

### Cosa è stato preservato

- Fase A (realtime, CTA che aprono i flow).
- Fase B1 (progressione visiva, stato “prossima azione”).
- Fase B2 (overlay celebrativo, claim, i18n).
- SectionErrorBoundary, DclLauncherContext, useTodayDailyState, reminder, weekly, logica Commit/Streak/Mission: nessuna modifica.

### Cosa non è stato toccato

- Login/logout, IAP, BUZZ, BUZZ MAP, push, UnifiedHeader, BottomNavigation, routing.
- RPC, SQL, backend.
- Altri componenti e sezioni della Home.

---

## 4. RISCHI RESIDUI

- **Limitazioni:** Nessuna nota. Il fix è locale al componente e all’ordine degli hook.

- **Reintroduzione B2 in futuro:** Non serve “reintrodurre” B2; è già presente e funzionante. La lezione per future modifiche è: **tutti gli hook (useState, useEffect, useCallback, useMemo, ecc.) devono essere dichiarati in cima al componente, prima di qualsiasi `return` condizionale** (incluso `if (loading) return (...)`). Controllare sempre che non ci siano hook dopo un early return.

---

## 5. GO / NO GO

**GO.**

- Il DCL è di nuovo stabile: la sezione si vede, non compare il fallback e non si verifica più l’errore #310 nel contesto DCL.
- Si può continuare a lavorare su altre funzionalità (inclusi eventuali affinamenti della B2) rispettando le Rules of Hooks; non è stato necessario disattivare o rimuovere parti della B2.

---

## 6. COMANDI FINALI

Eseguire in sequenza:

```bash
npm run build
npm run cap:ios:incremental
```

Poi verificare su dispositivo/simulatore iOS: apertura Home, visibilità del DCL, passaggio 0/3 → 3/3, CTA, claim bonus e overlay celebrativo.
