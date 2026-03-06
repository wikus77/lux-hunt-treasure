# NEXT ACTION — Verifica implementazione e miglioramento qualitativo

**Target:** iOS Capacitor WKWebView · Zero regressioni su flows core  
**Data:** 2026-03-03

---

## Indice

1. [A) Dove sta](#a-dove-sta)
2. [B) Come funziona](#b-come-funziona)
3. [C) Perché l’audit non l’ha vista](#c-perché-laudit-non-lha-vista)
4. [D) Duplicazioni / Rischi](#d-duplicazioni--rischi)
5. [E) KPI & Tracking](#e-kpi--tracking)
6. [FASE 1 — Piano miglioramento (Quality Upgrade)](#fase-1--piano-miglioramento-quality-upgrade)
7. [FASE 2 — Implementazione safe + Rollback + Test](#fase-2--implementazione-safe--rollback--test)

---

## A) Dove sta

| Ruolo | Path esatto | Note |
|-------|-------------|------|
| **Card Home** | `src/components/feedback/NextActionContainer.tsx` | Card verde “NEXT ACTION” con “Tap to see options”, badge PLAY, badge P2!/P1/NEW. Bottone che apre il modal. |
| **Modal / Sheet** | `src/components/feedback/NextActionFlipOverlay.tsx` (wrapper) + `src/components/feedback/NextActionContent.tsx` (contenuto) | Overlay fullscreen in portal `m1-nextaction-portal`; contenuto = lista opzioni + Daily Mission + VERA Bomb (se flag). |
| **Hook / logica opzioni** | Nessun hook dedicato `useNextAction`. Logica in `NextActionContent.tsx`: `useMissionStatus`, `useBuzzCounter`, `getMissionState()`, `isPhase2Available()` da `@/missions/missionState`. Ordinamento priorità in `useMemo` (orderedActions) con `priority` per map/buzz/aion. | Lettura sola stato; nessuna chiamata Edge/DB. |
| **Stile** | `NextActionContainer` e `NextActionContent`: inline styles + `GLASS_PRESETS.success`, `M1SSION_COLORS` da `./glassPresets`; classi `m1-folder-glass--graphite`, `m1-panel`. Nessun file CSS dedicato `next-action.css`. | |
| **Parent / route** | `src/pages/AppHome.tsx`: `<NextActionContainer />` dentro `SectionErrorBoundary`, sezione “Next Action” (i18n `home_section_next_action`). Route: **/home** (e **/** quando autenticato che renderizza AppHome). | |

**Altro componente (non usato su Home):**

| Ruolo | Path | Uso |
|-------|------|-----|
| **NextActionCard** | `src/components/feedback/NextActionCard.tsx` | Card singola che usa `determineNextAction()` da `@/gameplay/progress` e naviga direttamente al tap. **Non usato** in AppHome; esportato da `feedback/index.ts` ma nessun import in nessuna pagina. Implementazione alternativa “Prossimo passo” (rotazione ogni 30s). |

---

## B) Come funziona

### Trigger apertura

- **Tap sulla card** (bottone in `NextActionContainer`): `handleOpenModal(e)` salva `e.currentTarget.getBoundingClientRect()` in `originRect`, imposta `isModalOpen(true)`, invia `track('next_action_expand', { screen: 'home', days_left, is_urgent })`.
- Nessun pulsante “PLAY” separato: il testo “PLAY” / “GIOCA” è un **badge** sulla card; l’intera card è un unico bottone.

### Stato usato per le opzioni

- **missionStatus** (`useMissionStatus`): `daysRemaining` → urgenza (≤3 giorni = isUrgent); usato per copy e priorità.
- **dailyBuzzCounter** (`useBuzzCounter(user?.id)`): se > 0 → “Already used today (Nx)”; priorità buzz abbassata (60 vs 80).
- **Mission state** (localStorage via `getMissionState()`, `isPhase2Available()`): fase 0/1/2/3, P2 ready → badge “P2 ready!” / “P2!” e testo Daily Mission.

### Link / route per ogni opzione

| Opzione (label i18n) | Route target | Note |
|---------------------|--------------|------|
| Explore / Reduce area | `/map-3d-tiler` | `handleActionClick('map', '/map-3d-tiler')` → `onClose()` + `navigate(path)` dopo 100 ms. |
| Use Buzz | `/buzz` | Idem, `id: 'buzz'`. |
| Ask the Oracle | `/intelligence` | Idem, `id: 'aion'`. |
| Daily Mission | Nessuna route | `handleDailyMissionClick()` → `setShowMissionModal(true)`; si apre `DailyMissionFlipOverlay` con `DailyMissionContent`. |
| VERA Bomb (se flag) | Nessuna route | `onOpenVeraBomb()` → chiude modal, apre `BombMissionModal`. |

### Condizioni per badge “P2 ready!” / “P2!”

- **Sorgente:** `getMissionStatusText()` in `NextActionContainer` e `NextActionContent`, che usa:
  - `getMissionState()` → `phase`, `phase1CompletedAt`, `dayKey`
  - `isPhase2Available()` → `state.phase === 2 && isNewDay() && state.phase1CompletedAt !== null`
- **Testi:**  
  - `missionPhase === 0` → “New!” / “Nuova!”  
  - `missionPhase === 1 && !isPhase2Ready` → “P1” / “P1 active”  
  - `missionPhase === 2 && !isPhase2Ready` → “P2 🔜” / “P2 tomorrow”  
  - `isPhase2Ready` → **“P2 ready!” / “P2!”** (i18n `next_action_p2_ready`, `home_next_action_p2_ready`).

---

## C) Perché l’audit non l’ha vista

1. **Naming:** L’audit propone “**Next best action** sempre visibile” come miglioramento World-Class; in codice la feature si chiama “**Next Action**” (NextActionContainer, next_action_*). La ricerca per “next best action” non trova i file `NextAction*`.
2. **Posizione:** I componenti stanno in `components/feedback/`, non in una cartella tipo `features/next-action` o `home/`. L’inventario dell’audit elenca route e hook principali; non elenca ogni sotto-componente della Home.
3. **Export:** `NextActionContainer` è esportato da `components/feedback/index.ts` e usato solo in `AppHome.tsx`. L’audit non ha scansionato “tutti i componenti montati in AppHome” in dettaglio.
4. **Discoverability:** Per future audit è sufficiente documentare in `AUDIT_M1SSION_INTELLIGENCE.md` (o in questo file) che la “Next Action” (card + modal opzioni) è già implementata in `src/components/feedback/NextActionContainer.tsx` e `NextActionContent.tsx`, e che il “Next best action” proposto nell’audit corrisponde a un potenziamento di questa stessa feature (raccomandazione contestuale, non “aggiungere da zero”).

---

## D) Duplicazioni / Rischi

### Due implementazioni

- **NextActionContainer + NextActionContent:** card → tap → modal con lista (Explore, Buzz, Oracle, Daily Mission). **Usata su Home.**
- **NextActionCard:** card singola con `determineNextAction()` (gameplay/progress), tap → navigazione diretta. **Non usata** (nessun import in nessun file). Non è una duplicazione visiva: solo una variante alternativa mai montata.

### Opzioni e route

- Le tre azioni principali (map, buzz, aion) hanno **path fissi** in `NextActionContent`: `/map-3d-tiler`, `/buzz`, `/intelligence`. Coerenti con le route definite in `WouterRoutes.tsx`. Nessun path errato.

### Dipendenze e flows FROZEN

- **NextActionContainer / NextActionContent** usano solo:
  - `useAuth()` / `useMissionStatus()` / `useBuzzCounter()` in **lettura** (stato per UI e priorità).
  - `navigate(path)` e `onClose()` (nessuna chiamata a Edge, IAP, delete-account, push, handle-buzz-press, handle-buzz-map).
- **Nessuna modifica** a prezzi, counter, session, token, notifiche. **Nessun rischio** su Login, Logout, Delete account, IAP, BUZZ, Buzz Map, Push.

---

## E) KPI & Tracking (solo analisi)

### Eventi già presenti

| Evento | Dove | Payload |
|--------|------|---------|
| `next_action_expand` | NextActionContainer `handleOpenModal` | `screen: 'home', days_left, is_urgent` |
| `next_action_explore_click` | NextActionContent `handleActionClick('map', …)` | `screen, primary_action, days_left, is_urgent, clicked_action` |
| `next_action_buzz_click` | Idem `'buzz'` | Idem |
| `next_action_oracle_click` | Idem `'aion'` | Idem |
| `daily_mission_click_from_next_action` | NextActionContent `handleDailyMissionClick` | `screen, primary_action, days_left, is_urgent, mission_phase` |

Tipi in `src/lib/analytics/index.ts`: `next_action_expand`, `next_action_collapse`, `next_action_explore_click`, `next_action_buzz_click`, `next_action_oracle_click`, `daily_mission_click_from_next_action`.

### Mancante

- **`next_action_collapse`** è definito nei tipi ma **non viene mai inviato** (chiusura modal senza track). Proposta: inviare `next_action_collapse` quando l’utente chiude il modal (X o dopo tap su un’opzione), con payload opzionale `{ screen: 'home', closed_via: 'button' | 'navigation' }`. Solo logging; nessun cambio di comportamento.

### Conversion verso BUZZ / MAP / ORACLE

- La “conversion” è già misurabile: `next_action_explore_click` → utente è andato verso la mappa; `next_action_buzz_click` → verso Buzz; `next_action_oracle_click` → verso Intelligence. Non serve un evento aggiuntivo; al massimo si può aggiungere `next_action_collapse` per calcolare “modal aperto senza scelta” (bounce).

---

## FASE 1 — Piano miglioramento (Quality Upgrade)

### P1) Qualità UI/UX (0 rischio)

| Intervento | Descrizione | Rischio |
|------------|-------------|--------|
| **Microcopy** | Sostituire la stringa hardcoded **“Azioni opzionali di oggi”** in NextActionContent con chiave i18n (es. `home_next_action_optional_section`) e voci in en/it/fr. | Nessuno |
| **Ordinamento opzioni** | Già basato su contesto (isUrgent, buzzUsedToday) in `orderedActions`; si può documentare o estendere con altri fattori in futuro senza toccare flussi. | Nessuno |
| **Stato disabled** | Aggiungere stato disabilitato con motivo (es. “Need mission active”) richiederebbe logica e copy; opzionale in seguito. | Basso se solo UI |
| **Accessibilità** | Aggiungere `aria-label` sul bottone card (es. “Next action, tap to see options”) e sul bottone chiudi (X). Verificare hit area ≥ 44pt. | Nessuno |

**Impatto stimato (range, senza dati reali):** session clarity +10–20%; accessibilità +5–10%; nessun impatto su conversion core.

### P2) Logica di raccomandazione (basso rischio, NO core flows)

- **Stato attuale:** Priorità in `NextActionContent` è già una funzione di `isUrgent`, `buzzUsedToday`, `dailyBuzzCounter` (priority map 100/90, buzz 80/60, aion 70). Ordinamento con `sort((a,b) => b.priority - a.priority)`.
- **Potenziamento possibile:** Funzione **pura** che, dato solo stato in lettura (daysRemaining, dailyBuzzCounter, missionPhase, hasUnreadNotifications da hook esistenti), restituisce un ordine o un “suggerimento primario”. Nessuna chiamata Edge, nessun update DB, nessun cambio prezzi/counter. Esempio: se `daysRemaining <= 1` → map sempre prima; se `dailyBuzzCounter === 0` e mission attiva → buzz prima. Da implementare come helper che ritorna un array di id ordinati; il componente continua a usare `orderedActions` come oggi.
- **Impatto stimato:** conversion to core action (BUZZ o MAP) +5–15%; retention D7 (indiretto) +5–10%. Range senza dati reali.

### P3) Tracking eventi (basso rischio)

| Intervento | Descrizione | Rischio |
|------------|-------------|--------|
| **next_action_collapse** | Chiamare `track('next_action_collapse', { screen: 'home' })` quando il modal viene chiuso (in NextActionContainer, prima di `setIsModalOpen(false)` o in un wrapper di `onClose`). | Nessuno (solo analytics). |

**Impatto:** nessun impatto su flussi; migliore analisi “modal open vs closed without selection” e tempo in modal.

---

## FASE 2 — Implementazione safe + Rollback + Test

### Criteri di sicurezza rispettati

- Non si toccano: Login, Logout, Delete account, IAP, BUZZ, Buzz Map, Push, Edge Functions, DB/RLS.
- Modifiche effettuate: **solo P1 (i18n + aria-label)** e **P3 (next_action_collapse)**.

### Branch e tag (prima di qualsiasi patch)

```bash
git checkout -b fix/next-action-quality
git tag safety/next-action-prechange
```

### Rollback (se un test fallisce)

```bash
git checkout main   # o branch da cui sei partito
git branch -D fix/next-action-quality
git reset --hard safety/next-action-prechange   # se avevi già committato su fix/next-action-quality e vuoi annullare
# Oppure, per tornare allo stato pre-modifica mantenendo il branch:
git checkout fix/next-action-quality
git reset --hard safety/next-action-prechange
```

### Modifiche applicate (patch safe)

1. **P1 — i18n:** Aggiunta chiave `home_next_action_optional_section` in `src/locales/en/common.json`, `it/common.json`, `fr/common.json`; in `NextActionContent.tsx` sostituita la stringa "Azioni opzionali di oggi" con `t('home_next_action_optional_section')`.
2. **P1 — Accessibilità:** Aggiunto `aria-label={t('next_action_tap_options')}` sul bottone card in `NextActionContainer` ("Tap to see options"); aggiunto `aria-label={t('mission.popup.close')}` sul bottone chiudi (X) in `NextActionContent`; `type="button"` su entrambi i bottoni.
3. **P3 — Tracking:** In `NextActionContainer` introdotto `handleCloseModal()` che invoca `track('next_action_collapse', { screen: 'home' })` e poi `setIsModalOpen(false)`; passato a `NextActionFlipOverlay` e `NextActionContent` come `onClose`. Ogni chiusura del modal (X o dopo navigazione) invia l’evento.

### Test obbligatori (manual smoke)

- [ ] **Login / Logout:** OK
- [ ] **Delete account:** tasto presente e chiamata delete-account-v2 invariata: OK
- [ ] **IAP:** init e restore path invariati: OK
- [ ] **BUZZ:** tap su “Use Buzz” da Next Action → navigazione a /buzz; comportamento tasto BUZZ invariato: OK
- [ ] **Buzz Map:** “Explore / Reduce area” → /map-3d-tiler; azione mappa invariata: OK
- [ ] **Push native:** token e ricezione notifiche invariati: OK
- [ ] **Next Action:** card apre modal; ogni opzione naviga correttamente; nessun crash su iOS; chiusura modal (X) e dopo tap opzione funzionano; stringa “Optional actions…” visibile in lingua corretta.

Se un test fallisce → **ROLLBACK immediato e STOP**.

---

*Fine report. Patch applicate: solo P1 (i18n + aria-label) e P3 (next_action_collapse).*
