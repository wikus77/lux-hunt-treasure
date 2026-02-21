# iOS (Capacitor / WKWebView) — CAMERA CRASH VERIFICATION + AVATAR CAMERA BUTTON (FAKE) — READ-ONLY FORENSICS

**App:** M1SSION™ (Capacitor, WKWebView)  
**Scope:** Camera crash verification + avatar camera button real vs fake. No code changes.

---

## 1) ✅ CAMERA ENTRY POINTS TABLE

| ID | File | Line range | Trigger UI (route/page/component) | Mechanism | iOS WKWebView risk | Matches “Tapped to open the camera”? |
|----|------|------------|-----------------------------------|------------|--------------------|--------------------------------------|
| **EP1** | `src/components/profile/ProfileInfo.tsx` | 110–155 | Settings → Profilo Agente (`/settings/agent-profile`), Profile (`/profile` → redirect), AgentProfileSectionContent (modal) | Hidden `<input type="file" accept="image/*">`; camera icon `onClick` → `document.getElementById('profile-image-input')?.click()` | **Med** — File input no `capture`; system may offer Camera or Photo Library; if user taps “Camera”, native camera opens | **Yes** (if user chooses Camera from sheet) |
| **EP2** | `src/pages/profile/PersonalInfoPage.tsx` | 218–234 | Settings → Informazioni Personali (`/settings/personal-info`) | Hidden `<input type="file" accept="image/jpeg,image/png,image/jpg" capture="environment">`; Button `onClick` → `fileInputRef.current?.click()` | **High** — `capture="environment"` requests camera directly on iOS | **Yes** (direct “open camera”) |
| **EP3** | `src/pages/settings/PrivacyPermissionsSettings.tsx` | 115–120 | Settings → Privacy e permessi (`/settings/privacy-permissions`) | `navigator.mediaDevices.getUserMedia({ video: true })` to “test” camera permission; no file input | **High** — Starts live video stream; known WebKit/AVFoundation issues on some iPadOS versions | **Yes** (opens camera for permission test) |
| **EP4** | `src/components/profile/ProfileBio.tsx` | 26–40 | Wherever ProfileBio is used, when `isEditing` | Visible `<Input type="file" accept="image/*">` (no camera icon overlay); uses FileReader → data URL, no upload in component | **Low** — Standard file picker; no `capture` | **No** (picker, not “open camera” tap) |

**Excluded (not camera / not avatar):**

- `useMicLevel.ts` — `getUserMedia({ audio: ... })` only (microphone).
- `ContentSources.tsx`, `KYCForm.tsx`, `VideoUploadManager.tsx` — File inputs for documents/video; not camera/avatar.
- **Capacitor:** No `@capacitor/camera` in repo; no `Camera.getPhoto` usage.

---

## 2) ✅ AVATAR CAMERA BUTTON STATUS MAP (REAL vs FAKE)

| Location | File | Line range | Component | Handler? | Hidden file input? | Wired to input? | Overlay / z-index / pointer-events | Finding |
|----------|------|------------|-----------|-----------|--------------------|----------------|-------------------------------------|---------|
| **Settings → Profilo Agente** | `AgentProfileSettings.tsx` | 78–89 | Uses **ProfileInfo** | ✅ Yes | ✅ Yes | ✅ Yes — `id="profile-image-input"`, onClick triggers `.click()` | No blocker | **REAL** |
| **Profile (route /profile)** | `Profile.tsx` | 63–77 | Uses **ProfileInfo** | ✅ Yes | ✅ Yes | ✅ Yes | No blocker | **REAL** (same ProfileInfo) |
| **Settings modal → Profilo** | `AgentProfileSectionContent.tsx` | 89–95 | Uses **ProfileInfo** | ✅ Yes | ✅ Yes | ✅ Yes | No blocker | **REAL** |
| **Settings → Informazioni Personali** | `PersonalInfoPage.tsx` | 218–234 | Own avatar block | ✅ Yes — `onClick={() => fileInputRef.current?.click()}` | ✅ Yes | ✅ Yes — `ref={fileInputRef}` | No blocker | **REAL** (Upload icon, not Camera icon; opens input with `capture="environment"`) |
| **ProfilePage (standalone)** | `ProfilePage.tsx` | 246–248 | Own avatar block | ❌ **No** | ❌ **No** | ❌ N/A | — | **FAKE** — Decorative camera button, no `onClick`, no file input |

