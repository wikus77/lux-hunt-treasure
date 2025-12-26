# M1SSION™ BRAND & DESIGN BIBLE
## Volume 19: Accessibility Guidelines

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. ACCESSIBILITY PHILOSOPHY

### 1.1 Commitment Statement

M1SSION™ is committed to providing an accessible gaming experience for all users, regardless of ability. Accessibility is not an afterthought—it is integrated into every design decision.

### 1.2 Standards Compliance

**Target compliance:**
- WCAG 2.1 Level AA
- Section 508 (where applicable)
- Platform-specific guidelines (iOS, Android)

### 1.3 Core Principles (POUR)

1. **Perceivable** — Information presentable in ways all users can perceive
2. **Operable** — Interface usable by all input methods
3. **Understandable** — Content and operation comprehensible
4. **Robust** — Content works with current and future technologies

---

## 2. VISUAL ACCESSIBILITY

### 2.1 Color Contrast

**Minimum ratios:**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1
- Graphical objects: 3:1

**M1SSION™ color compliance:**
| Combination | Ratio | Pass |
|-------------|-------|------|
| White on #0A0A14 | 18.1:1 | ✓ |
| Cyan (#00E5FF) on #0A0A14 | 12.3:1 | ✓ |
| Red (#FF3366) on #0A0A14 | 5.2:1 | ✓ |
| Gray text on dark | 4.8:1 | ✓ |

### 2.2 Color Independence

**Requirements:**
- Never convey information by color alone
- Provide text labels
- Use icons/shapes alongside color
- Patterns for charts/graphs

**Examples in M1SSION™:**
- Error states: Red color + icon + text message
- Success: Green color + checkmark + text
- Markers: Different shapes, not just colors
- Status: Color + label always

### 2.3 Text Sizing

**Requirements:**
- Text resizable up to 200% without loss
- No text in images (except logos)
- Readable at default zoom
- Support browser font scaling

**Implementation:**
```css
/* Use relative units */
font-size: 1rem; /* Not 16px */
line-height: 1.5; /* Not 24px */
```

### 2.4 Focus Visibility

**Requirements:**
- Visible focus indicator on all interactive elements
- Focus indicator distinguishable from surroundings
- Consistent focus styling throughout

**M1SSION™ focus style:**
```css
:focus-visible {
  outline: 2px solid #00E5FF;
  outline-offset: 2px;
}
```

---

## 3. MOTION & ANIMATION

### 3.1 Reduced Motion

**Support `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**M1SSION™ implementation:**
- All animations check preference
- Essential motion only when reduced
- No flashing/strobing (< 3 per second)
- User toggle in settings

### 3.2 Animation Safety

**Prohibited:**
- Flashing more than 3 times/second
- Large flashing areas
- Strobing effects
- Forced autoplay video with flash

**Allowed with care:**
- Glitch effects (brief, can disable)
- Pulse animations (gentle)
- Transitions (under 1 second)

### 3.3 User Control

**Requirements:**
- Pause/stop/hide for moving content
- User-initiated autoplay only
- Settings to disable effects
- Memory of preferences

---

## 4. KEYBOARD ACCESSIBILITY

### 4.1 Full Keyboard Operation

**Requirements:**
- All functionality via keyboard
- No keyboard traps
- Logical tab order
- Visible focus at all times

**Tab order:**
```
Header → Main navigation → Main content → 
Secondary navigation → Footer
```

### 4.2 Focus Management

**Interactive elements:**
- Buttons: Tab to reach, Enter/Space to activate
- Links: Tab to reach, Enter to follow
- Form fields: Tab to reach, type to enter
- Modals: Focus trapped inside, Escape to close

**Custom components:**
- Dropdowns: Arrow keys navigate, Enter selects
- Tabs: Arrow keys switch, Tab moves out
- Sliders: Arrow keys adjust value

### 4.3 Skip Links

**Implementation:**
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

**Styling:**
```css
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  left: 16px;
  top: 16px;
  z-index: 9999;
}
```

### 4.4 Keyboard Shortcuts

**Game shortcuts (with toggle):**
- `Space` - Buzz action
- `M` - Open map
- `I` - Open intelligence
- `Esc` - Close modal/overlay

---

## 5. SCREEN READER SUPPORT

### 5.1 Semantic HTML

**Requirements:**
- Proper heading hierarchy (h1 → h2 → h3)
- Lists for lists (`<ul>`, `<ol>`)
- Tables for tabular data
- Landmarks for regions

**Landmarks:**
```html
<header role="banner">
<nav role="navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">
```

### 5.2 ARIA Labels

**When to use:**
- Icon-only buttons
- Complex widgets
- Dynamic content
- Custom components

**Examples:**
```html
<!-- Icon button -->
<button aria-label="Close modal">
  <XIcon />
</button>

<!-- Progress -->
<div 
  role="progressbar" 
  aria-valuenow="60" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="Mission progress">
</div>
```

### 5.3 Live Regions

**For dynamic content:**
```html
<!-- Polite announcements -->
<div aria-live="polite" aria-atomic="true">
  Message appears here
</div>

<!-- Urgent announcements -->
<div aria-live="assertive">
  Error message
</div>
```

**M1SSION™ usage:**
- Clue discovery: Polite announcement
- Error messages: Assertive
- Score updates: Polite
- Timer warnings: Assertive

### 5.4 Alt Text

**Image requirements:**
- Descriptive alt for meaningful images
- Empty alt (`alt=""`) for decorative
- Complex images: Extended description

**Examples:**
```html
<!-- Meaningful -->
<img src="marker.png" alt="Undiscovered clue marker">

<!-- Decorative -->
<img src="glow.png" alt="">

<!-- Complex -->
<img 
  src="map.png" 
  alt="Mission area map showing 5 markers"
  aria-describedby="map-description">
```

---

## 6. TOUCH ACCESSIBILITY

### 6.1 Touch Targets

**Minimum sizes:**
- Primary actions: 48px × 48px
- Secondary actions: 44px × 44px
- Adequate spacing: 8px between

### 6.2 Gesture Alternatives

**For every gesture, provide alternative:**
- Swipe to dismiss → Close button
- Pinch to zoom → Zoom buttons
- Long press → Context menu button

### 6.3 One-Handed Operation

**Considerations:**
- Important actions within thumb reach
- Bottom navigation on mobile
- Avoid top corners for critical actions

---

## 7. COGNITIVE ACCESSIBILITY

### 7.1 Clear Language

**Requirements:**
- Simple, direct language
- Avoid jargon (or explain it)
- Consistent terminology
- Short sentences

**Reading level:**
- Target: 8th grade reading level
- Test with readability tools
- Plain language alternatives

### 7.2 Predictable Behavior

**Requirements:**
- Consistent navigation
- Same elements in same locations
- Clear feedback for actions
- No unexpected changes

### 7.3 Error Prevention

**Requirements:**
- Confirmation for destructive actions
- Undo where possible
- Clear error messages
- Suggestions for correction

**Error message format:**
- What happened
- Why it happened
- How to fix it

### 7.4 Memory Load

**Reduce cognitive load:**
- Don't require remembering
- Provide context
- Clear progress indicators
- Save user progress

---

## 8. FORM ACCESSIBILITY

### 8.1 Labels

**Requirements:**
- Every input has a label
- Labels visible (not placeholder only)
- Labels associated programmatically

```html
<label for="email">Email Address</label>
<input id="email" type="email" name="email">
```

### 8.2 Error Handling

**Requirements:**
- Errors identified clearly
- Errors associated with fields
- Suggestions provided
- Errors announced

```html
<input 
  id="email" 
  aria-invalid="true" 
  aria-describedby="email-error">
<span id="email-error" role="alert">
  Please enter a valid email address
</span>
```

### 8.3 Required Fields

**Indication:**
- Visual indicator (asterisk)
- `aria-required="true"`
- Label text "required"

### 8.4 Autocomplete

**Use appropriate autocomplete:**
```html
<input autocomplete="email">
<input autocomplete="current-password">
<input autocomplete="street-address">
```

---

## 9. MEDIA ACCESSIBILITY

### 9.1 Images

**Requirements:**
- Alt text for meaningful images
- Text alternatives for complex graphics
- No text in images

### 9.2 Video

**Requirements:**
- Captions for all video
- Audio descriptions where needed
- Transcript availability
- Pause control

### 9.3 Audio

**Requirements:**
- Transcript or captions
- Volume control
- Not autoplay (or user control)

---

## 10. GAME-SPECIFIC ACCESSIBILITY

### 10.1 Map Accessibility

**Screen reader support:**
- Announce marker positions
- Describe regions
- Provide text alternatives

**Alternative interfaces:**
- List view of markers
- Searchable locations
- Text-based navigation

### 10.2 Time-Based Actions

**Accommodations:**
- Adjustable timers where possible
- Pause functionality
- Clear time remaining
- Audio cues

### 10.3 Signal/Detection

**For users who can't see visual signals:**
- Audio cues for proximity
- Haptic feedback
- Text descriptions
- Alternative detection mode

---

## 11. SETTINGS & PREFERENCES

### 11.1 Accessibility Settings

**User controls:**
- Motion reduction toggle
- Font size adjustment
- High contrast mode
- Audio descriptions toggle
- Haptic feedback toggle

### 11.2 Persistence

**Requirements:**
- Settings persist across sessions
- Sync across devices if logged in
- Easy to access
- Clear descriptions

---

## 12. TESTING

### 12.1 Automated Testing

**Tools:**
- axe DevTools
- Lighthouse accessibility audit
- WAVE evaluation
- Color contrast analyzers

### 12.2 Manual Testing

**Checklist:**
- [ ] Keyboard-only navigation
- [ ] Screen reader testing (VoiceOver, NVDA)
- [ ] Zoom to 200%
- [ ] Reduced motion preference
- [ ] High contrast mode
- [ ] Touch target sizes

### 12.3 User Testing

**Include users with:**
- Visual impairments
- Motor impairments
- Cognitive differences
- Older adults
- New technology users

---

## 13. DOCUMENTATION

### 13.1 Accessibility Statement

**Include:**
- Commitment to accessibility
- Standards followed
- Known limitations
- Contact for issues

### 13.2 VPAT/ACR

**Maintain:**
- Voluntary Product Accessibility Template
- Regular updates
- Available on request

---

## 14. DEVELOPMENT CHECKLIST

**Every component:**
- [ ] Keyboard accessible
- [ ] Focus visible
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Motion respectful
- [ ] Touch targets adequate
- [ ] Labels present
- [ ] Errors announced

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For internal design secrets, refer to internal documentation.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





