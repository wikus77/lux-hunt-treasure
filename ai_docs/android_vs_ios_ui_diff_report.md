# Android vs iOS UI Difference Report
**Date:** 2026-02-10
**Scope:** Web layer only (no iOS wrapper modifications)

---

## EXECUTIVE SUMMARY

Android WebView (Chromium-based) and iOS WKWebView have different rendering behaviors that can cause visual discrepancies. The differences observed in M1SSION fall into three categories:

1. **Critical:** Missing assets causing crashes/empty UI
2. **Visual:** CSS property support differences
3. **Layout:** Safe-area and viewport handling

---

## 1. CRITICAL DIFFERENCES (Asset-Related)

### 1.1 Missing 3D Models

| Feature | iOS | Android | Cause |
|---------|-----|---------|-------|
| 3D Agent in PrizeVision | ✅ Renders | ❌ Crashes | GLB files excluded from AAB |
| Agent Carousel | ✅ Works | ❌ Broken | GLB files excluded |

**Files Involved:**
- `src/components/command-center/home-sections/PrizeVision.tsx:37`
- `src/components/agent/agentCatalog.ts:27-53`

**Fix (web layer only):**
- Add fallback placeholder image when GLB fails to load
- Use remote CDN URL for 3D models with error boundary per component

### 1.2 Missing Videos

| Feature | iOS | Android | Cause |
|---------|-----|---------|-------|
| Home intro video | ✅ Plays | ❌ Missing | MP4 excluded from AAB |
| Prize reveal animations | ✅ Plays | ❌ Missing | MP4 excluded |

**Files Involved:**
- `src/components/home/HomeIntroVideo.tsx:18` - `/assets/video/HOME-BRIF-VIDEO.mp4`

**Fix (web layer only):**
- Add `onError` handler with fallback static image
- Load video from remote CDN

### 1.3 Missing Prize Images

| Feature | iOS | Android | Cause |
|---------|-----|---------|-------|
| Prize carousel HD images | ✅ Visible | ❌ Missing | Prize folders excluded |

**Files Involved:**
- `src/components/command-center/home-sections/PrizeVision.tsx:17-28`

**Fix (web layer only):**
- Add `onError` fallback for `<img>` tags
- Use remote URLs for HD prize images

---

## 2. VISUAL DIFFERENCES (CSS Support)

### 2.1 Backdrop Filter / Blur Effects

| Property | iOS WKWebView | Android Chromium | Support |
|----------|---------------|------------------|---------|
| `backdrop-filter: blur()` | ✅ Full support | ⚠️ Partial (may fail in older WebView) | Android 9+ |
| `-webkit-backdrop-filter` | ✅ Required prefix | ❌ Often ignored | Use both |

**Files Using backdrop-filter:**
```
src/index.css:630, 1021-1059, 1189
src/features/pulse-breaker/components/PulseBreaker.css:84, 731, 803
src/features/pulse/styles/pulse-pill.css:20
src/features/living-map/styles/livingMap.css:106
src/features/m1u/m1u-ui.css:10, 47
src/features/m1u/M1UPill.tsx:241
```

**Current Code Pattern (GOOD):**
```css
backdrop-filter: var(--wt-blur-main);
-webkit-backdrop-filter: var(--wt-blur-main);
```

**Fix (web layer only):**
- Add fallback solid background for unsupported browsers:
```css
background: rgba(0, 0, 0, 0.8); /* fallback */
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
@supports (backdrop-filter: blur(10px)) {
  background: rgba(0, 0, 0, 0.5);
}
```

### 2.2 Font Loading

| Aspect | iOS | Android | Difference |
|--------|-----|---------|------------|
| System font | SF Pro | Roboto | Different glyphs/spacing |
| Custom fonts (Orbitron) | ✅ Loads | ⚠️ May delay render | Network-dependent |

**Files Involved:**
- `src/index.css:30, 173` - Orbitron font-family
- Google Fonts CDN link in `index.html`

**Fix (web layer only):**
- Add `font-display: swap` to @font-face rules
- Ensure Orbitron is preloaded in `<head>`

### 2.3 Scrollbar Styling

| Aspect | iOS | Android |
|--------|-----|---------|
| Scrollbar visibility | Hidden by default | Visible on Chromium |
| Custom scrollbar CSS | `::-webkit-scrollbar` works | `::-webkit-scrollbar` works |

**Fix:** Already handled with `::-webkit-scrollbar { display: none; }` in index.css

---