**Precise finding — FAKE:**

- **File:** `src/pages/ProfilePage.tsx`  
- **Lines:** 246–248  
- **Snippet:**
  ```tsx
  <button className="absolute -bottom-2 -right-2 bg-[#00D1FF] rounded-full p-2 hover:bg-cyan-500 transition-colors">
    <Camera className="w-4 h-4 text-black" />
  </button>
  ```
- **Missing:** No `onClick`, no `ref` to file input, no hidden `<input type="file">` in that block. Button is purely decorative.
- **Note:** In current routing (`WouterRoutes.tsx`), `/profile` redirects to `/settings/agent-profile`, so the default profile UI is AgentProfileSettings (ProfileInfo = real). ProfilePage may still be reachable from other entry points or legacy routes; any path that renders ProfilePage shows a non-functional camera icon on avatar.

**ProfileBio:** Has file input for image when `isEditing`, but no camera icon overlay on avatar; different UI pattern. Not classified as “avatar camera button” for this map.

---

## 3) ✅ END-TO-END AVATAR UPLOAD TRACE (STORAGE + DB + UI REFRESH)

### Flow A — ProfileInfo (Settings / Profile / modal)

1. **Tap:** User taps camera icon overlay on avatar → `document.getElementById('profile-image-input')?.click()` (ProfileInfo.tsx L113).
2. **Picker/camera:** Browser shows system UI (photo library and/or camera; no `capture`). User selects or captures image.
3. **onChange:** `ProfileInfo.tsx` L123–154: reads `e.target.files?.[0]`, uploads to Supabase Storage.
4. **Storage:** Bucket **`avatars`**. Path: `avatar-${Date.now()}.${ext}` (flat, no user subfolder). Public URL via `supabase.storage.from('avatars').getPublicUrl(data.path)`.
5. **DB:** ProfileInfo does **not** write to DB on upload. It only calls `setProfileImage(publicUrl)` (parent state). Persistence to DB happens when user clicks **Save** (e.g. in ProfileHeader): `handleSaveBasicInfo` → `updateProfile({ avatar_url: profileImage })` → `useProfileRealtime.updateProfile` → `profiles` table update (`avatar_url`, `updated_at`).
6. **UI refresh:** State update → re-render. Realtime subscription in `useProfileRealtime` can push new `avatar_url`; `useProfileBasicInfo` also syncs from `globalProfile.avatar_url` and localStorage. If user does **not** hit Save after uploading, avatar shows in UI from state but is **not** persisted to `profiles.avatar_url` until next save.

**Exact storage:** Bucket **`avatars`**. Path pattern `avatar-{timestamp}.{ext}`. **Public** URLs via `getPublicUrl` (no signed URLs in this path).

### Flow B — PersonalInfoPage

1. **Tap:** User taps Upload button next to avatar → `fileInputRef.current?.click()` (L221).
2. **Picker/camera:** `<input capture="environment">` → on iOS can open **camera** directly.
3. **onChange:** `handleAvatarUpload` (L36–100): validate type/size, upload to Storage, then **immediate** DB update.
4. **Storage:** Bucket **`avatars`**. Path: `{user.id}/avatar_{Date.now()}.{ext}` (per-user folder). Public URL via `getPublicUrl(fileName)`.
5. **DB:** Direct update: `supabase.from('profiles').update({ avatar_url: publicUrl, updated_at })` (L84–90). No “Save” step.
6. **UI refresh:** `actions.setProfileImage(publicUrl)` + toast. Realtime/global sync can update other views.

**Exact storage:** Bucket **`avatars`**. Path pattern `{user_id}/avatar_{timestamp}.{ext}`. **Public** URLs.

### Storage + DB summary

| Item | Value |
|------|--------|
| **Bucket name** | `avatars` |
| **ProfileInfo path** | `avatar-{timestamp}.{ext}` (root of bucket) |
| **PersonalInfoPage path** | `{user_id}/avatar_{timestamp}.{ext}` |
| **Access** | Public URLs via `getPublicUrl` (no signed URLs in these flows) |
| **DB column** | `profiles.avatar_url` (and optional localStorage `profileImage` for legacy/offline) |

### Caching (iOS WKWebView)

