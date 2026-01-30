# iOS Contrast Audit - Phase 3: Header & Text Computed Styles

**Date:** January 30, 2026  
**Focus:** CSS rules affecting text contrast/visibility on iOS

---

## OPACITY RULES FOUND

### Critical (Affecting Header)
- **src/components/layout/UnifiedHeader.tsx:337** - `background: 'rgba(15, 20, 30, 0.45)'` 
  - **ISSUE:** Header pill only 45% opaque - too transparent for good contrast
  - **Impact:** White text on 45% dark background may fail WCAG AA (4.5:1)

### iOS Native Styles
- **src/styles/ios-native.css:76** - `background: hsl(var(--card) / 0.95);`
  - Reconnect badge - 95% opaque (acceptable)
  
- **src/styles/ios-native.css:171** - `background: hsl(var(--card) / 0.98);`
  - Reconnect badge dark mode - 98% opaque (good)

### Soft Native Styles (Light Theme)
- **src/styles/soft-native.css:18** - `--sn-bg-card: rgba(255, 255, 255, 0.95);`
  - Card backgrounds - 95% opaque (acceptable for light theme)

- **src/styles/soft-native.css:138** - `background: rgba(255, 255, 255, 0.98);`
  - Elevated cards - 98% opaque (good)

- **src/styles/soft-native.css:152** - `background: rgba(255, 255, 255, 0.75);`
  - Flat cards - 75% opaque (may need review)

### Decorative Only
- **src/styles/theme.css:260** - `opacity: 0.03;`
  - Grain overlay - decorative, doesn't affect text

---

## BACKDROP/BLUR RULES

### Header Pill (CRITICAL)
- **src/components/layout/UnifiedHeader.tsx:338-339**
  ```javascript
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  ```
  - **ISSUE:** Very strong blur (20px) combined with 45% opacity background
  - **Impact:** Backdrop blur can reduce perceived contrast, especially on iOS
  - **Note:** Saturation boost (180%) may help but doesn't solve opacity issue

### iOS Native Styles
- **src/styles/ios-native.css:77-78** - `backdrop-filter: blur(12px);`
  - Reconnect badge - moderate blur (acceptable)

- **src/styles/ios-native.css:387-388** - `backdrop-filter: none !important;`
  - Header wrapper - correctly disabled (wrapper should be transparent)

### Soft Native Styles
- **src/styles/soft-native.css:123-124** - `backdrop-filter: blur(12px);`
  - Standard cards - moderate blur

- **src/styles/soft-native.css:139-140** - `backdrop-filter: blur(16px);`
  - Elevated cards - stronger blur

- **src/styles/soft-native.css:153-154** - `backdrop-filter: blur(8px);`
  - Flat cards - lighter blur

---

## TEXT COLOR OVERRIDES

### UnifiedHeader Component
- **src/components/layout/UnifiedHeader.tsx:296** - `className="text-white"`
  - CODE text in MinimalHeaderStrip

- **src/components/layout/UnifiedHeader.tsx:367** - `className="text-white"`
  - SSION text in logo

- **src/components/layout/UnifiedHeader.tsx:393** - `className="text-white"`
  - CODE text in pill header

### CSS Variable Usage
- **src/styles/ios-native.css:101** - `color: hsl(var(--foreground));`
  - Reconnect badge text - uses theme variable (good practice)

### Theme Variables (theme.css)
- **Dark mode:** `--foreground: 0 0% 98%;` (light text)
- **Light mode:** `--foreground: 0 0% 18%;` (dark text)

---

## NATIVE-SPECIFIC RULES

### Correctly Implemented
- **src/styles/ios-native.css:384-389** - `body.is-native .unified-header-wrapper`
  - Wrapper is transparent (correct - only pill should have background)

- **src/styles/ios-native.css:392-397** - `body.is-native .bottom-navigation-ios`
  - Bottom nav wrapper transparent (correct)

- **src/styles/ios-native.css:400-404** - `body.is-native [class*="MinimalHeaderStrip"]`
  - Minimal header transparent (correct)

