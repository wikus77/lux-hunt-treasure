# LIVE TARGET — Phase 4.3 Enterprise — Incident closure report

**Scope:** iOS native (Capacitor WKWebView), Live Target only — miss-tap fail, victory modal, level-complete baseline.  
**Build stamp:** `LT-4.3` (`liveTargetModuleCode` in `liveTargetRuntimeGlobals.ts`).

---

## 1. Files touched (Phase 4.3 scope)

| File | Role |
|------|------|
| `src/pages/sandbox/map3d/layers/liveTargetLevelPlan.ts` | Level plans (L1 baseline + L2 placeholder), scalable fields (`failOnMissTap`, zoom/range flags, `captureWindowMs`, `targetCount`, motion/anchor, etc.). |
| `src/pages/sandbox/map3d/layers/liveTargetGameplayMachine.ts` | `LiveTargetFailReason` extended with `miss_tap`. |
| `src/pages/sandbox/map3d/layers/liveTargetPhase4Difficulty.ts` | Profile enables `failOnMissTap` where required. |
| `src/pages/sandbox/map3d/layers/LiveTargetVictoryModal.tsx` | Premium layered victory UI (portal to `document.body`, ptrig/shard/card language, M1SSION palette). |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.tsx` | Map `click` miss detector; level state (`liveTargetLevelId`, `completedLevelIds`, modal open); success → modal; Continue → advance level; forensics `[LiveTarget][4.3][…]`. |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.css` | `.hint--wow-fail--miss`, `.lt-p43-*` modal (z-index **12500**, backdrop blur). |
| `src/pages/sandbox/map3d/layers/liveTargetRuntimeGlobals.ts` | Module code `LT-4.3`. |
| `src/locales/en/common.json` | New `liveTarget.*` keys (victory modal, `fail_miss_tap`, etc.). |
| `src/locales/it/common.json` | Same. |
| `src/locales/fr/common.json` | Same. |

*Note: The branch may contain unrelated modified files; the table above is the Live Target 4.3 surface.*

---

## 2. Backup created

- **Stash message:** `chore(live-target): backup pre phase4.3 fail miss and level-complete modal`
- **Stash commit object (refs/stash):** `34d8ec803c41b0a8f922d155bb1309d8af809bc9`
- **Inspect:** `git stash list`, `git stash show -p stash@{0}`

---

## 3. Fail on miss tap (how it works)

- **When:** `gameplayState === 'engaged'`, terminal `none`, level plan has `failOnMissTap: true`.
- **Mechanism:** MapLibre `map.on('click', …)` — only real map surface clicks register; taps on the HTML target overlay, phase-4 portal (`data-lt-phase4-portal`), Engage CTA, victory root (`data-lt-p43-victory`), and other UI above the map do **not** hit this listener.
- **Priority:** Target success path remains first (tap on target element); background map click = immediate fail with `failReason === 'miss_tap'`, red WOW styling (e.g. `hint--wow-fail--miss`), toast copy from `liveTarget.fail_miss_tap`.
- **Cleanup:** Listener removed on teardown / state change (no duplicate success+fail).

---

## 4. Victory modal (how it works)

- **Trigger:** After successful capture (`succeedSession`), overlay sets victory modal open.
- **Content:** i18n — badge/headline/subtitle/next hint + **CONTINUA**; classified card motif (e.g. level id).
- **Visual:** Phantom-style layering (ptrigs, shard layers, star, ransom-style headline strip) reinterpreted in M1SSION colors (black / cyan / white / green accent), not a literal demo paste.

---

## 5. Modal placement / z-index

- **Portal:** `createPortal` to `document.body` from `LiveTargetVictoryModal.tsx`.
- **Stacking:** Backdrop + card use `.lt-p43-*`; CSS documents **z-index 12500** above the phase-4 portal layer so tutorial/engage do not cover the modal while it is open.

---

## 6. Level structure introduced

- **Runtime state (overlay):** `liveTargetLevelId`, `completedLevelIds`, `victoryModalOpen`.
- **Plans:** `LIVE_TARGET_LEVEL_PLANS` in `liveTargetLevelPlan.ts` — per-level `id`, label keys, `captureZoomMin` / `captureZoomMax`, `captureWindowMs`, `targetCount`, `motionProfile`, `anchorBehavior`, `failOnMissTap`, `failOnZoomExit`, `failOnRangeExit` (baseline for future server sync).
- **Continue:** Closes modal, appends completed level id, bumps `liveTargetLevelId` toward max defined level (capped).

---

## 7. i18n

Keys added/used for EN/IT/FR include (prefix `liveTarget.`): victory modal title/subtitle/badge/button/next-level hint, `victory_card_classified`, `fail_miss_tap`. Verify exact keys in the three `common.json` files under `liveTarget`.

---

## 8. Tests executed

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | OK |
| `npm run build` | OK |
| `npm run cap:ios:incremental` | OK |

---

## 9. Rollback (exact)

1. **If Phase 4.3 is committed:** `git revert <commit-sha>` (single commit containing only Live Target 4.3 is cleanest).
2. **Stash snapshot:** `34d8ec803c41b0a8f922d155bb1309d8af809bc9` — use `git stash show -p stash@{0}` to inspect; apply with care if you need to recover an older WIP (may conflict with current tree).
3. **Surgical file restore:** `git checkout <good-ref> --` the paths listed in section 1 (only if `<good-ref>` predates 4.3 and branch is clean enough).

---

## 10. Ready for next phase

- Server-backed persistence for `completedLevels` / `currentLevel`.
- Level 2+ gameplay (multi-target, motion profiles) wired to `liveTargetLevelPlan.ts`.
- Optional: expose level fields in `patchLiveTargetRuntimeGlobal` for remote debug.
- Device QA: confirm map vs overlay hit-testing on physical iPhone (WKWebView).

---

## Acceptance checklist

- [x] Engaged + tap on map (not target) → real fail, red WOW, miss copy.
- [x] Success → victory modal (layered premium), then Continue advances local level state.
- [x] No intentional changes outside Live Target scope listed above.
- [x] `tsc` / `build` / `cap:ios:incremental` green.
