# REPORT — Floating Nodes V2 (Pill Enterprise UI)

**Date:** 2026-03-19  
**Scope:** UI + composition only (no auth, BUZZ, IAP, navigation/backend changes).

## Deliverables

| Item | Status |
|------|--------|
| `src/components/floatingNodes/` (ActionOrb, TimeRing, CommitBlob, AgentNode, BattleNode, FloatingNodesLayer) | Done |
| `ENABLE_FLOATING_NODES_V2` in `src/config/featureFlags.ts` | Done (`true`) |
| Legacy rollback: `HomeSidePillsLayerLegacy.tsx` + thin `HomeSidePillsLayer.tsx` | Done |
| i18n (`home_float_node_*`) en / it / fr | Done |
| `z-index` below Home header (`z-[58]` vs header `z-[60]` on `Home.tsx`) | Adjusted |

## Feature flag matrix

| `HOME_V2_FLOATING_SIDE_PILLS_ENABLED` | `ENABLE_FLOATING_NODES_V2` | Result |
|---------------------------------------|----------------------------|--------|
| `false` | * | No floating layer |
| `true` | `true` | `FloatingNodesLayer` (nodes V2) |
| `true` | `false` | `HomeSidePillsLayerLegacy` (capsules) |

## Tap / launcher parity (same as legacy)

| Node | Action |
|------|--------|
| ActionOrb | `openMission()` → scroll `#home-daily-mission` |
| CommitBlob | `openCommit()` → scroll `#home-daily-commit` |
| AgentNode | `openAgent()` → scroll `[data-section="agent"]` |
| TimeRing | `openMissionModal` detail `'time'` → scroll `[data-section="status"]` |
| BattleNode | `openBattle()` → scroll `[data-section="battle"]` |

## Scroll / pointer-events

- Root: `fixed inset-0 pointer-events-none` (does not steal page scroll).
- Hit targets: `pointer-events-auto` on each `motion.button`.

## Build / iOS sync

- `npm run build` — **OK** (Vite production build completed).
- `npm run cap:ios:incremental` — **exit 0** (build + incremental sync + `cap update ios`).

## iOS performance note

Not device-benchmarked in CI. Layer uses Framer Motion on five small nodes; recommend smoke test on iPhone (scroll + rapid taps). Rollback: `ENABLE_FLOATING_NODES_V2 = false`.

## Branch

Create/use branch: `feature/pill-v2-enterprise` (per runbook).

---

## Verdict: **GO**

Rationale: build green, cap sync green, logic unchanged (same hooks + launchers), rollback path explicit, header stacking corrected (`z-[58] < z-[60]`).

**NO-GO triggers (if seen on device):** jank on low-end iOS, accidental header overlap, or missed taps — then set `ENABLE_FLOATING_NODES_V2` to `false` and retest.