### Light Theme Overrides
- **src/styles/soft-native.css:73-76** - `body.is-native:has(.sn-page)`
  - Forces light background for soft-native pages

- **src/styles/soft-native.css:526-531** - `body.is-native .sn-page`
  - Ensures page containers are transparent

---

## SUSPECTED ROOT CAUSE

### 🔴 CRITICAL ISSUE: Header Pill Opacity Too Low

**Location:** `src/components/layout/UnifiedHeader.tsx:337`

**Current Implementation:**
```javascript
background: 'rgba(15, 20, 30, 0.45)',  // Only 45% opaque!
backdropFilter: 'blur(20px) saturate(180%)',
```

**Problem Analysis:**

1. **Opacity Too Low:** 45% opacity means 55% of background shows through
   - On light backgrounds, this creates a washed-out appearance
   - White text contrast suffers significantly

2. **Backdrop Filter Interaction:**
   - `backdrop-filter: blur(20px)` blurs content behind the header
   - On iOS, backdrop-filter can reduce effective opacity perception
   - Combined with 45% opacity, text becomes harder to read

3. **iOS-Specific Issues:**
   - iOS Safari/WKWebView handles backdrop-filter differently than desktop
   - Users with "Reduce Transparency" accessibility setting may see worse contrast
   - Different iOS versions may render backdrop-filter inconsistently

4. **WCAG Compliance:**
   - White text (#FFFFFF) on rgba(15, 20, 30, 0.45) background
   - Effective contrast ratio likely below 4.5:1 (WCAG AA requirement)
   - May fail accessibility audits

---

## SOLUTION RECOMMENDATIONS

### Priority 1: Increase Header Background Opacity

**Option A: Increase to 85-90% opacity (Recommended)**
```javascript
background: 'rgba(15, 20, 30, 0.85)',  // or 0.90
```

**Option B: Use theme variable with higher opacity**
```javascript
background: 'hsl(var(--card) / 0.90)',
```

### Priority 2: Reduce Backdrop Blur

**Current:** `blur(20px)`  
**Recommended:** `blur(12px)` or `blur(16px)`

```javascript
backdropFilter: 'blur(12px) saturate(180%)',
```

**Rationale:** Lighter blur maintains glass effect while improving text clarity

### Priority 3: Add Text Shadow for Contrast

**Enhance white text visibility:**
```javascript
textShadow: "0 1px 2px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.3)"
```

### Priority 4: iOS-Specific Override

**Add iOS-specific rule for better contrast:**
```css
/* src/styles/ios-native.css */
body.is-native .unified-header-wrapper header {
  background: rgba(15, 20, 30, 0.95) !important;
  backdrop-filter: blur(12px) saturate(150%) !important;
}
```

### Priority 5: Test with iOS Accessibility Settings

**Test scenarios:**
- Standard iOS settings
- "Increase Contrast" enabled
- "Reduce Transparency" enabled
- Dark mode vs Light mode

---

## TESTING CHECKLIST

- [ ] Increase header opacity to 0.85-0.90
- [ ] Reduce backdrop blur to 12px
- [ ] Add text-shadow to white text elements
- [ ] Test on iOS device (not just simulator)
- [ ] Test with "Increase Contrast" enabled
- [ ] Test with "Reduce Transparency" enabled
- [ ] Verify WCAG AA compliance (4.5:1 contrast ratio)
- [ ] Test in both light and dark backgrounds
- [ ] Verify header readability during scroll/bounce

---

## FILES REQUIRING CHANGES

1. **src/components/layout/UnifiedHeader.tsx**
   - Line 337: Increase background opacity
   - Line 338-339: Reduce backdrop blur
   - Lines 296, 367, 393: Add text-shadow to white text

2. **src/styles/ios-native.css** (Optional)
   - Add iOS-specific override for header contrast

---

## ADDITIONAL NOTES

- The wrapper transparency rules are correctly implemented
- Soft-native styles use appropriate opacity for light theme
- Theme variables are properly used in most places
- Main issue is isolated to UnifiedHeader pill background opacity

---

**Report Generated:** January 30, 2026  
**Next Steps:** Implement opacity and blur fixes, then test on physical iOS device
