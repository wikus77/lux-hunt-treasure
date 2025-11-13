# PHASE 9 — UX REFACTOR + WEAPON/DEFENSE SHOP ANALYSIS

**Date**: 2025-01-15  
**Status**: Pre-Implementation Analysis  
**Project**: M1SSION™ TRON Battle System

## 📋 CURRENT STATE ANALYSIS

### 1. Battle Widget (src/components/battle/BattleWidget.tsx)
**Current Implementation:**
- Floating button at bottom-left (z-1001)
- Expands to sliding panel on click
- Shows active battles & pending challenges
- "New Battle" button navigates to `/battle` route
- Badge counter for active + pending battles

**Issues to Fix:**
- Panel expansion is not modal-style
- "New Battle" forces navigation away from map
- No option to start battle without leaving map view

### 2. M1U System (VERIFIED & OPERATIONAL)
**Database:**
- ✅ `user_m1_units` table with balance, total_earned, total_spent
- ✅ RPC: `m1u_get_summary()`, `m1u_ping()`, `m1u_fake_update()`
- ✅ Realtime subscription via `useM1UnitsRealtime()`
- ✅ Stripe integration for M1U purchases

**Frontend:**
- ✅ `M1UPill` component (glassmorphism design)
- ✅ `M1UnitsShopModal` for purchasing M1U packs
- ✅ `M1UPaymentModal` for Stripe checkout

**Ready to Use**: M1U system is fully functional and can be used for battle shop purchases.

### 3. Weapon/Defense System (PARTIALLY IMPLEMENTED)
**Current State:**
- ❌ No `battle_items` catalog table
- ❌ No `user_battle_items` inventory table
- ⚠️ Basic defense selection in BattleHUD (uses hardcoded catalog)
- ⚠️ No shop UI for purchasing/managing weapons

**What Exists:**
- `WeaponCatalogItem` type defined in `src/types/battle.ts`
- `getWeaponsCatalog()` and `getDefenseCatalog()` hooks (but no backend)
- Defense selection dropdown in BattleHUD

### 4. Map Controls
**Location**: `src/pages/sandbox/MapTiler3D.tsx`
**Current Style**: Standard Material UI buttons
**Need**: Pill-style redesign (same functionality)

### 5. Note & Points/Areas Panels
**Components**: `DevNotesPanel.tsx`, `DevAreasPanel.tsx`
**Current Size**: Full size
**Need**: Reduce by 25% (padding, font, dimensions)

## 🎯 IMPLEMENTATION PLAN

### PHASE 9A — DATABASE SCHEMA (Supabase)

#### New Tables:
1. **`battle_items`** (catalog of all weapons & defenses)
   - `id` UUID PRIMARY KEY
   - `type` TEXT ('weapon' | 'defense')
   - `code` TEXT UNIQUE (e.g., 'MISSILE_V1', 'SHIELD_BASIC')
   - `name` TEXT
   - `description` TEXT
   - `icon_key` TEXT (for frontend icon selection)
   - `base_price_m1u` INTEGER
   - `power` INTEGER (base effectiveness)
   - `rarity` TEXT ('common' | 'rare' | 'epic' | 'legendary')
   - `min_rank` INTEGER (minimum agent rank required)
   - `max_stack` INTEGER (max quantity in inventory)
   - `is_active` BOOLEAN DEFAULT true
   - `created_at` TIMESTAMPTZ DEFAULT now()

2. **`user_battle_items`** (user inventory)
   - `id` UUID PRIMARY KEY
   - `user_id` UUID REFERENCES auth.users(id) ON DELETE CASCADE
   - `item_id` UUID REFERENCES battle_items(id) ON DELETE CASCADE
   - `quantity` INTEGER DEFAULT 1
   - `is_equipped` BOOLEAN DEFAULT false
   - `acquired_at` TIMESTAMPTZ DEFAULT now()
   - UNIQUE(user_id, item_id)

#### RLS Policies:
- `battle_items`: READ for authenticated, WRITE for service_role/admin only
- `user_battle_items`: Users can only see/modify their own items

#### RPC Functions:
1. **`list_available_battle_items()`**
   - Returns all active items from catalog
   - Joins with user inventory to show owned status

