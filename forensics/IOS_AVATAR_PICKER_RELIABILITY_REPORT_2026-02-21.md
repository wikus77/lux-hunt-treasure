# iOS Avatar Picker Reliability — Forensics & Fix Report
**Date:** 2026-02-21  
**Branch:** `fix/ios-avatar-picker-reliability`  
**Rollback tag:** `safety/ios-avatar-picker-before-20260221_070000`

---

## 1. Executive summary

- **Symptom 1:** Camera/avatar button opens picker only ~1/10 times on iOS (WKWebView).
- **Symptom 2:** After selecting/capturing, avatar does not propagate to all UI zones.
- **Root causes (forensics):** (1) `ProfileInfo.tsx` used `document.getElementById('profile-image-input')` + global `id="profile-image-input"` + `className="hidden"`; when multiple instances of ProfileInfo are mounted (e.g. Settings + modal), duplicate IDs caused undefined behavior and iOS WKWebView is sensitive to programmatic clicks on hidden inputs. (2) Avatar propagation relied only on realtime/context; no immediate `localStorage` write or cache-bust in header.
- **Fixes applied (scope-locked):** Ref-based trigger and offscreen input in ProfileInfo; minimal debug logs; sync via `localStorage` + cache-bust in header; same patterns/logs in PersonalInfoPage and ProfilePage for consistency.

---

## 2. Phase 0 — Rollback

- **Branch:** `fix/ios-avatar-picker-reliability` (created from `fix/ios-avatar-upload-rls`).
- **Tag:** `safety/ios-avatar-picker-before-20260221_070000`.

**Rollback commands (if needed):**
```bash
# Option A: reset to state before this fix
git fetch --tags
git checkout fix/ios-avatar-picker-reliability
git reset --hard safety/ios-avatar-picker-before-20260221_070000

# Option B: revert a specific commit (after fix is merged)
git revert <commit-hash> -m 1

# Option C: restore only the modified files from tag
git checkout safety/ios-avatar-picker-before-20260221_070000 -- \
  src/components/profile/ProfileInfo.tsx \
  src/hooks/useProfileImage.ts \
  src/components/layout/UnifiedHeader.tsx \
  src/components/layout/ProfileLayout.tsx \
  src/pages/profile/PersonalInfoPage.tsx \
  src/pages/ProfilePage.tsx
```

---

## 3. Phase 1 — PICKER TRIGGER MAP

| File | Lines | Trigger | Input visibility | Duplicate ID risk | Overlay / pointer-events |
|------|--------|---------|-------------------|--------------------|---------------------------|
| **ProfileInfo.tsx** | 111–114 (camera), 118–170 (input) | **Before:** `document.getElementById('profile-image-input')?.click()` **After:** `profileImageInputRef.current?.click()` | **Before:** `className="hidden"` **After:** offscreen `opacity:0; position:absolute; 1px; left:-9999` | **Yes (before):** `id="profile-image-input"` — ProfileInfo used in AgentProfileSettings, Profile.tsx, AgentProfileSectionContent → multiple instances = duplicate IDs. **After:** no id, ref-only. | Camera overlay has `cursor-pointer`; input offscreen so no hit conflict. |
| **ProfilePage.tsx** | 251–255 (button), 258–298 (input) | `avatarFileInputRef.current?.click()` | `className="hidden"` | No (ref, single instance) | Button is visible; input hidden. |
| **PersonalInfoPage.tsx** | 220–224 (Button), 228–233 (input) | `fileInputRef.current?.click()` | `className="hidden"` | No (ref, single instance) | Button visible; input hidden. |

**Conclusion:** The only problematic trigger was **ProfileInfo**: getElementById + global id + hidden input. When more than one ProfileInfo was in the DOM, the first matching `#profile-image-input` received the click; timing and WKWebView “user gesture” rules made the behavior ~1/10. Fix: use a **ref** tied to the input in the same component, remove the id, and make the input offscreen instead of `display:none`/hidden.

---

## 4. Phase 2 — Debug logs added

All logs use the requested prefixes and are limited to the avatar flow.

