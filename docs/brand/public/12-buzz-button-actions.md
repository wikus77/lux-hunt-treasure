# M1SSION™ BRAND & DESIGN BIBLE
## Volume 12: Buzz Button & Action Controls

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. BUZZ BUTTON PHILOSOPHY

### 1.1 The Primary Action

The Buzz button is the most important interactive element in M1SSION™. It represents the core gameplay action—scanning the environment for signals and clues.

**Design Requirements:**

1. **Unmistakable Visibility**
   - Always findable
   - Cannot be obscured
   - Commands attention

2. **Satisfying Interaction**
   - Feedback rich
   - Responsive feel
   - Rewarding to press

3. **State Communication**
   - Clear availability
   - Cost shown
   - Energy visible

4. **Brand Expression**
   - Signature element
   - Neon aesthetic
   - Unique to M1SSION™

### 1.2 Buzz Button Contexts

**Map View (Primary):**
- Centered bottom
- Maximum size
- Full animation

**Other Pages:**
- Contextual placement
- Potentially smaller
- Appropriate adaptation

---

## 2. VISUAL DESIGN

### 2.1 Button Anatomy

```
┌────────────────────────────────────────────┐
│              OUTER GLOW RING               │
│  ┌──────────────────────────────────────┐  │
│  │          RING ANIMATION              │  │
│  │  ┌──────────────────────────────┐    │  │
│  │  │       MAIN BUTTON AREA       │    │  │
│  │  │  ┌──────────────────────┐    │    │  │
│  │  │  │    ICON + LABEL      │    │    │  │
│  │  │  │                      │    │    │  │
│  │  │  │    [BUZZ ICON]       │    │    │  │
│  │  │  │    "BUZZ"            │    │    │  │
│  │  │  │                      │    │    │  │
│  │  │  └──────────────────────┘    │    │  │
│  │  │        COST DISPLAY          │    │  │
│  │  └──────────────────────────────┘    │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### 2.2 Dimensions

**Standard Size:**
- Outer diameter: 80px
- Inner button: 64px
- Glow extend: +16px
- Touch target: 96px minimum

**Compact Size:**
- Outer diameter: 56px
- Inner button: 44px
- Touch target: 64px minimum

### 2.3 Colors

**Active State:**
- Background: Gradient from #00E5FF to #00BFFF
- Text: #0A0A14 (contrast)
- Glow: #00E5FF at 50% opacity
- Ring: Animated cyan

**Disabled State:**
- Background: #2A2A40
- Text: rgba(255, 255, 255, 0.3)
- No glow
- Dimmed ring

**Processing State:**
- Background: Pulsing cyan
- Spinner overlay
- Enhanced glow
- Animated ring

**Success State:**
- Flash: Green (#00FF88)
- Particle burst
- Ring expansion
- Celebratory feedback

### 2.4 Typography

**Button Label:**
- Font: Electrolize, 14px
- Weight: Bold
- Letter-spacing: 2px
- Text: "BUZZ"

**Cost Display:**
- Font: Inter, 11px
- Weight: 500
- Format: "1 PULSE" or "FREE"

---

## 3. BUTTON STATES

### 3.1 Ready State

Available for interaction:

**Visual:**
- Full color gradient
- Gentle pulse animation
- Glow active
- Cost clearly shown

**Behavior:**
- Tappable
- Hover effect (desktop)
- Focus ring on keyboard

### 3.2 Pressed State

During touch/click:

**Visual:**
- Scale down 5%
- Color intensifies
- Glow brightens
- Haptic feedback

**Duration:**
- 100ms minimum hold
- Debounce applied

### 3.3 Processing State

Action in progress:

**Visual:**
- Spinner or pulse
- "Scanning..." label
- Ring animates faster
- Button non-interactive

**Duration:**
- Variable by action
- Minimum visible time: 400ms

### 3.4 Cooldown State

Temporary unavailability:

**Visual:**
- Grayed appearance
- Timer overlay
- Cooldown countdown
- Subtle pulse when ready

**Duration:**
- Context dependent
- Clear time remaining

### 3.5 Disabled State

Cannot be used:

**Visual:**
- Fully desaturated
- No glow
- Crossed icon or lock
- Reason text optional

**Causes:**
- No energy
- Location invalid
- Not enrolled
- System lock

### 3.6 Success State

Successful action:

**Visual:**
- Green flash
- Particle explosion
- Scale bounce
- Ring burst

**Duration:**
- 400ms animation
- Return to ready

### 3.7 Failure State

Action failed:

**Visual:**
- Red flash
- Shake animation
- Error message
- Ring pulses red

**Duration:**
- 300ms animation
- Error persists

---

## 4. ANIMATIONS

### 4.1 Idle Pulse

Constant ambient animation:

```css
@keyframes buzzPulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
  }
}
```

**Duration:** 2s
**Timing:** ease-in-out
**Infinite loop**

### 4.2 Ring Rotation

Orbital animation around button:

```css
@keyframes ringRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

**Duration:** 10s
**Timing:** linear
**Infinite loop**

### 4.3 Press Animation

When button pressed:

```css
@keyframes buzzPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}
```

**Duration:** 150ms
**Timing:** ease-out

### 4.4 Scan Animation

Processing visual:

```css
@keyframes buzzScan {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}
```

**Duration:** 800ms
**Timing:** ease-out
**Repeats during processing**

### 4.5 Success Burst

Celebration effect:

**Sequence:**
1. Button scales up 10%
2. Green flash overlay
3. Particle emission
4. Scale returns with bounce

**Duration:** 500ms
**Particle count:** 12-16

---

## 5. BUZZ MAP BUTTON

### 5.1 Visual Design

The Buzz Map button activates area scanning:

**Standard State:**
- Circular button
- Map grid icon
- Cyan outline
- Positioned near main Buzz

**Dimensions:**
- Size: 48px diameter
- Touch target: 56px

**Colors:**
- Active: Cyan outline, transparent center
- Pressed: Solid cyan
- Disabled: Gray outline

### 5.2 States

**Available:**
- Cyan glow
- Subtle pulse
- M1U cost shown

**Activated:**
- Solid fill
- Ring expanding
- Timer visible

**Cooldown:**
- Timer overlay
- Grayed
- Countdown visible

---

## 6. ACTION BUTTON PATTERNS

### 6.1 Primary Action Button

For important actions beyond Buzz:

**Visual:**
- Solid cyan background
- Dark text
- Rounded corners (8px)
- Full glow effect

**Examples:**
- "CLAIM REWARD"
- "START MISSION"
- "CONFIRM"

### 6.2 Secondary Action Button

For supportive actions:

**Visual:**
- Transparent background
- Cyan outline
- Cyan text
- Subtle glow

**Examples:**
- "VIEW DETAILS"
- "SKIP"
- "LEARN MORE"

### 6.3 Tertiary Action

For minor actions:

**Visual:**
- No background
- Text only (cyan)
- Underline optional
- No glow

**Examples:**
- "Cancel"
- "Back"
- "Reset"

### 6.4 Destructive Action

For dangerous operations:

**Visual:**
- Red background or outline
- White or red text
- Warning glow

**Examples:**
- "DELETE"
- "LEAVE MISSION"
- "RESET PROGRESS"

---

## 7. CONTEXTUAL ACTIONS

### 7.1 Map Context Actions

**Marker Interaction:**
- "CLAIM" button appears
- Positioned near marker
- Quick dismiss available

**Zone Actions:**
- "ENTER ZONE"
- "VIEW AREA"
- Overlay positioning

### 7.2 Card Context Actions

**Within cards:**
- Right-aligned
- Smaller scale
- Icon + text combination

**Examples:**
- "View" link
- "Claim" button
- "Details" arrow

### 7.3 Modal Actions

**Modal footer:**
- Primary right-aligned
- Secondary left-aligned
- Clear action hierarchy

**Standard patterns:**
- "Cancel" | "Confirm"
- "Back" | "Continue"
- "Close" | "Save"

---

## 8. FEEDBACK PATTERNS

### 8.1 Haptic Feedback

**On supported devices:**
- Light tap: Button press
- Medium impact: Success
- Heavy: Error
- Pattern: Countdown ready

### 8.2 Audio Feedback

**Sound effects (if enabled):**
- Click: Short tick
- Success: Ascending tone
- Error: Low buzz
- Scan: Sweeping sound

### 8.3 Visual Feedback

**Always present:**
- State change animations
- Color transitions
- Scale changes
- Glow modifications

---

## 9. ACCESSIBILITY

### 9.1 Touch Targets

**Minimum sizes:**
- Primary button: 48px
- Secondary: 44px
- Touch area extends beyond visible

### 9.2 Focus States

**Keyboard navigation:**
- Clear focus ring
- 3px cyan outline
- 2px offset
- Contrast maintained

### 9.3 Screen Readers

**Announcements:**
- Button label
- State information
- Cost if applicable
- Result feedback

### 9.4 Reduced Motion

**Simplified animations:**
- No rotation
- Instant state changes
- Subtle opacity fades only
- Functional feedback maintained

---

## 10. BUTTON PLACEMENT

### 10.1 Map View Layout

```
┌────────────────────────────────────────────┐
│                   MAP                       │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│         ENERGY BAR / PULSE METER            │
│                                             │
│           ┌─────────────────┐               │
│           │  [BUZZ BUTTON]  │  [BUZZ MAP]   │
│           └─────────────────┘               │
│                                             │
├─────────────────────────────────────────────┤
│              BOTTOM NAV BAR                 │
└────────────────────────────────────────────┘
```

### 10.2 Z-Index Hierarchy

**Layering:**
1. Map (base)
2. Map markers
3. Action area (Buzz)
4. Overlays/modals
5. Entity messages

Buzz button should never be obscured by map elements but yields to full-screen overlays.

---

## 11. ENERGY INDICATOR

### 11.1 Pulse Energy Display

**Positioned near Buzz button:**
- Horizontal bar or arc
- Segments indicate remaining
- Color reflects level

**States:**
- Full: All cyan
- Partial: Proportional fill
- Critical: Red pulsing
- Empty: Gray, locked

### 11.2 Cost Display

**Shows action cost:**
- "1 PULSE" format
- "FREE" when applicable
- "0 AVAILABLE" when depleted

---

## 12. RESPONSIVE BEHAVIOR

### 12.1 Mobile Portrait

- Buzz button centered
- Buzz Map adjacent
- Maximum emphasis

### 12.2 Mobile Landscape

- Buttons to right side
- Smaller scale possible
- Map prioritized

### 12.3 Tablet / Desktop

- Button positions flexible
- Can be in sidebar
- Maintain proportions

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For energy and resource UI, refer to Volume 13.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




