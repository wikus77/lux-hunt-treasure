# M1SSION™ BRAND & DESIGN BIBLE
## Volume 5: UI Component Library

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. COMPONENT PHILOSOPHY

### 1.1 Design Principles

M1SSION™ UI components follow these fundamental principles:

**Consistency**
Every component maintains visual and behavioral consistency across the platform. Users develop intuitive understanding through repeated patterns.

**Clarity**
Components communicate their purpose and state clearly. No ambiguity in what an element does or what state it represents.

**Responsiveness**
All components adapt gracefully to different screen sizes and input methods. Touch, mouse, and keyboard all receive equal consideration.

**Accessibility**
Components meet WCAG 2.1 AA standards minimum. Color, contrast, focus states, and screen reader support are built-in, not afterthoughts.

**Performance**
Components are optimized for rendering performance. Animations use GPU-accelerated properties. Heavy operations are deferred or throttled.

---

## 2. BUTTONS

### 2.1 Primary Button

The main call-to-action button.

**Visual Properties:**
- Background: Linear gradient (Pulse Cyan)
- Border: None
- Border Radius: 8px
- Padding: 12px 24px
- Min Width: 120px
- Text: Electrolize, 14px, uppercase, white
- Glow: 0 0 20px rgba(0, 229, 255, 0.4)

**States:**

| State | Modification |
|-------|-------------|
| Default | As described above |
| Hover | Background lightens 10%, glow intensifies |
| Active | Scale 0.98, glow reduces |
| Focus | 2px offset ring in cyan |
| Disabled | 50% opacity, no glow, cursor not-allowed |
| Loading | Spinner replaces text, maintains width |

### 2.2 Secondary Button

Supporting actions with less visual weight.

**Visual Properties:**
- Background: Transparent
- Border: 1px solid var(--color-cyan)
- Border Radius: 8px
- Padding: 12px 24px
- Text: Inter Medium, 14px, cyan

**States:**

| State | Modification |
|-------|-------------|
| Default | As described |
| Hover | Background rgba(0, 229, 255, 0.1) |
| Active | Border color lightens |
| Focus | 2px offset ring |
| Disabled | 50% opacity |

### 2.3 Ghost Button

Minimal visual presence.

**Visual Properties:**
- Background: Transparent
- Border: None
- Padding: 12px 24px
- Text: Inter Medium, 14px, color varies

**States:**
- Hover: Subtle background tint
- Focus: Underline or ring

### 2.4 Icon Button

Button containing only an icon.

**Visual Properties:**
- Size: 40px × 40px (touch target)
- Icon Size: 20px
- Border Radius: 8px or 50%
- Background: Transparent or Night Surface

### 2.5 Danger Button

For destructive actions.

**Visual Properties:**
- Background: Linear gradient (Signal Magenta)
- Other properties match Primary

---

## 3. FORM ELEMENTS

### 3.1 Text Input

Standard text entry field.

