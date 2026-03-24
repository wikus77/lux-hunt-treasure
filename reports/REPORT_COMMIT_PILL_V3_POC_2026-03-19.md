# REPORT — Commit Pill V3 (POC centrale, iOS Capacitor, ultra-safe)

**Data:** 2026-03-19

---

## 1) VERIFICA READ-ONLY (Fase 0)

### File / flussi trovati

| Elemento | Dettaglio |
|----------|-----------|
| **Launcher programmatico** | `DclLauncherContext`: `openCommit()` → `registerOpenCommit` |
| **Registrazione** | `CommitNodeTrigger.tsx` (`useEffect` + `registerOpenCommit`) apre `CommitModal` con `setIsModalOpen(true)` e `originRect` dal `triggerRef` del nodo in pagina |
| **Contenitore in Home** | `CommitNodesContainer` monta `CommitNodeTrigger` dentro `#home-daily-commit` (`AppHome.tsx`) |
| **Stato done/pending** | `useTodayDailyState().commit_done` (già usato dai pill laterali) |
| **Fixed reale su iOS** | Stesso problema noto: scroll in `.m1-single-scroll-root` → `createPortal(..., document.body)` |

### Root cause limiti attuali

- Il commit “laterale” vive in layer `fixed` **dentro** lo scroll root → su WKWebView può non essere viewport-fixed.
- Il flusso reale del modal è **sempre** quello di `CommitNodeTrigger` + `CommitModal` (nessuna nuova business logic).

### Strategia scelta (safe)

1. Nuovo **`CommitPillV3`** solo UI: `createPortal` su `document.body`, `z-index` 9480 (sotto header 9999 e bottom nav 10000).
2. **Tap** → `buttonClickFeedback()` + `openCommit()` in `try/catch` (no-op se eccezione).
3. **Solo iOS Capacitor**: `isCommitPillV3IosCapacitor()` (`Capacitor.isNativePlatform() && getPlatform() === 'ios'`).
4. **Feature flag** `ENABLE_COMMIT_PILL_V3` (default `false`).
5. **Niente duplicato**: quando flag ON **e** iOS nativo, il **solo** commit laterale è nascosto (`CommitBlob` / `FloatingCommitPillV3` / legacy button); su web/Android il laterale resta perché il centrale non monta.

### Riuso blob attuale

- Metafora allineata a `CommitBlob` / energy node (morph leggero, Sparkles/Check, badge) — **senza** Three.js / AION nel POC centrale (requisito utente).

### Fase 0 — **GO**

---

## 2) IMPLEMENTAZIONE

### File toccati / creati

| File | Ruolo |
|------|--------|
| `src/components/home/commitPillV3/commitPillV3.config.ts` | Flag, z-index, id portal, `isCommitPillV3IosCapacitor` |
| `src/components/home/commitPillV3/CommitPillV3.types.ts` | Tipi UI minimi |
| `src/components/home/commitPillV3/CommitPillV3.tsx` | Nodo centrale + portal |
| `src/components/home/commitPillV3/index.ts` | Export |
| `src/pages/AppHome.tsx` | Mount dentro `DclLauncherProvider` |
| `src/components/floatingNodes/FloatingNodesLayer.tsx` | Nasconde `CommitBlob` se POC attiva |
| `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` | Nasconde `FloatingCommitPillV3` se POC attiva |
| `src/components/home/HomeSidePillsLayerLegacy.tsx` | Nasconde pill commit legacy se POC attiva |

**Non modificati:** `UnifiedHeader.tsx`, `BottomNavigation.tsx`, `CommitModal`, logica commit interna.

### Mount

- `AppHome` → `ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor()` → `<CommitPillV3 />` (con `SectionErrorBoundary`).

### Posizionamento

- Orizzontale: centro (`left: 50%`, `translateX(-50%)`).
- Verticale: `bottom: calc(76px + safe-area-bottom)` per stare sopra la bottom nav senza coprirla.
- Wrapper: `pointer-events: none`; bottone: `pointer-events: auto`.

### Micro-espansione

- **Sì, minimale:** anello cyan **one-shot** al tap (~380ms, scale + fade) — feedback operativo, non menu radiale.
- Idle: morph **lento** del `border-radius` (blob), rispettando `prefers-reduced-motion` (blob → cerchio statico).

### Fallback launcher

- `openCommit()` non registrato: ritorna `false` dal context — nessun crash; l’utente può usare ancora il nodo commit in pagina (`#home-daily-commit`) se visibile.
- Con POC attiva il laterale è nascosto: in quel caso l’unico entry è il centrale; se il registrar non è pronto, tap = solo haptic/anello (documentare per QA).

---

## 3) TAP MATRIX

| Azione | Effetto |
|--------|---------|
| **Tap** | `buttonClickFeedback()` → impulso anello → `openCommit()` |
| **Badge** | `Da fare` / `Completato` (stessi testi i18n dei pill: `home_float_badge_pending` / `home_side_pill_commit_done`) da `commit_done` |
| **Stato visivo** | Cyan + Sparkles vs emerald + Check; glow coerente |

---

## 4) RISCHI RESIDUI

- **Animazione modal**: `originRect` può riferirsi al trigger in-scroll, non al pill centrale (comportamento esistente del registrar).
- **Overlap**: va verificato su iPhone con PRIZE/DCL e altezze reali (padding bottom 76px è euristico).
- **Solo iOS**: su simulatore Android / web il POC non appare (per scope prodotto).

---

## 5) GO / NO-GO

- **Pronto per test su iPhone (Capacitor):** **GO** dopo `ENABLE_COMMIT_PILL_V3 = true` in `commitPillV3.config.ts`.
- **Blueprint per altri pill:** **GO** (stesso pattern portal + flag + hide laterale mirato).

---

## 6) COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```

**Attivazione POC:** in `src/components/home/commitPillV3/commitPillV3.config.ts` impostare:

```ts
export const ENABLE_COMMIT_PILL_V3 = true;
```

(solo build iOS nativa; rollback = `false`).
