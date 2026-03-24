# Report — M1SSION™ Home v2 / Rebuild pill laterali floating AAA

**Data:** 2026-03-19  
**Target:** iOS wrapped (Capacitor WKWebView)  
**Scope:** Solo UI + wiring launcher; container Home esistenti intatti.

---

## 1. VERIFICA READ-ONLY (sintesi)

### Cosa salvare vs rifare
- **Prima iterazione:** pill rettangolari, scroll-first → **sostituita** da capsule floating, motion leggera, badge reali.
- **Pattern tecnici mantenuti:** `SectionErrorBoundary`, `pointer-events-none` sul layer + `auto` sui tap, safe-area, posizione sotto M1U.

### Launcher diretti reali (prima del rebuild)
| Voce | Prima | Dopo |
|------|-------|------|
| Prossima azione | `openMission()` + fallback scroll | **Stesso** (primario: launcher) |
| Commit | `openCommit()` + fallback scroll | **Stesso** |
| Agent | Solo scroll | **`registerOpenAgent`** → `AgentDiaryFlipOverlay` |
| Tempo | Solo scroll | **`CustomEvent('openMissionModal', { detail: 'time' })`** (già in `ActiveMissionBox`, nessuna modifica logica) |
| Battle | Solo scroll | **`registerOpenBattle`** → lobby `BattleConsole` |

### Logica Tempo rimasto (invariata)
- **Soglie visive pill:** `remainingDays === 0` → finale/rosso; `remainingDays ≤ 5` → urgente/arancio; altrimenti ambra.
- **Anello SVG:** progresso `(totalDays - remainingDays) / totalDays` con `totalDays` da `useMissionStatus` (fallback 30).
- **Modal tempo:** aperto dall’evento globale già ascoltato in `ActiveMissionBox` (righe ~430–447).

### Badge dinamici (dati reali)
| Pill | Dati |
|------|------|
| Prossima azione | `useDailyEngineV2`: fase/run, missionId, loading; completamento `phase===3 && status==='completed'` |
| Commit | `useTodayDailyState().commit_done` |
| Agent | `useAgentCode().agentCode` (troncato) o etichetta fallback i18n |
| Tempo | giorni rimanenti + stato urgente/finale |
| Battle | `useBattlePendingCount` (stessa query filtro di `BattleConsole` su `battles` pending/accepted) |

### Blob Commit nel pill
- **Non** incorporato il modello 3D AION nel pill (peso THREE.js / WKWebView). Identità operativa: **icona Sparkles + glow cyan**, coerente M1SSION.

### Floating senza rompere layout
- `z-[88]` sotto M1U (`1001`) e modali fullscreen alti; `paddingBottom` per bottom nav; stack `top: calc(safe-area + 192px)`.

### File toccati (rebuild)
- Nuovi: `HomeSectionLauncherContext.tsx`, `useBattlePendingCount.ts`
- Riscritto: `HomeSidePillsLayer.tsx`
- Wiring minimo: `AgentDiary.tsx`, `BattleConsole.tsx`, `AppHome.tsx`, `featureFlags.ts`
- i18n: `it/en/fr common.json`
- **Non modificati:** `UnifiedHeader`, `BottomNavigation`, logica interna `ActiveMissionBox` / DCL / Commit / Battle game.

### Rischio regressione
- **Basso:** registrazioni launcher solo `useEffect` + ref; evento tempo preesistente; pill disattivabili con flag.

---

## 2. IMPLEMENTAZIONE

### Feature flag
- **`HOME_V2_FLOATING_SIDE_PILLS_ENABLED`** (`featureFlags.ts`). Default **`true`** (come richiesta precedente “far vedere”).
- Rollback: **`false`** → layer non montato.
- **`HOME_V2_SIDE_PILLS_ENABLED`** deprecato come alias del flag nuovo.

### Fallback
- Ogni handler: try/catch; se `open*()` ritorna `false` o eccezione → scroll verso selettore/id documentato.

### Floating + motion
- **Framer Motion:** `y: [0,-5,0]`, `duration: 5`, `repeat: Infinity`, `easeInOut` (due stack con delay 0.5s sul destro).
- **Forma:** `rounded-full`, capsule compatte, glass + neon controllato.

### Touch / z-index
- Layer `pointer-events-none`; bottoni `pointer-events-auto`; `whileTap` scale ~0.96–0.97.

---

## 3. TAP MATRIX

| Pill | Apre | Fallback | Badge |
|------|------|----------|-------|
| Prossima azione | `openMission()` | `#home-daily-mission` | Done / Fase n / Pronto / … |
| Commit | `openCommit()` | `#home-daily-commit` | OK / Da fare |
| M1SSION Agent | `openAgent()` | `[data-section="agent"]` | Codice agente o “Live” |
| Tempo rimasto | `openMissionModal` detail `time` | `[data-section="status"]` | Ultimo / Urgenza / Ng |
| M1SSION Battle | `openBattle()` | `[data-section="battle"]` | N inviti / Lobby |

---

## 4. RISCHI RESIDUI

- Doppia query Supabase per battle pending (console + pill): accettabile; eventuale dedup in fase futura.
- `motion.div` + `ref` su `BattleConsole`: dipende da forwardRef di framer-motion (versione progetto OK in genere).

---

## 5. GO / NO GO

**GO** per test su iPhone reale (build + cap sync).

**GO** per fase successiva (rimozione container duplicati) solo dopo UX approvata.

---

## 6. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```

**Spegnere i pill in 1 secondo:** `HOME_V2_FLOATING_SIDE_PILLS_ENABLED = false` in `src/config/featureFlags.ts`.
