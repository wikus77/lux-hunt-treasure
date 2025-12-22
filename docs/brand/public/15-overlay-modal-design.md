# M1SSION™ BRAND & DESIGN BIBLE
## Volume 15: Overlay & Modal Design

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. OVERLAY PHILOSOPHY

### 1.1 Purpose of Overlays

Overlays in M1SSION™ serve critical narrative and functional purposes:

1. **Narrative Delivery** — Entity communications
2. **Attention Focus** — Critical information
3. **Flow Control** — Guided sequences
4. **Information Display** — Detailed content

### 1.2 Overlay Principles

**Respect the Player:**
- Don't block unnecessarily
- Clear dismiss path
- Appropriate duration

**Maintain Immersion:**
- Match visual language
- Narrative consistency
- Seamless transitions

**Prioritize Clarity:**
- One message at a time
- Clear hierarchy
- Obvious actions

---

## 2. OVERLAY TYPES

### 2.1 Full-Screen Overlay

**Maximum attention:**
```
┌─────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓                                               ▓│
│▓              [ENTITY SYMBOL]                  ▓│
│▓                                               ▓│
│▓         "Message text appears here            ▓│
│▓          with typing effect."                 ▓│
│▓                                               ▓│
│▓              [ACTION BUTTON]                  ▓│
│▓                                               ▓│
│▓                  [X CLOSE]                    ▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────────┘
```

**Usage:**
- Entity communications
- Critical alerts
- Mission briefings
- Prize reveals

### 2.2 Centered Modal

**Focused content:**
```
┌─────────────────────────────────────────────────┐
│             (dimmed background)                  │
│                                                  │
│        ┌─────────────────────────┐              │
│        │    MODAL HEADER         │   [X]        │
│        │─────────────────────────│              │
│        │                         │              │
│        │    Modal content        │              │
│        │    goes here            │              │
│        │                         │              │
│        │─────────────────────────│              │
│        │  [CANCEL]  [CONFIRM]    │              │
│        └─────────────────────────┘              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Usage:**
- Confirmations
- Settings panels
- Detail views
- Forms

### 2.3 Bottom Sheet

**Contextual info:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│              (main content visible)              │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│    ▬▬▬   (drag handle)                          │
│                                                  │
│    Sheet Title                                   │
│                                                  │
│    Content in bottom sheet format               │
│    Easy to dismiss via swipe                    │
│                                                  │
│    [ACTION BUTTON]                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Usage:**
- Location details
- Quick actions
- Supplementary info

### 2.4 Toast/Snackbar

**Brief notification:**
```
                  ┌─────────────────────┐
                  │ ✓ Clue discovered!  │
                  └─────────────────────┘
```

**Usage:**
- Success confirmations
- Quick updates
- Non-blocking info

### 2.5 Whisper Overlay

**Subtle notification:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────────────────────┐                   │
│  │ "Shadow whisper text..." │                   │
│  └──────────────────────────┘                   │
│                                                  │
│              (main content below)                │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Usage:**
- Entity whispers
- Ambient narrative
- Hints

---

## 3. VISUAL STYLING

### 3.1 Background Treatment

**Full-Screen Overlay:**
- Solid dark: #0A0A14 at 95%
- Or gradient with glitch effect
- Entity-influenced color tint

**Modal Backdrop:**
- Black at 70-80% opacity
- Blur: 8-12px
- Click to dismiss (optional)

**Bottom Sheet:**
- Dark background
- Elevated shadow
- Rounded top corners

### 3.2 Container Styling

**Standard Modal:**
```css
background: linear-gradient(145deg, 
  rgba(15, 15, 26, 0.98),
  rgba(26, 26, 53, 0.95)
);
border: 1px solid rgba(0, 229, 255, 0.2);
border-radius: 16px;
box-shadow: 
  0 0 0 1px rgba(0, 229, 255, 0.1),
  0 24px 48px rgba(0, 0, 0, 0.5);
