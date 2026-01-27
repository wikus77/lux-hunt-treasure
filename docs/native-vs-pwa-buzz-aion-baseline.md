# M1SSION™ Native vs PWA — Buzz + AION Baseline Snapshot

**Date:** 2026-01-27  
**Tag:** `pre_surgical_buzz_aion_native_fix_20260127_0200`

---

## VISUAL BASELINE

### /buzz Page

| Aspect | PWA (Safari iOS) | Native (Capacitor) |
|--------|------------------|---------------------|
| Background behind header | Continuous `#070818` | Transparent gap (page bg doesn't extend) |
| Decorative gradient | Visible, smooth | Visible |
| Content scroll | Smooth, body-based | Container-based, less inertia |
| Rubber-band bounce | ✅ Yes | Partial (Option B applied) |
| Edge behavior (top/bottom) | Elastic | "Magnet stop" effect still present |

### /intelligence (AION) Page

| Aspect | PWA (Safari iOS) | Native (Capacitor) |
|--------|------------------|---------------------|
| Background behind header | Continuous dark | Transparent gap |
| AION cloud/glow | Fully visible | Potentially clipped |
| Chat scroll | Smooth | Container-based |
| Rubber-band bounce | ✅ Yes | Partial |
| Edge behavior | Elastic | "Magnet stop" |

---

## SCROLL FEEL BASELINE

| Metric | PWA | Native |
|--------|-----|--------|
| Scroll owner | `document.body` | `.m1-single-scroll-root` |
| Overscroll (body) | `auto` | `hidden` (no scroll) |
| Overscroll (container) | N/A | `auto` (Option B) |
| Inertia quality | Native iOS | Good (but container-based) |
| Pull-down bounce (top) | Strong | Weak/partial |
| Pull-up bounce (bottom) | Strong | Weak/partial |

---

## ROOT CAUSE FILES

### Buzz Background Gap
- **File:** `src/pages/BuzzPage.tsx`
- **Line:** 105
- **Issue:** `bg-[#070818]` on page container only; body/root has no background in native

### AION Clipping Risk
- **File:** `src/pages/IntelligencePage.tsx`
- **Lines:** 25-31, 49-61
- **Issue:** No explicit background; AION container height-constrained without overflow:visible

### Global Native Styles
- **File:** `src/styles/ios-native.css`
- **Lines:** 204-219
- **Issue:** `body.is-native` has `overflow: hidden` (correct), but no background-color set

---

## ROLLBACK COMMANDS

```bash
# Full rollback to baseline
git reset --hard pre_surgical_buzz_aion_native_fix_20260127_0200

# Per-file rollback
git checkout pre_surgical_buzz_aion_native_fix_20260127_0200 -- src/pages/BuzzPage.tsx
git checkout pre_surgical_buzz_aion_native_fix_20260127_0200 -- src/pages/IntelligencePage.tsx
git checkout pre_surgical_buzz_aion_native_fix_20260127_0200 -- src/styles/ios-native.css
```
