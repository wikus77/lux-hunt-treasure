# Report — M1SSION™ Home v2 / Pill laterali verticali (UI only)

**Data:** 2026-03-19  
**Target:** App nativa wrappata iOS (Capacitor WKWebView)  
**Scope:** Solo Home, solo layer UI aggiuntivo + tap sicuri. Nessuna rimozione container esistenti.

---

## 1. VERIFICA READ-ONLY (Fase 0)

### 1.1 Componenti / container attuali

| Richiesta | Componente / selettore | File principale |
|-----------|------------------------|-----------------|
| **Prossima Azione** | `NextActionContainer` dentro `#home-daily-mission` | `AppHome.tsx` |
| **Commit** | `CommitNodesContainer` in `#home-daily-commit` | `AppHome.tsx` → `CommitNodesContainer` / `CommitNodeTrigger` |
| **Tempo Rimasto** | Sezione “TEMPO RIMASTO” con `ActiveMissionBox` (include blocco tempo + indizi + stato) | `CommandCenterHome.tsx` → `ActiveMissionBox.tsx` |
| **M1SSION Agent** | `AgentDiary` in wrapper `data-section="agent"` | `CommandCenterHome.tsx` |
| **M1SSION Battle** | `BattleConsole` in wrapper `data-section="battle"` | `CommandCenterHome.tsx` |

### 1.2 File che montano i blocchi sulla Home

- **`src/pages/AppHome.tsx`:** PrizeVision, Streak/Shop/Cashback, DCL, Commit, Next Action; poi `CommandCenterHome` (Agent, Tempo/ActiveMissionBox, Battle).
- **`src/components/command-center/CommandCenterHome.tsx`:** struttura Agent / ActiveMissionBox / BattleConsole.

### 1.3 Apertura / gestione flow oggi

| Blocco | Comportamento tipico |
|--------|----------------------|
| **Prossima Azione** | Tap su card → overlay/modal missione; **DclLauncherContext** `openMission()` registrato in `NextActionContainer`. |
| **Commit** | Tap su nodo AION → `CommitModal`; **DclLauncherContext** `openCommit()` in `CommitNodeTrigger`. |
| **Agent** | Contenuto in-page in `AgentDiary` (nessun launcher globale trovato). |
| **Tempo rimasto** | Long-press / tap su card in `ActiveMissionBox` → modali (`GlassModal` tempo / stato). |
| **Battle** | `BattleConsole` in-page; overlay `BattleArenaOverlay` per deep-link. |

### 1.4 Apertura programmatica riusabile

- **Commit / Prossima Azione:** sì — `useDclLauncher()` → `openCommit()`, `openMission()` (con fallback scroll già usato nel DCL).
- **Agent / Tempo / Battle:** nessun context tipo DCL; fallback sicuro = **`scrollIntoView`** verso sezioni con `data-section="agent" | "status" | "battle"` (già presenti in `CommandCenterHome`).

### 1.5 Logica colore dinamico **Tempo rimasto** (conferma)

Fonte: **`ActiveMissionBox.tsx`** (linee ~478–479, 661–674, modali ~205–206, 360–363).

- **`isFinalDay`:** `remainingDays === 0` → rosso (`text-red-400`, bordi/glow rossi).
- **`isUrgent`:** `remainingDays <= 5` (e non solo final day) → arancione (`text-orange-400`, `orange-400/500`).
- **Altrimenti:** ambra / giallo (`text-amber-400`, progress bar con tier `<= 15` giallo-arancio, `> 15` più calmo).

**Nota:** Non è una soglia “72 ore”; è basata su **giorni rimanenti** (`daysRemaining` da `useMissionStatus`). Il modal tempo usa anche `remainingDays <= 5` come urgente e `<= 0` scaduto.

### 1.6 Pattern UI flottante esistenti

- `M1UPill` fisso sinistra `z-[1001]` (`#m1u-pill-home-slot`).
- `AgentEnergyPill` / rank `fixed z-[70]` in basso a destra (se `PULSE_ENABLED`).
- `InviteFloatingButton`, notifiche banner `z-40` area header.

### 1.7 Posizionamento pill laterali

- Layer **`fixed`**, `z-[85]`: sotto M1U/header overlay elevati, sopra sfondo scroll principale; sotto modali fullscreen (es. Streak success ~100000).
- **`pointer-events: none`** sul wrapper, **`pointer-events: auto`** solo sui bottoni: lo scroll centrale non è bloccato dalle aree vuote.
- **`paddingBottom`**: `calc(88px + safe-area)` per non coprire la bottom navigation tipica.
- **`top`**: `calc(safe-area + 188px)` per ridurre sovrapposizione con la pill M1U sinistra.

