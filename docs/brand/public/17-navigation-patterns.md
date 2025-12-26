# M1SSION™ BRAND & DESIGN BIBLE
## Volume 17: Navigation Patterns

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. NAVIGATION PHILOSOPHY

### 1.1 Core Principles

Navigation in M1SSION™ must enable gameplay while maintaining immersion:

1. **Instant Access** — Key functions always reachable
2. **Non-Intrusive** — Doesn't obscure gameplay
3. **Clear Hierarchy** — Users know where they are
4. **Consistent** — Predictable across screens
5. **Minimal** — Only essential items exposed

### 1.2 Navigation Hierarchy

**Level 1: Global Navigation**
- Persistent across all screens
- Primary destinations
- Bottom tab bar

**Level 2: Section Navigation**
- Within major sections
- Tabs or segmented controls
- Context-specific

**Level 3: In-Page Navigation**
- Within content
- Links and buttons
- Contextual actions

---

## 2. BOTTOM TAB BAR

### 2.1 Structure

```
┌─────────────────────────────────────────────────┐
│                                                  │
│               PAGE CONTENT                       │
│                                                  │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Home]    [Map]    [Hunt]   [Intel]   [More]   │
│    🏠        🗺️       🎯       📡       ⋮        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 2.2 Tab Items

**Essential tabs (5 maximum):**
1. **Home** — Dashboard, overview
2. **Map** — Main gameplay interface
3. **Hunt/Buzz** — Primary action center
4. **Intelligence** — Information/narrative
5. **More/Profile** — Additional features

### 2.3 Visual Design

**Dimensions:**
- Height: 56px + safe area
- Icon size: 24px
- Label font: 10px

**Styling:**
```css
background: rgba(10, 10, 20, 0.95);
border-top: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
```

### 2.4 Tab States

**Inactive:**
- Icon: Gray (rgba(255, 255, 255, 0.4))
- Label: Gray
- No highlight

**Active:**
- Icon: Cyan (#00E5FF)
- Label: Cyan
- Glow effect optional

**Pressed:**
- Scale: 0.95
- Brightness increase
- Haptic feedback

### 2.5 Notification Badges

**Position:** Top-right of icon

**Styling:**
```css
background: #FF3366;
color: white;
font-size: 10px;
min-width: 16px;
height: 16px;
border-radius: 8px;
```

**Content:**
- Number (if countable)
- Dot (if just attention)
- Max "99+"

---

## 3. TOP NAVIGATION BAR

### 3.1 Standard Header

```
┌─────────────────────────────────────────────────┐
│ [←]     PAGE TITLE          [Action]   [Action] │
└─────────────────────────────────────────────────┘
```

**Components:**
- Back button (left)
- Page title (center)
- Action buttons (right)

### 3.2 Dimensions

**Height:** 56px + safe area (notch)
**Padding:** 16px horizontal

### 3.3 Visual Design

**Styling:**
```css
background: rgba(10, 10, 20, 0.9);
backdrop-filter: blur(8px);
border-bottom: 1px solid rgba(255, 255, 255, 0.1);
```

**Title:**
- Font: Electrolize, 18px
- Color: White
- Uppercase option

### 3.4 Back Navigation

**Icon:** Left arrow (←)
**Size:** 24px
**Touch target:** 44px
**Behavior:** Returns to previous screen

### 3.5 Action Buttons

**Maximum:** 2-3 actions
**Icons:** 24px
**Touch target:** 44px
**Examples:** Search, settings, share

---

## 4. CONTEXTUAL NAVIGATION

### 4.1 Tab Bar Within Page

**For sub-sections:**
```
┌─────────────────────────────────────────────────┐
│  [Tab 1]      [Tab 2]      [Tab 3]              │
│  ─────────                                      │
└─────────────────────────────────────────────────┘
```

**Styling:**
- Underline active tab
- Cyan underline color
- Smooth transition

### 4.2 Segmented Control

**For view modes:**
```
┌───────────────────────────────────────┐
│ [  List  ] [  Grid  ] [  Map  ]      │
└───────────────────────────────────────┘
```

**Styling:**
- Pill container
- Active segment highlighted
- Transition animation

### 4.3 Breadcrumbs

**For deep hierarchy:**
```
Home > Category > Subcategory > Item
```

**Usage:** Desktop primarily, optional on mobile

---

## 5. DRAWER/SIDE MENU

### 5.1 Structure

```
┌──────────────┬───────────────────────────────────┐
│              │                                    │
│  [Avatar]    │                                    │
│  Username    │                                    │
│              │         Main Content               │
│─────────────│                                    │
│              │                                    │
│  Profile     │                                    │
│  Settings    │                                    │
│  Missions    │                                    │
│  Rewards     │                                    │
│  Support     │                                    │
│              │                                    │
│─────────────│                                    │
│  Logout      │                                    │
│              │                                    │
└──────────────┴───────────────────────────────────┘
```

### 5.2 Trigger

**Methods:**
- Hamburger icon tap
- Swipe from edge
- Profile icon tap

### 5.3 Visual Design

**Width:** 280px (mobile), 320px (desktop)
**Background:** Dark with slight transparency
**Overlay:** Dimmed backdrop

### 5.4 Menu Items

**Dimensions:**
- Row height: 48px
- Icon: 24px
- Padding: 16px

**Styling:**
- Active item: Cyan highlight
- Icons match text color
- Dividers between groups

---

## 6. TRANSITION PATTERNS

### 6.1 Page Transitions

**Forward navigation:**
```css
/* New page slides in from right */
animation: slideInRight 300ms ease-out
```

**Back navigation:**
```css
/* Page slides out to right */
animation: slideOutRight 250ms ease-in
```

**Tab switching:**
```css
/* Fade transition */
animation: fadeIn 200ms ease-out
```

### 6.2 Modal Transitions

**Opening:**
- Backdrop fades in
- Modal scales up from 0.95
- Duration: 250ms

**Closing:**
- Reverse of opening
- Duration: 200ms

### 6.3 Drawer Transitions

**Opening:**
```css
transform: translateX(0);
transition: 300ms cubic-bezier(0.16, 1, 0.3, 1);
```

**Closing:**
```css
transform: translateX(-100%);
transition: 250ms ease-in;
```

---

## 7. GESTURE NAVIGATION

### 7.1 Swipe Gestures

**Back navigation:**
- Swipe from left edge
- Interactive dismiss
- Velocity threshold

**Drawer open:**
- Swipe from left edge (when drawer exists)
- Threshold: 50px

**Bottom sheet dismiss:**
- Swipe down
- Velocity-based

### 7.2 Pull Gestures

**Pull to refresh:**
- Standard pattern
- Loading indicator
- Content update

**Pull up for more:**
- Infinite scroll trigger
- Load more content

---

## 8. DEEP LINKING

### 8.1 URL Structure

**Pattern:** `m1ssion://section/page/id`

