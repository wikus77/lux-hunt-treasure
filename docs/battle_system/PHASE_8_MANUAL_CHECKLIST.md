# M1SSION™ BATTLE SYSTEM — MANUAL TESTING CHECKLIST
**iPhone PWA Testing Guide for Phase 8**

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

---

## 📱 PREREQUISITES

Before starting tests, ensure:

- [ ] Two iPhone devices available (iPhone 12 or newer recommended)
- [ ] Both devices have M1SSION PWA installed to home screen
  - Open https://m1ssion.eu (or staging URL) in Safari
  - Tap Share → "Add to Home Screen"
  - Launch app from home screen icon
- [ ] Both devices: Push notifications enabled
  - Open PWA → Settings → Enable Push
  - Grant permission when prompted
- [ ] Both users: Authenticated and have at least 20 Energy Fragments
- [ ] Both users: On `/map-3d-tiler` (3D map view)
- [ ] Good network connection (Wi-Fi or 4G/5G)

---

## ✅ TEST 1: BASIC BATTLE FLOW (Core Functionality)

**Objective**: Verify complete battle from challenge to resolution.

### Steps

1. **Device A: Initiate Battle**
   - [ ] Navigate to map, find Device B's agent marker (red pin)
   - [ ] Tap marker → **Expected**: Menu appears with "Challenge" option
   - [ ] Tap "Challenge" → **Expected**: Battle configuration dialog opens
   - [ ] Select stake: "Energy", amount: 10, percentage: 50%
   - [ ] Confirm battle → **Expected**: Toast "Attack initiated! Waiting for defense..."
   - [ ] **Record**: Battle ID shown in UI or console (if visible)

2. **Device B: Receive Challenge**
   - [ ] Within 10-30 seconds, Device B should receive **push notification**
     - **Expected Title**: "⚔️ Battle Challenge from [Agent A]"
     - **Expected Body**: Details about stake and opponent
   - [ ] Tap notification → **Expected**: PWA opens to `/map-3d-tiler`
   - [ ] **Expected**: Battle HUD appears on screen (floating card, bottom-right or center)
     - Shows opponent name, stake, countdown timer

3. **Device B: Accept Battle**
   - [ ] In Battle HUD, tap "Accept Battle" button
   - [ ] **Expected**: Toast "Battle accepted!"
   - [ ] **Expected**: Battle HUD updates to show countdown (e.g., "3... 2... 1...")

4. **Both Devices: Countdown Phase**
   - [ ] **Expected**: Both screens show synchronized countdown timer
   - [ ] **Expected**: Visual flash appears after countdown (bright white flash or similar)
   - [ ] **Action**: Both users tap screen as fast as possible after flash

5. **Both Devices: Battle Resolves**
   - [ ] **Expected**: Battle HUD shows result:
     - Winner: "🏆 Victory! +10 Energy"
     - Loser: "⚔️ Battle Lost. -10 Energy"
   - [ ] **Expected**: Push notification sent to both users with result
   - [ ] **Verify**: Energy balance updated correctly:
     - Winner: +10 Energy
     - Loser: -10 Energy

6. **Both Devices: FX on Map**
   - [ ] During battle, **Expected FX visible**:
     - **Attack phase**: Missile trail from Device A position → Device B position
     - **Flash phase**: Bright flash at battle arena location
     - **Resolution**: Winner pulse/shockwave at winner's location
   - [ ] FX should be visible on **both** devices simultaneously

### Pass Criteria
- ✅ Push notification received within 30 seconds
- ✅ Battle HUD appears and functions correctly
- ✅ Countdown and flash visible on both devices
- ✅ Winner determined correctly (fastest reaction time)
- ✅ Energy balances updated correctly
- ✅ FX visible on map for both users
- ✅ No errors in console (check via Safari Web Inspector if available)

### Fail Criteria
- ❌ Push notification not received or delayed >60s
- ❌ Battle HUD doesn't appear or is unresponsive
- ❌ FX not visible or only visible to one user
- ❌ Energy balance incorrect
- ❌ Console errors (red text in browser console)

---

## ✅ TEST 2: BATTLE REJECTION

**Objective**: Verify correct handling when opponent rejects challenge.

### Steps

1. **Device A: Initiate Battle** (same as Test 1, step 1)
2. **Device B: Receive Challenge** (same as Test 1, step 2)
3. **Device B: Reject Battle**
   - [ ] In Battle HUD, tap "Reject" or "Decline" button (if available)
   - [ ] **OR**: Wait for battle to expire (timeout after 60s)
4. **Device A: Notification of Rejection**
   - [ ] **Expected**: Toast "Battle cancelled" or "Opponent did not respond"
   - [ ] **Expected**: No energy deducted from either user
5. **Verify Database** (optional, for admin):
   - [ ] Check `battles` table: `status = 'cancelled'` or `'expired'`

### Pass Criteria
- ✅ Battle cancelled without stake transfer
- ✅ Both users notified of cancellation
- ✅ No errors

---

## ✅ TEST 3: OFFLINE / PWA CLOSED

**Objective**: Test push notification delivery when Device B is offline.

### Steps

1. **Device B: Close PWA**
   - [ ] Swipe up to close PWA (or enable airplane mode)
2. **Device A: Initiate Battle** (same as Test 1, step 1)
3. **Device B: Come Online**
   - [ ] Open PWA again (or disable airplane mode)
   - [ ] **Expected**: Push notification appears with delay (up to 2 minutes)
   - [ ] Tap notification → **Expected**: Opens PWA with Battle HUD
4. **Device B: Accept Battle** (same as Test 1, step 3)

### Pass Criteria
- ✅ Push notification delivered when device comes online
- ✅ Tap notification opens PWA correctly
- ✅ Battle proceeds normally

