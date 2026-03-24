# REPORT — Home Floating Pills V3 (reference-driven, viewport-fixed, iOS-safe)

**Date:** 2026-03-19  
**Branch:** `feature/floating-pill-v3-fixed-reference`

---

## 1) File toccati

| Path | Ruolo |
|------|--------|
| `src/components/home/floatingPillsV3/floating-pills-v3.ts` | Flag `ENABLE_HOME_FLOATING_PILLS_V3`, `z-index`, id portal |
| `src/components/home/floatingPillsV3/floatingPillsV3.types.ts` | Tipi UI |
| `src/components/home/floatingPillsV3/useFloatingPillsV3.ts` | Token layout (z-index, offset stack) |
| `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` | Portal → `document.body`, dati + launcher |
| `src/components/home/floatingPillsV3/FloatingActionPillV3.tsx` | Prossima azione (capsule-orb / report bars) |
| `src/components/home/floatingPillsV3/FloatingCommitPillV3.tsx` | Commit blob |
| `src/components/home/floatingPillsV3/FloatingAgentPillV3.tsx` | Agent (eye + MCP glow) |
| `src/components/home/floatingPillsV3/FloatingTimeRingPillV3.tsx` | Tempo (doppio ring SVG + tier) |
| `src/components/home/floatingPillsV3/FloatingBattlePillV3.tsx` | Battle (silhouette aggressiva) |
| `src/components/home/floatingPillsV3/index.ts` | Export pubblici |
| `src/pages/AppHome.tsx` | Mount condizionale V3 vs `HomeSidePillsLayer` |

**Non toccati (per safety clause):** UnifiedHeader, BottomNavigation, auth, BUZZ, IAP, DCL business logic, RPC, ecc.

---

## 2) Root cause — perché i pill “non erano veramente floating”

- Il layout app usa **`main.global-layout-content.m1-single-scroll-root`** con **`overflow-y: auto`** (`GlobalLayout.tsx`).
- Su **iOS WKWebView**, `position: fixed` applicato a elementi **discendenti** dello scroll container spesso è ancorato al **contenitore di scroll**, non alla viewport → i pill **scorrono con la pagina**.
- `HomeSidePillsLayer` / `FloatingNodesLayer` erano montati **dentro** il flusso di `AppHome` sotto quel `<main>`, quindi ereditavano il problema.

---

## 3) Strategia V3

1. **`createPortal(..., document.body)`** — il layer esce dall’albero dello scroll root; `fixed` = viewport reale.
2. **`z-index: 9500`** — sopra il main (`z-index: 0`), **sotto** UnifiedHeader (`9999`) e BottomNavigation (`10000`).
3. **`pointer-events: none`** sul wrapper; **`pointer-events: auto`** solo sui `button` dei pill.
4. **Offset verticale `168px` + safe-area** (token in `useFloatingPillsV3`) per ridurre overlap con **M1U pill** (FOTO E).
5. **Launcher-only taps** — nessun `scrollIntoView` di fallback (differenza rispetto a V2): se un registrar non è montato, il tap non ha effetto visibile (vedi rischi).

---

## 4) Uso delle reference (A–F)

| Ref | Uso |
|-----|-----|
| **A** Tempo | Doppio anello SVG, arco progress, centro numerico, badge stato |
| **B** Prossima azione | Capsula verticale, micro-barre “report”, core cyan, target |
| **C** Agent | Occhio (identity), cornice device-like, glow violet se MCP attivo |
| **D** Battle | Silhouette più “tech”, bordo organico aggressivo, accenti viola/rosso se live |
| **E / F** | Solo problema overlap → offset stack e padding bottom verso bottom nav |

Nessuno stile cartoon flat copiato — solo metafora e gerarchia.

---

## 5) Pill completati (dati reali)

| Pill | Dati | Apertura |
|------|------|----------|
| Prossima azione | `useDailyEngineV2`, `DAILY_ENGINE_V2_ENABLED` (badge come V2) | `openMission()` |
| Commit | `useTodayDailyState().commit_done` | `openCommit()` |
| Agent | `retention.agentStatus`, `useAgentCode` | `openAgent()` |
| Tempo | `useMissionStatus`, tier **giorni×24h** (>72 / ≤72 / ≤24) come V2 | `openMissionModal` `'time'` |
| Battle | `useBattlePendingCount` | `openBattle()` |

---

## 6) Fallback / differenze vs V2

- **Nessuno scroll di recupero** se `open*()` ritorna `false` (registrar assente): **tap silenzioso** — accettato per rispettare “non scrollare / non simulare”.
- Flag **default `ENABLE_HOME_FLOATING_PILLS_V3 = false`** in `floating-pills-v3.ts` → zero impatto finché non imposti `true`.

---

## 7) Rischi residui

- Se i registrar DCL / sezioni non sono ancora montati al primo tap, l’utente non vede feedback (solo haptics se disponibili).
- Overlap ottico con PRIZE/DCL va **verificato su device** (altezze font / scale iOS).
- Due sistemi convivono (V2 legacy + V3): confusione solo se qualcuno attiva entrambi — **mutual exclusion** in `AppHome` evita doppi pill.

---

## 8) GO / NO-GO — rimozione futura vecchi container

**GO condizionato:** dopo QA iOS reale (scroll fisso, tap, overlap, performance).  
**NO-GO** se su device i portal interferiscono con gesture o modali — rivedere `z-index` o mount point.

---

## 9) Build outcome

- `npm run build` — **OK** (post-fix sintassi `FloatingPillLayerV3`).

---

## 10) Comandi finali (da eseguire in locale)

```bash
npm run build
npm run cap:ios:incremental
```

**Attivazione V3:** in `src/components/home/floatingPillsV3/floating-pills-v3.ts` impostare:

```ts
export const ENABLE_HOME_FLOATING_PILLS_V3 = true;
```

(con `HOME_V2_FLOATING_SIDE_PILLS_ENABLED === true`).

---

## Verdict fase 0 → implementazione: **GO**

Root cause confermata; fix architetturale (portal + fixed) allineata a iOS scroll root.
