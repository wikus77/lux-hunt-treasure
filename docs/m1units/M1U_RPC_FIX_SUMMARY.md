# M1U RPC Fix + Pill Integration — Summary

**Date:** 2025-11-11  
**Status:** ✅ READY FOR TESTING

---

## 🔧 Issues Fixed

### 1. RPC Signature Mismatch
**Problem:** Debug panel called `m1u_ping(target_uid)` but function existed without parameters.

**Error:**
```
could not find function public.m1u_ping(target_uid uuid)
```

**Solution:**
- Created SQL overload: `m1u_ping(target_uid UUID DEFAULT NULL)`
- Function now accepts optional parameter, defaults to `auth.uid()`
- Updated hook to call without arguments: `rpc('m1u_ping')`

### 2. Missing RPC Helper
**Problem:** No consistent way to fetch balance via RPC.

**Solution:**
- Created `m1u_get_balance(target_uid UUID DEFAULT NULL)`
- Returns `BIGINT` balance, creates row if missing
- Used in hook's `fetchUnits()` for consistent access

---

## 📋 Required Actions (USER)

### Step 1: Run SQL in Supabase
**File:** `supabase/sql/m1u_rpc_overload.sql`

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `m1u_rpc_overload.sql`
3. Paste and click "Run"
4. Verify success messages:
   ```
   ✅ M1U RPC overload applied successfully
   ✅ m1u_ping() now accepts optional target_uid
   ✅ m1u_get_balance() created
   🎯 Debug panel should now work without errors!
   ```

### Step 2: Test Debug Panel
1. Enable dev access: `localStorage.setItem('developer_access', 'true')`
2. Reload page → Debug panel appears bottom-right
3. Click **"Ping"** → Badge turns HEARTBEAT (blue), then SUBSCRIBED (green)
4. Click **"Fake Update"** → Balance increments by +1
5. Click **"Refetch"** → Balance reloads from DB

**Expected Console Output:**
```
[14:30:45] User ID: 12345678-90ab-cdef-1234-567890abcdef
[14:30:45] Connection: Connecting...
[14:30:46] Connection: Connected
[14:30:46] Balance updated: 0 M1U
[14:30:50] 🏓 Sending ping...
[14:30:50] Connection: Heartbeat ♥
[14:30:52] Connection: Connected
[14:30:55] 🎭 Triggering fake update...
[14:30:55] ✅ Fake update sent
[14:30:55] Balance updated: 1 M1U
```

---

## 🎨 M1U Pill Locations

### ✅ Already Integrated

#### 1. **Home (Landing Page)**
**File:** `src/components/landing/XavierStyleLandingPage.tsx`
- **Position:** Fixed top-right corner
- **Safe Area:** iOS-compatible `env(safe-area-inset-top)`
- **Display:** Full pill with "M1U" label
- **Z-Index:** 50 (above content, below modals)

```tsx
<div className="fixed top-4 right-4 z-50" 
     style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
  <M1UnitsPill />
</div>
```

#### 2. **Map Header**
**File:** `src/pages/map/MapHeader.tsx`
- **Position:** Center section, next to AgentBadge
- **Display:** Compact (no "M1U" label)
- **Layout:** Flexbox `gap-3`

```tsx
<div className="flex items-center justify-center gap-3">
  <AgentBadge />
  <M1UnitsPill showLabel={false} />
</div>
```

#### 3. **Buzz (via HeaderLayout)**
**File:** `src/components/layout/HeaderLayout.tsx`
- **Position:** Center section
- **Display:** Full pill with label
- **Usage:** Any page using HeaderLayout component

```tsx
<div className="flex items-center justify-center">
  <M1UnitsPill />
</div>
```

---

## 🔄 Hook Updates

### `useM1UnitsRealtime.ts`

**Changes:**
1. **Ping function** → Calls `rpc('m1u_ping')` without arguments
2. **Fetch function** → Uses `rpc('m1u_get_balance')` for initial load
3. **Auto-create** → If row missing, calls `m1u_ping()` to create

**Benefits:**
- ✅ No hardcoded user_id in RPC calls
- ✅ Server-side validation via SECURITY DEFINER
- ✅ Consistent access pattern
- ✅ Auto-row creation on first access

---

## 🛡️ Security Hardening

### RLS Policies Applied

```sql
-- Users can only insert/update their own rows
CREATE POLICY "write own units (upsert self)"
  ON public.user_m1_units FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update own units"
  ON public.user_m1_units FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### RPC Functions
- **SECURITY DEFINER** → Runs with function owner privileges
- **Self-only queries** → `target_uid` defaults to `auth.uid()`
- **Admin future-proof** → Can add role check later if needed

---

## 🧪 Testing Checklist

### ✅ Completed (Backend)
- [x] SQL overload created
- [x] RPC permissions granted
- [x] RLS policies hardened
- [x] Hook updated to new signatures
- [x] Debug panel calls fixed

### 🔄 Pending (User Verification)
- [ ] SQL script executed in Supabase
- [ ] Debug panel Ping works (no RPC error)
- [ ] Fake Update increments balance
- [ ] Refetch reloads balance
- [ ] Pill visible on Home (top-right)
- [ ] Pill visible on Map header (center)
- [ ] Pill visible on Buzz header (center)
- [ ] No console errors
- [ ] Real iPhone device test

---

## 📸 Expected Visual

### Home (Landing)
```
┌────────────────────────────────────────┐
│ [Safe Area Top]          [M1U: 123] ← │ Fixed top-right
│                                        │
│     M1SSION™ HERO CONTENT              │
│                                        │
│    [INIZIA LA MISSIONE]                │
└────────────────────────────────────────┘
```

### Map Header
```
┌────────────────────────────────────────┐
│ M1ssion  [AgentBadge] [M1U] [Help] [⚡]│
│          ↑ Center       ↑ Compact      │
└────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **YOU:** Run SQL in Supabase → Verify success messages
2. **YOU:** Test debug panel → Verify Ping/Update/Refetch
3. **YOU:** Navigate Home/Map/Buzz → Verify pill visible
4. **YOU:** Screenshot all 3 pages → Send for review
5. **ME:** Verify screenshots → Adjust positioning if needed

---

## 🔐 Safety Compliance

✅ **NO changes to:**
- Buzz markers/geolocation logic
- Push notification system
- Stripe payments
- Norah chat integration
- "ON M1SSION" button functionality

✅ **No hardcoded refs:**
- All RPC calls use dynamic `auth.uid()`
- No Supabase URL/ref in code

✅ **Signatures:**
- All files include copyright notice

---

## 📄 Files Modified

### Created
- `supabase/sql/m1u_rpc_overload.sql` (RPC fixes)
- `docs/m1units/M1U_RPC_FIX_SUMMARY.md` (this file)

### Modified
- `src/hooks/useM1UnitsRealtime.ts` (RPC signatures)

### Already Integrated (Previous Step)
- `src/components/m1units/M1UnitsPill.tsx`
- `src/components/debug/M1UnitsDebugPanel.tsx`
- `src/components/landing/XavierStyleLandingPage.tsx`
- `src/pages/map/MapHeader.tsx`
- `src/components/layout/HeaderLayout.tsx`

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