**Examples:**
- `m1ssion://map` - Map view
- `m1ssion://hunt/123` - Specific hunt
- `m1ssion://profile` - User profile

### 8.2 State Restoration

**Capabilities:**
- Return to previous position
- Restore scroll position
- Maintain filters

---

## 9. LOADING STATES

### 9.1 Initial Load

**Splash screen:**
- Logo animation
- Progress indicator
- Brand presence

### 9.2 Page Load

**Skeleton screens:**
- Gray placeholder shapes
- Shimmer animation
- Matches expected layout

### 9.3 Action Load

**Button spinner:**
- Within button
- Replaces text
- Disabled state

---

## 10. ERROR STATES

### 10.1 Navigation Errors

**Page not found:**
- Clear message
- Back/home options
- Branded styling

**Network error:**
- Retry option
- Offline indicator
- Cached content option

### 10.2 Recovery

**Options:**
- Back button
- Home button
- Retry action

---

## 11. ACCESSIBILITY

### 11.1 Focus Management

**Tab order:**
- Logical progression
- Skip to main content
- Clear indicators

**Focus visible:**
```css
outline: 2px solid #00E5FF;
outline-offset: 2px;
```

### 11.2 Screen Reader

**Landmarks:**
- Header as `<header>` or `role="banner"`
- Navigation as `<nav>`
- Main content as `<main>`

**Announcements:**
- Page changes
- Navigation state
- Loading status

### 11.3 Keyboard Navigation

**Tab bar:**
- Left/Right arrows
- Enter to select
- Tab to exit

**Drawer:**
- Escape to close
- Tab through items
- Focus trap when open

---

## 12. RESPONSIVE BEHAVIOR

### 12.1 Mobile (< 768px)

- Bottom tab bar
- Full-width content
- Stack layout
- Swipe gestures

### 12.2 Tablet (768px - 1024px)

- Bottom or side navigation
- Wider content areas
- Optional persistent drawer

### 12.3 Desktop (> 1024px)

- Side navigation possible
- Larger touch targets not required
- Hover states active
- Keyboard shortcuts prominent

---

## 13. SPECIAL NAVIGATION

### 13.1 Map Navigation

**Within map:**
- Pan gestures
- Zoom controls
- Compass
- Center on user

### 13.2 Onboarding Flow

**Linear progression:**
- Step indicator
- Next/back buttons
- Skip option
- Progress persistence

### 13.3 Game Flow Navigation

**Mission flow:**
- Progress indicator
- Context-specific actions
- Quick access to map
- State preservation

---

## 14. NAVIGATION PATTERNS BY SCREEN

### 14.1 Home Screen

**Elements:**
- Header with branding
- Main content (cards, overview)
- Bottom tab bar

### 14.2 Map Screen

**Elements:**
- Minimal header (or none)
- Map fills screen
- Floating controls
- Bottom tab bar (possibly hidden)

### 14.3 Detail Screens

**Elements:**
- Back button
- Title
- Content
- Action buttons
- Tab bar

### 14.4 Settings/Profile

**Elements:**
- Back button
- Section title
- List items
- Tab bar

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For responsive design, refer to Volume 18.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





