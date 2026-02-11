# iOS SSO Forensic Report — App Store Review Rejection Fix
**Date:** 2026-02-11
**Issue:** Google/Apple SSO buttons fail + Register no-action on App Review device
**Status:** TEMPORARY FIX APPLIED

---

## 1. EXACT BUTTON LOCATIONS

### SSO Buttons (Now Temporarily Hidden on iOS Native)

**File:** `src/pages/Login.tsx`

| Button | Location | Handler |
|--------|----------|---------|
| "Sign up with Apple" | `renderSignUpScreen()` lines 269-283 | `handleAppleSignUp()` → `signInWithApple()` |
| "Sign up with Google" | `renderSignUpScreen()` lines 286-302 | `handleGoogleSignUp()` → `signInWithGoogle()` |

**Hooks Used:**
- `useAppleAuth` → `src/hooks/useAppleAuth.ts`
- `useGoogleAuth` → `src/hooks/useGoogleAuth.ts`

### Register Button

**File:** `src/pages/Login.tsx`

| Button | Location | Handler |
|--------|----------|---------|
| "Sign up with Email" | `renderSignUpScreen()` line 313-323 | `navigate('/register')` |

**Register Page:** `src/pages/Register.tsx` → Uses `RegistrationForm` component

---

## 2. ROOT CAUSE HYPOTHESIS

### Why SSO Fails on App Review but Works for You

**Primary Hypothesis: OAuth Redirect/Deep-Link Failure on Clean Install**

The OAuth flow for Google/Apple uses Supabase's `signInWithOAuth()` which:

1. Opens Safari/SFSafariViewController for authentication
2. User authenticates with Google/Apple
3. OAuth provider redirects to Supabase callback URL
4. Supabase redirects back to app via **Universal Links**

**Failure Point:** The Universal Link redirect back to the app likely fails on App Review devices because:

| Factor | Your Device | App Review Device |
|--------|-------------|-------------------|
| Associated Domains | Cached from previous installs | Fresh, no cache |
| Universal Links | Working (prior AASA fetch) | May fail on first launch |
| Safari ITP | Established trust | Strict third-party blocking |
| Redirect Chain | Completes | May break at Supabase→App |

### Evidence from Code

```typescript
// src/lib/authDeepLink.ts:20-26
export function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    // For native apps, use Supabase hosted callback
    // Supabase will redirect back to app via universal links ← POTENTIAL FAILURE POINT
    const supabaseUrl = getSupabaseUrl();
    return `${supabaseUrl}/auth/v1/callback`;
  }
  // ...
}
```

The redirect relies on:
1. **Apple AASA (apple-app-site-association)** being fetched and cached
2. **Supabase callback URL** properly configured with app's bundle ID
3. **Universal Links entitlements** in Xcode correctly set up

### Why Register "No-Action" Could Occur

**Hypothesis 1:** App Review tapped "Sign Up" button on opening screen, which navigates to signup screen with SSO buttons - the SSO buttons failed, creating perception of "no action"

**Hypothesis 2:** App Review may have tapped the SSO buttons expecting email registration

**Now Fixed:** When SSO buttons are hidden, only "Sign up with Email" is shown, which navigates properly to `/register`

---

## 3. DEBUGGING INSTRUCTIONS (For Future Investigation)

### Chrome Remote Debugging (WebView)

```bash
# 1. Connect iOS device via USB
# 2. Enable Web Inspector: Settings → Safari → Advanced → Web Inspector
# 3. In Safari on Mac: Develop → [Device Name] → M1SSION

# Look for errors:
# - "Failed to open URL"
# - "Universal link not handled"
# - OAuth callback errors
```

### Xcode Console (Native Logs)

```bash
# 1. Connect device, open Xcode
# 2. Window → Devices and Simulators
# 3. Select device → Open Console

# Filter for:
# - "DeepLink"
# - "OAuth"
# - "Auth callback"
# - "Universal link"
```

