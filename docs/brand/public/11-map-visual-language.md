# M1SSION™ BRAND & DESIGN BIBLE
## Volume 11: Map Visual Language

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. MAP DESIGN PHILOSOPHY

### 1.1 The Map as Game Board

In M1SSION™, the map is not merely a navigation tool—it is the primary game interface. The visual design transforms geographic data into an immersive game world.

**Design Principles:**

1. **Atmosphere Over Accuracy**
   - Mood takes priority over cartographic precision
   - Dark aesthetic maintained throughout
   - Game elements prominently featured

2. **Information Hierarchy**
   - Game-relevant features emphasized
   - Background geography subdued
   - Player focus guided by design

3. **Living Interface**
   - Animated elements suggest activity
   - Real-time updates visible
   - Dynamic response to player position

4. **Brand Consistency**
   - Colors match system palette
   - Glow effects present
   - Typography consistent

### 1.2 Map Viewing Contexts

The map appears in multiple contexts:

**Full-Screen Map View:**
- Primary gameplay interface
- Maximum detail and interactivity
- All layers visible

**Embedded Map:**
- Within cards or previews
- Simplified rendering
- Key elements only

**Background Map:**
- Atmospheric context
- Highly subdued
- Minimal interactivity

---

## 2. BASE MAP STYLING

### 2.1 Color Treatment

**Land Areas:**
- Base: #0A0A14 (Void Black)
- Building footprints: #12121F (Deep Space)
- Parks/green: #0A1A14 (Dark teal-black)

**Water Areas:**
- Base: #0A0F1A (Deep navy-black)
- Coastlines: Subtle cyan glow

**Roads:**
- Major roads: #1A1A2E (Night Surface)
- Minor roads: #151520 (Subtle lines)
- Highways: #252538 (Slightly brighter)

**Boundaries:**
- District borders: rgba(255, 255, 255, 0.05)
- Mission area: Cyan glow border

### 2.2 Typography on Map

**Street Names:**
- Font: Inter, 10px
- Color: rgba(255, 255, 255, 0.3)
- Uppercase, letter-spacing: 0.1em

**Area Names:**
- Font: Electrolize, 12px
- Color: rgba(255, 255, 255, 0.4)
- Uppercase

**Point of Interest Labels:**
- Font: Inter, 11px
- Color: rgba(255, 255, 255, 0.5)
- Sentence case

### 2.3 Zoom Level Styling

**Far Zoom (City View):**
- Minimal detail
- Only major features
- Emphasis on zones

**Medium Zoom (Neighborhood):**
- Street grid visible
- Buildings apparent
- Markers become distinct

**Close Zoom (Street Level):**
- Full detail
- Building footprints clear
- All markers interactive

---

## 3. MARKER SYSTEM

### 3.1 Standard Marker

The primary discoverable point:

**Visual Properties:**
- Shape: Circle with inner glow
- Size: 24px base (scales with zoom)
- Color: Pulse Cyan (#00E5FF)
- Glow: Standard cyan glow
- Animation: Subtle pulse

**States:**
- Undiscovered: Not visible
- Detected: Faint signal ring
- Discovered: Full visibility
- Claimed: Faded, checkmark

### 3.2 Premium Marker

Higher value discovery:

**Visual Properties:**
- Shape: Diamond or larger circle
- Size: 32px base
- Color: Gold/amber
- Glow: Intense gold glow
- Animation: Enhanced pulse

### 3.3 Mission Marker

Story-critical points:

**Visual Properties:**
- Shape: Star or special icon
- Size: 36px base
- Color: Entity-dependent
- Glow: Maximum intensity
- Animation: Rhythmic pulse

### 3.4 Prize Marker

Ultimate objective:

**Visual Properties:**
- Shape: Trophy or star burst
- Size: 48px base
- Color: Gold with multi-color glow
- Glow: Dramatic, animated
- Animation: Beacon effect

### 3.5 Player Position Marker

Current location indicator:

**Visual Properties:**
- Shape: Circular with direction cone
- Size: 40px with accuracy ring
- Color: White center, cyan ring
- Animation: Gentle pulse
- Direction: Indicates heading

### 3.6 Other Players

Visible agents:

**Visual Properties:**
- Shape: Small circle
- Size: 16px
- Color: Muted cyan or gray
- No glow
- Anonymous identification

---

## 4. SIGNAL VISUALIZATION

### 4.1 Signal Detection Rings

Proximity indication:

**Visual Properties:**
- Concentric circles from marker
- Expanding animation
- Opacity decreases with distance
- Color matches marker type

**Animation:**
```css
@keyframes signalPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
```

### 4.2 Signal Strength Indicator

UI element showing proximity:

**Visual Properties:**
- 4-5 arc segments
- Fill based on strength
- Color intensifies with strength
- Positioned near edge

**States:**
- No signal: All gray
- Weak: 1 segment lit
- Medium: 2-3 segments
- Strong: 4 segments
- Maximum: All lit with glow

### 4.3 Direction Indicator

Compass-style direction hint:

**Visual Properties:**
- Arc or arrow shape
- Points toward signal
- Updates with player rotation
- Intensity reflects distance

---

## 5. ZONE VISUALIZATION

### 5.1 Mission Boundary

Overall play area:

**Visual Properties:**
- Soft edge glow (cyan)
- Subtle fill inside (rgba 5%)
- Outside area darkened
- Animated edge pulse

### 5.2 Active Zones

Areas with special status:

**Visual Properties:**
- Colored polygon
- Entity-matched color
- Low opacity fill (10%)
- Glowing border

### 5.3 Search Area

Buzz Map activated region:

**Visual Properties:**
- Circular boundary
- Cyan glow edge
- Timer overlay
- Contained markers highlighted

### 5.4 Restriction Zones

Areas players cannot enter:

**Visual Properties:**
- Red/dark tint
- Hatched pattern optional
- Warning border
- Blocked indicator

---

## 6. ANIMATION PATTERNS

### 6.1 Map Load Animation

Initial map appearance:

**Sequence:**
1. Dark base fades in
2. Road network draws
3. Buildings emerge
4. Markers pop in
5. Player position appears

**Timing:**
- Total: 800ms
- Staggered reveals
- Easing: ease-out

### 6.2 Marker Discovery Animation

When marker becomes visible:

**Sequence:**
1. Signal ring expands
2. Marker scales up
3. Glow intensifies
4. Settles to rest state

**Timing:**
- Total: 400ms
- Spring easing for bounce

### 6.3 Marker Claim Animation

When player claims reward:

**Sequence:**
1. Marker pulses rapidly
2. Particle burst outward
3. Success icon appears
4. Marker fades/transforms

**Timing:**
- Total: 600ms
- Celebratory feel

### 6.4 Zone Activation Animation

When Buzz Map activates:

**Sequence:**
1. Ring expands from player
2. Edge glow establishes
3. Interior markers reveal
4. Timer begins

**Timing:**
- Ring expansion: 400ms
- Marker reveals: 300ms staggered

---

## 7. OVERLAY ELEMENTS

### 7.1 Map Controls

Zoom and orientation:

**Visual Properties:**
- Glass/translucent background
- Minimal icon buttons
- Position: Right edge
- Subtle when inactive

**Elements:**
- Zoom in (+)
- Zoom out (-)
- Current location (crosshair)
- Compass (north indicator)

### 7.2 Information Overlay

Status and data display:

**Position:**
- Top: Mission info
- Bottom: Action buttons
- Corners: Metrics

**Visual Properties:**
- Semi-transparent backgrounds
- Rounded corners
- Subtle borders
- Readable contrast

### 7.3 Buzz Controls

Primary action interface:

**Position:**
- Bottom center
- Above navigation

**Elements:**
- Buzz button (prominent)
- Buzz Map button
- Energy indicator
- Cost display

---

## 8. SPECIAL MAP STATES

### 8.1 Scanning State

When actively detecting:

**Visual Modification:**
- Subtle scan line sweeps
- Enhanced signal visibility
- Pulsing player marker
- Active processing feel

### 8.2 Glitch State

SHADOW interference:

**Visual Modification:**
- Color shift to red/magenta
- Displacement jitter
- Signal interference
- Tiles distort briefly

### 8.3 Low Energy State

When pulse energy depleted:

**Visual Modification:**
- Desaturated map
- Markers less prominent
- Reduced glow effects
- Recovery messaging

### 8.4 Offline State

No connectivity:

**Visual Modification:**
- Cached tiles only
- Clear offline indicator
- Last known markers
- Limited functionality

---

## 9. PORTAL VISUALIZATION

### 9.1 Portal Markers

Special interactive locations:

**Visual Properties:**
- Unique icon per portal
- Larger size (40px)
- Distinctive color by type
- Pulsing animation

**Portal Types:**
- MCP Protected: Cyan, shield icon
- SHADOW Zone: Red, warning icon
- ECHO Archive: Purple, wave icon
- Special: Custom per portal

### 9.2 Portal Activation Area

Interaction zone:

**Visual Properties:**
- Circular glow around portal
- Color matches portal type
- Size indicates interaction range
- Animates when player near

---

## 10. PERFORMANCE CONSIDERATIONS

### 10.1 Tile Optimization

**Strategies:**
- Vector tiles for styling
- Raster fallback for complex areas
- Aggressive caching
- Progressive loading

### 10.2 Marker Clustering

**At Far Zoom:**
- Group nearby markers
- Show count badge
- Expand on zoom

### 10.3 Animation Budget

**Limits:**
- Max 10 actively animating elements
- Reduce off-screen animations
- Throttle in background
- Respect reduced-motion

### 10.4 Memory Management

**Strategies:**
- Unload off-screen tiles
- Limit marker detail by zoom
- Recycle animation frames
- Clear old overlays

---

## 11. ACCESSIBILITY

### 11.1 Color Independence

- Shape distinguishes marker types
- Patterns supplement color
- Labels available

### 11.2 Screen Reader Support

- Map regions labeled
- Markers announced
- Actions described
- Alternative text navigation

### 11.3 Motor Accessibility

- Large touch targets
- Zoom controls accessible
- Alternative to gestures

---

## 12. DARK MODE CONSISTENCY

The map is designed dark-first:

**Never:**
- Light backgrounds
- White tile themes
- High contrast streets

**Always:**
- Dark base tiles
- Glowing highlights
- Subdued geography
- Emphasized game elements

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For Buzz button visuals, refer to Volume 12.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





