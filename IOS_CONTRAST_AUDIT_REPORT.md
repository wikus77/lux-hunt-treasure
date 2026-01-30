# iOS Native App - Text & Icon Contrast Audit Report

**Date:** 2026-01-30  
**Branch:** `fix/ios-contrast-audit`  
**Rollback Tag:** `ios-contrast-audit-start`  
**Rollback Command:** `git reset --hard ios-contrast-audit-start`

---

## 1. SUMMARY

### Primary Causes (3)

| # | Cause | Impact | Severity |
|---|-------|--------|----------|
| 1 | **`.sn-page` CSS uses `:has()` selector** which fails on iOS WebView | White theme CSS doesn't apply, dark background remains visible behind white text | CRITICAL |
| 2 | **Header pill opacity too low (45%)** combined with `blur(20px)` | Text appears washed out on colorful/bright backgrounds | HIGH |
| 3 | **Bottom nav inactive icon color too muted (`#8B9CAF`)** | Icons barely visible against semi-transparent pill | MEDIUM |

### Why MAP is OK

The MAP page (`MapTiler3D.tsx`) is immune because:
- **Does NOT use `.sn-page` class** - avoids the broken theme system entirely
- **Uses fixed positioning** (`position: fixed, inset: 0`) - renders as fullscreen canvas
- **Inherits default dark theme** from `html`/`body` which has proper contrast
- **No useEffect manipulating `document.documentElement`** - no CSS conflicts

### Why Other Pages Break

HOME, BUZZ, AION, NOTIFICATIONS all use `.sn-page` which:
1. Adds `.sn-page` class to `document.documentElement` via useEffect
2. Relies on `html:has(.sn-page)` CSS rules to apply white background
3. **`:has()` selector is NOT fully supported in iOS WebView** (WKWebView)
4. Result: CSS rules fail silently, dark elements show through white theme

---

## 2. FINDINGS (Technical Details)

### 2.1 Wrapper Stack

| Property | Value |
|----------|-------|
| Wrapper Type | **Capacitor** |
| WebView | **WKWebView** (iOS) |
| Config File | `ios/App/App/AppDelegate.swift` |
| WebView Background | `#0a0b0f` (was changed from white) |
| isOpaque | `false` |

### 2.2 Impacted Pages & Their Structure

| Page | Root Component | Theme Class | Layout | Status |
|------|---------------|-------------|--------|--------|
| HOME | `AppHome.tsx` | `.sn-page` | GlobalLayout | ❌ BROKEN |
| BUZZ | `BuzzPage.tsx` | `.sn-page` | GlobalLayout (fullscreen) | ❌ BROKEN |
| AION | `IntelligencePage.tsx` | `.sn-page` | GlobalLayout | ❌ BROKEN |
| Notifications | `NotificationsPage.tsx` | `.m1-app-bg` | Self-managed | ❌ BROKEN |
| MAP | `MapTiler3D.tsx` | **NONE** | GlobalLayout (fullscreen) | ✅ OK |

### 2.3 CSS Files Responsible

| File | Line(s) | Issue |
|------|---------|-------|
| `src/styles/soft-native.css` | 64-84 | `html:has(.sn-page)` white background rules **FAIL on iOS** |
| `src/styles/soft-native.css` | 100-105 | `.sn-page` container rules (transparent bg) |
| `src/index.css` | 1089-1150 | Multiple `.sn-page` white theme overrides using `:has()` |
| `src/index.css` | 1152-1166 | Hides `.m1-fullscreen-bg` when `.sn-page` present |
| `src/pages/AppHome.tsx` | 191-213 | useEffect adds `.sn-page` to `<html>` + inline white styles |
| `src/pages/BuzzPage.tsx` | 98-121 | Same useEffect pattern as Home |

### 2.4 Header Contrast Issue

**Component:** `src/components/layout/UnifiedHeader.tsx`

```tsx
// Line 337-339 - THE PROBLEM
background: 'rgba(15, 20, 30, 0.45)',  // Only 45% opacity!
backdropFilter: 'blur(20px) saturate(180%)',
WebkitBackdropFilter: 'blur(20px) saturate(180%)',
```

**Problem Chain:**
1. 45% opacity background lets 55% of content show through
2. `blur(20px)` reduces perceived contrast further
3. White text on semi-transparent blurred background fails WCAG AA (4.5:1)
4. iOS renders `backdrop-filter` differently, worsening contrast

### 2.5 Bottom Navigation Icon Issue

**Component:** `src/components/layout/BottomNavigation.tsx`

| State | Color | Contrast |
|-------|-------|----------|
| Active | `#00D1FF` (cyan) | ✅ Good |
| Inactive | `#8B9CAF` (muted gray-blue) | ❌ Poor |

