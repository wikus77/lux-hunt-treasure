# Live Target — Phase 4 forensic fix (LT-4.1)

**Date:** 2026-04-05  
**Build stamp:** `LT-4.1` (`liveTargetModuleCode`)

## 1. Files touched (scope: Live Target + i18n)

| File | Change |
|------|--------|
| `src/pages/sandbox/map3d/layers/liveTargetPhase2Movement.ts` | Orbit center stored on engine state; `createInitialEngineState(debug, orbitCenter)`; `advanceOrbitTick(state, now)` only. |
| `src/pages/sandbox/map3d/layers/liveTargetPhase4Difficulty.ts` | Enterprise fields (`captureZoomMin/Max`, `captureWindowMs`, `failOnZoomExit`, `failOnRangeExit`, `anchorOrbitToUserWhenPositionAvailable`, `id`); easy zoom band **13–19**; anchor-to-user **on**. |
| `src/pages/sandbox/map3d/layers/liveTargetGameplayMachine.ts` | Public state **`zoom_eligible`** (replaces `engage_ready`); engage CTA when `zoom_eligible`. |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.tsx` | Orbit center from user + lock on GPS drop; portal UI to `document.body`; `load`/`idle` zoom sync; watchdog uses profile flags + `captureWindowMs`; forensics **`[LiveTarget][4.1][forensics]`** via `liveTargetForensicLogsEnabled()`. |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.css` | `.lt-phase4-portal-root` (z-index **11500**); engaged hint strip. |
| `src/pages/sandbox/map3d/layers/liveTargetRuntimeGlobals.ts` | `liveTargetModuleCode` → **LT-4.1**. |
| `src/locales/en/common.json` | `liveTarget.tutorial_engaged_hint`. |
| `src/locales/it/common.json` | Same. |
| `src/locales/fr/common.json` | Same. |

## 2. Backup created

- **Git stash (persistent):** message `chore(live-target): backup pre phase4 forensic fix (persistent)`  
- **Stash commit object:** `81e771e15be0b2b102499f466f89226ff30682e5`  
- Restore: `git stash list` then `git stash apply stash@{n}` (or `git show 81e771e15be0b2b102499f466f89226ff30682e5` to inspect).

## 3. Root causes (verified by code trace, not assumptions)

### Cause A — Gameplay gate never met (primary)

- Target motion was always orbiting **fixed Milan** (`LIVE_TARGET_PHASE2_ORBIT_CENTER`) while `inRange` required **≤ 120 m** to the moving target.
- Testers outside that disk never left derived state **`idle`** (`hasUserPosition && !inRange` → `idle`), so **`zoom_eligible` never occurred**, **Engage never rendered**, **engaged/cyan/success/fail never ran**.
- UI that did not depend on range (tutorial copy) still appeared → matched field report: “only tutorial” / “no real flow”.

### Cause B — Stacking context / layer trap (secondary)

- `LiveTargetLayer3D` sits inside MapTiler3D’s **fixed** map shell with **`z-index: 1`**, which creates a **stacking context**.
- Fixed-position chrome (e.g. Buzz wrapper **1001**, pills **1000**, bottom nav **10000**) are **siblings above** that subtree, so Live Target “high” z-indices were only **relative inside** the low context.
- Engage / tutorial could be **occluded or visually drowned** compared to map chrome despite large numbers in CSS.

### Cause C — Zoom signal + narrow band (contributing)

- If `getZoom()` was not yet reliable before `zoom`/`moveend`, `mapZoom` could stay **0** (watchdog intentionally skips fail when `mapZoom <= 0`, but **engage** stayed false).
- Previous easy band **14–18.5** was easier to miss on first paint; widened to **13–19** for the easy profile.

## 4. `engageEligible` (actual conditions)

`engageEligible === engageVisible` in code:

- `hasUserPosition`
- `terminal === 'none'`
- `!engaged`
- `gameplayState === 'zoom_eligible'` where `zoom_eligible` means: **in range** and **zoom ∈ [engageZoomMin, engageZoomMax]**

## 5. Zoom gate (current)

- **Pre-engage:** `engageZoomMin` / `engageZoomMax` (easy: **13–19**), aliases `captureZoomMin` / `captureZoomMax` for this profile.
- **While engaged:** same window unless a future profile splits them; fail-on-zoom uses `failOnZoomExit` + `isZoomValidForEngagedCapture`.

## 6. State machine (effective)

| State | When |
|-------|------|
| `idle` | No GPS **or** not in capture radius |
| `in_range` | In radius, zoom **outside** engage band |
| `zoom_eligible` | In radius, zoom **inside** band, not engaged, not terminal |
| `engaged` | After Engage tap |
| `captured_success` / `captured_fail` | Terminal outcomes |

(`engage_ready` removed from derivation; use `zoom_eligible`.)

## 7. Engage button

- Rendered only when `engageVisible` **inside** `createPortal(..., document.body)` → **above Buzz (~1001)**, **below** bottom nav (**10000**).
- Pointer events enabled on wrap; portal root `pointer-events: none` to avoid blocking the map except on controls.

## 8. Engaged / cyan

- Engage sets `engaged`; target uses **`hint--engaged`** (cyan breath).
- Short **`tutorial_engaged_hint`** in portal while engaged.

## 9. Success / green

- Tap target while engaged, in range, zoom valid → `terminal === 'success'`, **`hint--wow-success`**, haptic success, toast.

## 10. Fail / red

- Timeout (`captureWindowMs`), or `failOnRangeExit` / `failOnZoomExit` while engaged → **`hint--wow-fail`**, error haptic, toast.

## 11. Tutorial / layering

- Tutorial + Engage + toasts + debug badge (when LS/env debug) → **portal** at **11500**.
- Tutorial retains elevated bottom offset class **above** Buzz vertical slot where possible.

## 12. i18n

- Added **`liveTarget.tutorial_engaged_hint`** (en / it / fr).

## 13. Tests executed

- `npx tsc --noEmit` — pass  
- `npm run build` — pass  
- `npm run cap:ios:incremental` — pass  

## 14. Rollback

```bash
git stash apply 81e771e15be0b2b102499f466f89226ff30682e5
# or: git stash apply stash@{n}  # entry named chore(live-target): backup pre phase4 forensic fix (persistent)
```

Then revert any remaining edits to the files listed in section 1 if needed.

## Forensics (dev / log builds)

Throttled `console.warn('[LiveTarget][4.1][forensics]', …)` when `liveTargetForensicLogsEnabled()` — includes `zoomEligible`, `engageEligible`, `renderedEngageCta`, `orbitCenter`, `distToTargetM`, `mapZoom`, `targetVisual`, etc.
