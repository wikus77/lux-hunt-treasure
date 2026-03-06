# Phase 1 — Forensic Report: Apple Review Blockers

## A) Auth/Token consumers (bootstrap)

| File | Line | Call | Mount | Bootstrap risk |
|------|------|------|--------|----------------|
| AuthProvider.tsx | 127, 338, 396 | getSessionSingleFlight | useEffect([]), visibility, FaceID | HIGH (first consumer) |
| use-auth-session-manager.ts | 187 | getSessionSingleFlight | useEffect([]) | HIGH (parallel init) |
| useProfileRealtime.ts | 29, 106 | getSessionSingleFlight | useEffect([]) | HIGH |
| useM1UnitsRealtime.ts | - | uses userId, .from('profiles') + channel | useEffect([userId]) | HIGH |
| useActiveMissionEnrollment.ts | - | checkEnrollment + channel | useEffect([user]) | HIGH |
| useAgentEnergy.ts | - | .from('profiles') + channel | useEffect([user]) | HIGH |
| useHierarchyRank.ts | - | .from('profiles') + channel | useEffect([user]) | HIGH |
| useBuzzMapPricingNew.ts | 23 | getSession() direct | calculateNextLevel | HIGH (isAcquireTimeout in log) |
| useBuzzGrants.ts, iapService, etc. | various | getSession/getUser | on demand or mount | MEDIUM |

## B) Realtime at boot (post-login)

- useProfileRealtime: profile_changes_${id}, no authReady gate.
- useM1UnitsRealtime: m1_units_user_${userId}, no authReady gate.
- useActiveMissionEnrollment: mission_enrollment_changes, gated by user only.
- useAgentEnergy: agent_energy channel, gated by user only.
- useHierarchyRank: hierarchy_rank_${user.id}, gated by user only.
- useBuzzMapPricingNew: subscribes when userId; calls getSession in calculateNextLevel.

## C) Timeline bootstrap (T0..T+5s)

- **T0:** React mount → AuthProvider effect → getSessionSingleFlight(); use-auth-session-manager effect → getSessionSingleFlight() (same promise).
- **T0+:** useProfileRealtime effect → getSessionSingleFlight() (same promise, but if first still in progress, wait). useM1UnitsRealtime, useActiveMissionEnrollment, useAgentEnergy, useHierarchyRank mount with user from context/session-manager; they fire fetch + channel as soon as user is truthy (may be before AuthProvider has set authHydrated).
- **T0+:** useBuzzMapPricingNew (DynamicIslandContextManager, etc.) runs calculateNextLevel → getSession() (direct, not single-flight in current code) → contention.
- **T+2s–10s:** Lock timeout if multiple getSession or token access in parallel → cascading errors (DNA, MicroMissions, XP, BattleDefense, UNHANDLED REJECTION).

## D) Top 3 files to patch for lock contention

1. **useProfileRealtime.ts** — Run subscription only when authReady (authHydrated) to avoid racing with AuthProvider init.
2. **useBuzzMapPricingNew.ts** — Use getSessionSingleFlight and gate calculateNextLevel / realtime on authReady; remove direct getSession.
3. **useM1UnitsRealtime.ts** / **useActiveMissionEnrollment.ts** / **useAgentEnergy.ts** / **useHierarchyRank.ts** — Gate fetch + channel on authReady so they start only after bootstrap session is settled.

## E) [PE] Exception: {} source

- **File:** `src/features/pulse/hooks/useAwardPE.ts`
- **Line:** 232
- **Code:** `console.error('[PE] ❌ Exception:', err);`
- **Cause:** `err` can be an empty object `{}` (e.g. from Supabase or network), so the log shows "Exception: {}".
- **Fix:** Log message, name, stack, cause, and a safe stringify of err so the log is actionable or can be silenced if non-critical.

---

## Phase 5 — Verification checklist (run on device)

| Test | PASS condition |
|------|----------------|
| 1 Cold start | No "lock:sb-…-auth-token timed out", no "isAcquireTimeout", no cascading DNA/MicroMissions/XP/HierarchyRank/useAgentEnergy errors in first 20s |
| 2 Login → Home | No lock errors; M1U, streak, mission load in reasonable time |
| 3 Buzz Map pricing | useBuzzMapPricingNew does not log lock timeout |
| 4 IAP sandbox | No "Transaction not found or already finished" error; credit/receipt flow unchanged |
| 5 [PE] | Either gone or logs stack/file; no continuous empty `{}` spam |

## Phase 6 — Rollback (1-command)

```bash
# Return to state before Apple Review Blockers patches
git reset --hard rollback/apple-review-blockers-20260303

# Optional: delete the fix branch
git branch -D fix/apple-review-blockers-lock-iap-pe
```

## Before vs after (expected)

| Blocker | Before | After (expected) |
|---------|--------|-------------------|
| Lock timeout (lock:sb-… timed out) | Multiple at boot | 0 |
| isAcquireTimeout: true | Cascading errors | 0 |
| IAP "Transaction not found or already finished" | Error log | Warn or 0 (treated as success) |
| [PE] Exception: {} | Empty object spam | Stack/cause or silent when non-critical |