---

## ✅ TEST 4: PERFORMANCE MODE

**Objective**: Verify FX degradation in Performance Mode.

### Steps

1. **Device A: Enable High FX** (default)
   - [ ] Open Settings → Mission Settings
   - [ ] Verify "Battle FX Performance Mode" = "High Qualità"
2. **Device A: Start Battle** (any battle, can be with Device B)
3. **Device A: Observe FX**
   - [ ] **Expected**: Full missile trails, rich particle effects, shield bubble
4. **Device A: Switch to Performance Mode**
   - [ ] Open Settings → Mission Settings
   - [ ] Change "Battle FX Performance Mode" → "Performance"
   - [ ] Return to map
5. **Device A: Start New Battle**
6. **Device A: Observe FX**
   - [ ] **Expected**: Simplified FX (shorter trails, fewer particles)
   - [ ] **Expected**: No console errors
   - [ ] **Expected**: Map remains responsive

### Pass Criteria
- ✅ FX visibly reduced in Performance Mode
- ✅ No console errors when switching modes
- ✅ Map remains functional

---

## ✅ TEST 5: ADMIN AUDIT PANEL

**Objective**: Verify admin can view battle audit reports.

### Prerequisites
- [ ] Admin user logged in (email in admin role table)

### Steps

1. **Admin: Navigate to Audit Panel**
   - [ ] Open URL: `/admin/battle-audit`
   - [ ] **Expected**: Page renders without error
   - [ ] **Expected**: List of recent battles displayed
2. **Admin: Select a Battle**
   - [ ] Click "Audit" button on any battle
   - [ ] **Expected**: Audit report appears with:
     - Battle ID, creator, opponent, winner
     - RNG seed (may be `null` if Phase 7 migration not applied)
     - RNG check status (ok / mismatch / missing)
     - Ledger check status (ok / incomplete)
     - Audit log entries (list of events)
     - Tamper flags (should be empty for normal battles)
3. **Admin: Flag Battle** (optional)
   - [ ] Click "Flag as Suspicious" button
   - [ ] **Expected**: Confirmation dialog
   - [ ] Confirm → **Expected**: Toast "Battle flagged successfully"

### Pass Criteria
- ✅ Admin panel accessible (non-admin users redirected or blocked)
- ✅ Audit report displays correctly
- ✅ No console errors

---

## 🧪 ADDITIONAL CHECKS

### Console Logs (Safari Web Inspector)

On each device, check browser console for errors:
1. Connect iPhone to Mac via USB
2. Open Safari on Mac → Develop → [iPhone] → [M1SSION PWA]
3. Monitor console during tests
4. **Expected**: No red errors (warnings are OK)
5. **Look for**: `[Battle]`, `[BattleFxLayer]`, `[Push]` debug logs

### Network Requests (Optional)

In Safari Web Inspector → Network tab:
- [ ] Verify requests to `/functions/v1/battle-accept` succeed (200 OK)
- [ ] Verify requests to `/functions/v1/battle-resolve` succeed (200 OK)
- [ ] Verify push notification requests succeed (check `webpush-targeted-send` calls)

### Database Verification (Admin Only)

In Supabase dashboard:
- [ ] Check `battles` table: verify new battles appear with correct `status`
- [ ] Check `battle_transfers` table: verify stake transfers recorded
- [ ] Check `battle_audit` table: verify audit log entries created
- [ ] Check `battle_notifications` table: verify notifications created and `consumed = true` after dispatch

---

## 📊 TEST SUMMARY SHEET

| Test | Device A | Device B | Pass/Fail | Notes |
|------|----------|----------|-----------|-------|
| Test 1: Basic Battle Flow | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | |
| Test 2: Battle Rejection | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | |
| Test 3: Offline/PWA Closed | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | |
| Test 4: Performance Mode | ✅ / ❌ | N/A | ✅ / ❌ | |
| Test 5: Admin Audit Panel | ✅ / ❌ | N/A | ✅ / ❌ | |

**Overall Status**: ✅ PASS / ❌ FAIL

**Issues Found**:
- (List any bugs, console errors, or unexpected behavior)

**Tester Name**: ___________________________
**Test Date**: ___________________________
**iPhone Model**: ___________________________
**iOS Version**: ___________________________

---

## 🚨 COMMON ISSUES & TROUBLESHOOTING

### Push Notification Not Received
- **Check**: PWA installed to home screen? (not just bookmarked)
- **Check**: Push permissions granted in Settings?
- **Check**: Network connection stable?
- **Try**: Force-close PWA and reopen

### Battle HUD Not Appearing
- **Check**: Console for errors (red text)
- **Check**: Battle ID logged in console? (may indicate backend issue)
- **Try**: Refresh page (swipe down to reload)

### FX Not Visible
- **Check**: Performance Mode enabled? (may simplify FX)
- **Check**: Map layers loaded? (see agent markers?)
- **Try**: Zoom in/out on map to refresh rendering

### Energy Balance Incorrect
- **Check**: Database `battle_transfers` table (admin only)
- **Check**: Console for transfer errors
- **Report**: Critical bug, flag battle in audit panel

---

## ✅ FINAL CHECKLIST (Before Release)

- [ ] All 5 tests pass on at least 2 iPhone devices
- [ ] No critical console errors
- [ ] Push notifications delivered consistently
- [ ] FX visible on both devices during battle
- [ ] Energy balances correct after battle
- [ ] Admin audit panel functional
- [ ] Performance Mode toggle works

**If all checks pass**: ✅ **READY FOR RELEASE**
**If any fail**: ❌ **BLOCK RELEASE** — Review technical report for fixes

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
