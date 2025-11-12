# M1SSION™ Battle System - Phase 4: Enhanced HUD & 3D FX

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## Overview

Phase 4 enhances the Battle System with:
- **Enhanced Battle HUD v2** with action history, better state management, and visual polish
- **3D Battle Effects** (optional) with automatic 2D fallback
- **Non-invasive mount point** for safe integration
- **Performance telemetry** for optimization insights

## Architecture

```
src/
├── components/battle/
│   ├── BattleHUD.tsx          # Enhanced HUD v2 (history, states)
│   └── BattleMount.tsx         # Safe mount point wrapper
├── fx/
│   ├── battle/                 # 2D FX (Phase 3)
│   │   ├── MissileTrail2D.tsx
│   │   ├── EMPWave2D.tsx
│   │   ├── ShieldBubble2D.tsx
│   │   └── index.tsx           # Factory with 3D support
│   └── battle3d/               # 3D FX (NEW - lazy loaded)
│       ├── MissileTrail3D.tsx
│       ├── EMPWave3D.tsx
│       ├── ShieldBubble3D.tsx
│       └── index.tsx
└── hooks/
    ├── useBattleSystem.ts      # Phase 2 RPC calls
    └── useBattleRealtimeSubscription.ts  # Phase 3 realtime
```

## Enhanced Features

### 1. Battle HUD v2

**New capabilities:**
- ✅ **Action History**: Last 3 battle events with timestamps
- ✅ **Enhanced States**: `await_defense`, `resolved`, `cancelled`
- ✅ **Dynamic Styling**: Color-coded status based on urgency
- ✅ **Improved UX**: Better loading states, error handling
- ✅ **Expandable/Collapsible**: Dock minimized or expanded

**States:**
```typescript
type BattleStatus = 'await_defense' | 'resolved' | 'cancelled';

interface ActionHistoryItem {
  id: string;
  type: 'attack_started' | 'defense_needed' | 'battle_resolved';
  timestamp: number;
  description: string;
}
```

### 2. BattleMount - Safe Integration

**Purpose:** Non-invasive wrapper to mount Battle HUD without touching protected components.

**Usage Example:**
```tsx
import { BattleMount } from '@/components/battle/BattleMount';
import { useState } from 'react';

function MyPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleBattleStart = async (defenderId: string) => {
    const { startAttack } = useBattleSystem();
    const result = await startAttack(defenderId, 'laser_mk1');
    setActiveSessionId(result.session_id);
  };

  return (
    <div className="relative">
      {/* Your existing content/map */}
      <YourMapComponent />
      
      {/* Battle HUD overlay - non-invasive */}
      <BattleMount 
        sessionId={activeSessionId} 
        onClose={() => setActiveSessionId(null)} 
      />
    </div>
  );
}
```

**Key Points:**
- ✅ Does **NOT** auto-mount on map
- ✅ Safe to add to any page wrapper
- ✅ Only renders when `sessionId` is provided
- ✅ Doesn't interfere with map/markers/pills

### 3. 3D Battle Effects (Optional)

**Mode Options:**
```typescript
type BattleFXMode = '2d' | '3d' | '3d-auto';
```

**Auto-Detection:**
- `'2d'`: Force 2D (always works)
- `'3d'`: Force 3D (requires R3F)
- `'3d-auto'`: Detect WebGL → use 3D, fallback to 2D

**ENV Override:**
```bash
# Force 2D mode for low-end devices
VITE_BATTLE_FX_MODE=2d
```

**Usage Example:**
```tsx
import { renderBattleFX } from '@/fx/battle';
import { useState } from 'react';

function BattleContainer() {
  const [fx, setFx] = useState<ReactNode | null>(null);

  const handleAttackFX = () => {
    setFx(renderBattleFX({
      type: 'missile',
      from: [attackerLat, attackerLng],
      to: [defenderLat, defenderLng],
      mode: '3d-auto', // Auto-detect best mode
      onEnd: () => setFx(null)
    }));
  };

  return (
    <div className="relative">
      <MapComponent />
      
      {/* FX Overlay Container */}
      {fx && (
        <div className="absolute inset-0 pointer-events-none z-[1000]">
          {fx}
        </div>
      )}
    </div>
  );
}
```

**Available FX:**
```typescript
renderBattleFX({
  type: 'missile',
  from: [lat1, lng1],
  to: [lat2, lng2],
  mode: '3d-auto'
});

renderBattleFX({
  type: 'emp',
  center: [lat, lng],
  mode: '3d-auto'
});

renderBattleFX({
  type: 'shield',
  center: [lat, lng],
  mode: '3d-auto'
});
```

## Complete Integration Example

