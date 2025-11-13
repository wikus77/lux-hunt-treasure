# M1SSION™ BATTLE SYSTEM — PHASE 8 TEST SCENARIOS
**Battle System Testing & Validation Plan**

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

---

## 🎯 TEST OBJECTIVES

This document outlines comprehensive test scenarios for the TRON Battle System (Phases 5-7) on iPhone PWA, covering:
- Battle flow (create → accept → flash → resolve)
- Push notifications dispatch
- Battle FX visualization on 3D map
- Audit & security layer validation
- Performance mode testing

---

## 📋 SCENARIO 1: BASIC 1v1 BATTLE (Happy Path)

### Objective
Verify complete battle flow with both players online, FX visible, push notifications delivered, audit clean.

### Preconditions
- User A and User B: authenticated, PWA installed, push enabled
- Both users online on `/map-3d-tiler`
- Both have sufficient stake balance (e.g., 10 Energy Fragments)

### Steps

1. **User A initiates battle**
   - Navigate to User B's agent marker on map
   - Tap marker → select "Challenge" (or equivalent)
   - Choose stake: Energy, 10 fragments, 50% wagered
   - Confirm battle creation

2. **Expected: Battle created (status: pending)**
   - `battles` table: new row with `creator_id = A`, `opponent_id = B`, `status = 'pending'`
   - `battle_audit`: entry `battle_created` with timestamp
   - `battle_notifications`: entry for User B with type `battle_invite` (or `attack_started`)

3. **User B receives push notification**
   - Within 5-10s, User B device shows push: "⚔️ Battle Challenge from [Agent A]"
   - Tap notification → opens PWA to `/map-3d-tiler` with Battle HUD visible

4. **User B accepts battle**
   - Battle HUD shows challenge details (stake, opponent)
   - Tap "Accept Battle" button
   - `battles.status` → `'accepted'`, `accepted_at` timestamp updated
   - `battle_audit`: entry `battle_accepted`

5. **Battle enters countdown (status: ready → countdown)**
   - After accept, battle transitions to `countdown` state
   - `countdown_start_at` and `flash_at` timestamps set
   - Both users see countdown timer UI (e.g., 3-2-1...)

6. **Flash moment (status: active)**
   - At `flash_at` timestamp, visual flash appears
   - Both users must tap screen as fast as possible
   - `creator_tap_at`, `opponent_tap_at`, `creator_reaction_ms`, `opponent_reaction_ms` recorded

7. **Battle resolves automatically**
   - Edge function `battle-resolve` determines winner (lowest reaction time)
   - `battles.status` → `'resolved'`, `winner_id` set
   - `battle_transfers`: ledger entry transferring 10 Energy from loser to winner
   - `battle_audit`: entry `battle_resolved` with winner, loser, reaction times

8. **FX visualization on map**
   - **Attack phase**: Missile trail animates from User A position → User B position
   - **Flash phase**: Visual flash at battle arena position
   - **Resolution**: Winner pulse/shockwave FX at winner position

9. **Push notifications for resolution**
   - User A (if winner): "🏆 Vittoria! +10 energy"
   - User B (if loser): "⚔️ Battle conclusa. -10 energy"
   - `battle_notifications` entries created, consumed by `battle-push-dispatcher`

10. **Audit verification**
    - Admin runs `audit_battle(battle_id)`
    - Expected output:
      ```json
      {
        "rng_check": "ok",
        "ledger_check": "ok",
        "tamper_flags": [],
        "audit_summary": {
          "is_clean": true
        }
      }
      ```

### Pass Criteria
- ✅ Battle created, accepted, and resolved successfully
- ✅ Both users received push notifications at correct stages
- ✅ FX visible on map for both users during all phases
- ✅ Audit report shows `is_clean: true`, no tamper flags
- ✅ Energy balance correctly transferred (loser -10, winner +10)
- ✅ Ghost mode updated if applicable (loser consecutive losses)

### Fail Criteria
- ❌ Battle stuck in `pending` or `accepted` without progressing
- ❌ Push notifications not delivered or delayed >30s
- ❌ FX not visible or only visible to one user
- ❌ Audit shows tamper flags (RNG_MISMATCH, AUDIT_LOG_INCOMPLETE, etc.)
- ❌ Energy balance incorrect or transfer not recorded

---

## 📋 SCENARIO 2: BATTLE REJECTED / CANCELLED

### Objective
Verify correct handling when opponent rejects challenge or battle expires/cancels.

### Preconditions
- User A and User B authenticated, online
- User A initiates battle against User B

### Steps

1. **User A initiates battle** (same as Scenario 1 step 1)
2. **User B receives invite push notification**
3. **User B rejects or ignores battle**
   - Option A: User B taps "Reject" in Battle HUD
   - Option B: User B does not respond before `expires_at` timestamp

