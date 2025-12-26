# M1SSION™ BRAND & DESIGN BIBLE
## Volume 16: Forms & Input Design

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. FORM DESIGN PHILOSOPHY

### 1.1 Principles

Forms in M1SSION™ must balance functionality with the game's aesthetic:

1. **Clarity First** — Users must understand what's needed
2. **Efficiency** — Minimize friction
3. **Feedback** — Real-time validation
4. **Accessibility** — Works for all users
5. **Aesthetic** — Matches M1SSION™ style

### 1.2 Form Contexts

**Authentication:**
- Login
- Registration
- Password reset

**Profile:**
- Account settings
- Preferences
- Personal info

**Gameplay:**
- Answer submission
- Prize claims
- Quick actions

**Support:**
- Contact forms
- Feedback
- Reports

---

## 2. TEXT INPUT DESIGN

### 2.1 Standard Text Input

```
┌─────────────────────────────────────────────────┐
│  Label                                          │
│  ┌─────────────────────────────────────────┐    │
│  │ Placeholder text...                     │    │
│  └─────────────────────────────────────────┘    │
│  Helper text or validation message              │
└─────────────────────────────────────────────────┘
```

**Dimensions:**
- Height: 48px
- Padding: 14px horizontal
- Border radius: 8px

### 2.2 Input States

**Default/Idle:**
```css
background: rgba(26, 26, 53, 0.6);
border: 1px solid rgba(255, 255, 255, 0.1);
color: white;
```

**Focus:**
```css
border-color: #00E5FF;
box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.2);
```

**Filled:**
```css
border-color: rgba(255, 255, 255, 0.2);
```

**Error:**
```css
border-color: #FF3366;
box-shadow: 0 0 0 2px rgba(255, 51, 102, 0.2);
```

**Disabled:**
```css
background: rgba(26, 26, 53, 0.3);
border-color: rgba(255, 255, 255, 0.05);
color: rgba(255, 255, 255, 0.3);
cursor: not-allowed;
```

### 2.3 Label Design

**Typography:**
- Font: Inter, 13px
- Weight: 500
- Color: rgba(255, 255, 255, 0.8)
- Margin-bottom: 6px

**Required indicator:**
- Red asterisk (*)
- Or "(required)" text

### 2.4 Placeholder Text

**Typography:**
- Font: Inter, 15px
- Color: rgba(255, 255, 255, 0.4)
- Style: Normal (not italic)

**Content:**
- Helpful hint
- Example format
- Not critical info

### 2.5 Helper Text

**Typography:**
- Font: Inter, 12px
- Color: rgba(255, 255, 255, 0.5)
- Margin-top: 4px

**Usage:**
- Format hints
- Requirements
- Instructions

---

## 3. SPECIALIZED INPUTS

### 3.1 Password Input

**Features:**
- Show/hide toggle button
- Eye icon indicator
- Secure input type

**Toggle button:**
- Position: Right inside input
- Icon: Eye / Eye-off
- Touch target: 44px

### 3.2 Email Input

**Features:**
- Email keyboard on mobile
- Format validation
- Clear button option

### 3.3 Number Input

**Features:**
- Numeric keyboard
- Increment/decrement buttons (optional)
- Min/max constraints

### 3.4 Search Input

**Features:**
- Search icon (left)
- Clear button (right)
- Rounded style option
- Instant feedback

### 3.5 Code/OTP Input

**Features:**
- Individual character boxes
- Auto-advance
- Paste support
- Backspace handling

**Visual:**
```
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘
```

### 3.6 Textarea

**Features:**
- Auto-resize option
- Character counter
- Min/max rows

**Styling:**
- Same base as text input
- Resize: vertical only
- Min-height: 100px

---

## 4. SELECTION INPUTS

### 4.1 Dropdown/Select

**Closed state:**
```
┌─────────────────────────────────────┐
│  Selected option              ▼    │
└─────────────────────────────────────┘
```

**Open state:**
```
┌─────────────────────────────────────┐
│  Selected option              ▲    │
├─────────────────────────────────────┤
│  Option 1                          │
│  Option 2                    ✓     │
│  Option 3                          │
│  Option 4                          │
└─────────────────────────────────────┘
```

**Styling:**
- Matches text input base
- Dropdown arrow icon
- Selected item highlighted
- Check mark indicator

### 4.2 Radio Buttons

**Visual:**
```
○ Option not selected
● Option selected (cyan fill)
```

**Dimensions:**
- Radio size: 20px
- Touch target: 44px
- Gap to label: 12px

**Styling:**
- Border: 2px solid
- Unselected: White border
- Selected: Cyan fill and border

### 4.3 Checkboxes

**Visual:**
```
☐ Unchecked
☑ Checked (cyan background, white check)
```

**Dimensions:**
- Size: 20px
- Border radius: 4px
- Touch target: 44px

**Styling:**
- Border: 2px solid
- Unchecked: White border
- Checked: Cyan background

### 4.4 Toggle/Switch

**Visual:**
```
OFF: ○───────
ON:  ───────●  (cyan track)
```

**Dimensions:**
- Width: 48px
- Height: 24px
- Knob: 20px

**Styling:**
- Track: Dark when off, cyan when on
- Knob: White
- Transition: 200ms

---

## 5. ADVANCED INPUTS

### 5.1 Date Picker

**Trigger:**
- Text input with calendar icon
- Opens picker on click/tap

**Picker:**
- Month/year navigation
- Day grid
- Today indicator
- Selected highlight

### 5.2 Time Picker

**Options:**
- Scrollable wheels
- Input with constraints
- AM/PM toggle

### 5.3 Range Slider

**Visual:**
```
Min ────●────────── Max
```