```

**Entity Modal (SHADOW):**
```css
border-color: rgba(255, 51, 102, 0.4);
box-shadow: 0 0 30px rgba(255, 51, 102, 0.2);
```

**Entity Modal (MCP):**
```css
border-color: rgba(0, 229, 255, 0.4);
box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
```

**Entity Modal (ECHO):**
```css
border-color: rgba(153, 102, 255, 0.4);
box-shadow: 0 0 30px rgba(153, 102, 255, 0.2);
```

### 3.3 Header Design

**Modal Header:**
- Font: Electrolize, 18-20px
- Uppercase, centered
- Divider line below
- Close button top-right

**Close Button:**
- X icon (20px)
- Circular hit area (44px)
- Subtle background on hover

### 3.4 Content Area

**Typography:**
- Body: Inter, 15px
- Good line height (1.6)
- Max width for readability

**Spacing:**
- Padding: 20-24px
- Gap between elements: 16px

### 3.5 Footer/Actions

**Button placement:**
- Right-aligned for primary
- Left-aligned for secondary
- Full-width for single action

**Standard pattern:**
```
[Cancel]          [Confirm]
(secondary)       (primary)
```

---

## 4. ENTITY OVERLAYS

### 4.1 SHADOW Overlay

**Visual characteristics:**
- Red/magenta tint
- Glitch effects active
- Inverted triangle symbol
- Ominous atmosphere

**Symbol animation:**
- Eye in triangle
- Subtle rotation
- Scale pulse
- Glitch jitter

### 4.2 MCP Overlay

**Visual characteristics:**
- Cyan tint
- Clean, stable appearance
- Shield/hexagon symbol
- Protective atmosphere

**Symbol animation:**
- Rotating rings
- Scan lines
- Stable pulse
- Data streams

### 4.3 ECHO Overlay

**Visual characteristics:**
- Purple/violet tint
- Ghosted, uncertain feel
- Wave/circle fragments
- Ethereal atmosphere

**Symbol animation:**
- Flickering form
- Wave pulses
- Partial visibility
- Fragmented appearance

### 4.4 Text Presentation

**Typing effect:**
- Character by character
- 30-50ms per character
- Cursor indicator
- Pause at punctuation

**Text styling:**
- Monospace for entity comms
- Color matches entity
- Glow effect on text
- Good contrast

---

## 5. MODAL PATTERNS

### 5.1 Confirmation Modal

**Structure:**
```
┌─────────────────────────────────────┐
│        CONFIRM ACTION        [X]    │
├─────────────────────────────────────┤
│                                     │
│  Are you sure you want to          │
│  perform this action?              │
│                                     │
│  This cannot be undone.            │
│                                     │
├─────────────────────────────────────┤
│  [CANCEL]              [CONFIRM]    │
└─────────────────────────────────────┘
```

### 5.2 Information Modal

**Structure:**
```
┌─────────────────────────────────────┐
│         PRIZE DETAILS        [X]    │
├─────────────────────────────────────┤
│                                     │
│  [Prize Image]                      │
│                                     │
│  Prize Name                         │
│  Description text explaining       │
│  the prize details.                │
│                                     │
│  Value: €5,000                     │
│                                     │
├─────────────────────────────────────┤
│           [CLOSE]                   │
└─────────────────────────────────────┘
```

### 5.3 Form Modal

**Structure:**
```
┌─────────────────────────────────────┐
│        ENTER DETAILS         [X]    │
├─────────────────────────────────────┤
│                                     │
│  Label                             │
│  ┌─────────────────────────────┐   │
│  │ Input field                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Another Label                     │
│  ┌─────────────────────────────┐   │
│  │ Input field                 │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [CANCEL]               [SUBMIT]    │
└─────────────────────────────────────┘
```

### 5.4 Selection Modal

**Structure:**
```
┌─────────────────────────────────────┐
│       SELECT OPTION          [X]    │
├─────────────────────────────────────┤
│                                     │
│  ○ Option 1                        │
│  ● Option 2 (selected)             │
│  ○ Option 3                        │
│  ○ Option 4                        │
│                                     │
├─────────────────────────────────────┤
│  [CANCEL]               [SELECT]    │
└─────────────────────────────────────┘
```

---

## 6. ANIMATIONS

### 6.1 Modal Entry

**Centered Modal:**
```css
@keyframes modalEnter {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
duration: 250ms
easing: ease-out
```

**Full-Screen Overlay:**
```css
@keyframes overlayEnter {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
duration: 300ms
```

### 6.2 Modal Exit

**Reverse of entry:**
- Fade out
- Scale down slightly
- Duration: 200ms

### 6.3 Bottom Sheet

**Slide up:**
```css
@keyframes sheetEnter {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}
duration: 300ms
easing: cubic-bezier(0.16, 1, 0.3, 1)
```

### 6.4 Toast Entry

**Slide in:**
```css
@keyframes toastEnter {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
duration: 200ms
```

**Auto-dismiss:**
- Stay 4 seconds
- Slide out

---

## 7. INTERACTION PATTERNS

### 7.1 Dismiss Methods

**Close button:**
- Always available
- Top-right position
- Clear visibility

**Backdrop click:**
- For non-critical modals
- Click outside to close
- Not for confirmations

**Swipe down:**
- For bottom sheets
- Natural mobile gesture
- Velocity threshold

**Escape key:**
- Desktop support
- Universal dismiss
- Keyboard accessibility

### 7.2 Focus Trapping

**Accessibility:**
- Focus stays in modal
- Tab cycles through elements
- Returns focus on close

### 7.3 Scroll Behavior

**Background:**
- Body scroll locked
- Prevents content shift
- Restored on close

**Modal content:**
- Internal scroll if needed
- Clear scroll indicators
- Max height constraints

---

## 8. SPECIAL OVERLAYS

### 8.1 Mission Intro Overlay

**Full-screen sequence:**
- Entity briefing
- Animation sequence
- Interactive elements
- Progress indicator

### 8.2 Prize Intro Overlay

**Cinematic presentation:**
- Prize images
- Entity narration
- Auto-advance or manual
- Completion CTA

### 8.3 Portal Overlay

**Location-triggered:**
- Portal-specific content
- Dialogue display
- Rewards/effects
- Close mechanism

### 8.4 Glitch Overlay

**Visual effect:**
- CSS-based distortion
- Entity-colored
- Brief duration
- No interaction needed

---

## 9. RESPONSIVE CONSIDERATIONS

### 9.1 Mobile Modals

**Sizing:**
- Full width minus margins
- Max height: 90vh
- Bottom-aligned option

**Safe areas:**
- Respect notch
- Account for keyboard
- Avoid nav overlap

### 9.2 Tablet Modals

**Sizing:**
- Centered, fixed width
- Max 480-560px
- Comfortable padding

### 9.3 Desktop Modals

**Sizing:**
- Centered
- Max 640px typical
- Can vary by content

---

## 10. ACCESSIBILITY

### 10.1 ARIA Implementation

**Required attributes:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` for title
- `aria-describedby` for content

### 10.2 Focus Management

**On open:**
- Focus first interactive element
- Or modal title

**On close:**
- Return focus to trigger
- Announce closure

### 10.3 Screen Reader

**Announcements:**
- Dialog opened
- Content read
- Actions available

### 10.4 Reduced Motion

**Simplified:**
- No scale animation
- Instant opacity change
- Functional feedback maintained

---

## 11. Z-INDEX MANAGEMENT

**Layering:**
```
z-index hierarchy:
1000  - Navigation
5000  - Regular overlays
10000 - Important modals
50000 - Entity overlays
99999 - System alerts
```

**Stacking:**
- Only one modal at a time (preferred)
- New modal above previous
- Clear layer management

---

## 12. ERROR & LOADING STATES

### 12.1 Loading Modal

**While processing:**
- Spinner centered
- "Processing..." text
- Non-dismissible

### 12.2 Error Modal

**When failed:**
- Clear error message
- Action options
- Retry if applicable

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For forms and input design, refer to Volume 16.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




