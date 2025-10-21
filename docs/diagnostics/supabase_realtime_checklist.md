# 🔍 SUPABASE REALTIME PRESENCE AUDIT CHECKLIST

**Project:** M1SSION™  
**Channel:** `m1_agents_presence_v1`  
**Date:** [INSERT_DATE]  
**Audited By:** [INSERT_NAME]

---

## 🎯 OBJECTIVE

Verify Supabase Realtime Presence stability and confirm single project endpoint usage.

**Safety Clause:**
- ✅ Read-only audit (no schema/RLS/key changes)
- ✅ No channel renaming
- ✅ No service role key rotation
- ✅ Report findings only, propose fixes separately

---

## 1️⃣ PROJECT ENDPOINT VERIFICATION

### 1.1 Dashboard Project Settings

**Steps:**
1. Navigate to: **Project Settings → API**
2. Locate **Project URL** (do NOT copy full URL here, just last 6 chars)

**Project URL (last 6 chars):** [e.g., `...zxof`]  
**Project ID:** [Obscure most, e.g., `vkjrq...zxof`]

### 1.2 Frontend Environment Variables

**Check deployed ENV:**
```bash
# If you have CLI access to deployment
echo $VITE_SUPABASE_URL
```

**OR from browser console (on /map page):**
```javascript
// DO NOT LOG FULL URL IN SCREENSHOTS - just verify match
const frontendUrl = import.meta.env.VITE_SUPABASE_URL;
const lastSix = frontendUrl?.slice(-6);
console.log('Frontend Supabase (last 6):', lastSix);
```

**Frontend URL (last 6 chars):** [e.g., `...zxof`]

### 1.3 Verification

- [ ] ✅ Dashboard URL last 6 chars **MATCH** frontend ENV
- [ ] ❌ Mismatch detected → **WRONG PROJECT ENDPOINT**

**If mismatch:**
- Preview endpoint: [last 6]
- Production endpoint: [last 6]
- Dashboard endpoint: [last 6]

**Recommendation:** Update ENV vars to point to correct project.

---

## 2️⃣ REALTIME CONFIGURATION

### 2.1 Realtime Settings Page

**Steps:**
1. Navigate to: **Realtime → Settings**

**Settings Verification:**

| Setting | Expected | Actual | Status |
|---------|----------|--------|--------|
| Allow public access | ON | [ON/OFF] | [✅/❌] |
| Max concurrent clients | ≥ 2000 | [VALUE] | [✅/❌] |
| Max events per second | ≥ 100 | [VALUE] | [✅/❌] |
| Broadcast enabled | YES | [YES/NO] | [✅/❌] |
| Presence enabled | YES | [YES/NO] | [✅/❌] |

**Screenshot Required:** Realtime Settings page (with sensitive values obscured)

**Issues Found:**
- [ ] No issues
- [ ] Allow public access is OFF → **CRITICAL: Turn ON**
- [ ] Max clients too low → **Increase to 2000+**
- [ ] Presence disabled → **CRITICAL: Enable Presence**

---

## 2️⃣.2 CORS / Allowed Origins (if available)

**Steps:**
1. Check if Realtime has any domain whitelist/restriction
2. Verify your frontend domain is allowed

**Allowed Origins:** [List domains or "No restrictions"]

**Frontend Domain:** [e.g., `2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com`]

- [ ] ✅ Frontend domain in allowed list (or no restrictions)
- [ ] ❌ Frontend domain not allowed → **ADD TO WHITELIST**

---

## 3️⃣ REALTIME INSPECTOR TEST

### 3.1 Single Client Join

**Steps:**
1. Navigate to: **Realtime → Inspector**
2. Channel name: `m1_agents_presence_v1`
3. Select role: `anon`
4. Click **Join Channel**

**Result:**

- [ ] ✅ Status: `SUBSCRIBED` (green badge)
- [ ] ⏳ Status: `joining` (stuck, not progressing)
- [ ] ❌ Status: `TIMED_OUT` or error message

