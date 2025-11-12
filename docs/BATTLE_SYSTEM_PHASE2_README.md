# M1SSION™ Battle System - PHASE 2 Documentation

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## Overview

Phase 2 integrates full economy (M1U, Pulse Energy, Reputation) into the Battle System with:
- **Transactional M1U**: Attacker/defender pay M1U upfront; winner receives rewards
- **Manual Defense**: Defender must respond within 60s window
- **Deterministic Resolution**: Server-side RNG calculates outcome
- **PE & Reputation Ledgers**: Winners gain PE/Rep; losers lose soft penalties
- **Push Integration**: Writes to `battle_notifications` for existing pipeline

---

## Phase 2 Architecture

### Database Schema (Phase 2)

New tables added:

1. **user_wallet**: M1U balance per user
2. **m1u_ledger**: Transaction log with idempotency
3. **pe_ledger**: Pulse Energy transaction log
4. **reputation_ledger**: Reputation transaction log
5. **battle_notifications**: Events for push pipeline
6. **defense_catalog**: Defense items catalog
7. **pricing_rules**: Server-tunable rewards
8. **rank_modifiers**: Rank-based multipliers

### RPC Functions (Phase 2)

#### Economy Functions
- `wallet_debit(user_id, amount, reason, ref_id, idempotency_key)` → Debit M1U
- `wallet_credit(user_id, amount, reason, ref_id, idempotency_key)` → Credit M1U
- `arsenal_consume(user_id, item_key, item_type)` → Decrement arsenal quantity
- `pe_credit(user_id, amount, reason, ref_id)` → Add PE ledger entry
- `reputation_credit(user_id, amount, reason, ref_id)` → Add reputation ledger entry

#### Battle Functions
- `start_battle_v2(defender_id, weapon_key, client_nonce)` → Start attack with M1U debit
- `submit_defense_v2(session_id, defense_key)` → Submit defense & resolve battle
- `finalize_expired_battles()` → Close expired battles (attacker wins by timeout)
- `get_wallet_balance(user_id?)` → Get M1U balance

---

## Installation

### Step 1: Execute SQL Migrations

Run migrations in your Supabase SQL Editor (or via CLI):

```bash
# In Supabase SQL Editor, execute in order:
1. docs/battle_system/phase2_schema.sql
2. docs/battle_system/phase2_rpc.sql
```

These migrations are **idempotent** (safe to run multiple times).

### Step 2: Verify Schema

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_wallet', 'm1u_ledger', 'pe_ledger', 'reputation_ledger', 'battle_notifications', 'defense_catalog');

-- Check RPC functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%battle%' OR proname LIKE '%wallet%';
```

### Step 3: Seed Test Data (Optional)

```sql
-- Give test user some M1U
INSERT INTO user_wallet (user_id, m1u_balance)
VALUES ('your-test-user-uuid', 1000)
ON CONFLICT (user_id) DO UPDATE SET m1u_balance = 1000;

-- Give test user some weapons/defenses
INSERT INTO user_arsenal (user_id, item_type, item_key, quantity)
VALUES 
  ('your-test-user-uuid', 'weapon', 'plasma_strike', 5),
  ('your-test-user-uuid', 'defense', 'energy_shield', 5)
ON CONFLICT (user_id, item_key) DO UPDATE SET quantity = 5;
```

---

## Client-Side Usage

### Hook: `useBattleSystem()`

Located at: `src/hooks/useBattleSystem.ts`

#### Updated Methods (Phase 2)

```typescript
import { useBattleSystem } from '@/hooks/useBattleSystem';

