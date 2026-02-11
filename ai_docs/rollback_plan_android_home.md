# Rollback Plan - Android Home Crash Fix
**Date:** 2026-02-10
**Status:** BACKUP CREATED

---

## 1. BACKUP CREATED

| Backup Type | Location | Timestamp |
|-------------|----------|-----------|
| Git Branch | `backup/android-home-pre-fix-20260210_165445` | 2026-02-10 16:54:45 |
| Git Tag | `backup_android_home_pre_fix_20260210_165445` | 2026-02-10 16:54:45 |
| ZIP Archive | `_rollback/android_home_fix_rollback_20260210_165456.zip` (1.3GB) | 2026-02-10 16:55:44 |

---

## 2. ROLLBACK COMMANDS (1-Command)

### Option A: Rollback via Git Tag (Recommended)
```bash
# Discard all changes and restore to pre-fix state
git checkout backup_android_home_pre_fix_20260210_165445
```

### Option B: Rollback via Git Branch
```bash
# Switch to backup branch
git checkout backup/android-home-pre-fix-20260210_165445
```

### Option C: Restore from ZIP (Nuclear Option)
```bash
# Extract specific folders from zip
cd /Users/josephmule/lux-hunt-treasure
unzip -o _rollback/android_home_fix_rollback_20260210_165456.zip "android/*" "src/*" -d .
```

---

## 3. HARD GUARDS (iOS PROTECTION)

### RULE: NO iOS MODIFICATIONS ALLOWED

During this fix session, the following are **STRICTLY FORBIDDEN**:

| Forbidden Action | Why |
|-----------------|-----|
| Any file modification in `ios/` | iOS wrapper must remain untouched |
| `cap sync ios` | Would sync web assets to iOS |
| `pod install` | Would modify iOS dependencies |
| Any Xcode project changes | iOS build must not be affected |

### Guard Check (Run Before Any Commit)
```bash
# Verify no iOS changes from this session
git diff --name-only HEAD | grep "^ios/" && echo "❌ iOS MODIFIED - ABORT!" || echo "✅ iOS untouched"
```

### Auto-Abort Trigger
If any patch in this session modifies files under `ios/`:
1. **STOP IMMEDIATELY**
2. Run: `git checkout -- ios/`
3. Report the violation

---

## 4. PRE-EXISTING iOS CHANGES (NOT FROM THIS SESSION)

The following iOS files have pre-existing modifications (from prior work, NOT this fix):
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/M1.png` (deleted)
- `ios/App/App/public/bundle-analysis.html` (modified)
- `ios/App/App/public/index.html` (modified)
- `ios/App/App/Assets.xcassets/_orphan_assets/` (untracked)

**These are NOT related to this Android fix and should remain unchanged.**

---

## 5. VERIFICATION BEFORE ROLLBACK

Before rolling back, verify:
1. Android Home still crashes: **YES** → Rollback needed
2. iOS still works: **CHECK** → Should work regardless
3. New files created that need cleanup:
   - `src/components/ui/SafeImage.tsx`
   - `src/components/ui/SafeVideo.tsx`
   - `src/utils/useSafeGLTF.ts`
   - `src/utils/platform.ts`
   - `src/services/assetResolver.ts`
   - `public/asset-manifest.json`

---

## 6. ROLLBACK CHECKLIST

- [ ] Identified that fix failed
- [ ] Run guard check to confirm no iOS changes
- [ ] Run rollback command (Option A recommended)
- [ ] Verify working tree is clean
- [ ] Test Android app (should show original crash)
- [ ] Document failure reason for next attempt

---

*Rollback plan created: 2026-02-10 16:55*
