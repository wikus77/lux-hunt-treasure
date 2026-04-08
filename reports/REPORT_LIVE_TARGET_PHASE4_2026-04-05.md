# Live Target — Phase 4 (Zoom gate + Engage + WOW feedback)

**Date:** 2026-04-05  
**Module code:** `LT-4.0` (`liveTargetModuleCode` in `liveTargetRuntimeGlobals.ts`)

## Files touched (scope: Live Target layer + i18n only)

| File | Role |
|------|------|
| `src/pages/sandbox/map3d/layers/liveTargetPhase4Difficulty.ts` | Enterprise-style difficulty profile (easy defaults, extensible fields). |
| `src/pages/sandbox/map3d/layers/liveTargetGameplayMachine.ts` | Derived gameplay state, zoom windows, engage CTA visibility. |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.tsx` | Map zoom tracking, engage flow, engaged watchdog, tap-to-capture while engaged, tutorial + toasts. |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.css` | Cyan engaged / green success / red fail animations, engage CTA, tutorial layering, outcome toasts. |
| `src/pages/sandbox/map3d/layers/liveTargetRuntimeGlobals.ts` | `liveTargetModuleCode` → `LT-4.0`. |
| `src/locales/en/common.json` | `liveTarget.*` Phase 4 strings. |
| `src/locales/it/common.json` | Same. |
| `src/locales/fr/common.json` | Same. |

## Motivation / root cause

Phase 3 allowed “near + tap” capture without a real **zoom gate** or **explicit engage**. Phase 4 introduces a **scalable difficulty model**, a **single derived state machine**, an **Engage** CTA only when GPS + zoom are valid, and **distinct success/fail** visuals plus haptics—without changing global routing, Buzz, or economy.

## State machine (derived)

States in type union: `idle` → `in_range` → `zoom_eligible` | `engage_ready` → `engaged` → `captured_success` | `captured_fail`.

**Phase 4 v1 derivation:** `zoom_eligible` and `engage_ready` are treated as the same gate (see comment in `liveTargetGameplayMachine.ts`): when in range and zoom is in the engage band, the derived state is `engage_ready` (the Engage button is visible only in this state).

Terminal outcomes map to `captured_success` / `captured_fail` for debugging and `data-lt-gameplay`.

## Zoom gate rule

- **Engage eligibility (pre-engage):** `zoom ∈ [engageZoomMin, engageZoomMax]` (from profile), plus GPS in range and valid user position.
- **While engaged (capture validity):** `zoom ∈ [zoomMinCapture, zoomMaxCapture]` (for easy profile these match the engage band; structure allows future profiles to differ).
- **Watchdog:** If `mapZoom <= 0`, zoom-based fail is skipped briefly so the first frame does not instantly fail before MapLibre reports zoom.

## Engage CTA rule

`engageVisible = hasUserPosition && !engaged && terminal === 'none' && isEngageButtonVisible(gameplayState)` where `isEngageButtonVisible` is **only** `state === 'engage_ready'`.

Pressing **Engage** sets `engaged`, applies **selection haptic**, turns the target **cyan** (CSS `hint--engaged`). There is **no** separate “Capture” button for the final action.

## Success / fail rules

- **Success:** While `engaged`, user **taps the target dot**, still **in range**, zoom still **valid for engaged capture** → `terminal = success`, WOW green (`hint--wow-success`), success toast, success haptic, orbit paused.
- **Fail:** While engaged, any of: **timeout** (`engagedCaptureTimeoutMs`), **out of range**, or **zoom left valid window** → `terminal = fail`, WOW red (`hint--wow-fail`), fail toast, error haptic, orbit paused. `failReason` is set for forensics (`capture_timeout` | `out_of_range` | `zoom_left_window`).

## Tutorial

Uses `liveTarget.tutorial_phase4_title` / `tutorial_phase4_body`; container combines `lt-phase3-tutorial` + `lt-phase4-tutorial` for **higher bottom offset and z-index** so it sits above Buzz map chrome. Copy describes: approach → zoom → Engage → cyan active mode → tap target to finish.

## i18n keys added

- `liveTarget.engage_cta`
- `liveTarget.tutorial_phase4_title`, `liveTarget.tutorial_phase4_body`
- `liveTarget.state_engage_ready`, `liveTarget.state_engaged`
- `liveTarget.success_message`, `liveTarget.failure_message`
- `liveTarget.difficulty_easy` (profile `labelKey`)

## Tests executed

- `npx tsc --noEmit` — pass  
- `npm run build` — pass  
- `npm run cap:ios:incremental` — pass (dist → `ios/App/App/public`, Capacitor iOS update)

## Rollback (exact)

**Git tag (pre–Phase 4 tree):** `live-target-pre-phase4`

Example restore of layer files only:

```bash
git checkout live-target-pre-phase4 -- \
  src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.tsx \
  src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.css \
  src/pages/sandbox/map3d/layers/liveTargetRuntimeGlobals.ts
# Remove new files if reverting fully:
# git rm src/pages/sandbox/map3d/layers/liveTargetPhase4Difficulty.ts \
#         src/pages/sandbox/map3d/layers/liveTargetGameplayMachine.ts
```

Restore locale keys if needed by checking out those three `common.json` paths from the same ref or reverting the added `liveTarget.*` lines manually.

## Forensics

When visual debug is on, fixed badge shows `LT 4.0 · {gameplayState}`; console `[LiveTarget][4.0][forensics]` includes difficulty, zoom, gates, state, and fail reason when applicable.
