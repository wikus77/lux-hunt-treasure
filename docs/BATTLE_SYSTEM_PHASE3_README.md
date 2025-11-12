# 🎮 M1SSION™ Battle System - FASE 3: UI, Realtime & FX

**Status:** ✅ Frontend Components Ready (Not Integrated)  
**Date:** 2025-01-12  
**Version:** 3.0.0

---

## 📋 Overview

Phase 3 adds the **frontend UI layer** for the Battle System:
- **Battle HUD**: Dockable panel for defense selection and countdown
- **Realtime Hook**: Live updates via Supabase realtime channels
- **2D FX Components**: Visual effects for battles (Framer Motion based)

⚠️ **IMPORTANT**: These components are **NOT automatically integrated** into the map. They are provided as standalone modules with integration examples.

---

## 🎯 What's Included

### 1. Realtime Hook
**File:** `src/hooks/useBattleRealtimeSubscription.ts`

```typescript
const { state, channel } = useBattleRealtimeSubscription(sessionId);

// state includes:
// - status: 'await_defense' | 'resolved' | 'cancelled'
// - winnerId?: string
// - until?: number (ms epoch)
// - lastEvent?: { type, payload }
```

**Features:**
- Subscribes to `battle:{session_id}` channel
- Listens to `battle_sessions` and `battle_notifications` changes
- Auto-cleanup on unmount
- Debug logging with `[Battle Realtime]` prefix

---

### 2. Battle HUD Component
**File:** `src/components/battle/BattleHUD.tsx`

**Props:**
```typescript
interface BattleHUDProps {
  sessionId: string | null;
  onClose?: () => void;
}
```

**Features:**
- Collapsible panel (bottom-right by default)
- 60-second countdown timer
- Defense selection dropdown
- Real-time status updates
- Disabled state when resolved

**Styling:**
- Fixed position: `bottom-20 right-4`
- Width: `320px`
- Z-index: `40` (below modals, above content)
- Does NOT interfere with existing map UI

---

### 3. Battle FX (2D Fallback)
**Directory:** `src/fx/battle/`

**Components:**
- `MissileTrail2D` - Animated line from attacker to defender
- `EMPWave2D` - Expanding ring effect
- `ShieldBubble2D` - Pulsing shield on target

**Factory Function:**
```typescript
import { renderBattleFX } from '@/fx/battle';

const fx = renderBattleFX({
  type: 'missile',
  from: [attackerLat, attackerLng],
  to: [defenderLat, defenderLng],
  onEnd: () => console.log('FX complete')
});
```

---

## 🚀 Manual Integration Guide

### Example 1: Battle HUD in Custom Page

```tsx
import { useState } from 'react';
import { BattleHUD } from '@/components/battle/BattleHUD';
import { useBattleSystem } from '@/hooks/useBattleSystem';

export function BattleTestPage() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const { startAttack } = useBattleSystem();

  const handleStartBattle = async () => {
    const result = await startAttack('defender-uuid', 'weapon-key');
    if (result?.session_id) {
      setActiveSession(result.session_id);
    }
  };

  return (
    <div className="relative h-screen">
      <button onClick={handleStartBattle}>Start Test Battle</button>
      
      {/* HUD renders when session is active */}
      {activeSession && (
        <BattleHUD 
          sessionId={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
```

---

### Example 2: FX Overlay on Map

```tsx
import { useState, ReactNode } from 'react';
import { renderBattleFX } from '@/fx/battle';

export function MapWithBattleFX() {
  const [activeFX, setActiveFX] = useState<ReactNode | null>(null);

  const triggerAttackFX = (from: [number, number], to: [number, number]) => {
    setActiveFX(
      renderBattleFX({
        type: 'missile',
        from,
        to,
        onEnd: () => {
          // Show EMP on impact
          setActiveFX(
            renderBattleFX({
              type: 'emp',
              center: to,
              onEnd: () => setActiveFX(null)
            })
          );
        }
      })
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Your map component */}
      <MapComponent />
      
      {/* FX overlay container */}
      {activeFX && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {activeFX}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Guide

### Test 1: Start Attack → HUD Appears

```typescript
// In browser console or test component
import { useBattleSystem } from '@/hooks/useBattleSystem';

const { startAttack } = useBattleSystem();
const result = await startAttack('defender-id', 'plasma-blade');

// Expected result:
// { session_id: 'uuid', expires_at: 'ISO date +60s' }
```

### Test 2: Realtime Updates

```typescript
import { useBattleRealtimeSubscription } from '@/hooks/useBattleRealtimeSubscription';

const { state } = useBattleRealtimeSubscription('session-id');

// Watch console for:
// [Battle Realtime] Subscribing to battle: session-id
// [Battle Realtime] Session update: { status: 'await_defense', ... }
```

### Test 3: Defense Submission

```typescript
const { submitDefense } = useBattleSystem();
const result = await submitDefense('session-id', 'energy-shield');

