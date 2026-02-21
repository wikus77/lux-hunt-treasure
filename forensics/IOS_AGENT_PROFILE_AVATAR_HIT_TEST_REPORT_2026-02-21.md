# iOS Agent Profile — Avatar Hit-Test + Edit Mode Text Report
**Date:** 2026-02-21  
**Branch:** `fix/ios-agent-profile-avatar-hit-test`  
**Rollback tag:** `safety/ios-agent-profile-avatar-hit-test-before-20260221_120000`

---

## 1. Executive summary

- **Screen:** AGENT PROFILE (modal/pagina edit profilo) — uses **ProfileInfo** (avatar + camera) inside AgentProfileSettings page and AgentProfileSectionContent modal.
- **Symptom 1:** Tap on camera icon opens picker intermittently (e.g. 1/10).
- **Symptom 2:** In edit mode, all text/labels/inputs appear grey and hard to read.
- **Root causes (UI):** (1) Subscription ring overlay and Avatar had no `pointer-events-none`, so they could capture taps before the camera button; camera button had no z-index and a small touch target (< 44px). (2) Edit-mode inputs used shadcn default `placeholder:text-muted-foreground` and no explicit `text-white`, so text looked grey.
- **Fixes applied (scope-locked to ProfileInfo):** Ring + Avatar `pointer-events-none`; camera button `z-[9999]`, `pointer-events-auto`, 44×44px hit area, sync `input.click()`; edit-mode Input/Textarea `text-white` + `placeholder:text-white/50` + border/focus overrides.

---

## 2. Phase 0 — Rollback

- **Branch:** `fix/ios-agent-profile-avatar-hit-test`
- **Tag:** `safety/ios-agent-profile-avatar-hit-test-before-20260221_120000`

**Rollback commands:**
```bash
# Option A: reset to state before this fix
git fetch --tags
git checkout fix/ios-agent-profile-avatar-hit-test
git reset --hard safety/ios-agent-profile-avatar-hit-test-before-20260221_120000

# Option B: revert a specific commit (after fix is merged)
git revert <commit-hash> -m 1

# Option C: restore only the modified file from tag
git checkout safety/ios-agent-profile-avatar-hit-test-before-20260221_120000 -- src/components/profile/ProfileInfo.tsx
```

---

## 3. Phase 1 — Forensics (ROOT CAUSE UI)

### 3.1 Component that renders avatar + camera + edit mode

- **Component:** `src/components/profile/ProfileInfo.tsx`
- **Used in:** AgentProfileSettings page, Profile.tsx page, AgentProfileSectionContent modal (AGENT PROFILE).
- **Avatar circle:** `<Avatar>` with `relative z-10`, contains AvatarImage + AvatarFallback.
- **Overlay camera button:** `<div>` with `absolute bottom-0 right-0`, `p-1.5`, Camera icon `w-3 h-3`.
- **Edit mode:** When `isEditing === true`, ProfileInfo shows `<Input>` and `<Textarea>` for name, agentCode, agentTitle, bio.

### 3.2 Layer / hit-test table

| Layer | Element | z-index (before) | pointer-events (before) | Note |
|-------|--------|-------------------|--------------------------|------|
| Subscription ring | `div.absolute.inset-0` | (none) | auto | Full circle overlay; could capture tap before camera. |
| Avatar | `Avatar` | z-10 | auto | Covers center; camera is bottom-right but ring covers same area. |
| Camera button | `div` (camera) | (none) | auto | Sibling after Avatar; small touch target (~p-1.5 + icon). |
| File input | `input` offscreen | — | — | Ref-based click; no hit area. |

**Root cause hit-test:** The subscription ring is `absolute inset-0` and sits in the same stacking context; it has no `pointer-events-none`, so on iOS WKWebView it could receive the tap instead of the camera button. The camera button had no explicit z-index and a touch target smaller than 44px (iOS HIG).

### 3.3 Edit mode — why text looked grey

| Source | Class / behavior | Effect |
|--------|------------------|--------|
| shadcn Input | `placeholder:text-muted-foreground` (input.tsx) | Placeholder grey. |
| shadcn Input | (no explicit text color in dark context) | Value text can inherit muted. |
| shadcn Textarea | `placeholder:text-muted-foreground`, `disabled:opacity-50` (textarea.tsx) | Same. |
| ProfileInfo edit fields | Only `bg-black/30` | No override for text/placeholder. |

**Root cause edit mode:** Edit-mode inputs/textarea in ProfileInfo did not override theme; they relied on default `text-foreground` / `placeholder:text-muted-foreground`, which in the Agent Profile glass context appeared grey and low contrast.

### 3.4 Hit-test logs added

- **Location:** ProfileInfo.tsx — camera button `onClick`.
- **Log:** `[AvatarHitTest] camera pressed` (when user taps camera).
- No wrapper click log added (optional); only camera to confirm tap is received.

---

## 4. Phase 2 — Fix 1: Camera button always clickable (iOS safe)

Applied **only** in `ProfileInfo.tsx`:

1. **Subscription ring:** Added `pointer-events-none` so it does not capture taps.
2. **Avatar:** Added `pointer-events-none` so taps on the avatar area can pass to the camera button when overlapping; camera remains the only interactive element on the avatar block.
3. **Camera button:**
   - `z-[9999]` so it is on top.
   - `pointer-events-auto` (explicit).
   - Hit area ≥ 44px: `min-h-[44px] min-w-[44px] flex items-center justify-center` (icon kept readable, e.g. `h-4 w-4`).
   - No `await` before `input.click()`; click remains synchronous in the button’s `onClick`.
4. **Log:** `[AvatarHitTest] camera pressed` on click.

---

## 5. Phase 3 — Fix 2: Edit mode text readable

Applied **only** in `ProfileInfo.tsx` for the edit-mode block:

1. **Input (name, agentCode, agentTitle):**  
   `text-white placeholder:text-white/50 border-white/20 focus-visible:ring-cyan-500` in addition to existing `bg-black/30`, `h-10`, etc.
2. **Textarea (bio):**  
   `text-white placeholder:text-white/50 border-white/20 focus-visible:ring-cyan-500` in addition to existing `bg-black/30`.
3. No global palette change; only local overrides for Agent Profile edit mode.

---

## 6. Phase 4 — Build & test

```bash
npm run build
npx cap sync ios
```

**Checklist (device) — PASS/FAIL:**

| Test | Expected | PASS/FAIL |
|------|----------|-----------|
| A) Tap camera 20× | Picker opens 20/20 | ___ |
| B) Edit mode text | All labels/inputs/placeholder white, readable | ___ |
| C) Other pages | No regression (Buzz/Map/Auth/IAP) | ___ |

**Log:** Xcode console → filter `[AvatarHitTest]` → “camera pressed” on each camera tap.

---

## 7. Files modified

- **Only:** `src/components/profile/ProfileInfo.tsx`  
  (subscription ring + Avatar pointer-events; camera z-index, size, log; edit-mode Input/Textarea text and placeholder).

No changes to: iOS wrapper, entitlements, Capacitor config, global layout/header, or other components.
