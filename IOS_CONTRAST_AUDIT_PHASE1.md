# iOS Contrast Audit - Phase 1: Wrapper Stack Identification

**Date:** January 30, 2026  
**Branch:** `fix/ios-contrast-audit`

---

## WRAPPER STACK

### Type
**Capacitor** (v6+)

### WebView Config File
- **Primary:** `ios/App/App/AppDelegate.swift`
- **Config:** `capacitor.config.ts` → `ios/App/App/capacitor.config.json`

### Key Settings

#### Capacitor Config (`capacitor.config.ts`)
```typescript
ios: {
  scheme: 'M1SSION',
  contentInset: 'never',  // Prevents double safe-area application
  scrollEnabled: true
}
```

#### AppDelegate.swift WebView Configuration
**Location:** `ios/App/App/AppDelegate.swift` (lines 95-133)

**Critical Settings:**
1. **Background Colors:**
   - `webView.backgroundColor = UIColor.white` (#FFFFFF)
   - `webView.scrollView.backgroundColor = UIColor.white` (#FFFFFF)
   - `webView.isOpaque = true`

2. **ScrollView Configuration:**
   - `contentInsetAdjustmentBehavior = .never`
   - `contentInset = .zero`
   - `bounces = true`
   - `alwaysBounceVertical = true`

3. **Pre-render CSS Injection:**
   - UserScript injected at `.atDocumentStart`
   - Forces white background via inline styles:
     ```javascript
     document.documentElement.style.setProperty('background', 
       'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 50%, #EAEAEC 100%)', 
       'important');
     document.documentElement.style.setProperty('background-color', '#FFFFFF', 'important');
     ```
   - Adds `sn-page` class to `<html>` element
   - Sets CSS variables: `--sat`, `--capacitor-safe-area-top`

---

## IMPACTED PAGES

| Page | Root Component | Layout Wrapper | Status |
|------|---------------|----------------|--------|
| **HOME** | `src/pages/AppHome.tsx` | `GlobalLayout` → `SafeAreaWrapper` → `<main>` (scroll-under-header) | ✅ Identified |
| **BUZZ** | `src/pages/BuzzPage.tsx` | `GlobalLayout` → `SafeAreaWrapper` → `<main>` (fullscreen route) | ✅ Identified |
| **MAP** | `src/pages/sandbox/MapTiler3D.tsx` | `GlobalLayout` → `SafeAreaWrapper` → `<main>` (fullscreen route) | ✅ Identified |
| **AION/Intelligence** | `src/pages/IntelligencePage.tsx` | `GlobalLayout` → `SafeAreaWrapper` → `<main>` (standard route) | ✅ Identified |
| **Notifications** | `src/pages/NotificationsPage.tsx` | **Self-managed** (no GlobalLayout header/nav) | ✅ Identified |

---

## LAYOUT WRAPPER DETAILS

### GlobalLayout (`src/components/layout/GlobalLayout.tsx`)
- **Routes:** Standard app pages + fullscreen routes (`/map`, `/buzz`, `/games`)
- **Structure:**
  - `SafeAreaWrapper` (outermost)
  - `UnifiedHeader` (fixed, glass effect)
  - `<main>` with `m1-scroll-under-header` class
  - `BottomNavigation` (fixed bottom)

**Key Styles:**
- `paddingTop: 0` (content scrolls under header)
- `paddingBottom: calc(64px + env(safe-area-inset-bottom, 0px))`
- `overscrollBehavior: 'auto'` (allows iOS rubber-band bounce)
- `WebkitOverflowScrolling: 'touch'`

### SafeAreaWrapper (`src/components/layout/SafeAreaWrapper.tsx`)
- **Purpose:** PWA safe area insets management
- **Behavior:** 
  - Reads safe area via `getPWASafeAreaInsets()`
  - Applies padding to bottom/left/right (NOT top - background extends into safe area)
  - Header handles its own safe area positioning

---

## BACKGROUND COLOR CONFLICTS IDENTIFIED

### ⚠️ CRITICAL ISSUE: Dark Theme CSS vs White WebView

1. **Global CSS (`src/index.css`):**
   - Lines 667-675: Forces dark gradient background on `<html>`
   - Uses `!important` flags
   - Dark colors: `#0a0b0f`, `#0c0e14`, etc.

2. **AppDelegate.swift:**
   - Lines 116-119: Sets WebView background to **WHITE** (`#FFFFFF`)
   - Lines 198-200: Injects JavaScript to force white background on `<html>`

3. **Page-Level Overrides:**
   - `AppHome.tsx` (lines 191-213): Forces white background via `useEffect`
   - `BuzzPage.tsx` (lines 98-121): Forces white background via `useEffect`
   - `IntelligencePage.tsx` (lines 22-45): Forces white background via `useEffect`

**Result:** Multiple competing background color declarations create contrast issues during:
- Initial page load
- iOS rubber-band bounce/overscroll
- Page transitions
- Safe area transitions

---

## RECOMMENDATIONS FOR PHASE 2

1. **Consolidate background color strategy:**
   - Remove dark theme CSS from `index.css` for iOS Capacitor
   - Ensure AppDelegate white background is respected
   - Remove redundant page-level `useEffect` overrides

2. **Verify contrast ratios:**
   - Text on white background (#FFFFFF)
   - UI elements (buttons, cards) on white background
   - Glass effects on white background

3. **Test overscroll behavior:**
   - Verify white background shows during bounce
   - Check safe area transitions
   - Validate header/nav visibility

---

**Next Steps:** Phase 2 - Contrast Ratio Analysis & Fix Implementation