**Time to SUBSCRIBED:** [e.g., "< 500ms" or "Never subscribed"]

**Screenshot Required:** Inspector showing SUBSCRIBED status

**Event Log (first 5 events):**
```
[Timestamp] event_type: payload
[Timestamp] event_type: payload
...
```

**If stuck at `joining`:**
- [ ] Check Realtime service health (Dashboard → Project Health)
- [ ] Check if project has billing issues (free tier limits)
- [ ] Check if WebSocket connection is blocked (firewall/proxy)

---

### 3.2 Multi-Client Presence Test

**Steps:**
1. Keep Inspector tab open (Client A)
2. Open **second browser** (or incognito tab) (Client B)
3. Navigate to actual app /map page
4. In Inspector (Client A), watch for `presence_diff` events

**Expected Flow:**
```
Client B joins → Inspector sees: presence_diff (join)
Client B leaves → Inspector sees: presence_diff (leave)
```

**Client B Agent Code:** [e.g., "AG-X0197"]

**Events Received in Inspector:**

| Event # | Timestamp | Event Type | Payload Summary | Latency |
|---------|-----------|------------|-----------------|---------|
| 1 | [TIME] | `presence_diff` | join: AG-X0197 | [< 1s / > 1s] |
| 2 | [TIME] | `presence_diff` | leave: AG-X0197 | [< 1s / > 1s] |

**Result:**

- [ ] ✅ `presence_diff` (join) received in < 1s
- [ ] ✅ `presence_diff` (leave) received in < 1s
- [ ] ⏳ Events delayed > 1s → **REALTIME LATENCY ISSUE**
- [ ] ❌ No events received → **PRESENCE NOT WORKING**

**Screenshot Required:** Inspector event log showing presence_diff

---

### 3.3 Presence State Sync

**Steps:**
1. With both clients connected (Inspector + /map page)
2. In Inspector, click **Show presence state**
3. Verify Client B's agent appears in state

**Presence State (from Inspector):**
```json
{
  "agent-AG-X0197-uuid": {
    "presence_ref": "...",
    "agent_code": "AG-X0197",
    "lat": 43.xxx,
    "lng": 7.xxx,
    "online_at": "2025-01-21T..."
  }
}
```

**Verification:**

- [ ] ✅ Client B agent appears in presence state
- [ ] ✅ Agent has `lat` and `lng` fields (coords present)
- [ ] ❌ Agent missing from state → **TRACK NOT RECEIVED**
- [ ] ⚠️ Agent present but no coords → **COORDS NOT TRACKED**

---

## 4️⃣ REALTIME LOGS ANALYSIS

### 4.1 Access Realtime Logs

**Steps:**
1. Navigate to: **Logs → Realtime Logs** (if available)
2. Set timeframe: [Date/Time of testing]
3. Search for: `m1_agents_presence_v1`

**If logs not available:** Note "Realtime logs not accessible in current plan"

### 4.2 Error Pattern Search

**Search Queries:**

| Query | Count | Sample Error |
|-------|-------|--------------|
| `TIMED_OUT` | [N] | [Paste sample or "None"] |
| `disconnect` | [N] | [Paste sample or "None"] |
| `rate_limit` | [N] | [Paste sample or "None"] |
| `m1_agents_presence_v1` | [N] | [Paste sample or "None"] |
| `error` | [N] | [Paste sample or "None"] |

**Findings:**

- [ ] ✅ No errors in timeframe
- [ ] ⚠️ Intermittent disconnects (< 5 in 1 hour)
- [ ] ❌ Frequent TIMED_OUT errors (> 10 in 1 hour) → **REALTIME UNSTABLE**
- [ ] ❌ Rate limit warnings → **TOO MANY EVENTS, THROTTLE NEEDED**