**Visual Properties:**
- Background: Night Surface (#1A1A2E)
- Border: 1px solid Dusk (#303045)
- Border Radius: 8px
- Padding: 12px 16px
- Height: 48px
- Text: Inter, 14px, Light color

**States:**

| State | Modification |
|-------|-------------|
| Default | As described |
| Focus | Border color Pulse Cyan, subtle glow |
| Error | Border color Error Red |
| Disabled | 50% opacity |
| Filled | Same as default |

**Label:**
- Position: Above input
- Font: Inter, 12px, 500 weight
- Color: Mist
- Margin Bottom: 8px

**Helper Text:**
- Position: Below input
- Font: Inter, 12px, 400 weight
- Color: Mist or Error Red

### 3.2 Password Input

Text input with visibility toggle.

**Additional Properties:**
- Visibility toggle icon on right
- Icon changes based on state
- Same styling as Text Input

### 3.3 Text Area

Multi-line text entry.

**Visual Properties:**
- Same as Text Input
- Min Height: 100px
- Resize: Vertical only
- Line Height: 1.5

### 3.4 Select / Dropdown

Selection from predefined options.

**Visual Properties:**
- Same base as Text Input
- Chevron icon on right
- Dropdown panel matches input width
- Options have hover and selected states

**Dropdown Panel:**
- Background: Deep Space
- Border: 1px solid Dusk
- Border Radius: 8px
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
- Max Height: 240px with scroll

### 3.5 Checkbox

Binary selection.

**Visual Properties:**
- Size: 20px × 20px
- Border: 2px solid Dusk
- Border Radius: 4px
- Background: Transparent

**Checked State:**
- Background: Pulse Cyan
- Border: Pulse Cyan
- Check icon: White

### 3.6 Radio Button

Single selection from group.

**Visual Properties:**
- Size: 20px × 20px
- Border: 2px solid Dusk
- Border Radius: 50%
- Background: Transparent

**Selected State:**
- Border: Pulse Cyan
- Inner dot: Pulse Cyan (10px)

### 3.7 Toggle Switch

On/off control.

**Visual Properties:**
- Track: 48px × 24px
- Thumb: 20px circle
- Border Radius: 12px

**States:**
- Off: Track dark, thumb left
- On: Track cyan, thumb right
- Transition: 200ms ease

---

## 4. CARDS

### 4.1 Standard Card

Container for related content.

**Visual Properties:**
- Background: Deep Space (#12121F)
- Border: 1px solid rgba(255, 255, 255, 0.05)
- Border Radius: 12px
- Padding: 16px
- Shadow: 0 4px 16px rgba(0, 0, 0, 0.2)

**Card Header:**
- Title: Electrolize, 16px
- Subtitle: Inter, 12px, Mist
- Optional icon

**Card Body:**
- Content area
- Standard body typography

**Card Footer:**
- Action buttons
- Metadata

### 4.2 Interactive Card

Card with hover/tap states.

**Additional Properties:**
- Cursor: Pointer
- Hover: Border glow, slight lift
- Active: Scale 0.99

### 4.3 Stat Card

Displays numerical data.

**Structure:**
- Large number (Roboto Mono, 32px)
- Label below (Inter, 12px)
- Optional trend indicator
- Optional icon

### 4.4 Entity Card

Entity-branded card.

**Properties:**
- Border top: 3px solid entity color
- Background tint: Entity color at 5%
- Icon in entity color

---

## 5. MODALS & OVERLAYS

### 5.1 Modal Dialog

Focused content requiring action.

**Visual Properties:**
- Background: Deep Space
- Border: 1px solid Dusk
- Border Radius: 16px
- Padding: 24px
- Max Width: 480px
- Shadow: 0 16px 48px rgba(0, 0, 0, 0.5)

**Structure:**
- Header with title and close button
- Body with content
- Footer with actions (right-aligned)

**Backdrop:**
- Background: rgba(0, 0, 0, 0.8)
- Blur: 4px optional

### 5.2 Fullscreen Overlay

Immersive experience overlay.

**Visual Properties:**
- Position: Fixed, full viewport
- Background: Void Black or gradient
- Z-index: Above all content
- Safe area padding

**Uses:**
- Entity messages
- Mission briefings
- Prize reveals

### 5.3 Toast Notification

Temporary feedback message.

**Visual Properties:**
- Position: Top center or bottom center
- Background: Night Surface
- Border Radius: 8px
- Padding: 12px 16px
- Shadow: 0 4px 16px rgba(0, 0, 0, 0.3)

**Types:**
- Info: Cyan accent
- Success: Green accent
- Warning: Amber accent
- Error: Red accent

**Behavior:**
- Auto-dismiss: 3-5 seconds
- Dismissible: Close button
- Stackable: Up to 3 visible

---

## 6. NAVIGATION

### 6.1 Bottom Navigation Bar

Primary mobile navigation.

**Visual Properties:**
- Height: 64px (plus safe area)
- Background: Deep Space with blur
- Border Top: 1px solid rgba(255, 255, 255, 0.05)
- Position: Fixed bottom

**Nav Items:**
- Icon (24px) above label (10px)
- Active: Cyan color
- Inactive: Steel color
- Tap target: Min 48px

### 6.2 Top Header Bar

Context and actions bar.

**Visual Properties:**
- Height: 56px (plus safe area)
- Background: Void Black or transparent
- Position: Fixed top or relative

**Content:**
- Left: Back button or menu
- Center: Title
- Right: Actions

### 6.3 Tab Bar

Content switching within page.

**Visual Properties:**
- Height: 48px
- Background: Transparent
- Border Bottom: 1px solid Dusk

**Tab Items:**
- Text only or icon+text
- Active indicator: 2px line in Cyan
- Active text: Light
- Inactive text: Mist

---

## 7. LISTS

### 7.1 Standard List

Vertical list of items.

**Visual Properties:**
- Background: Transparent
- Divider: 1px solid rgba(255, 255, 255, 0.05)
- Item Padding: 16px

**List Item:**
- Leading: Icon or avatar
- Content: Title and optional subtitle
- Trailing: Action or value

### 7.2 Interactive List

Tappable list items.

**Additional Properties:**
- Hover: Background Night Surface
- Active: Background Twilight
- Ripple effect on tap

### 7.3 Leaderboard List

Ranked entries.

**Structure:**
- Rank number (left)
- Avatar
- Name and stats
- Score (right)

**Special Ranks:**
- 1st: Gold accent
- 2nd: Silver accent
- 3rd: Bronze accent

---

## 8. PROGRESS INDICATORS

### 8.1 Progress Bar

Linear progress display.

**Visual Properties:**
- Track: Dusk, 4px height
- Fill: Cyan gradient
- Border Radius: 2px

**Variants:**
- Determinate: Shows percentage
- Indeterminate: Animated shimmer

### 8.2 Circular Progress

Radial progress display.

**Visual Properties:**
- Track: Dusk stroke
- Fill: Cyan stroke
- Stroke Width: 4px
- Animation: Rotate fill

### 8.3 Spinner

Loading indicator.

**Visual Properties:**
- Size: 24px, 32px, or 48px
- Stroke: Cyan, animated rotation
- Duration: 1s loop

---

## 9. FEEDBACK ELEMENTS

### 9.1 Badge

Status or count indicator.

**Visual Properties:**
- Size: Min 20px width
- Padding: 4px 8px
- Border Radius: 10px
- Font: Inter, 10px, 500

**Variants:**
- Dot: 8px circle (no text)
- Count: Number display
- Label: Text badge

### 9.2 Chip

Selectable/removable tag.

**Visual Properties:**
- Height: 32px
- Padding: 0 12px
- Border Radius: 16px
- Background: Night Surface
- Border: 1px solid Dusk

**States:**
- Selected: Cyan background
- Removable: X icon included

### 9.3 Tooltip

Contextual information.

**Visual Properties:**
- Background: Twilight
- Border Radius: 4px
- Padding: 8px 12px
- Font: Inter, 12px
- Max Width: 240px
- Arrow pointing to trigger

---

## 10. DATA DISPLAY

### 10.1 Avatar

User or entity representation.

**Visual Properties:**
- Sizes: 24px, 32px, 40px, 48px, 64px
- Border Radius: 50%
- Border: Optional 2px entity color
- Fallback: Initials on colored background

### 10.2 Status Indicator

Online/offline or state display.

**Visual Properties:**
- Size: 8px or 12px
- Border Radius: 50%
- Position: Overlapping parent element
- Colors: Green (online), Gray (offline), Amber (away)

### 10.3 Countdown Timer

Time remaining display.

**Visual Properties:**
- Font: Roboto Mono, tabular-nums
- Size: Context dependent
- Glow: Increases as time decreases
- Color shift: Cyan → Amber → Red

---

## 11. SPECIALIZED COMPONENTS

### 11.1 Pulse Energy Bar

Displays current pulse energy.

**Visual Properties:**
- Segmented bar design
- Animated fill when increasing
- Glow on full segments
- Depletion animation

### 11.2 M1U Balance Display

Currency amount display.

**Structure:**
- M1U icon
- Amount (Roboto Mono, tabular)
- Optional +/- animation

### 11.3 Signal Strength Indicator

Proximity to marker signal.

**Visual Properties:**
- Multiple arc segments
- Fill based on strength
- Animated pulse
- Color intensity scales

---

## 12. COMPONENT TOKENS

### 12.1 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing |
| space-2 | 8px | Compact |
| space-3 | 12px | Standard |
| space-4 | 16px | Comfortable |
| space-5 | 24px | Generous |
| space-6 | 32px | Section spacing |
| space-8 | 48px | Large gaps |

### 12.2 Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Small elements |
| radius-md | 8px | Buttons, inputs |
| radius-lg | 12px | Cards |
| radius-xl | 16px | Modals |
| radius-full | 50% | Circles |

### 12.3 Shadow Tokens

| Token | Value |
|-------|-------|
| shadow-sm | 0 2px 4px rgba(0,0,0,0.2) |
| shadow-md | 0 4px 16px rgba(0,0,0,0.3) |
| shadow-lg | 0 8px 32px rgba(0,0,0,0.4) |
| shadow-xl | 0 16px 48px rgba(0,0,0,0.5) |

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For UX principles, refer to Volume 6.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




