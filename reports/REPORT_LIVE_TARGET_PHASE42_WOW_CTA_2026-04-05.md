# Live Target — Phase 4.2 WOW CTA + victory/fail animations

**Date:** 2026-04-05  
**Build stamp:** `LT-4.2`

## 1. Files touched

| File | Purpose |
|------|---------|
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.tsx` | Engage CTA markup (span + triple-chevron SVG), `engageCtaPressed` for touch/chevron motion, terminal WOW burst DOM, portal toast modifiers, forensics `4.2`, one-shot `[wow]` log on terminal. |
| `src/pages/sandbox/map3d/layers/LiveTargetGeoOverlay.css` | `.lt-phase42-engage-cta` (reference-based pill + chevrons, cyan M1SSION palette), hover vs touch (`hover: none` ambient pulse), pressed state, `.lt-wow-terminal-burst` rings + flash, `ltP42VictoryDot` / `ltP42FailDot`, toast aura keyframes. |
| `src/pages/sandbox/map3d/layers/liveTargetRuntimeGlobals.ts` | `liveTargetModuleCode` → **LT-4.2**. |

No i18n key changes required: `liveTarget.engage_cta` remains **Ingaggia** (IT) / Engage (EN) / Engager (FR); label uses **uppercase** via CSS.

## 2. Backup created

- **Stash message:** `chore(live-target): backup pre phase4.2 wow animations and engage cta skin`  
- **Stash commit object:** `a22eb0783616e919c57414e51bff267c0ff0e8c0`  
- **Restore:** `git stash apply stash@{n}` (find entry with that message) or inspect with `git show a22eb0783616e919c57414e51bff267c0ff0e8c0`.

## 3. Where the INGAGGIA button lives

- Still rendered only when `engageVisible` (unchanged: `zoom_eligible`, not engaged, terminal none, has GPS).  
- **DOM:** `document.body` → `.lt-phase4-portal-root` → `.lt-phase4-engage-wrap` → `button.lt-phase42-engage-cta`.  
- **Pointer:** `stopPropagation` on pointer down; `touch-action: manipulation`; does not affect map pan when tapping the CTA.

## 4. Design reference adaptation

- **Structure:** Same as reference — `<button>` + `<span>` label + `<svg>` with three `<polygon>` chevrons.  
- **Palette:** Electric cyan / teal / aqua gradient, light text `#ecfbff`, cyan glow `box-shadow` (not pink `#ff135a`).  
- **Typography:** System stack (`system-ui`, SF Pro, etc.) — no new font dependency.  
- **Motion:** Reference `ripple`, `colorize`, chevron `translateX` + opacity pulse recreated as `ltP42Ripple`, `ltP42Colorize`, `ltP42ChevronOpacity`.  
- **Mobile:** `@media (hover: none)` applies idle `ltP42EngageAmbient`; fine-pointer hover keeps reference-style hover.  
- **Touch press:** Class `lt-phase42-engage-cta--pressed` (pointer down/up/leave/cancel) slides chevrons in and runs opacity pulse without requiring `:hover`.

## 5. Mobile / touch behaviour

- Press: scale `0.95` on `:active`; chevrons animate when `pressed` class set.  
- Haptics: unchanged — `hapticMedium` on Engage click (Phase 4.1 behaviour preserved).

## 6. Success WOW

- **DOM:** `.lt-wow-terminal-burst--success` with three `.lt-wow-terminal-burst__wave` + `.lt-wow-terminal-burst__flash--success`.  
- **CSS:** Expanding green rings (`ltP42SuccessRing`), radial flash (`ltP42SuccessFlash`), dot sequence `ltP42VictoryDot` (burst scale + ring-like `box-shadow` + settle).  
- **Toast:** `.lt-phase42-outcome-toast--success` adds `ltP42ToastSuccessAura` on `box-shadow`.  
- **Log:** `[LiveTarget][4.2][wow]` once per outcome with `success_wow_entered`.

## 7. Fail WOW

- **DOM:** Same burst structure with `--fail` modifiers.  
- **CSS:** Red shock rings (`ltP42FailRing` + slight rotation), red radial flash (`ltP42FailFlash`), dot `ltP42FailDot` (micro-shake + collapse).  
- **Toast:** `ltP42ToastFailAura`.  
- **Log:** `fail_wow_entered`.

## 8. Layering / z-index

- **Portal root:** `z-index: 11500` (unchanged from 4.1) — above Buzz (~1001), below bottom nav (~10000).  
- **Engage wrap:** `z-index: 2` inside portal (stacking relative to portal only; root already lifts subtree).  
- **Target burst:** Inside `.live-target-geo-overlay-root`, `z-index: 5` under `.hint-dot` (12).

## 9. i18n

- No new keys; `liveTarget.engage_cta` and success/fail toasts unchanged.

## 10. Tests

- `npx tsc --noEmit` — pass  
- `npm run build` — pass  
- `npm run cap:ios:incremental` — pass  

## 11. Rollback

```bash
git stash apply a22eb0783616e919c57414e51bff267c0ff0e8c0
```

Or manually revert the three files in section 1.

## 12. Debug

- Interval forensics: `[LiveTarget][4.2][forensics]` includes `wowTerminalActive`, `renderedEngageCta`, `targetVisual`, etc. (when `liveTargetForensicLogsEnabled()`).  
- Badge text: `LT 4.2 · …`.
