# iOS Contrast Audit - Phase 4: Bottom Navigation Icon Visibility

## BOTTOM NAV COMPONENT: `src/components/layout/BottomNavigation.tsx`

## ICON RENDERING:
- **Icon type**: Lucide React icons (Home, MessageSquare, Circle) + Custom SVGs
- **Color source**: `currentColor` (inherited from parent button's inline style)
- **Fill/Stroke**: 
  - Lucide icons: `stroke="currentColor"` (no fill)
  - Custom SVGs: `stroke="currentColor"` or `fill="currentColor" stroke="currentColor"`
  - Stroke width: `1.5` for most icons, `1` for leaderboard icon

## CSS RULES AFFECTING NAV:

### Component Inline Styles (`BottomNavigation.tsx:219-240`)
- **Wrapper** (`.bottom-navigation-ios`):
  - `opacity: 1` (explicit)
  - `visibility: visible` (explicit)
  - `pointerEvents: "none"` (wrapper only, inner pill has `auto`)

### Inner Pill Container (`BottomNavigation.tsx:242-257`)
- **Background**: `rgba(15, 20, 30, 0.45)` - Semi-transparent dark blue
- **Backdrop filter**: `blur(20px) saturate(180%)` - Heavy blur effect
- **Box shadow**: `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.08)`

### Icon Color (`BottomNavigation.tsx:275`)
- **Active**: `#00D1FF` (cyan) - Good contrast
- **Inactive**: `#8B9CAF` (grayish blue) - **LOW CONTRAST ISSUE**

### CSS Files:
- **`src/styles/ios-native.css:392`** - Makes wrapper transparent in native mode:
  ```css
  body.is-native .bottom-navigation-ios {
    background: transparent !important;
    backdrop-filter: none !important;
  }
  ```
  This removes backdrop-filter from wrapper, but inner pill still has it.

- **`src/styles/native-app-upgrade.css:18-21`** - Icon size rules:
  ```css
  .bottom-navigation-ios .bottom-nav-icon {
    width: 28px !important;
    height: 28px !important;
  }
  ```
  Note: Component uses inline styles, so these classes may not apply.

- **`src/styles/native-app-upgrade.css:320-326`** - Active state enhancements:
  ```css
  .bottom-navigation-ios .nav-active {
    text-shadow: 0 0 10px rgba(0, 209, 255, 0.8) !important;
  }
  .bottom-navigation-ios .nav-active .bottom-nav-icon {
    filter: drop-shadow(0 0 6px rgba(0, 209, 255, 0.8)) !important;
  }
  ```
  Note: Component doesn't use `.nav-active` class, uses inline styles instead.

- **`src/styles/utilities.css:37-43`** - Unused utility classes:
  ```css
  .bottom-nav-item { ... }
  .dark .bottom-nav-item { @apply text-gray-400; }
  .light .bottom-nav-item { @apply text-gray-600; }
  ```
  These are not used by the actual component.

- **`src/styles/soft-native.css:563-568`** - z-index guarantee for broken pages:
  ```css
  body:has(.sn-page) .bottom-navigation-ios {
    z-index: 9999 !important;
    isolation: isolate !important;
  }
  ```

## ACTIVE VS INACTIVE:

### Active State:
- **Color**: `#00D1FF` (cyan)
- **Background circle**: `rgba(0, 0, 0, 0.4)` (semi-transparent black)
- **Indicator line**: `#00D1FF` with glow (`boxShadow: "0 0 8px #00D1FF, 0 0 16px #00D1FF"`)
- **Opacity**: Full (1.0)
- **Contrast**: Good against dark pill background

### Inactive State:
- **Color**: `#8B9CAF` (grayish blue)
- **Background**: None
- **Indicator**: None
- **Opacity**: Full (1.0)
- **Contrast**: **POOR** - Low contrast against `rgba(15, 20, 30, 0.45)` background

## ROOT CAUSE OF LOW CONTRAST:

### Primary Issues:

1. **Inactive Color Too Muted**: 
   - `#8B9CAF` has insufficient contrast against the semi-transparent dark pill background
   - The color appears "washed out" especially when the backdrop-filter blur mixes with page content behind

2. **Semi-Transparent Background Amplifies Problem**:
   - Pill background `rgba(15, 20, 30, 0.45)` allows page content to bleed through
   - Combined with `blur(20px) saturate(180%)`, this creates visual noise that reduces icon visibility
   - On broken pages (`.sn-page`), bright backgrounds can wash out the icons further

3. **No Icon-Specific Contrast Enhancement**:
   - Icons rely solely on color inheritance (`currentColor`)
   - No stroke-width increase for inactive icons
   - No drop-shadow or outline for inactive icons to improve visibility

4. **Missing CSS Class Usage**:
   - Component uses inline styles instead of CSS classes
   - Utility classes like `.bottom-nav-item.active` exist but aren't used
   - Native upgrade styles (`.nav-active`) don't apply because component doesn't use those classes

### Secondary Issues:

5. **Backdrop Filter Interaction**:
   - Heavy blur (`blur(20px)`) can make icons appear softer/less defined
   - On iOS, backdrop-filter can have performance implications that affect rendering clarity

6. **Wrapper Transparency in Native Mode**:
   - `ios-native.css` makes wrapper transparent, which is correct
   - But the inner pill's semi-transparent background still allows content bleed-through

## RECOMMENDATIONS:

1. **Increase Inactive Icon Contrast**:
   - Change inactive color from `#8B9CAF` to `#A0B4C8` or `#B8C8D8` (lighter gray-blue)
   - Or use `#FFFFFF` with reduced opacity: `rgba(255, 255, 255, 0.7)`

2. **Add Visual Enhancement for Inactive Icons**:
   - Increase stroke-width for inactive icons: `strokeWidth={2}` vs `1.5`
   - Add subtle drop-shadow: `filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))`

3. **Improve Pill Background Opacity**:
   - Increase background opacity: `rgba(15, 20, 30, 0.65)` or `rgba(15, 20, 30, 0.75)`
   - This reduces content bleed-through and improves icon contrast

4. **Consider CSS Classes Instead of Inline Styles**:
   - Move color logic to CSS classes for better maintainability
   - Use `.nav-active` and `.nav-inactive` classes
   - Apply native upgrade styles properly

5. **Add iOS-Specific Contrast Boost**:
   - For `body.is-native`, increase inactive icon opacity or use lighter color
   - Add explicit contrast rules for broken pages (`.sn-page`)
