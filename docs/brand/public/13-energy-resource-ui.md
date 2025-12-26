# M1SSION™ BRAND & DESIGN BIBLE
## Volume 13: Energy & Resource UI

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. RESOURCE SYSTEM OVERVIEW

### 1.1 Core Resources

M1SSION™ features several player resources displayed through distinctive UI elements:

1. **Pulse Energy** — Action fuel for gameplay
2. **M1U (Mission Units)** — Virtual currency
3. **Clues** — Discovery progress tokens
4. **Cashback** — Accumulated rewards

### 1.2 Display Philosophy

**Principles:**
- Always visible when relevant
- Clear current amounts
- Easy to understand changes
- Non-intrusive during gameplay

---

## 2. PULSE ENERGY UI

### 2.1 Energy Bar Design

Primary energy indicator:

**Visual Structure:**
```
┌─────────────────────────────────────┐
│ ⚡ ████████████░░░░░░░░░  5 / 10    │
└─────────────────────────────────────┘
```

**Dimensions:**
- Width: Responsive (160-280px)
- Height: 24px
- Border radius: 12px

**Colors:**
- Container: rgba(0, 0, 0, 0.5) with border
- Fill (Full): Cyan gradient (#00E5FF → #00BFFF)
- Fill (Low): Orange (#FF8C00)
- Fill (Critical): Red (#FF3366)
- Empty: rgba(255, 255, 255, 0.1)

### 2.2 Energy States

**Full Energy:**
- Complete fill
- Subtle pulse animation
- Green/cyan glow

**Partial Energy:**
- Proportional fill
- Number display clear
- Action costs shown

**Low Energy (≤ 20%):**
- Orange fill
- Warning indicator
- Refill prompt nearby

**Critical (≤ 1 pulse):**
- Red fill
- Pulsing animation
- Urgent refill messaging

**Empty:**
- No fill
- Gray container
- "RECHARGE" prompt

### 2.3 Energy Regeneration

**Timer Display:**
- Next pulse countdown
- Format: "Next in 5:42"
- Progress ring option

**Animation:**
- Fill grows smoothly
- Number increments with bounce
- Celebration micro-animation

### 2.4 Energy Cost Preview

**Before action:**
- Show cost clearly
- "Will cost: 1 PULSE"
- Highlight if insufficient

---

## 3. M1U CURRENCY UI

### 3.1 Balance Display

**Header Position:**
```
┌─────────────────────────────────────┐
│  M1U  ◆  12,450                     │
└─────────────────────────────────────┘
```

**Visual Properties:**
- M1U logo/icon
- Balance number
- Compact format for large numbers (12.4K)

**Styling:**
- Background: Glass effect
- Text: Gold/amber (#FFD700)
- Glow: Subtle gold

### 3.2 Balance States

**Positive Balance:**
- Gold text
- Standard display
- Tap shows history

**Zero Balance:**
- Gray text
- "0 M1U"
- Purchase prompt

**Pending Transaction:**
- Loading spinner
- Grayed number
- "Processing..."

### 3.3 Transaction Animations

**Earning M1U:**
- Number increases with animation
- Green "+X" indicator floats up
- Celebratory effect

**Spending M1U:**
- Number decreases smoothly
- Red "-X" indicator
- Confirmation shown first

### 3.4 M1U in Context

**Purchase Flows:**
- Clear pricing (€ + M1U equivalent)
- Balance shown
- Deficit warnings

**Reward Claims:**
- M1U amount prominent
- Animation on claim
- Balance update visible

---

## 4. CLUE PROGRESS UI

### 4.1 Clue Counter

**Progress indicator:**
```
┌─────────────────────────────────────┐
│  🔍  CLUES:  3 / 21                 │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────┘
```

**Visual Properties:**
- Clue icon (magnifying glass variant)
- Current / Total format
- Progress bar

**Styling:**
- Progress fill: Cyan
- Background: Dark
- Text: White/cyan

### 4.2 Clue Discovery Animation

**On finding clue:**
1. Clue icon pulses
2. Counter increments with bounce
3. Progress bar fills
4. Celebration effect

**Special Milestones:**
- 25%, 50%, 75%, 100%
- Enhanced celebration
- Badge/achievement display

### 4.3 Clue Detail View

**Expanded view shows:**
- Clue history
- Discovery timestamps
- Location hints
- Prize proximity

---

## 5. CASHBACK VAULT UI

### 5.1 Vault Display

**Compact pill:**
```
┌───────────────────┐
│  🏦  250 M1U      │
└───────────────────┘
```

**Expanded view:**
```
┌─────────────────────────────────────┐
│          CASHBACK VAULT             │
│                                     │
│            250 M1U                  │
│                                     │
│   Claimable: Sunday 00:00 UTC       │
│                                     │
│        [CLAIM CASHBACK]             │
└─────────────────────────────────────┘
```

### 5.2 Vault States

**Accumulating:**
- Growing number display
- "Collecting..." indicator
- Weekly progress

**Ready to Claim:**
- Enhanced glow
- "CLAIM NOW" button
- Time remaining

**Claimed:**
- Zero balance
- "Claimed" confirmation
- Next week timer

### 5.3 Claim Flow

**Process:**
1. Tap vault
2. Show claimable amount
3. Confirm action
4. Processing animation
5. Success with M1U animation
6. Balance update

---

## 6. RESOURCE NOTIFICATIONS

### 6.1 Inline Notifications

**Small status updates:**
- Position: Near resource
- Duration: 3 seconds
- Auto-dismiss

**Examples:**
- "+50 M1U earned"
- "Energy restored"
- "Clue discovered!"

### 6.2 Toast Notifications

**Larger updates:**
- Position: Top center
- Duration: 4 seconds
- Action button option

**Examples:**
- "New clue found! Tap to view"
- "Energy full - ready to hunt!"
- "Reward available"

### 6.3 Modal Notifications

**Major resource events:**
- Full screen or centered modal
- Requires acknowledgment
- Celebration effects

**Examples:**
- Mission completion bonus
- Prize proximity alert
- Weekly cashback claim

---

## 7. PURCHASE & TRANSACTION UI

### 7.1 Purchase Flow

**Step 1: Selection**
- Item displayed
- Cost clear (€ and/or M1U)
- Current balance shown

**Step 2: Confirmation**
- Summary of purchase
- Final cost
- Confirm/Cancel buttons

**Step 3: Processing**
- Loading state
- "Processing payment..."
- No user interaction

**Step 4: Result**
- Success: Celebration
- Failure: Error message
- Balance update

### 7.2 Price Display

**Format:**
- Euro amounts: €4.99
- M1U amounts: 500 M1U
- Combined: €4.99 (or 500 M1U)

**Styling:**
- Euro: White text
- M1U: Gold text
- Discount: Strikethrough original

### 7.3 Transaction History

**List view:**
- Date/time
- Description
- Amount (+/-)
- Balance after

**Visual:**
- Green for credits
- Red for debits
- Filter options

---

## 8. RESOURCE BAR COMPONENT

### 8.1 Unified Resource Bar

**Compact header element:**
```
┌─────────────────────────────────────────────────┐
│  ⚡ 7/10    │    ◆ 12,450 M1U    │    🔍 5/21  │
└─────────────────────────────────────────────────┘
```

**Properties:**
- Fixed position (top)
- Always visible during play
- Tap expands details

### 8.2 Contextual Display

**Map View:**
- Energy prominent
- M1U visible
- Clues accessible

**Shop View:**
- M1U prominent
- Energy secondary
- Purchase focus

**Profile View:**
- All expanded
- History accessible
- Details available

---

## 9. ANIMATED TRANSITIONS

### 9.1 Number Counters

**Incrementing:**
```javascript
// Smooth count animation
easing: 'ease-out'
duration: 400ms
bounce at end
```

**Decrementing:**
```javascript
// Slightly faster
easing: 'ease-in'
duration: 300ms
```

### 9.2 Progress Fills

**Growing:**
- Smooth fill animation
- 300ms duration
- ease-out easing

**Shrinking:**
- Instant or quick
- 200ms duration
- User's resource spent

### 9.3 Icon Animations

**On change:**
- Scale pulse (1.2x)
- Glow increase
- Return to normal

**Duration:** 200ms

---

## 10. ACCESSIBILITY

### 10.1 Color Independence

- Numbers always present
- Icons supplement colors
- State not color-only

### 10.2 Screen Readers

**Announcements:**
- "Energy: 5 of 10"
- "M1U balance: 12,450"
- "3 clues found of 21"

**Updates:**
- "Earned 50 M1U"
- "Energy depleted"

### 10.3 Reduced Motion

- Numbers change instantly
- Progress bars update without animation
- No bouncing effects

---

## 11. RESPONSIVE DESIGN

### 11.1 Mobile

- Compact displays
- Tap to expand
- Prioritize active resource

### 11.2 Tablet

- More space for detail
- Side-by-side possible
- History visible

### 11.3 Desktop

- Full information
- Hover tooltips
- Keyboard shortcuts

---

## 12. ERROR STATES

### 12.1 Resource Errors

**Insufficient funds:**
- Highlight cost in red
- Show current balance
- Link to purchase/earn

**Transaction failed:**
- Error message
- Retry option
- Support link

### 12.2 Loading States

**Fetching balance:**
- Skeleton placeholder
- Subtle animation
- Number appears on load

**Transaction pending:**
- Grayed resource
- Loading indicator
- "Processing..."

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For leaderboard and competitive UI, refer to Volume 14.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