### 1.8 Rischi valutati

| Rischio | Mitigazione |
|---------|-------------|
| Sovrapposizione M1U sinistra | Top stack abbassato (188px da safe-area). |
| z-index vs modali | z 85 << overlay celebrativi. |
| Touch / scroll | pointer-events solo sui pill. |
| Crash | `SectionErrorBoundary` + try/catch su handler tap + scroll sicuro. |
| Hook order | Componente montato solo se flag true; nessun early return prima degli hook nel layer. |

**Esito verifica:** implementazione **GO** (solo UI + wiring documentato).

---

## 2. IMPLEMENTAZIONE APPLICATA

### 2.1 File toccati

| File | Modifica |
|------|----------|
| `src/config/featureFlags.ts` | Aggiunta **`HOME_V2_SIDE_PILLS_ENABLED`** (default **`false`**). |
| `src/components/home/HomeSidePillsLayer.tsx` | **Nuovo** layer UI: stack sinistro (Prossima azione, Commit, Agent), stack destro (Tempo, Battle). |
| `src/pages/AppHome.tsx` | Import flag + componente; render condizionato **dentro `DclLauncherProvider`**, con `SectionErrorBoundary`. |
| `src/locales/it/en/fr/common.json` | Chiavi `home_side_pill_*` (etichette pill + “OK/Done” per Commit fatto). |

### 2.2 Feature flag

- **`HOME_V2_SIDE_PILLS_ENABLED`** in `featureFlags.ts`.
- **`false`:** il layer **non viene montato** → Home identica al comportamento precedente.
- **`true`:** compaiono i 5 pill. Rollback: impostare **`false`** e ricompilare (o hot reload in dev).

### 2.3 Fallback

- Ogni tap è in **try/catch**; in caso di errore si usa scroll verso id/`querySelector` ove possibile.
- **Prossima azione:** `openMission()` → se `false`, scroll `#home-daily-mission`.
- **Commit:** `openCommit()` → se `false`, scroll `#home-daily-commit`.
- **Agent / Tempo / Battle:** scroll a `[data-section="agent"|"status"|"battle"]`.

### 2.4 z-index / pointer-events / iOS

- Wrapper: `z-[85]`, `pointer-events-none`, padding safe-area.
- Bottoni: `pointer-events-auto`, `active:scale-[0.97]` per feedback leggero.

---

## 3. TAP MATRIX

| Pill | Mostra | Tap → | Diretto / fallback |
|------|--------|-------|---------------------|
| **Prossima azione** | Label i18n, icona Target, glow forte | `openMission()` | Diretto se registrato; altrimenti scroll al container missione. |
| **Commit** | Label, icona done/sparkle da `commit_done` | `openCommit()` | Diretto se registrato; altrimenti scroll Commit. |
| **M1SSION Agent** | Label compatta | Scroll a `data-section="agent"` | Solo fallback scroll (nessun launcher globale). |
| **Tempo rimasto** | Giorni (`missionStatus.daysRemaining`) + colori allineati a ActiveMissionBox (0 / ≤5 / altro) | Scroll a `data-section="status"` | Fallback scroll (non riapre il modal tempo — stessa UX “porta alla sezione”). |
| **M1SSION Battle** | Label + icona | Scroll a `data-section="battle"` | Fallback scroll. |

**Limitazione documentata:** Tempo rimasto e Battle/Agent non aprono modali programmatici senza refactor di `ActiveMissionBox` / `BattleConsole`; la fase richiedeva zero modifica business logic → solo scroll alla sezione reale.

---

## 4. RISCHI RESIDUI

- **Sovrapposizione visiva** su iPhone piccoli tra pill sinistri e M1U: mitigato con `top` 188px; da validare su device reale.
- **`commit_done`** letto da `useTodayDailyState`: allineato al DCL ma dipende dagli stessi dati; se hook in errore, boundary intercetta l’intero layer.
- **Colori tempo** nel pill duplicano le soglie di `ActiveMissionBox` (commento in codice): se in futuro cambiano lì, andrebbero sincronizzati o estratti in util condiviso.

---

## 5. GO / NO GO

- **GO** per test su iPhone dopo aver impostato **`HOME_V2_SIDE_PILLS_ENABLED = true`** in `featureFlags.ts`, poi `npm run build` e sync Capacitor.
- **GO** per fase successiva (affinamenti layout, eventuale scroll offset, o estrazione helper tempo condiviso) dopo feedback reale — **senza** obbligo di rimuovere i container duplicati in questa fase.

---

## 6. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```

**Per attivare i pill:** in `src/config/featureFlags.ts` impostare `HOME_V2_SIDE_PILLS_ENABLED = true`.