### Key Log Patterns to Watch

```
✅ WORKING:
🔐 Initiating Google/Apple Auth sign-in...
✅ Auth URL generated, redirecting...
🔗 [DeepLink] App opened with URL: ...auth/callback...
✅ [DeepLink] Session set successfully

❌ FAILING:
🔐 Initiating Google/Apple Auth sign-in...
✅ Auth URL generated, redirecting...
(NO CALLBACK LOGS - redirect failed to return to app)
```

---

## 4. FIX APPLIED: TEMPORARY SSO HIDE

### Changes Made

**File:** `src/pages/Login.tsx`

**Added Feature Flag (lines 25-41):**
```typescript
// 🚨 APP STORE REVIEW FIX — TEMPORARY SSO HIDE
const IOS_SSO_TEMPORARILY_DISABLED = true;

function shouldShowSSOButtons(): boolean {
  if (!IOS_SSO_TEMPORARILY_DISABLED) return true;
  
  const isIOSNative = Capacitor.isNativePlatform() && 
                      Capacitor.getPlatform() === 'ios';
  
  if (isIOSNative) {
    console.log('🚨 [Login] SSO buttons hidden for iOS native (App Review fix)');
    return false;
  }
  
  return true; // Show on Android, web, PWA
}
```

**Conditional Rendering (around line 270):**
```tsx
{shouldShowSSOButtons() && (
  <>
    {/* Apple and Google SSO buttons */}
    {/* OR divider */}
  </>
)}
```

### What's Visible Now on iOS Native

| Before | After |
|--------|-------|
| Sign up with Apple | ❌ Hidden |
| Sign up with Google | ❌ Hidden |
| OR divider | ❌ Hidden |
| Sign up with Email | ✅ Visible |

---

## 5. VERIFICATION CHECKLIST

### Email + Password Login

- [x] Login form visible on `/login` screen
- [x] Email field accepts input
- [x] Password field accepts input
- [x] Submit button triggers `login()` function
- [x] Success redirects to home/mission

### Registration

- [x] "Sign up with Email" button navigates to `/register`
- [x] Registration form visible
- [x] All fields (name, email, password, confirm) accept input
- [x] Submit button triggers `register()` function
- [x] Success creates account and redirects

---

## 6. ROLLBACK INSTRUCTIONS

### Option A: Re-enable SSO (Change Flag)

```typescript
// src/pages/Login.tsx, line 29
const IOS_SSO_TEMPORARILY_DISABLED = false; // ← Change to false
```

### Option B: Git Rollback

```bash
# Restore stash from before fix
git stash list
# Look for: pre-ios-sso-hide-20260211_042524

# Or checkout the original branch
git checkout feat/disco-rotazione-minigame
git stash pop
```

---

## 7. FUTURE FIX RECOMMENDATIONS

To properly fix SSO on iOS native:

1. **Verify Universal Links AASA**
   - Check `https://m1ssion.app/.well-known/apple-app-site-association`
   - Ensure `applinks` contains correct bundle ID

2. **Test Deep Link Callback**
   - Manually test: `m1ssion://auth/callback?code=test`
   - Verify `appUrlOpen` listener fires

3. **Consider Native OAuth Libraries**
   - `@capacitor-community/apple-sign-in` for native Apple auth
   - `@capacitor-community/google-auth` for native Google auth
   - These bypass Safari redirect entirely

4. **Supabase Configuration**
   - Verify OAuth redirect URLs include app scheme
   - Check Supabase Auth settings for iOS bundle ID

---

## 8. FILES CHANGED

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Added `IOS_SSO_TEMPORARILY_DISABLED` flag and conditional rendering |

**Lines Changed:** ~25 lines added (feature flag + conditional wrapper)

**Code Preserved:** All SSO code paths intact, only UI visibility affected

---

*Report generated: 2026-02-11*
*Branch: fix/ios-sso-temp-hide-20260211_042524*