- Avatar URL is the same public URL after upload; only the **path** (new file) changes. If the app uses the **same URL** for an updated image (e.g. overwrite with same name), WKWebView can cache the old image until reload. In current code:
  - **ProfileInfo:** New path every time (`avatar-${Date.now()}.${ext}`) → new URL → cache less likely to show stale.
  - **PersonalInfoPage:** New path per upload (`avatar_${Date.now()}`) → new URL → same.
- If any flow ever reused the same URL for a new file, “avatar not updating until kill-app” would be possible; in the traced flows, new URL per upload reduces that risk. No cache-busting query params found in avatar `src` in the inspected components.

### Error handling

- **ProfileInfo:** `try/catch`; on upload error: `console.error`, `toast.error('Errore nel caricamento dell\'immagine')`. No DB rollback (no DB write on upload).
- **PersonalInfoPage:** Validation toasts (type, size); `try/catch`; on failure: toast error, `setIsLoading(false)`. DB update is in same try block; no explicit rollback of profile row on upload success + update failure (user could see toast success but DB fail in theory).
- **useProfileBasicInfo / updateProfile:** On update error, realtime hook reverts local state from Supabase and rethrows; toast from `handleSaveBasicInfo`.

---

## 4) ✅ TOP CRASH SUSPECTS + EVIDENCE

### Suspect 1 — `capture="environment"` (PersonalInfoPage) — **HIGH**

- **Evidence:** `src/pages/profile/PersonalInfoPage.tsx` L229–231: `<input type="file" accept="image/jpeg,image/png,image/jpg" capture="environment">`.
- **Why:** On iOS WKWebView, `capture="environment"` tells the system to open the **camera** directly (rear camera on phone). This matches Apple’s wording “Tapped to open the camera.” Known issues: WebKit/file input handoff to UIImagePickerController/PHPicker on iPadOS, especially on iPad Air M3 / iPadOS 26, can crash or behave inconsistently.
- **Relevant code:** Same file L218–234 (button + input).

### Suspect 2 — `getUserMedia({ video: true })` (Privacy Permissions) — **HIGH**

- **Evidence:** `src/pages/settings/PrivacyPermissionsSettings.tsx` L116–120: `const stream = await navigator.mediaDevices.getUserMedia({ video: true });` then `stream.getTracks().forEach(track => track.stop());`.
- **Why:** Actively starts a video capture session. On iPad/WKWebView, AVFoundation/WebKit integration can crash (e.g. permission UI, session start/stop, or multi-window). Reviser could tap “camera” permission and trigger this.
- **Relevant code:** L97–120 (`requestPermission('camera')` branch).

### Suspect 3 — Permissions-Policy `camera=()` + client-side headers — **MED**

- **Evidence:** `src/security/csp.ts` L92: `'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)'`. `src/components/security/ProductionSecurityWrapper.tsx` L44–45: `applySecurityHeaders()` runs in useEffect (production). `applySecurityHeaders()` (csp.ts L107–124) injects meta tags for all `SECURITY_HEADERS`, including Permissions-Policy.
- **Why:** In Capacitor, content is loaded from `capacitor://`; there is no HTTP response, so these meta tags are the only way to apply policy. If WKWebView honors Permissions-Policy via meta, `camera=()` disables camera for the document. Then programmatic `.click()` on a file input or getUserMedia could hit a “feature disabled” path and crash or fail in an unexpected way.
- **Relevant code:** `csp.ts` L87–94, L107–124; `ProductionSecurityWrapper.tsx` L42–50. PWAEnhancedWrapper wraps app with ProductionSecurityWrapper.

### Validation checklist (device testing, no code changes)

1. **PersonalInfoPage (capture="environment")**  
   - Steps: Login → Settings → Informazioni Personali → tap Upload button on avatar.  
   - Expected: System offers camera or photo library; on “Camera”, camera opens.  
   - Logs: Xcode device console (WebKit, AVFoundation, process name). Note exact moment of crash: **before** action sheet, **after** choosing “Camera”, **when** camera view appears, or **on return** from camera.  
   - Note: If crash is after choosing “Camera”, Suspect 1 is top candidate.

2. **Privacy Permissions (getUserMedia)**  
   - Steps: Settings → Privacy e permessi → tap “Richiedi” or equivalent for **camera**.  
   - Expected: Permission prompt and/or brief camera use, then stop.  
   - Logs: Same as above. Note: Crash **during** or **right after** getUserMedia points to Suspect 2.

