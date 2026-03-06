# Daily Missions v1 — Server-Real Plan

**Target:** M1SSION™ · iOS Capacitor WKWebView  
**Scope:** Foundation (tables + Edge) + Vertical slice Idea 1 (Cipher Drill) + Clone pipeline Idea 2/3  
**Date:** 2026-03-03

---

## FASE 0 — Forensics & Risk (READ-ONLY)

### A) Economia M1U — Single source of truth

| Item | Finding |
|------|--------|
| **Table/column** | `public.profiles.m1_units` (INTEGER). Profiles row keyed by `profiles.id` = `auth.users.id`. |
| **RPC** | `public.admin_credit_m1u(p_user_id UUID, p_amount INTEGER, p_reason TEXT)` — SECURITY DEFINER, returns `{ success, old_balance, new_balance }`. Defined in `supabase/migrations/20251206_fix_admin_credit_m1u.sql`. |
| **Grants** | `REVOKE ALL FROM PUBLIC`; `GRANT EXECUTE TO service_role` only. Client/anon cannot call it. |
| **Where M1U is credited today** | (1) **IAP:** `credit-m1u-purchase` (Stripe) and `verify-iap-purchase` (Capgo/IAP) → both use RPC `admin_credit_m1u` or direct `profiles.m1_units` update with `user_m1_units_events` log. (2) **Welcome bonus:** `claim-welcome-bonus` → `admin_credit_m1u`. (3) **Marker rewards:** `claim-marker-reward` → `admin_credit_m1u`. (4) **Cashback:** `cashback-claim` → direct update `profiles.m1_units`. (5) **Daily missions (current):** `creditM1USafe()` → localStorage only (SAFE_MODE), no DB. |
| **Safe additive method for daily** | Use **Edge Function with service_role** calling `admin_credit_m1u(p_user_id, amount, 'daily_mission_phase1' | 'daily_mission_phase2')`. No change to IAP/BUZZ/Buzz Map logic. |

### B) Delete account chain

| Item | Finding |
|------|--------|
| **Current flow** | `delete-account-v2` Edge Function: validates JWT → `admin.auth.admin.deleteUser(userId)`. No explicit table cleanup in Edge. |
| **DB cleanup** | Relies on **FK ON DELETE** from `auth.users`. Tables that reference `auth.users(id)` must use `ON DELETE CASCADE` (or SET NULL where appropriate) so that deleting the user does not block. |
| **profiles** | `profiles.id` references `auth.users(id) ON DELETE CASCADE` (see `20251208_fix_user_delete_fk.sql`). So when user is deleted, profile row is deleted. |
| **New tables** | `daily_mission_runs` and `daily_mission_claims` will use `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`. No change to `delete-account-v2` code; CASCADE will remove runs/claims when user is deleted. **No risk of blocking delete.** |

### C) Daily mission attuale (client-side)

| File | Role |
|------|------|
| `src/missions/missionState.ts` | localStorage state: active_id, phase, day_key, phase1_completed_at, credited_phase1/2, progress_data, pending_rewards, briefing_shown. Keys: `m1_daily_missions_*`. |
| `src/missions/missionsRegistry.ts` | MISSIONS_REGISTRY, getMissionOfTheDay(), calculatePhaseRewards(), validateInput(). MISSIONS_REWARD_SAFE_MODE = true. |
| `src/missions/missionEngine.ts` | getEngineState(), handlePhase1Complete(), handlePhase2Complete() → creditM1USafe() + missionState writers. |
| `src/missions/rewards/creditM1U.ts` | creditM1USafe(): if SAFE_MODE → append to localStorage `m1_daily_missions_pending_credits`; LIVE_MODE not implemented. |
| **Where "credited" in localStorage** | `markPhase1Credited()` / `markPhase2Credited()` in missionState.ts set keys `m1_daily_missions_credited_phase1` / `credited_phase2`. Pending amounts in `m1_daily_missions_pending_credits` (array of { amount, reason, timestamp }). |
| **Migration strategy** | Add **feature flag** (e.g. `USE_DAILY_MISSION_SERVER` or keep mission_id-based: only for `cipher_drill_anagram_v1` use Edge; rest stay client until migrated). UI remains same; when server-real is used, call Edge for start/complete and sync state from server; fallback to existing localStorage flow for other missions. |

### D) i18n framework

