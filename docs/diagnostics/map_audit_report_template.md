# 🔍 M1SSION™ MAP VERSION SKEW AUDIT REPORT

**Report Date:** [INSERT_DATE]  
**Tested By:** [INSERT_NAME]  
**Environment:** Preview / Production (circle one)  
**Browser:** Chrome / Safari / Firefox (circle one)  
**OS:** macOS / Windows / Linux (circle one)

---

## 📋 EXECUTIVE SUMMARY

**Primary Issue:** AGENTS red markers intermittent + Living Map (Weather overlay) inconsistent across hard refreshes

**Root Cause Hypothesis:**
- [ ] Version Skew (different BUILD_ID loaded across refreshes)
- [ ] Service Worker cache pollution (stale chunks served)
- [ ] ENV mismatch (Preview vs Prod using different flags)
- [ ] Realtime Presence timing issue
- [ ] Other: _______________________

**Conclusion:** [TO BE FILLED AFTER TESTING]

---

## 🧪 TEST EXECUTION LOG

### Test Setup
- **Date/Time Started:** [INSERT]
- **Route:** /map
- **User Logged In:** Yes / No
- **Agent Code:** [INSERT if logged in]

### Pre-Test Actions
- [ ] Cleared browser cache (DevTools → Clear site data)
- [ ] Unregistered all Service Workers
- [ ] Closed all other tabs
- [ ] Hard refresh before first test

---

## 📊 DIAGNOSTIC RESULTS (5 Consecutive Hard Refreshes)

### Test Run #1
**Timestamp:** [INSERT]

```javascript
// Paste console output from: await runMapDiagnostics()
```

**BUILD_ID:** [INSERT]  
**MODE:** [INSERT]  
**SW Controller:** [INSERT]  
**Cache Names:** [INSERT]  
**LIVING_MAP Flag:** [true/false/(unset)]  
**WEATHER_OVERLAY Flag:** [true/false/(unset)]  
**TERRAIN_URL Present:** [Yes/No]  

**UI Observations:**
- [ ] Self marker visible (red dot "You — AG-XXXX")
- [ ] Weather overlay visible (rain animation)
- [ ] Living Map HUD visible
- [ ] Radar overlay visible
- [ ] 3D terrain toggle present

**Screenshots:**
- [ ] Console full output
- [ ] Network tab (JS filter: "living")
- [ ] Application → Service Workers
- [ ] Application → Cache Storage
- [ ] Map UI (markers + overlays)

---

### Test Run #2
**Timestamp:** [INSERT]

```javascript
// Paste console output from: await runMapDiagnostics()
```

**BUILD_ID:** [INSERT]  
**MODE:** [INSERT]  
**SW Controller:** [INSERT]  
**Cache Names:** [INSERT]  
**LIVING_MAP Flag:** [INSERT]  
**WEATHER_OVERLAY Flag:** [INSERT]  
**TERRAIN_URL Present:** [INSERT]  

**Comparison to Run #1:**
- [ ] BUILD_ID **SAME** / **DIFFERENT** ← ⚠️ CRITICAL
- [ ] Flags **SAME** / **DIFFERENT**
- [ ] Cache names **SAME** / **DIFFERENT**
- [ ] SW controller **SAME** / **DIFFERENT**

**UI Changes:**
- [ ] Markers appeared/disappeared
- [ ] Weather overlay toggled
- [ ] Living Map HUD changed

---

### Test Run #3
**Timestamp:** [INSERT]

**BUILD_ID:** [INSERT]  
**MODE:** [INSERT]  
**Comparison to Runs #1-2:** [SAME/DIFFERENT]

---

### Test Run #4
**Timestamp:** [INSERT]

**BUILD_ID:** [INSERT]  
**MODE:** [INSERT]  
**Comparison to Runs #1-3:** [SAME/DIFFERENT]

---

### Test Run #5
**Timestamp:** [INSERT]

**BUILD_ID:** [INSERT]  
**MODE:** [INSERT]  
**Comparison to Runs #1-4:** [SAME/DIFFERENT]

---

## 📈 CONSISTENCY ANALYSIS

### BUILD_ID Stability
```
Run #1: [BUILD_ID_1]
Run #2: [BUILD_ID_2]
Run #3: [BUILD_ID_3]
Run #4: [BUILD_ID_4]
Run #5: [BUILD_ID_5]
```

