# iOS Infinite Loading — Fix Report

**App:** M1SSION™ — iOS native wrapped (Capacitor / WKWebView)  
**Branch:** `hotfix/ios-infinite-loading-20260227`  
**Date:** 2026-02-27  
**Scope:** Boot/login/render only. No PWA/TWA, no unrelated features.

---

## 1) Summary

The app was stuck on “Verifica accesso…” (infinite loading) on iOS because the protected-route gate never received `isLoading: false` from `useAccessControl` when the `profiles` query failed or returned no rows (PGRST116). The fix: use `.maybeSingle()` instead of `.single()`, and on error or missing profile always set state with `isLoading: false` and a safe fallback (e.g. `canAccess: true`, `subscriptionPlan: 'free'`), plus a `finally` and handling of the “no user” path so loading is never left true.

---

## 2) Root cause (file + line + log)

| Item | Detail |
|------|--------|
| **Symptom** | UI stuck on “Verifica accesso…” (spinner), never renders home. |
| **Gate** | `src/components/auth/WouterProtectedRoute.tsx` — shows that screen when `accessLoading === true` (line 89–91). |
| **Source of `accessLoading`** | `useAccessControl()` in `src/hooks/useAccessControl.ts` — `isLoading` in state. |
| **Bug** | In `useAccessControl.ts`, the Supabase query used `.single()`. When the user had **0 rows** in `profiles` (or any error), Supabase returned **PGRST116** (“JSON object requested, multiple (or no) rows returned”). On `fetchError`, the code did `console.error` and **`return`** without ever calling `setState`, so `isLoading` stayed `true` and the gate never advanced. |
| **Log evidence** | `Error fetching profile: {"code":"PGRST116","message":"JSON object requested, multiple (or no) rows returned"}` — matches this path. |
| **File / line (pre-fix)** | `src/hooks/useAccessControl.ts`: query with `.single()` and `if (fetchError) { console.error(...); return; }` with no `setState`. |

**Boot chain (concise):**  
`main.tsx` → App → router → `WouterProtectedRoute` → `useUnifiedAuth()` + `useAccessControl()`. Gate shows “Verifica accesso…” while `authLoading` or `accessLoading`. When `useAccessControl`’s profile fetch failed or returned 0 rows, it never set `isLoading: false`, so `accessLoading` stayed true indefinitely.

**Production readiness:** `ProductionSafety.tsx` only logs a warning and always renders `children`; it does **not** block render. No change made there.

---

## 3) Patch applied (scope: boot gate only)

**Single file changed:** `src/hooks/useAccessControl.ts`

- **Query:** `.single()` → `.maybeSingle()` so 0 rows yield `data: null` instead of PGRST116.
- **On fetch error:** Instead of `return` after `console.error`, call `setState` with `isLoading: false` and safe fallback: `canAccess: true`, `subscriptionPlan: 'free'`, `status: 'active'`, etc.
- **On missing profile (`!userProfile`):** Same safe fallback, `isLoading: false`, so app renders (e.g. free plan) instead of hanging.
- **No user in async:** When `getCurrentUser()` is null inside `checkAccess`, set `isLoading: false` before return.
- **Finally:** `setState(prev => prev.isLoading ? { ...prev, isLoading: false } : prev)` so any code path that leaves loading true is corrected.

No changes to maps, buzz, payments, or other features. No changes to `useHierarchyRank` (PGRST116 there does not control the gate; the gate only depends on `useAccessControl` and `useUnifiedAuth`).

---

## 4) Test (iPhone post-fix)

To be run on device/simulator (iOS wrapped):

1. **Happy path:** Open app → within 3–5 s either home or login is visible; no infinite “Verifica accesso…”.
2. **User with no profile row (0 rows):** App should still render (fallback free access), not spinner.
3. **Logs:** PGRST116 may still appear in other hooks (e.g. HierarchyRank); they must not block the boot gate. “Error fetching profile” may still log once; loading must still clear.
4. **Regression:** Login / FaceID / normal navigation unchanged; only boot gate behavior was fixed.

---

## 5) Rollback

| Item | Value |
|------|--------|
| **Branch** | `hotfix/ios-infinite-loading-20260227` |
| **Tag** | `rollback/ios-infinite-loading/20260227_060130` |
| **Commit (pre-patch)** | `5de45f24f0c2da03a6c23142945ef41a18fc2cef` |

To rollback:  
`git checkout rollback/ios-infinite-loading/20260227_060130 -- src/hooks/useAccessControl.ts`  
(or restore that file from the tag and commit).

---

**Hard stop respected:** Only boot/login/render and the single file in scope were modified. “Verifica accesso…” was located in `WouterProtectedRoute.tsx`; root cause was in `useAccessControl.ts`, which drives `accessLoading` for that gate.
