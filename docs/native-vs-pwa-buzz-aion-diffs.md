# M1SSION™ Native vs PWA — Buzz + AION Forensic Diffs

**Date:** 2026-01-27

---

## WHAT USER SEES

### /buzz Page (Native)
- **Background gap behind header:** The area behind the fixed header appears darker/transparent compared to PWA where the background is continuous.
- **"Magnet stop" at edges:** When scrolling to top/bottom, the scroll stops abruptly instead of the soft elastic bounce of PWA.
- **Decorative gradient:** Works correctly (no issue).

### /intelligence (AION) Page (Native)
- **Background discontinuity:** Same as Buzz - header area has no background.
- **AION cloud/glow potentially clipped:** The glow effects from AION entity may not extend beyond their container.
- **Chat scroll feel:** Less inertia than PWA.

---

## EXACT FILE/SELECTOR LIST

### BUZZ — Background Gap

| File | Line | Selector/Element | Issue |
|------|------|------------------|-------|
| `src/pages/BuzzPage.tsx` | 105 | `<div className="bg-[#070818]">` | Background on page container, not root |
| `src/styles/ios-native.css` | 204-219 | `body.is-native` | No `background-color` set |

**Fix Required:** Set background on `body.is-native` OR ensure `#root`/`main` has consistent background.

### AION — Background + Clipping

| File | Line | Selector/Element | Issue |
|------|------|------------------|-------|
| `src/pages/IntelligencePage.tsx` | 25-31 | `<div className="flex flex-col px-3">` | No background set |
| `src/pages/IntelligencePage.tsx` | 49-61 | AION container | `height: 81px` constraint, no `overflow: visible` |
| Parent chain | - | GlobalLayout `<main>` | `overflow-y: auto` could clip overflow from children |

**Fix Required:** 
1. Add background to IntelligencePage or ensure native root has it.
2. Set `overflow: visible` on AION container to allow glow to extend.

### SCROLL FEEL — Remaining Magnet Effect

| File | Line | Selector | Issue |
|------|------|----------|-------|
| `src/index.css` | 820-824 | `body.is-native .global-layout-content` | `overscroll-behavior-y: contain` still active |

**Note:** This may contribute to "magnet stop" but changing it is MEDIUM risk. We will NOT change it in this surgical pass.

---

## FIX PLAN (SURGICAL)

### Fix 1: Buzz Background Continuity
- Add `background-color: #070818` to `body.is-native` in `ios-native.css`
- This ensures header area has same background as page content in native

### Fix 2: AION Cloud Anti-Clipping
- Add `overflow: visible` to AION entity container in `IntelligencePage.tsx`
- Add explicit background to IntelligencePage root for header area continuity

### Fix 3: Scroll Guard (No Changes)
- Keep current Option B settings
- Do NOT change `index.css` overscroll in this pass