```tsx
import { BattleMount } from '@/components/battle/BattleMount';
import { useBattleSystem } from '@/hooks/useBattleSystem';
import { useBattleRealtimeSubscription } from '@/hooks/useBattleRealtimeSubscription';
import { renderBattleFX } from '@/fx/battle';
import { useState, useEffect } from 'react';

function BattlePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fx, setFx] = useState<ReactNode | null>(null);
  
  const { startAttack } = useBattleSystem();
  const { state } = useBattleRealtimeSubscription(sessionId);

  // React to battle events
  useEffect(() => {
    if (!state.lastEvent) return;

    console.debug('[Battle] Event:', state.lastEvent.type);

    // Trigger FX based on event
    if (state.lastEvent.type === 'attack_started') {
      setFx(renderBattleFX({
        type: 'missile',
        from: [43.8, 7.5],
        to: [43.9, 7.6],
        mode: '3d-auto',
        onEnd: () => setFx(null)
      }));
    }

    if (state.lastEvent.type === 'battle_resolved') {
      setFx(renderBattleFX({
        type: 'emp',
        center: [43.85, 7.55],
        mode: '3d-auto',
        onEnd: () => setFx(null)
      }));
    }
  }, [state.lastEvent]);

  const handleInitiateAttack = async () => {
    try {
      const result = await startAttack('defender-uuid', 'laser_mk1');
      setSessionId(result.session_id);
    } catch (error) {
      console.error('[Battle] Start failed:', error);
    }
  };

  return (
    <div className="relative h-screen">
      {/* Your map/content */}
      <YourMapComponent />

      {/* Battle HUD (only when active) */}
      <BattleMount 
        sessionId={sessionId} 
        onClose={() => setSessionId(null)} 
      />

      {/* FX Overlay */}
      {fx && (
        <div className="absolute inset-0 pointer-events-none z-[1000]">
          {fx}
        </div>
      )}

      {/* Attack trigger (example) */}
      <button 
        onClick={handleInitiateAttack}
        className="absolute top-4 right-4 z-10"
      >
        Start Battle
      </button>
    </div>
  );
}
```

## Testing Guide

### 1. Test Enhanced HUD

```tsx
// Simulate active battle
const testSessionId = 'test-session-uuid';

<BattleMount sessionId={testSessionId} />
```

**Expected:**
- ✅ HUD appears in bottom-right
- ✅ Countdown displays (60s → 0)
- ✅ Defense catalog loads
- ✅ Action history shows events
- ✅ State transitions work (await_defense → resolved)
- ✅ Expand/collapse works
- ✅ Close button works

### 2. Test 3D/2D Fallback

```typescript
// Test 3D auto-detection
console.log('3D available:', renderBattleFX({ type: 'missile', from: [0,0], to: [1,1], mode: '3d-auto' }));

// Force 2D
console.log('2D forced:', renderBattleFX({ type: 'missile', from: [0,0], to: [1,1], mode: '2d' }));
```

**Expected:**
- ✅ 3D renders on WebGL-capable devices
- ✅ 2D fallback on low-end devices
- ✅ ENV override works (`VITE_BATTLE_FX_MODE=2d`)
- ✅ No crash if R3F unavailable

### 3. Test Realtime Integration

```typescript
const { state } = useBattleRealtimeSubscription(sessionId);

useEffect(() => {
  console.log('[Test] Battle state:', state);
  console.log('[Test] Last event:', state.lastEvent);
}, [state]);
```

**Expected:**
- ✅ Real-time updates on battle channel
- ✅ Events trigger FX automatically
- ✅ HUD updates on state change
- ✅ Cleanup on unmount

## Performance Notes

### Telemetry (Internal)

```typescript
// Event bus logs for debugging
console.debug('[BattleHUD] Countdown:', timeLeft);
console.debug('[BattleFX] Rendering missile in 3D mode');
console.debug('[BattleMount] No active session');
```

**Metrics tracked:**
- FX animation duration
- HUD state transitions
- 3D/2D mode selection
- Defense catalog load time

### Low-End Device Optimization

```bash
# .env.local
VITE_BATTLE_FX_MODE=2d  # Force 2D on low-end devices
```

**Recommendations:**
- Use `'3d-auto'` mode (default) for automatic detection
- Monitor console for `[BattleFX]` logs
- Test on mobile/low-end devices
- 2D fallback is always stable

## Limitations & Notes

### ⚠️ What Phase 4 Does NOT Do

- ❌ Does **NOT** auto-mount HUD on map
- ❌ Does **NOT** modify any protected components
- ❌ Does **NOT** touch map/markers/pills
- ❌ Does **NOT** require 3D (works pure 2D)
- ❌ Does **NOT** send network telemetry

### ✅ Safe Integration Points

- ✅ Manual `<BattleMount />` in page wrappers
- ✅ FX overlay via `renderBattleFX()`
- ✅ Realtime subscription via `useBattleRealtimeSubscription()`
- ✅ RPC calls via `useBattleSystem()`

## Next Steps

After Phase 4, you can:
1. **Mount HUD**: Add `<BattleMount />` to your battle pages
2. **Add FX**: Trigger `renderBattleFX()` on battle events
3. **Test 3D**: Enable WebGL and test 3D effects
4. **Optimize**: Use ENV flags for device-specific tuning
5. **Analytics**: See Phase 4 Supabase README for leaderboard/stats

## Files Modified

```
✅ src/components/battle/BattleHUD.tsx (enhanced)
✅ src/components/battle/BattleMount.tsx (new)
✅ src/fx/battle/index.tsx (3D support)
✅ src/fx/battle3d/* (new 3D components)
```

**No protected files were touched:**
- ❌ Map components (map-3d-tiler, etc.)
- ❌ UnifiedHeader.tsx
- ❌ BottomNavigation.tsx
- ❌ Pill components
- ❌ Marker components

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