4. **Expected: Battle cancelled/expired**
   - If rejected: `battles.status` → `'cancelled'`
   - If expired: cron `battle-cron-finalize` sets `status` → `'expired'`
   - `battle_audit`: entry `battle_cancelled` or `battle_expired`
   - No transfer in `battle_transfers`

5. **UI updates correctly**
   - User A sees notification "Battle cancelled" or "Opponent did not respond"
   - No FX shown on map (or brief "cancelled" animation)
   - No stake deducted from either user

6. **Audit verification**
   - `audit_battle(battle_id)` returns:
     ```json
     {
       "status": "cancelled" (or "expired"),
       "tamper_flags": [],
       "transfers": [],
       "audit_summary": { "is_clean": true }
     }
     ```

### Pass Criteria
- ✅ Battle correctly set to cancelled/expired status
- ✅ No stake transfer occurred
- ✅ Both users notified of cancellation
- ✅ Audit log reflects cancellation event

### Fail Criteria
- ❌ Stake incorrectly deducted
- ❌ Battle stuck in `pending` after expiration
- ❌ No audit entry for cancellation

---

## 📋 SCENARIO 3: DEVICE OFFLINE / PWA CLOSED

### Objective
Test push notification delivery and battle state when User B's device is offline or PWA is closed at invite time.

### Preconditions
- User A online on map
- User B: PWA closed or device in airplane mode

### Steps

1. **User A initiates battle** against User B
2. **Battle created** (`status: pending`)
3. **User B device offline** → push notification queued by system
4. **User B comes online** (opens PWA or disables airplane mode)
5. **Expected: Push notification delivered**
   - Notification appears with delay (up to 1-2 min depending on network)
   - Tap notification → opens PWA to `/map-3d-tiler`
   - Battle HUD shows pending challenge (if not yet expired)

6. **User B can accept or battle expires naturally**
   - If accepted within time window → proceed as Scenario 1
   - If expired → battle auto-cancelled by cron

### Pass Criteria
- ✅ Push notification delivered when device comes online
- ✅ Tap notification correctly opens PWA with Battle HUD
- ✅ No crash or inconsistent state
- ✅ Battle expires gracefully if time window passed

### Fail Criteria
- ❌ Push notification never delivered
- ❌ PWA crashes on notification tap
- ❌ Battle HUD shows incorrect state or missing data

---

## 📋 SCENARIO 4: PERFORMANCE MODE (High vs Low FX)

### Objective
Verify FX degradation when Performance Mode is switched to "Low FX", and that map remains stable.

### Preconditions
- User A authenticated, on `/map-3d-tiler`
- Active battle in progress (any stage with FX)

### Steps

1. **User A: FX in High Mode (default)**
   - Navigate to Settings → Mission Settings
   - Verify "Battle FX Performance Mode" is set to "High Qualità"
   - Observe battle FX on map:
     - Missile trails: full animation, longer duration
     - Shield/EMP: richer particle effects

2. **User A: Switch to Low FX**
   - In Settings, change "Battle FX Performance Mode" → "Performance"
   - Return to `/map-3d-tiler`

3. **Expected: FX degraded visibly**
   - Missile trails: shorter duration, fewer particles
   - Shield/EMP: simpler visuals
   - **No errors in console**
   - Map layers (agents, portals, rewards) still visible and functional

4. **User A: Return to High FX**
   - Switch back to "High Qualità"
   - FX return to full quality
   - No memory leaks or stale FX elements

### Pass Criteria
- ✅ FX visibly reduced in Low Mode
- ✅ No console errors or crashes
- ✅ Other map layers unaffected
- ✅ Setting persists across page reload

### Fail Criteria
- ❌ No visible difference between High/Low modes
- ❌ Console errors when switching modes
- ❌ Map becomes unresponsive or FX duplicates

---

## 📋 SCENARIO 5: MULTI-BATTLE STRESS TEST (Light)

### Objective
Verify system stability with 3+ concurrent battles, no FX leaks or event confusion.

### Preconditions
- 6+ users online (User A, B, C, D, E, F...)
- All on `/map-3d-tiler`

### Steps

1. **Create 3 battles simultaneously**
   - Battle 1: User A vs User B
   - Battle 2: User C vs User D
   - Battle 3: User E vs User F

2. **Expected: All battles progress independently**
   - Each battle has unique `battle_id`
   - Realtime subscriptions isolated per battle
   - FX rendered correctly for each battle's arena position

3. **No event cross-contamination**
   - User A's client only shows FX for Battle 1
   - User C's client only shows FX for Battle 3
   - No FX from Battle 1 appearing on Battle 2 participants' maps

4. **Cleanup: Battles resolve**
   - All 3 battles resolve naturally
   - FX disappear after resolution (no lingering elements)
   - Memory usage stable (no leaks)