**Result:**
- [ ] ✅ All 5 runs: SAME BUILD_ID
- [ ] ❌ 2+ different BUILD_IDs detected → **VERSION SKEW CONFIRMED**

**If version skew detected:**
- Variation pattern: [e.g., "Alternates between build-xyz and build-abc"]
- Frequency: [e.g., "3/5 runs use build-xyz, 2/5 use build-abc"]

### Feature Flags Stability
```
LIVING_MAP:      [Run1] [Run2] [Run3] [Run4] [Run5]
WEATHER_OVERLAY: [Run1] [Run2] [Run3] [Run4] [Run5]
TERRAIN_URL:     [Run1] [Run2] [Run3] [Run4] [Run5]
```

**Result:**
- [ ] ✅ All flags consistent across 5 runs
- [ ] ❌ Flags changed between runs → **ENV MISMATCH**

### Service Worker Consistency
```
Run #1 Controller: [URL]
Run #2 Controller: [URL]
Run #3 Controller: [URL]
Run #4 Controller: [URL]
Run #5 Controller: [URL]
```

**Result:**
- [ ] ✅ Same SW controller across all runs
- [ ] ❌ Different SW controllers detected → **SW CONFLICT**

### Cache Storage Consistency
```
Run #1 Cache Count: [N]
Run #2 Cache Count: [N]
Run #3 Cache Count: [N]
Run #4 Cache Count: [N]
Run #5 Cache Count: [N]
```

**Cache Names Present:**
- [ ] `m1ssion-v1`
- [ ] `m1ssion-v2`
- [ ] `m1ssion-build-[hash]` (dynamic versioning)
- [ ] `m1ssion-static-v1`
- [ ] `m1ssion-static-v2`
- [ ] Other: [INSERT]

**Result:**
- [ ] ✅ Cache names tied to BUILD_ID (e.g., `m1ssion-build-xyz123`)
- [ ] ❌ Static cache names (e.g., `m1ssion-v2`) → **NO CACHE VERSIONING**
- [ ] ⚠️ Multiple versions present (v1 + v2) → **STALE CACHE POLLUTION**

---

## 🎭 UI BEHAVIOR MATRIX

| Run # | Self Marker | Weather Overlay | Living Map HUD | Radar | 3D Toggle |
|-------|-------------|-----------------|----------------|-------|-----------|
| 1     | [✅/❌]     | [✅/❌]         | [✅/❌]        | [✅/❌] | [✅/❌]   |
| 2     | [✅/❌]     | [✅/❌]         | [✅/❌]        | [✅/❌] | [✅/❌]   |
| 3     | [✅/❌]     | [✅/❌]         | [✅/❌]        | [✅/❌] | [✅/❌]   |
| 4     | [✅/❌]     | [✅/❌]         | [✅/❌]        | [✅/❌] | [✅/❌]   |
| 5     | [✅/❌]     | [✅/❌]         | [✅/❌]        | [✅/❌] | [✅/❌]   |

**Consistency Score:** ___ / 5 runs matched expected state

**Observed Patterns:**
- [ ] UI state matches feature flags in all runs
- [ ] UI state inconsistent despite same flags → Cache serving mixed assets
- [ ] UI state correlates with BUILD_ID changes → Version skew

---

## 🌐 NETWORK TAB ANALYSIS

### Lazy Chunk Hashes (Living Map)

**Filter:** JS, search "living"

| Run # | RadarOverlay | PortalsLayer | AgentsLayer | ControlZones | Weather |
|-------|--------------|--------------|-------------|--------------|---------|
| 1     | [hash]       | [hash]       | [hash]      | [hash]       | [hash]  |
| 2     | [hash]       | [hash]       | [hash]      | [hash]       | [hash]  |
| 3     | [hash]       | [hash]       | [hash]      | [hash]       | [hash]  |
| 4     | [hash]       | [hash]       | [hash]      | [hash]       | [hash]  |
| 5     | [hash]       | [hash]       | [hash]      | [hash]       | [hash]  |

**Result:**
- [ ] ✅ All chunk hashes identical across 5 runs
- [ ] ❌ Chunk hashes vary → **VERSION SKEW / CACHE POLLUTION**

**Failed Requests:**
- [ ] No 404 errors
- [ ] 404 on chunks: [LIST] → Stale references in HTML/index

---

## 🔧 POST-WIPE TEST (Cache + SW Cleared)