**Most Recent Error (if any):**
```
[Timestamp] [Severity] [Message]
```

---

## 5️⃣ CONNECTION STABILITY TEST

### 5.1 Long-Duration Connection

**Steps:**
1. Join channel `m1_agents_presence_v1` in Inspector
2. Keep tab open for **10 minutes**
3. Observe connection status and events

**Timeline:**

| Elapsed Time | Status | Events Received | Notes |
|--------------|--------|-----------------|-------|
| 0:00 | SUBSCRIBED | - | Initial join |
| 2:00 | [STATUS] | [N] | [Any issues?] |
| 5:00 | [STATUS] | [N] | [Any issues?] |
| 10:00 | [STATUS] | [N] | [Any issues?] |

**Result:**

- [ ] ✅ Connection stable for 10 minutes (SUBSCRIBED throughout)
- [ ] ⏳ Connection dropped and reconnected (count: [N] times)
- [ ] ❌ Connection lost and did not recover → **HEARTBEAT FAILURE**

---

### 5.2 Tab Suspend/Resume Test (Browser-Specific)

**Steps:**
1. Join channel in Inspector
2. Switch to another tab for 2 minutes (let browser suspend Realtime)
3. Switch back to Inspector tab
4. Check if connection auto-recovers

**Result:**

- [ ] ✅ Connection auto-recovered (SUBSCRIBED within 5s)
- [ ] ⏳ Slow recovery (> 5s but < 30s)
- [ ] ❌ Connection did not recover → **REQUIRES MANUAL RECONNECT**

**Notes:** [Describe behavior]

---

## 6️⃣ JWT / AUTH TOKEN VERIFICATION

### 6.1 Anon Key Validity

**Steps:**
1. Navigate to: **Project Settings → API**
2. Check **Anon (public) key** expiration (if shown)

**Anon Key:**
- Prefix: `eyJhbGc...` (JWT format)
- Expiration: [Date or "No expiration"]
- Status: [Valid / Expired / Rotating]

**Verification:**

- [ ] ✅ Anon key valid and not expiring soon
- [ ] ⚠️ Key expiring within 7 days → **PLAN ROTATION**
- [ ] ❌ Key expired → **CRITICAL: ROTATE IMMEDIATELY**

---

### 6.2 Service Role Key (if used for Presence)

**Important:** Presence should use `anon` role, NOT service role.

**Check Frontend Code:**
```typescript
// In agentsPresence.ts or similar
const channel = supabase.channel('m1_agents_presence_v1', {
  // Should NOT have: config: { broadcast: { ack: true, self: true } }
  // Should NOT pass service_role token
});
```

**Verification:**

- [ ] ✅ Presence uses `anon` role (correct)
- [ ] ❌ Presence uses `service_role` → **SECURITY RISK, CHANGE TO ANON**

---

## 7️⃣ WEBSOCKET CONNECTION TEST

### 7.1 Browser DevTools Network Tab

**Steps:**
1. Open /map page
2. Open DevTools → Network tab
3. Filter: `WS` (WebSockets)
4. Look for Supabase Realtime connection

**WebSocket Connection:**

| Property | Value |
|----------|-------|
| URL | wss://[project].supabase.co/realtime/v1/websocket |
| Status | [101 Switching Protocols / Failed] |
| Messages Sent | [N] |
| Messages Received | [N] |
| Duration | [Open for X seconds] |

**Screenshot Required:** Network tab showing WebSocket connection

**Result:**

- [ ] ✅ WebSocket connected (101 Switching Protocols)
- [ ] ❌ WebSocket failed (4xx/5xx error) → **CONNECTION BLOCKED**

**If failed, check error message:**
```
[Error Code] [Error Message]
```

---

### 7.2 WebSocket Message Inspection

**Steps:**
1. Click on WebSocket connection in Network tab
2. Go to **Messages** sub-tab
3. Observe `phx_join`, `presence_state`, `presence_diff`