function BattleComponent() {
  const { 
    startAttack, 
    submitDefense, 
    finalizeExpired,
    isLoading,
    currentSession
  } = useBattleSystem();

  // 1. Start attack (with M1U debit)
  const handleAttack = async () => {
    const result = await startAttack('defender-uuid', 'plasma_strike');
    if (result) {
      console.log('Attack started:', result.session_id);
      console.log('Expires at:', result.expires_at); // +60s from now
      // Start countdown timer UI
    }
  };

  // 2. Submit defense (within 60s)
  const handleDefense = async (sessionId: string) => {
    const result = await submitDefense(sessionId, 'energy_shield');
    if (result) {
      console.log('Battle resolved!');
      console.log('Winner:', result.winner_id);
      console.log('Status:', result.status); // 'resolved'
      // Show result UI
    }
  };

  // 3. Finalize expired (cron/manual)
  const handleCleanup = async () => {
    const count = await finalizeExpired();
    console.log(`Finalized ${count} expired battles`);
  };

  return <div>...</div>;
}
```

---

## Battle Flow (Phase 2)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ATTACKER: startAttack(defenderId, weaponKey)            │
│    → Debit M1U                                              │
│    → Consume weapon from arsenal                            │
│    → Create battle_sessions (status='await_defense')        │
│    → Write battle_notifications (type='attack_started')     │
│    → Returns: { session_id, expires_at (+60s) }            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. DEFENDER: Gets push notification via existing pipeline  │
│    → Opens app, sees attack (60s timer)                     │
│    → Chooses defense_key from arsenal                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────┐
        │ Within 60s?                       │
        └───────────────┬───────────────────┘
                YES ↓               NO ↓
┌────────────────────────────┐  ┌────────────────────────────┐
│ 3a. submitDefense()        │  │ 3b. finalizeExpired()      │
│  → Debit M1U               │  │  → Attacker wins by timeout│
│  → Consume defense         │  │  → Reward attacker         │
│  → Calculate outcome (RNG) │  │  → Penalty defender        │
│  → Reward winner           │  │  → Write notifications     │
│  → Penalty loser           │  └────────────────────────────┘
│  → Write notifications     │
└────────────────────────────┘
```

### Deterministic RNG

- **Seed**: `sha256(attacker_id || defender_id || weapon_key || timestamp || nonce)`
- **Formula**: 
  - `att_power = weapon.power * rng_att * modifiers`
  - `def_power = defense.power * rng_def * modifiers`
  - `winner = att_power > def_power ? attacker : defender`

### Economy Flow

1. **Attack Phase**:
   - Attacker pays `weapon.m1u_cost` upfront
   - Weapon quantity decremented
   - Cooldown set for weapon

2. **Defense Phase**:
   - Defender pays `defense.m1u_cost` upfront
   - Defense quantity decremented
   - Cooldown set for defense

3. **Resolution**:
   - **Winner receives**:
     - +100 M1U (base, tunable via `pricing_rules`)
     - +50 PE (base)
     - +10 Reputation (base)
   - **Loser receives**:
     - -10 PE (soft penalty)
     - -5 Reputation (soft penalty)
     - No M1U loss beyond initial cost

4. **Timeout (no defense)**:
   - Same as Resolution, but attacker wins automatically

---

## Testing Guide

### Quick Test Flow

```typescript
// Test Script (in browser console or test file)

import { supabase } from '@/integrations/supabase/client';

// 1. Setup: Give users M1U and arsenal
await supabase.rpc('wallet_credit', {
  p_user_id: 'attacker-uuid',
  p_amount: 500,
  p_reason: 'test_setup',
  p_ref_id: null
});

await supabase.from('user_arsenal').insert([
  { user_id: 'attacker-uuid', item_type: 'weapon', item_key: 'plasma_strike', quantity: 5 },
  { user_id: 'defender-uuid', item_type: 'defense', item_key: 'energy_shield', quantity: 5 }
]);

// 2. Start attack (as attacker)
const { data: attackResult } = await supabase.rpc('start_battle_v2', {
  p_defender_id: 'defender-uuid',
  p_weapon_key: 'plasma_strike',
  p_client_nonce: crypto.randomUUID()
});

console.log('Attack started:', attackResult);
// → { success: true, session_id: '...', expires_at: '...' }

// 3. Submit defense (as defender, within 60s)
const { data: defenseResult } = await supabase.rpc('submit_defense_v2', {
  p_session_id: attackResult.session_id,
  p_defense_key: 'energy_shield'
});

console.log('Battle resolved:', defenseResult);
// → { success: true, status: 'resolved', winner_id: '...', outcome: 'attacker_win' | 'defender_win' }

// 4. Check ledgers
const { data: m1uLedger } = await supabase
  .from('m1u_ledger')
  .select('*')
  .eq('ref_id', attackResult.session_id)
  .order('created_at', { ascending: false });

console.log('M1U Ledger:', m1uLedger);
// → Shows debit (attack/defense) and credit (winner reward)

const { data: peLedger } = await supabase
  .from('pe_ledger')
  .select('*')
  .eq('ref_id', attackResult.session_id);

console.log('PE Ledger:', peLedger);
// → Shows +50 for winner, -10 for loser
```