3. **ProfileInfo (file input, no capture)**  
   - Steps: Settings → Profilo Agente → tap **camera icon** on avatar.  
   - Expected: Action sheet (e.g. “Photo Library” / “Camera”); user can choose Camera.  
   - Logs: Same. If crash only when user selects “Camera” (not Library), aligns with WebKit/camera handoff; if crash never here, contrasts with PersonalInfoPage (capture) and suggests Suspect 1.

4. **General**  
   - On any crash: capture full stack and thread; check for WebKit, AVFoundation, Capacitor, and any camera/picker symbols.  
   - Test on iPad Air M3 / iPadOS 26 and, if possible, iPhone with same OS minor version.

---

## 5) ✅ APPLE-PROOF FIX OPTIONS (NO PATCH)

### Option A — Keep HTML file input, make it robust

- **Idea:** Keep `<input type="file" accept="image/*">` (or image types) and **remove** `capture="environment"` everywhere. Rely on system to show “Camera” or “Photo Library” from the default file-input UI. Ensure every “camera” icon over avatar has a single, clearly wired input and onClick.
- **Files impacted:** `PersonalInfoPage.tsx` (remove `capture="environment"`), `ProfileInfo.tsx` (already no capture; verify wiring), `ProfilePage.tsx` (add handler + hidden input or reuse ProfileInfo).
- **Pros:** No new native dependency; works in WKWebView with standard picker; avoids direct camera handoff that may crash.  
- **Cons:** User may see “Photo Library” first; one extra tap to “Take Photo” if system offers it.  
- **iOS review risk:** Low if crash was tied to `capture`/direct camera.  
- **Effort:** Low (remove attribute; fix ProfilePage button).  
- **WKWebView:** High reliability for picker; camera still available via system choice.

### Option B — Use Capacitor Camera plugin

- **Idea:** Add `@capacitor/camera`, use `Camera.getPhoto({ source: CameraSource.Camera })` (and optionally `CameraSource.Photos` for library). Replace file-input + programmatic click with plugin call; upload the returned file/blob to `avatars` bucket and update `profiles.avatar_url` as today.
- **Files impacted:** New small helper (e.g. `useAvatarCamera` or `pickAvatarImage.ts`); `ProfileInfo.tsx`, `PersonalInfoPage.tsx`, and any other avatar camera entry (e.g. ProfilePage if made real). Info.plist already has NSCameraUsageDescription and NSPhotoLibraryUsageDescription.
- **Pros:** Native camera/photo UI; avoids WebKit file-input camera path; often more stable on iPad.  
- **Cons:** New dependency; need to handle Capacitor vs web (plugin not available on web; fallback to file input or hide camera on web).  
- **iOS review risk:** Low; native APIs are the path Apple expects.  
- **Effort:** Medium (plugin add, platform checks, fallback).  
- **WKWebView:** High reliability on iOS; web needs a separate path.

### Option C — Remove “camera permission test” getUserMedia; rely on OS prompt only

- **Idea:** In Privacy Permissions, do **not** call `getUserMedia({ video: true })` to “test” camera. Only show status (e.g. from `navigator.permissions.query` if available, or “Request” that opens system settings / or no live test). Actual camera use remains only via file input or Capacitor Camera.
- **Files impacted:** `PrivacyPermissionsSettings.tsx` (remove or replace the `case 'camera':` getUserMedia branch).
- **Pros:** Removes a major crash suspect (live video stream); still compliant with “can request permission” UX.  
- **Cons:** No in-app “live” camera test; user may not know camera works until they use avatar flow.  
- **iOS review risk:** Low.  
- **Effort:** Low.  
- **WKWebView:** Removes crash surface from this screen; camera still used only at avatar capture (Option A or B).

---

**Recommendation (plan only):**  
- **Short term:** Option A (remove `capture="environment"`) + Option C (remove getUserMedia camera test) to reduce crash risk with minimal change.  
- **Then:** Make ProfilePage avatar camera button functional (wire to same flow as ProfileInfo or PersonalInfoPage).  
- **If crashes persist or for stronger compliance:** Option B (Capacitor Camera) for avatar capture on iOS, with web fallback to file input.

---

*Report generated read-only. No code or config modified.*