**Expected Message Flow:**
```
→ phx_join (channel: m1_agents_presence_v1)
← phx_reply (status: ok)
→ presence (track payload)
← presence_state (initial state)
← presence_diff (as other clients join/leave)
```

**Messages Observed:**

| Direction | Type | Payload Summary | Timestamp |
|-----------|------|-----------------|-----------|
| → | phx_join | m1_agents_presence_v1 | [TIME] |
| ← | phx_reply | status: ok | [TIME] |
| → | presence | track: {...} | [TIME] |
| ← | presence_state | joins: {...} | [TIME] |

**Result:**

- [ ] ✅ All expected messages present
- [ ] ⏳ `phx_reply` delayed > 1s → **LATENCY**
- [ ] ❌ No `phx_reply` → **JOIN FAILED**
- [ ] ❌ No `presence_state` → **PRESENCE NOT INITIALIZED**

---

## 8️⃣ TIMEOUT CONFIGURATION

### 8.1 Channel Timeout Settings (Client-Side)

**Check Frontend Code:**
```typescript
// In agentsPresence.ts
const channel = supabase.channel('m1_agents_presence_v1', {
  config: {
    presence: {
      key: agentCode // or similar
    }
  }
});

// Default timeout: 10,000ms (10s)
// Custom timeout (if set): channel.timeout = [N]ms
```

**Timeout Value:** [Default 10s / Custom: [N]ms]

**Verification:**

- [ ] ✅ Using default 10s timeout (recommended)
- [ ] ⚠️ Custom timeout > 10s → May delay error detection
- [ ] ❌ Custom timeout < 5s → May cause premature timeouts

---

### 8.2 Heartbeat / Keep-Alive (Backend)

**Check Dashboard:**
- **Realtime → Settings** (if available)
- Look for "Heartbeat interval" or "Keep-alive timeout"

**Heartbeat Interval:** [N seconds or "Not configurable"]

**Verification:**

- [ ] ✅ Heartbeat enabled (connections stay alive)
- [ ] ❌ No heartbeat → **IDLE CONNECTIONS MAY TIMEOUT**

**Note:** If not configurable, default Supabase behavior is ~30s heartbeat.

---

## 9️⃣ RATE LIMITING & QUOTAS

### 9.1 Project Tier & Limits

**Steps:**
1. Navigate to: **Project Settings → Billing**
2. Check current plan and quotas

**Plan:** [Free / Pro / Team / Enterprise]

**Quotas:**

| Resource | Limit | Current Usage | Status |
|----------|-------|---------------|--------|
| Realtime connections | [N] | [N] | [✅ / ⚠️ / ❌] |
| Realtime messages/month | [N] | [N] | [✅ / ⚠️ / ❌] |
| Database bandwidth | [N GB] | [N GB] | [✅ / ⚠️ / ❌] |

**Result:**

- [ ] ✅ All quotas within limits (< 80% usage)
- [ ] ⚠️ Approaching limits (80-95% usage) → **UPGRADE SOON**
- [ ] ❌ Quota exceeded → **CRITICAL: UPGRADE OR THROTTLE**

---

### 9.2 Presence Rate Limiting

**Check if Presence tracks are rate-limited:**

**From logs or monitoring:**
- Track attempts per second: [N/s]
- Expected rate: [Frontend sends ~1 track/30s per user]

**Verification:**

- [ ] ✅ Track rate reasonable (< 1/s per user)
- [ ] ⚠️ Track rate high (1-10/s per user) → **INEFFICIENT, OPTIMIZE**
- [ ] ❌ Track rate excessive (> 10/s per user) → **THROTTLE NEEDED**

**Recommendation:**
- Expected: 1 track every 30s (heartbeat)
- Max acceptable: 1 track every 3s (during active movement)

---

## 🔟 MULTIPLE PROJECT / ENDPOINT CHECK