### Test Cases Checklist

- [x] **Happy Path**: Attack → Defense (within 60s) → Resolved
- [x] **Timeout**: Attack → No defense (>60s) → Attacker wins
- [x] **Insufficient M1U**: Attack with low balance → Error
- [x] **Insufficient Arsenal**: Attack with 0 weapons → Error
- [x] **Already in Battle**: Attacker has active battle → Error
- [x] **Defender Busy**: Defender has active battle → Error
- [x] **Offline Target**: Defender is offline → Error (checked in RPC)
- [x] **Stealth Target**: Defender is in stealth → Error (checked in RPC)
- [x] **Cooldown Active**: Weapon/defense on cooldown → Error
- [x] **Idempotency**: Duplicate attack (same nonce) → Deduplicated by ledger
- [x] **Ledger Consistency**: All M1U/PE/Rep changes logged

---

## Post-Migration Verification

### SQL Queries

```sql
-- 1. Check schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_wallet', 'm1u_ledger', 'pe_ledger', 'reputation_ledger', 'battle_notifications', 'defense_catalog', 'pricing_rules', 'rank_modifiers');

-- 2. Check RPC functions
SELECT proname FROM pg_proc 
WHERE proname IN ('start_battle_v2', 'submit_defense_v2', 'finalize_expired_battles', 'wallet_debit', 'wallet_credit', 'arsenal_consume', 'pe_credit', 'reputation_credit', 'get_wallet_balance');

-- 3. Check seed data
SELECT * FROM weapons_catalog;
SELECT * FROM defense_catalog;
SELECT * FROM pricing_rules;
SELECT * FROM rank_modifiers;

-- 4. Test wallet balance
SELECT get_wallet_balance(auth.uid());
```

---

## Known Limitations (Phase 2)

1. **No UI Components**: Phase 2 focuses on logic only (UI in Phase 3)
2. **Simplified RNG**: Uses seed hash modulo for pseudo-random (production should use proper PRNG)
3. **No Rank Modifiers**: Currently unused (future phase)
4. **No Distance Modifiers**: Currently unused (future phase)
5. **Fixed Rewards**: Base values hardcoded (use `pricing_rules` for tuning)
6. **No Realtime Client Hook**: `useBattleRealtime` for real-time updates (next phase)

---

## Next Steps (Phase 3)

- [ ] Battle HUD UI component (dock panel, compressible)
- [ ] Real-time battle channel (`battle:{session_id}`)
- [ ] 3D/2D battle animations (R3F + Framer Motion fallback)
- [ ] Integration with existing rank/reputation system
- [ ] Cron job for `finalize_expired_battles()` (Supabase Edge Function)
- [ ] Battle history & stats UI
- [ ] Leaderboard integration

---

## Safety Checklist (Phase 2)

✅ **NO modifications to**:
- Buzz/Buzz Map/Geolocation
- Push pipeline (only writes to `battle_notifications`)
- Stripe/payments
- "ON M1SSION" button
- fetch-interceptor, CORS, norah-chat-v2
- UnifiedHeader.tsx, BottomNavigation.tsx
- Pill components (Home, Buzz, /map-3d-tiler)
- Red agent markers, reward markers

✅ **ALL files end with legal signature**:
```typescript
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
```

✅ **Map remains fully functional**: Zero UI changes in Phase 2

---

## Support & Debugging

### Debug Logs

All battle operations log to console with `[Battle]` prefix:

```javascript
console.debug('[Battle] Starting attack (V2):', { defenderId, weaponKey });
console.debug('[Battle] Submitting defense:', { sessionId, defenseKey });
console.debug('[Battle] Finalized 3 expired battle(s)');
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Insufficient M1U balance` | Not enough M1U | Credit wallet via `wallet_credit()` |
| `Item not found or insufficient quantity` | Arsenal empty | Add items to `user_arsenal` |
| `Weapon is on cooldown` | Cooldown active | Wait for `user_cooldowns.until_ts` |
| `Target is not attackable` | Offline/stealth | Check `profiles.online` and `profiles.is_stealth` |
| `You already have an active battle` | Concurrent battle | Wait for resolution or use `finalize_expired()` |

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