## 3. LAYOUT DIFFERENCES

### 3.1 Safe Area Insets

| Property | iOS | Android |
|----------|-----|---------|
| `env(safe-area-inset-top)` | Returns actual notch height | Returns 0 |
| `env(safe-area-inset-bottom)` | Returns home indicator height | Returns 0 |

**Files Using safe-area:**
```
src/utils/viewportHeight.ts
src/features/notifications/NotificationPopup.tsx (likely)
Various bottom navigation components
```

**Fix (web layer only):**
- Use platform detection to add manual padding on Android:
```typescript
const isAndroid = /android/i.test(navigator.userAgent);
const safeBottom = isAndroid ? '16px' : 'env(safe-area-inset-bottom)';
```

### 3.2 100vh Behavior

| Behavior | iOS Safari/WKWebView | Android Chromium |
|----------|---------------------|------------------|
| `100vh` | Includes URL bar | Excludes URL bar |
| Address bar resize | Causes layout shift | More stable |

**Files Involved:**
- `src/utils/viewportHeight.ts:132` - Already handles this with `--vh` CSS variable

**Current Fix (GOOD):** Uses `window.innerHeight * 0.01` to set `--vh` variable.

### 3.3 Overscroll / Bounce

| Behavior | iOS | Android |
|----------|-----|---------|
| Elastic overscroll | Native bounce | No bounce (default) |
| Pull-to-refresh | Native gesture | Disabled in WebView |

**Fix (web layer only):**
- Already handled with `overscroll-behavior: none` where needed

---

## 4. PLATFORM DETECTION CODE

Current platform detection in codebase:

```typescript
// src/main.tsx:102-107
const isIOS = /iPhone|iPad|iPod/i.test(ua);

// src/utils/appBadge.ts:73-84
const isIOS = /iphone|ipad|ipod/.test(userAgent);
const isAndroid = /android/.test(userAgent);

// src/utils/iosPwaSafeBoot.ts:51
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// src/App.tsx:100
if (Capacitor.isNativePlatform()) { ... }
```

**Recommendation:**
- Create unified `src/utils/platform.ts` with:
```typescript
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isAndroid = () => /android/i.test(navigator.userAgent);
export const isNativeApp = () => Capacitor.isNativePlatform();
export const isAndroidNative = () => isAndroid() && isNativeApp();
export const isIOSNative = () => isIOS() && isNativeApp();
```

---

## 5. ANDROID-SPECIFIC RENDERING ISSUES

### 5.1 Touch Highlighting

Android WebView adds blue touch highlight by default.

**Fix:**
```css
* {
  -webkit-tap-highlight-color: transparent;
}
```

### 5.2 Text Selection

Android allows long-press text selection by default.

**Fix:**
```css
.non-selectable {
  -webkit-user-select: none;
  user-select: none;
}
```

### 5.3 Hardware Acceleration

Some CSS transforms may not use GPU on older Android WebView.

**Fix:**
```css
.animated-element {
  transform: translateZ(0);
  will-change: transform;
}
```

---

## 6. COMPARISON MATRIX

| Feature | iOS Status | Android Status | Fixable in Web Layer? |
|---------|------------|----------------|----------------------|
| 3D Agent models | ✅ | ❌ Crash | ✅ Yes (remote + fallback) |
| Home video | ✅ | ❌ Missing | ✅ Yes (remote) |
| Prize HD images | ✅ | ❌ Missing | ✅ Yes (remote + fallback) |
| Backdrop blur | ✅ | ⚠️ Partial | ✅ Yes (CSS fallback) |
| Safe-area padding | ✅ | ⚠️ Returns 0 | ✅ Yes (platform padding) |
| Font rendering | ✅ | ⚠️ Different | ⚠️ Partial (preload) |
| Scrollbar style | ✅ | ✅ | ✅ Already handled |
| Viewport height | ✅ | ✅ | ✅ Already handled |

---

## 7. NEXT ACTIONS (Numbered)

1. **Implement Remote Asset Pipeline** - Load 3D models, videos, and HD images from CDN
2. **Add Error Boundaries** - Per-component fallbacks to prevent full-page crash
3. **CSS Fallback Audit** - Ensure all `backdrop-filter` has solid background fallback
4. **Platform Padding** - Add Android-specific safe-area padding
5. **Font Preload** - Add `<link rel="preload">` for Orbitron font
6. **Unified Platform Utils** - Consolidate platform detection to single file

---

*Report generated: 2026-02-10*