| Location | Log line (example) |
|----------|---------------------|
| ProfileInfo.tsx — camera onClick | `[AvatarPicker] tap source=ProfileInfo ok` |
| ProfileInfo.tsx — camera onClick | `[AvatarPicker] inputFound=true/false` |
| ProfileInfo.tsx — after input.click() | `[AvatarPicker] inputClick fired` |
| ProfileInfo.tsx — input onChange | `[AvatarPicker] onChange files=<n> type=... size=...` |
| ProfileInfo.tsx — upload start | `[AvatarUpload] path=... start` |
| ProfileInfo.tsx — upload ok | `[AvatarUpload] ok url=...` |
| ProfileInfo.tsx — profile update | `[AvatarProfile] update start` / `[AvatarProfile] update ok` |
| ProfileInfo.tsx — after setProfileImage + localStorage | `[AvatarSync] storeUpdated avatar=...` |
| PersonalInfoPage.tsx | Same pattern: tap source=PersonalInfoPage, inputFound, inputClick fired, onChange, AvatarUpload, AvatarProfile, AvatarSync |
| ProfilePage.tsx | Same pattern: tap source=ProfilePage, inputFound, inputClick fired, onChange, AvatarUpload, AvatarProfile, AvatarSync |

---

## 5. Phase 3 — Fix 1: Trigger “iOS-proof” (ProfileInfo)

- **A)** Replaced `document.getElementById('profile-image-input')?.click()` with `profileImageInputRef.current?.click()` (ref defined in same component).
- **B)** Removed `id="profile-image-input"` to avoid duplicate IDs when multiple ProfileInfo instances exist.
- **C)** Replaced `className="hidden"` with offscreen styling: `style={{ opacity: 0, position: 'absolute', width: 1, height: 1, left: -9999, top: 0 }}` and `aria-hidden`.
- **D)** Click is synchronous: no `setTimeout`/`await` before `input.click()` inside the button’s `onClick`.
- **E)** No change to overlay/layout; only the camera button triggers the ref-based click.

---

## 6. Phase 4 — Fix 2: Avatar propagation + cache-bust

- **Propagation:** After a successful avatar update in ProfileInfo, PersonalInfoPage, and ProfilePage, `localStorage.setItem('profileImage', publicUrl)` is called so header/sidebar (useProfileImage/useLocalStorage) see the new value; realtime continues to update `profileData` and localStorage via useProfileRealtime/useGlobalProfileSync.
- **Cache-bust (UI only):** In `useProfileImage`, added `avatarDisplayUrl = profileImage ? profileImage + '?v=' + (realtimeProfile?.updated_at ?? '') : null`. UnifiedHeader and ProfileLayout use `avatarDisplayUrl` (or `avatarDisplayUrl ?? profileImage`) for the displayed avatar so WKWebView does not serve a stale cached image. Querystring is **not** stored in the DB.
- **ProfileInfo:** `AvatarImage` uses `key={profileImage ?? ''}` so the component remounts when the URL changes.

---

## 7. Phase 5 — Build & sync

Run:

```bash
npm run build
npx cap sync ios
```

**Checklist (device) — run after opening app in Xcode and attaching device:**

- [ ] **A)** Tap camera/avatar 20 times → picker opens 20/20 (no 1/10).
- [ ] **B)** Select image → `[AvatarPicker] onChange` always; then `[AvatarUpload] ok`, `[AvatarProfile] update ok`, `[AvatarSync] storeUpdated` in console.
- [ ] **C)** Avatar visible updated in ProfileInfo and in header/sidebar (all zones).
- [ ] **D)** Kill app and reopen → avatar still updated (persisted).

**Log snippet to capture:** Filter Xcode console for `[AvatarPicker]`, `[AvatarUpload]`, `[AvatarProfile]`, `[AvatarSync]` to verify flow.

---

## 8. Files modified (scope)

- `src/components/profile/ProfileInfo.tsx` — ref, no id, offscreen input, logs, localStorage, key on AvatarImage.
- `src/hooks/useProfileImage.ts` — `avatarDisplayUrl` (cache-bust).
- `src/components/layout/UnifiedHeader.tsx` — use `avatarDisplayUrl`.
- `src/components/layout/ProfileLayout.tsx` — pass `avatarDisplayUrl ?? profileImage` to header.
- `src/pages/profile/PersonalInfoPage.tsx` — logs, localStorage after success.
- `src/pages/ProfilePage.tsx` — logs, localStorage after success.

No changes to iOS wrapper, entitlements, or files outside the above list.