### 10.1 Historical Endpoints

**Question:** Has this project ever used a different Supabase project URL?

- [ ] ✅ No, always used current project
- [ ] ⚠️ Yes, migrated from [old project last 6 chars]

**If migrated:**
- Migration date: [Date]
- Old ENV vars cleaned up: [Yes / No / Unknown]

**Check for hardcoded URLs in code:**
```bash
# Search codebase for hardcoded Supabase URLs
grep -r "supabase.co" src/ --include="*.ts" --include="*.tsx" --exclude="node_modules"
```

**Hardcoded URLs Found:** [None / List files]

**Verification:**

- [ ] ✅ No hardcoded URLs (all use import.meta.env.VITE_SUPABASE_URL)
- [ ] ❌ Hardcoded URLs found → **REPLACE WITH ENV VAR**

---

### 10.2 Browser Cache / LocalStorage Check

**Steps:**
1. Open /map page
2. DevTools → Application → Local Storage
3. Look for `sb-[project-id]-auth-token`

**Local Storage Keys:**
```
sb-vkjrq...zxof-auth-token: {...}
sb-[other-project]-auth-token: {...} (if any)
```

**Verification:**

- [ ] ✅ Only one `sb-*-auth-token` key present (current project)
- [ ] ⚠️ Multiple `sb-*` keys → **OLD PROJECT TOKENS CACHED**

**If multiple tokens:**
- Clear localStorage: `localStorage.clear()`
- Hard refresh
- Verify issue persists

---

## ✅ AUDIT SUMMARY

### Issues Found

**🔴 Critical Issues:**
1. [List critical issues or "None"]

**🟡 Warnings:**
1. [List warnings or "None"]

**🟢 Info/Observations:**
1. [List observations or "None"]

---

### Realtime Health Score

| Category | Score | Notes |
|----------|-------|-------|
| Configuration | [0-10] | [Allow public access, limits, etc.] |
| Connection Stability | [0-10] | [SUBSCRIBED rate, timeout frequency] |
| Presence Sync | [0-10] | [presence_diff latency, state accuracy] |
| Endpoint Consistency | [0-10] | [Single project, no hardcoded URLs] |
| Auth & Security | [0-10] | [Anon key valid, no service role misuse] |

**Overall Health:** [0-50] / 50

**Interpretation:**
- 45-50: ✅ Excellent (no action needed)
- 35-44: 🟡 Good (minor optimizations)
- 25-34: ⚠️ Fair (action recommended)
- 0-24: 🔴 Poor (urgent action required)

---

### Recommended Actions

**Immediate (Critical):**
1. [Action 1 or "None"]

**Short-term (Warnings):**
1. [Action 1 or "None"]

**Long-term (Optimizations):**
1. [Action 1 or "None"]

---

## 📸 EVIDENCE SCREENSHOTS

**Required Screenshots:**

1. **Realtime Settings**
   - [ ] Settings page (Allow public access, limits)

2. **Realtime Inspector**
   - [ ] Join channel → SUBSCRIBED status
   - [ ] Event log showing presence_diff

3. **Project Settings**
   - [ ] API page (Project URL last 6 chars visible)

4. **Network Tab**
   - [ ] WebSocket connection (101 status)
   - [ ] WS Messages (phx_join, presence_state)

5. **Console (from /map page)**
   - [ ] `import.meta.env.VITE_SUPABASE_URL` last 6 chars

---

## 📝 NOTES

[Insert any additional observations, edge cases, or context]

---

## ✍️ AUDITOR SIGN-OFF

**Audited By:** [Name]  
**Date:** [Date]  
**Status:** ✅ Realtime OK / ⚠️ Issues Found / 🔴 Critical Issues

**Next Steps:**
- [ ] Share findings with frontend team
- [ ] Propose fixes in separate document
- [ ] Schedule re-audit after fixes deployed

---

**Checklist Version:** 1.0  
**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