| Item | Finding |
|------|--------|
| **Files** | `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json`. |
| **Usage** | `useTranslation()` from `react-i18next`, default namespace (no namespace passed = `translation`; typically keys from `common` if configured as default). `t('mission.popup.*')`, `t('daily_mission.*')` already used. |
| **New keys** | Add under `mission.popup` or new `daily_mission.cipher_drill` for Idea 1: title, CTA, timer label, success/fail copy, reward copy. EN/IT/FR for all. |

### E) Risk matrix (FROZEN — no touch)

| Area | Why patch will NOT touch it |
|------|-----------------------------|
| **Login/Logout** | No change to AuthProvider, auth context, or session. Edge uses Bearer token only to get user_id. |
| **Delete account** | No change to delete-account-v2. New tables use FK to auth.users ON DELETE CASCADE. |
| **IAP** | No change to iapService, verify-iap-purchase, credit-m1u-purchase. Daily uses same admin_credit_m1u RPC with distinct reason string. |
| **BUZZ** | No change to Buzz flow, BuzzActionButton, or buzz-related Edge. |
| **BUZZ MAP** | No change to Buzz Map logic or tables. |
| **Push** | No change to push registration or handlers. |
| **Mitigation** | Daily Mission server-real is isolated: new tables, new Edge Function, new/optional mission_id (cipher_drill_anagram_v1). Wiring only in mission engine/UI for that mission; existing missions can remain client-only. |

---

## FASE 1 — Foundation (Implementation summary)

- **Migrations:** `daily_mission_runs` (id, user_id, day_key, mission_id, phase, phase1_started_at, phase1_completed_at, phase2_started_at, phase2_completed_at, progress_json, status, created_at, updated_at). Unique (user_id, day_key, mission_id). RLS: owner read/write.
- **Migrations:** `daily_mission_claims` (id, user_id, day_key, mission_id, phase, amount_m1u, idempotency_key UNIQUE, claimed_at). RLS: owner read; insert only via Edge (service_role).
- **Edge Function `claim-daily-phase`:** Input: action (start_phase1 | complete_phase1 | start_phase2 | complete_phase2), mission_id, payload, client_day_hint (optional). Server computes day_key (UTC). Idempotent claim via idempotency_key; M1U via admin_credit_m1u. Response: ok, phase, status, reward_awarded, amount, result (win/fail), next_available_at.

---

## FASE 2 — Vertical slice Idea 1 (Cipher Drill)

- **Mission ID:** `cipher_drill_anagram_v1`.
- **Phase 1:** Full-screen modal, anagram from server (seed), timer 60s → "OK, ho memorizzato" → Edge complete_phase1.
- **Phase 2 (next day):** Input answer → Edge complete_phase2 → server validates → win/fail animation, real M1U if win.
- **i18n:** All strings EN/IT/FR; no hardcoded copy.
- **Animations:** Use existing (e.g. Framer Motion) in project.

---

## FASE 3 — Clone pipeline (Idea 2 & 3)

- **progress_json** schema supports: mission_type, phase1_payload, phase2_validation, attempts, max_attempts.
- Edge switch on mission_id: `truth_filter_words_v1`, `signal_pattern_numbers_v1` → return NOT_IMPLEMENTED_YET (safe).

---

## Test log (to be updated after implementation)

### Smoke FROZEN
- [ ] Login/Logout OK
- [ ] Delete account OK (new tables do not block)
- [ ] IAP OK
- [ ] BUZZ OK
- [ ] BUZZ MAP OK
- [ ] Push native OK

### Daily Mission (Cipher Drill server-real)
- [ ] Phase 1: timer 60s, completion calls Edge, state on server
- [ ] Phase 2 (next day or simulated): input, win/fail, real reward
- [ ] i18n EN/IT/FR

### Implemented (2026-03-03)
- Migration: `20260303110000_daily_mission_runs_claims.sql` (runs + claims, RLS, FK CASCADE)
- Edge: `claim-daily-phase` (start_phase1, complete_phase1, start_phase2, complete_phase2; cipher_drill_anagram_v1; stubs truth_filter_words_v1, signal_pattern_numbers_v1 → 501 NOT_IMPLEMENTED_YET)
- Registry: mission `cipher_drill_anagram_v1` added
- Client: `src/missions/serverReal/claimDailyPhase.ts`, `src/missions/ui/CipherDrillModal.tsx`
- DailyMissionContent: branches to CipherDrillModal when mission.id === cipher_drill_anagram_v1
- i18n: cipher_drill.* keys in en, it, fr

---

## Rollback

```bash
git checkout -b feat/daily-missions-server-real
git tag safety/daily-missions-prechange
# If needed:
git reset --hard safety/daily-missions-prechange
```