### Pass Criteria
- ✅ All 3 battles function correctly without interference
- ✅ FX isolated per battle
- ✅ No console errors or warnings
- ✅ No memory leaks (FX cleanup on battle end)

### Fail Criteria
- ❌ FX from Battle 1 visible on Battle 2 participants
- ❌ Realtime events mixed between battles
- ❌ Memory leak detected (FX elements not removed)

---

## 🛡️ ADMIN SCENARIO: AUDIT PANEL USAGE

### Objective
Verify admin can access Battle Audit Panel, search battles, and view audit reports.

### Preconditions
- Admin user logged in (role check via `has_role(auth.uid(), 'admin')`)
- At least 2 completed battles in DB (1 clean, 1 potentially flagged for test)

### Steps

1. **Admin navigates to `/admin/battle-audit`**
   - Page renders without error
   - List of recent battles displayed (ID, creator, opponent, status, winner)

2. **Admin selects a battle to audit**
   - Click "Audit" button on a specific battle row
   - System calls RPC `audit_battle(battle_id)`

3. **Expected: Audit report displayed**
   - Panel shows:
     - RNG seed
     - RNG check status (`ok` | `mismatch` | `missing`)
     - Ledger check status (`ok` | `incomplete`)
     - Audit log entries (list of events)
     - Tamper flags (if any)
   - For clean battle: all checks green, no tamper flags
   - For test flagged battle: tamper flags highlighted in red

4. **Admin can flag suspicious battle**
   - Button "Flag as Suspicious" available
   - On click, calls RPC `flag_battle_suspicious(battle_id, reason)`
   - Entry created in `battle_admin_actions` table

### Pass Criteria
- ✅ Admin panel accessible only to admin role
- ✅ Audit report correctly displays all data
- ✅ Tamper flags visible and highlighted
- ✅ Flag action logged in `battle_admin_actions`

### Fail Criteria
- ❌ Non-admin users can access audit panel
- ❌ Audit report shows incorrect data or errors
- ❌ Flag action fails or not logged

---

## 📊 ECONOMY QA SCENARIO: M1U / PE / RANK VALIDATION

### Objective
Verify stake transfers are balanced (no M1U/PE appearing or disappearing), and rank updates correctly.

### Preconditions
- User A: 100 Energy Fragments
- User B: 100 Energy Fragments
- 0 active battles

### Steps

1. **Record initial balances**
   - User A: 100 Energy
   - User B: 100 Energy
   - Total system: 200 Energy

2. **Create and resolve battle**
   - User A vs User B, stake: 20 Energy, 50% (10 Energy each side)
   - Battle resolves, User A wins

3. **Expected final balances**
   - User A: 100 + 10 = 110 Energy
   - User B: 100 - 10 = 90 Energy
   - Total system: still 200 Energy (balanced)

4. **Verify `battle_transfers` ledger**
   - One entry: `from_user_id = B`, `to_user_id = A`, `amount = 10`, `transfer_type = 'energy'`
   - No orphan transfers or duplicates

5. **Verify rank updates** (if rank is affected by battles)
   - User A rank: potentially increased (win)
   - User B rank: unchanged or decreased (loss)
   - No anomalous rank jumps with few battles

### Pass Criteria
- ✅ Total Energy in system balanced (200 before = 200 after)
- ✅ Winner gained exactly stake amount
- ✅ Loser lost exactly stake amount
- ✅ One transfer entry in ledger, no duplicates
- ✅ Rank updates logical

### Fail Criteria
- ❌ Total Energy imbalanced (e.g., 210 or 190)
- ❌ Duplicate transfers
- ❌ No transfer recorded
- ❌ Rank anomalies (e.g., +100 rank from 1 battle)

---

## 🧪 FINAL VALIDATION CHECKLIST

Before declaring Phase 8 "Release Ready", ensure:

- [ ] All 5 test scenarios pass
- [ ] Admin audit scenario passes
- [ ] Economy QA scenario passes
- [ ] No console errors during normal battle flow
- [ ] Push notifications delivered consistently (<30s delay)
- [ ] FX visible on both iPhone Safari and Chrome (PWA)
- [ ] Performance Mode toggle functional
- [ ] Audit reports clean for normal battles
- [ ] No memory leaks after 5+ battles
- [ ] Battle HUD UI responsive on iPhone screen sizes

---

## 📝 NOTES

- **RNG Seed Tracking**: Phase 7 introduced `rng_seed` in `battle_audit`. If not yet fully implemented, this will show as `missing` in audit reports—acceptable for now, but flag for future.
- **Ghost Mode**: Tested indirectly via consecutive losses. Dedicated ghost mode scenarios can be added in Phase 9.
- **Energy Traces**: Briefly tested in Scenario 1. Full visual validation requires map inspection after battle resolution.

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