**Problem:** Inactive color `#8B9CAF` has insufficient contrast against `rgba(15, 20, 30, 0.45)` pill background, especially when page content bleeds through.

---

## 3. PROPOSED FIX (NOT IMPLEMENTED)

### Strategy A: Fix `.sn-page` Theme System (iOS Compatibility)

**Problem:** `:has()` selector doesn't work in iOS WebView.

**Solution:** Replace `:has(.sn-page)` with `html.sn-page` selector (which IS set by useEffect).

```css
/* BEFORE (broken on iOS): */
html:has(.sn-page) {
  background: #FFFFFF !important;
}

/* AFTER (works on iOS): */
html.sn-page {
  background: #FFFFFF !important;
}
```

**Files to change:**
- `src/styles/soft-native.css`: Lines 64-84
- `src/index.css`: Lines 1089-1166

### Strategy B: Increase Header Opacity

**Change in `UnifiedHeader.tsx` line 337:**

```tsx
// BEFORE:
background: 'rgba(15, 20, 30, 0.45)',

// AFTER:
background: 'rgba(15, 20, 30, 0.85)',  // Increased from 45% to 85%
```

**Optional:** Reduce blur from `20px` to `12px` for cleaner text.

### Strategy C: Improve Bottom Nav Icon Contrast

**Change in `BottomNavigation.tsx` line 275:**

```tsx
// BEFORE:
color: item.active ? '#00D1FF' : '#8B9CAF',

// AFTER:
color: item.active ? '#00D1FF' : '#B8C4D4',  // Brighter inactive color
```

**Optional:** Add `textShadow` or `filter: drop-shadow()` to icons.

### Strategy D: iOS-Specific CSS Override

Add to `src/styles/ios-native.css`:

```css
/* Ensure header pill has proper contrast on iOS */
body.is-native .unified-header-wrapper header {
  background: rgba(15, 20, 30, 0.85) !important;
  backdrop-filter: blur(12px) saturate(150%) !important;
}

/* Ensure bottom nav icons are visible */
body.is-native .bottom-navigation-ios nav {
  background: rgba(15, 20, 30, 0.85) !important;
}
```

---

## 4. ROLLBACK INSTRUCTIONS

```bash
# Instant rollback to audit start point
git reset --hard ios-contrast-audit-start

# Or stash current changes first
git stash push -m "contrast fixes WIP"
git reset --hard ios-contrast-audit-start
```

---

## 5. FILES TO CHANGE (Proposed)

| File | Change Type | Priority |
|------|-------------|----------|
| `src/styles/soft-native.css` | Replace `:has()` with direct selectors | HIGH |
| `src/index.css` | Replace `:has()` with direct selectors | HIGH |
| `src/components/layout/UnifiedHeader.tsx` | Increase bg opacity to 0.85 | HIGH |
| `src/components/layout/BottomNavigation.tsx` | Brighten inactive icon color | MEDIUM |
| `src/styles/ios-native.css` | Add iOS-specific overrides | MEDIUM |

---

## 6. RISKS

| Risk | Mitigation |
|------|------------|
| Removing `:has()` may break non-iOS platforms | Use both selectors: `html.sn-page, html:has(.sn-page)` |
| Increasing opacity may look too "solid" | Test on both dark and light pages |
| Brighter inactive icons may look too prominent | A/B test with users |
| CSS specificity conflicts | Use `!important` sparingly, prefer specificity |

---

## 7. NEXT STEP PATCH PLAN

1. **Phase 1 (Critical):** Fix `:has()` selector issue in CSS files
2. **Phase 2 (High):** Increase header pill opacity
3. **Phase 3 (Medium):** Fix bottom nav inactive icon color
4. **Phase 4 (Verify):** Build and test on iOS device
5. **Phase 5 (QA):** Verify MAP page still works (regression test)

---

## APPENDIX: Key Code References

### AppHome.tsx useEffect (lines 191-213)
```tsx
useEffect(() => {
  document.documentElement.classList.add('sn-page');
  // ... sets inline white background styles
  return () => {
    document.documentElement.classList.remove('sn-page');
  };
}, []);
```

### soft-native.css (lines 64-84) - BROKEN SELECTOR
```css
html:has(.sn-page) {
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%) !important;
}
```

### UnifiedHeader.tsx (lines 337-339) - LOW OPACITY
```tsx
background: 'rgba(15, 20, 30, 0.45)',
backdropFilter: 'blur(20px) saturate(180%)',
```

---

**Report Generated:** 2026-01-30 17:50  
**Author:** AI Assistant (Cursor)  
**Status:** AUDIT COMPLETE - AWAITING APPROVAL FOR FIXES

© 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