// Expected:
// { status: 'resolved', winner_id: 'attacker-or-defender-uuid' }
```

### Test 4: Timeout (No Defense)

1. Start attack via `startAttack()`
2. Wait 60+ seconds without calling `submitDefense()`
3. Edge Function `battle-cron-finalize` runs (every 1 min)
4. Session auto-resolves as attacker win
5. HUD shows "Battle Concluded"

---

## 🔌 Realtime Architecture

```
Client                    Supabase                    Edge Function
  |                          |                              |
  |-- startAttack() -------> | RPC: start_battle_v2         |
  |                          |-- INSERT battle_sessions     |
  |                          |-- INSERT battle_notifications|
  |                          |                              |
  |<-- Realtime Update ----- | postgres_changes:            |
  |    (attack_started)      | battle_sessions              |
  |                          |                              |
  |-- submitDefense() -----> | RPC: submit_defense_v2       |
  |                          |-- UPDATE battle_sessions     |
  |                          |-- INSERT battle_results      |
  |                          |                              |
  |<-- Realtime Update ----- | postgres_changes:            |
  |    (battle_resolved)     | battle_sessions              |
  |                          |                              |
  |                          |                              |
  |    (60s timeout)         |                              |
  |                          |        <-- Cron Trigger ---- | every 1 min
  |                          |        (finalize_expired)    |
  |                          |-- UPDATE expired sessions    |
  |<-- Realtime Update ----- | postgres_changes:            |
  |    (auto-resolved)       | battle_sessions              |
```

---

## 🎨 UI Design Notes

### Battle HUD
- **Position:** Fixed bottom-right, above BottomNavigation (z-40)
- **Width:** 320px (mobile-friendly)
- **State Colors:**
  - Normal: Primary theme
  - Urgent (<10s): Destructive variant
  - Resolved: Muted theme

### FX Components
- **Duration:** 1.5-2.5 seconds per effect
- **Z-Index:** 1000 (overlay layer)
- **Performance:** Framer Motion with `pointer-events: none`
- **Accessibility:** Respects `prefers-reduced-motion`

---

## 🔒 Safety Checklist

✅ **Protected Elements NOT Modified:**
- ❌ Buzz / Buzz Map / geolocation
- ❌ Push notifications pipeline
- ❌ Stripe/payments
- ❌ UnifiedHeader.tsx
- ❌ BottomNavigation.tsx
- ❌ Pills (Home/Buzz/Map)
- ❌ Agent/Reward markers

✅ **New Files Added (Non-Invasive):**
- `src/hooks/useBattleRealtimeSubscription.ts`
- `src/components/battle/BattleHUD.tsx`
- `src/fx/battle/*` (4 files)
- `docs/BATTLE_SYSTEM_PHASE3_README.md`

---

## 📊 Battle Flow Diagram

```
[Attacker]                      [Defender]
    |                               |
    | startAttack()                 |
    |------------------------------>|
    |                               | Receives push notification
    |                               | HUD appears with timer
    | Realtime: attack_started      |
    |<----------------------------->|
    |                               |
    |          60s window           |
    |                               |
    |                               | submitDefense()
    |<------------------------------|
    |                               |
    | Realtime: battle_resolved     |
    |<----------------------------->|
    |                               |
    | Both see result in HUD        |
    |<----------------------------->|
```

---

## 🐛 Debugging Tips

### Enable Debug Logs
All battle components use `console.debug()` with prefixes:
- `[Battle Realtime]` - Subscription events
- `[Battle HUD]` - UI interactions
- `[Battle FX]` - Animation lifecycle

### Check Realtime Connection
```typescript
// In browser console
const channel = supabase.channel('test');
channel.subscribe((status) => console.log('Status:', status));
```

### Verify Session State
```sql
-- In Supabase SQL Editor
SELECT id, status, expires_at, winner_id 
FROM battle_sessions 
WHERE id = 'your-session-id';
```

---

## 🚧 Known Limitations (Phase 3)

1. **No Auto-Integration:** Components must be manually added to pages
2. **2D Only:** No 3D R3F effects yet (planned for Phase 4)
3. **No Push UI:** Uses existing pipeline (no new notification UI)
4. **Simple Coords:** FX uses percentage-based positioning (no real lat/lng conversion)

---

## 🔄 Next Steps (Phase 4 - Future)

- [ ] 3D R3F effects (MissileTrail3D, etc.)
- [ ] Map marker integration (attack indicator on target)
- [ ] Battle history/stats panel
- [ ] Leaderboard integration
- [ ] Advanced FX (particle systems, shaders)

---

## 📝 Copyright

```
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
```

All files in Phase 3 include the mandatory copyright footer.

---

**End of Phase 3 README**