**Features:**
- Track and thumb
- Value display
- Step increments
- Cyan active track

### 5.4 File Upload

**Trigger:**
- Button or drop zone
- File type indication
- Size limits shown

**Drop zone:**
```
┌─────────────────────────────────────┐
│                                     │
│     [Upload Icon]                   │
│                                     │
│  Drop files here or click to upload │
│  Max 5MB · PNG, JPG, PDF           │
│                                     │
└─────────────────────────────────────┘
```

---

## 6. VALIDATION

### 6.1 Real-time Validation

**Timing:**
- On blur (field exit)
- On change (after first submission)
- Before submission

**Indicators:**
- Border color change
- Icon indicator (✓ or ✗)
- Message below field

### 6.2 Error Messages

**Styling:**
```css
color: #FF3366;
font-size: 12px;
margin-top: 4px;
```

**Content:**
- Specific to error
- Actionable guidance
- Not generic

**Examples:**
- "Enter a valid email address"
- "Password must be at least 8 characters"
- "This field is required"

### 6.3 Success Indicators

**Visual:**
- Green check icon
- Green border
- Success message

### 6.4 Inline Validation Icons

**Position:** Right side of input

**Icons:**
- ✓ Green checkmark (valid)
- ✗ Red X (invalid)
- ⟳ Spinner (checking)

---

## 7. FORM LAYOUT

### 7.1 Single Column

**Default layout:**
```
┌─────────────────────────────────────┐
│ Label 1                             │
│ [Input 1                          ] │
│                                     │
│ Label 2                             │
│ [Input 2                          ] │
│                                     │
│ Label 3                             │
│ [Input 3                          ] │
│                                     │
│ [        Submit Button           ]  │
└─────────────────────────────────────┘
```

### 7.2 Multi-Column

**Desktop layout:**
```
┌────────────────┐ ┌────────────────┐
│ First Name     │ │ Last Name      │
│ [Input       ] │ │ [Input       ] │
└────────────────┘ └────────────────┘
┌─────────────────────────────────────┐
│ Email                               │
│ [Input                            ] │
└─────────────────────────────────────┘
```

### 7.3 Field Spacing

**Between fields:** 20-24px
**Between sections:** 32px
**Label to input:** 6px
**Input to helper:** 4px

### 7.4 Form Sections

**Grouped fields:**
```
┌─────────────────────────────────────┐
│ SECTION TITLE                       │
│─────────────────────────────────────│
│                                     │
│ Related fields grouped together     │
│                                     │
└─────────────────────────────────────┘
```

---

## 8. BUTTONS IN FORMS

### 8.1 Submit Button

**Styling:**
- Primary style
- Full width or right-aligned
- Clear label ("Create Account", not "Submit")

**States:**
- Default: Active, clickable
- Disabled: When form invalid
- Loading: During submission

### 8.2 Secondary Actions

**Examples:**
- Cancel
- Reset
- Back

**Position:**
- Left of primary
- Or separate row

### 8.3 Loading State

**Visual:**
- Spinner in button
- Text change ("Creating...")
- Button disabled

---

## 9. MOBILE CONSIDERATIONS

### 9.1 Touch Targets

**Minimum sizes:**
- All inputs: 48px height
- Buttons: 48px minimum
- Checkboxes/radios: 44px touch area

### 9.2 Keyboard Handling

**Input types:**
- `email` - Email keyboard
- `tel` - Phone keyboard
- `number` - Numeric keyboard
- `search` - Search keyboard

**Return key:**
- "Next" for form progression
- "Done" for last field
- "Search" for search inputs

### 9.3 Field Visibility

**Scroll on focus:**
- Input scrolls into view
- Account for keyboard height
- Smooth scroll animation

---

## 10. ACCESSIBILITY

### 10.1 Labels

**Requirements:**
- All inputs have labels
- Labels linked via `for` attribute
- Or wrapped around input

### 10.2 Error Association

**Programmatic:**
- `aria-describedby` for error messages
- `aria-invalid` for error state
- Error announced to screen readers

### 10.3 Focus Management

**Tab order:**
- Logical progression
- Skip links available
- No focus traps

### 10.4 Color Independence

**Beyond color:**
- Icons for status
- Text messages
- Border weight changes

---

## 11. AUTOCOMPLETE & AUTOFILL

### 11.1 Browser Autofill

**Styling:**
```css
/* Handle browser autofill styling */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px #1a1a35 inset;
  -webkit-text-fill-color: white;
}
```

### 11.2 Autocomplete Attributes

**Usage:**
- `autocomplete="email"` for emails
- `autocomplete="new-password"` for registration
- `autocomplete="current-password"` for login

---

## 12. FORM EXAMPLES

### 12.1 Login Form

```
┌─────────────────────────────────────┐
│            M1SSION™                 │
│                                     │
│ Email                               │
│ [email@example.com              ]   │
│                                     │
│ Password                            │
│ [••••••••••                    👁]   │
│                                     │
│ [        SIGN IN                ]   │
│                                     │
│ Forgot password?  |  Create account │
└─────────────────────────────────────┘
```

### 12.2 Registration Form

```
┌─────────────────────────────────────┐
│         CREATE ACCOUNT              │
│                                     │
│ Username                            │
│ [                               ]   │
│                                     │
│ Email                               │
│ [                               ]   │
│                                     │
│ Password                            │
│ [                              👁]   │
│ Min 8 characters                   │
│                                     │
│ Confirm Password                    │
│ [                              👁]   │
│                                     │
│ ☐ I agree to Terms of Service      │
│                                     │
│ [     CREATE ACCOUNT             ]  │
└─────────────────────────────────────┘
```

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For navigation patterns, refer to Volume 17.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