2. **`purchase_battle_item(p_item_id UUID, p_quantity INT)`**
   - Validates M1U balance
   - Deducts M1U via ledger
   - Inserts/updates user_battle_items
   - Transactional (all-or-nothing)

3. **`get_user_battle_inventory()`**
   - Returns user's current inventory with item details

### PHASE 9B — FRONTEND UX REFACTOR

#### 1. BattleWidget → Pill + Modal
**New Component Structure:**
```
BattlePill.tsx (circular pill, badge counter)
  └─ opens → BattleModal.tsx (full screen / bottom sheet)
                ├─ Active battles list
                ├─ Pending challenges
                ├─ Battle creation form (NEW)
                └─ Link to full Arena (/battle) [optional]
```

**Features:**
- No forced navigation to /battle
- Create/accept battles within modal
- Modal can be dismissed with X or swipe-down
- Integrates with weapon/defense selection from inventory

#### 2. Agent Marker Click → Battle Card
**New Component**: `AgentBattleCard.tsx`
- Triggered on red marker click (no marker modification)
- Shows:
  - Agent Code (e.g., AG-0012)
  - Rank/Reputation
  - Attackability status (Available / Ghost / Shielded)
- "⚔️ Attack this Agent" button
- Opens BattleModal with opponent pre-selected

**Data Source**:
- Create view or RPC: `get_agent_battle_info(agent_id)`
- Returns: agent_code, display_name, rank, reputation, is_attackable

#### 3. Map Controls Reskin
**File**: `src/pages/sandbox/MapTiler3D.tsx`
- Keep same position and functionality
- Apply pill-style design (glassmorphism, glow, rounded)
- Icons centered, hover states

#### 4. Resize Note & Points Panels
**Files**: `DevNotesPanel.tsx`, `DevAreasPanel.tsx`
- Reduce font-size by ~20%
- Reduce padding by ~25%
- Reduce overall dimensions by ~25%

### PHASE 9C — BATTLE SHOP UI

**New Components:**
1. **`BattleShop.tsx`** (main shop component)
   - Two tabs: Weapons | Defenses
   - Item cards with: icon, name, description, price, stats
   - "Buy" or "Equipped" button
   - Shows M1U balance (reuses M1UPill)

2. **`BattleInventory.tsx`** (user inventory view)
   - List of owned items
   - Quantity indicators
   - Equip/unequip buttons

**Integration:**
- Accessible from BattleModal ("Shop" button)
- Also accessible from /battle/shop route
- Purchase flow uses `purchase_battle_item()` RPC
- Updates M1U balance via existing realtime

### PHASE 9D — BATTLE CREATION WITH LOADOUT

**Enhancement**: `BattleModal.tsx` creation form
- Add weapon selector (from equipped/owned weapons)
- Add defense selector (from equipped/owned defenses)
- Store selected items in battle metadata or dedicated columns

**Backend**: Extend battle creation logic
- Add `weapon_item_id` and `defense_item_id` to battles table (optional)
- Or store in `metadata` JSONB field
- Use these for FX variations (future phase)

## 🛡️ SAFETY COMPLIANCE

### Protected Elements (NO MODIFICATIONS):
- ✅ Buzz / Buzz Map / geolocation
- ✅ Push notifications (SW/VAPID/FCM/APNs)
- ✅ Stripe payment flow (only reuse for M1U)
- ✅ "ON M1SSION" button
- ✅ fetch-interceptor, CORS
- ✅ UnifiedHeader.tsx, BottomNavigation.tsx
- ✅ Pill positions (Home, Buzz, /map-3d-tiler)
- ✅ Red agent markers (base logic/icons)
- ✅ Reward markers

### New Elements:
- ✅ All new files end with copyright notice
- ✅ PWA mobile-first design
- ✅ No hardcoded keys/URLs
- ✅ No Lovable proprietary dependencies

## 📊 ESTIMATED IMPACT

### Database:
- 2 new tables
- 3 new RPC functions
- Minimal new RLS policies

### Frontend:
- ~8 new components
- ~3 modified components (minimal changes)
- 0 breaking changes to existing battle system

### Testing Required:
1. Purchase weapon/defense with M1U
2. Equip items and create battle
3. Agent marker click → battle card → attack flow
4. Modal open/close on map without navigation
5. Verify all protected elements untouched

---

**READY FOR IMPLEMENTATION**: All conflicts analyzed, no blockers detected.

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