**Actions Taken:**
1. DevTools → Application → Service Workers → Unregister all
2. DevTools → Application → Cache Storage → Delete all
3. DevTools → Application → Storage → Clear site data
4. Hard refresh × 2

### Post-Wipe Run #1
**BUILD_ID:** [INSERT]  
**Cache Names:** [Should be empty or minimal]  
**UI State:** [Markers/Weather/HUD visible?]

### Post-Wipe Run #2
**BUILD_ID:** [INSERT]  
**Comparison to Post-Wipe #1:** [SAME/DIFFERENT]

**Result:**
- [ ] ✅ After wipe, UI behavior is now consistent
- [ ] ❌ Still inconsistent → Not a cache issue, likely backend/Realtime

---

## 🔍 AGENTS PRESENCE DEEP DIVE

### Presence State Timeline (from `window.__M1_DEBUG.presence`)

```javascript
// Paste from console: window.__M1_DEBUG.presence
{
  status: "[CHANNEL_CREATED | SUBSCRIBING | SUBSCRIBED | SYNC | error]",
  state: "[idle | joining | subscribed | error]",
  queued: [true/false],
  count: [N]
}
```

**Self Agent Data:**
```javascript
// Paste: window.__M1_DEBUG.lastAgentsPresence?.find(a => a.id === '<user_id>')
{
  id: "...",
  agent_code: "AG-XXXX",
  lat: ...,
  lng: ...,
  online_at: "..."
}
```

**Observations:**
- [ ] Presence reaches `SUBSCRIBED` state (✅ = working)
- [ ] Self agent has valid lat/lng coords (✅ = ready to render)
- [ ] Self marker `.m1-agent-dot--me` present in DOM (✅ = rendered)

**If marker missing despite coords:**
- [ ] Check `window.__M1_DEBUG.presence.state` = 'subscribed'
- [ ] Check `window.__M1_DEBUG.geo.source` = 'gps' or 'ip'
- [ ] Inspect DOM: `document.querySelector('.m1-agent-dot--me')`
- [ ] Check layer visibility: AGENTS toggle ON in UI

---

## 📡 SUPABASE REALTIME AUDIT (Backend)

### Realtime Inspector Test

**Dashboard:** [Project URL obscured]

1. **Realtime → Inspector**
   - Channel: `m1_agents_presence_v1`
   - Role: `anon`
   - Action: Join channel

**Result:**
- [ ] ✅ Status: `SUBSCRIBED` (green)
- [ ] ❌ Status: `joining` or `TIMED_OUT` → **REALTIME CONFIG ISSUE**

**Event Log:**
```
[Timestamp] JOIN channel
[Timestamp] SUBSCRIBED
[Timestamp] presence_diff (join: {...})
```

2. **Multi-Client Test**
   - Open second browser/tab
   - Join same channel
   - Observe `presence_diff` events

**Result:**
- [ ] ✅ Both clients receive presence_diff < 1s
- [ ] ❌ Events delayed/missing → **REALTIME LATENCY/TIMEOUT**

### Realtime Settings

- [ ] ✅ Allow public access: `ON`
- [ ] ✅ Max concurrent clients: ≥ 2000
- [ ] ✅ Max events/sec: ≥ 100
- [ ] ✅ Broadcast enabled
- [ ] ✅ Presence enabled

### Project Endpoint Verification

**Frontend ENV:**
```
VITE_SUPABASE_URL: [Obscured, e.g., https://*****.supabase.co]
```

**Dashboard Project URL:** [Match confirmed: YES / NO]

**Result:**
- [ ] ✅ Single project endpoint (frontend = dashboard)
- [ ] ❌ Mismatch detected → **WRONG PROJECT REFERENCED**

### Realtime Logs (if accessible)

**Timeframe:** [Date/Time of testing]

**Search for:**
- Disconnects
- TIMED_OUT errors
- Rate limit warnings
- Channel `m1_agents_presence_v1` specific errors

**Findings:** [Paste relevant log excerpts or "No errors found"]

---

## 🎯 ROOT CAUSE DETERMINATION

Based on the above evidence, the PRIMARY root cause is:

**[ ] VERSION SKEW** (BUILD_ID varies across refreshes)
- **Evidence:** BUILD_ID changes in [X]/5 runs
- **Impact:** Different builds serve different features/assets
- **Recommendation:** Implement BUILD_ID UI overlay + cache versioning

**[ ] SERVICE WORKER CACHE POLLUTION** (stale chunks)
- **Evidence:** Cache names static (`m1ssion-v2`), not tied to BUILD_ID
- **Impact:** Old JS chunks served despite new deployment
- **Recommendation:** Dynamic SW cache versioning with BUILD_ID

**[ ] ENV MISMATCH** (Preview vs Prod)
- **Evidence:** Feature flags differ between runs
- **Impact:** Inconsistent feature availability
- **Recommendation:** Verify ENV vars deployed to both environments

**[ ] REALTIME PRESENCE ISSUE** (backend)
- **Evidence:** Presence state stuck at `joining` or `TIMED_OUT`
- **Impact:** Agents never subscribe, markers never render
- **Recommendation:** Check Supabase Realtime settings + logs

**[ ] GEOLOCATION FAILURE** (coords unavailable)
- **Evidence:** `window.__M1_DEBUG.geo.source` = null or error
- **Impact:** Presence tracked without coords, marker not rendered
- **Recommendation:** Debug GPS permission + IP-Geo fallback

**[ ] OTHER:** [Describe]

---

## ✅ RECOMMENDED ACTIONS (In Priority Order)

### 🔴 CRITICAL (If version skew confirmed)

1. **Implement BUILD_ID UI Overlay (Dev-Only)**
   - File: `src/main.tsx`
   - Add BUILD_ID to `window.__M1_DEBUG`
   - Show BUILD_ID in bottom-right corner (dev mode only)

2. **Dynamic SW Cache Versioning**
   - File: `public/sw.js`
   - Replace `CACHE_NAME = 'm1ssion-v2'` with `m1ssion-${BUILD_ID}`
   - Inject BUILD_ID at build time via Vite plugin

3. **Cache Cleanup on Activation**
   - File: `public/sw.js`
   - Delete all caches not matching current BUILD_ID
   - Force `skipWaiting()` and `clients.claim()`

### 🟡 HIGH (If cache pollution confirmed)

4. **Clear Stale Caches**
   - DevTools → Application → Cache Storage → Delete `m1ssion-v1`, old `v2`
   - Script: Auto-cleanup on SW activation

5. **Verify ENV Consistency**
   - Compare `.env` in Preview vs Prod deployment
   - Ensure `VITE_*` vars match expected values

### 🟢 MEDIUM (If Realtime/Geo issues)

6. **Supabase Realtime Audit**
   - Dashboard → Realtime → Verify `Allow public access: ON`
   - Inspector → Test `m1_agents_presence_v1` join/diff

7. **Geolocation Debug**
   - Check GPS permission state
   - Verify IP-Geo fallback triggers
   - Test on device with GPS disabled

---

## 📸 EVIDENCE ATTACHMENTS

**Screenshots Required:**

1. **Console Output (All 5 Runs)**
   - [ ] Run #1 full diagnostic output
   - [ ] Run #2 full diagnostic output
   - [ ] Run #3 full diagnostic output
   - [ ] Run #4 full diagnostic output
   - [ ] Run #5 full diagnostic output

2. **DevTools Application Tab**
   - [ ] Service Workers (all registrations)
   - [ ] Cache Storage (all cache names)
   - [ ] Session Storage (any relevant keys)

3. **DevTools Network Tab**
   - [ ] JS filter: "living" (chunk hashes visible)
   - [ ] WebSocket (Supabase Realtime connection)
   - [ ] Any 404 errors on chunks

4. **Map UI**
   - [ ] AGENTS toggle ON (markers visible)
   - [ ] AGENTS toggle OFF (markers hidden)
   - [ ] Weather overlay visible
   - [ ] Living Map HUD visible

5. **Supabase Dashboard**
   - [ ] Realtime → Inspector (SUBSCRIBED status)
   - [ ] Realtime → Settings (Allow public access)
   - [ ] Project Settings → API (endpoint URL)

**File Attachments:**
- [ ] `window.__M1_DIAGNOSTIC_RESULTS` JSON export (all 5 runs)
- [ ] Console logs saved as .txt
- [ ] Network HAR file (if requested)

---

## 📝 NOTES & OBSERVATIONS

[Insert any additional observations, edge cases, or contextual information]

---

## ✍️ SIGN-OFF

**Tested By:** [Name]  
**Date:** [Date]  
**Approved By:** [Owner/Lead]  
**Status:** ✅ Audit Complete / ⏳ Awaiting Approval / 🔄 Re-test Required

---

**Report Template Version:** 1.0  
**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
