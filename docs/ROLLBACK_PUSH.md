# 🚨 PUSH NOTIFICATION ROLLBACK GUIDE

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

## Quick Reference

| Method | Time | Impact |
|--------|------|--------|
| Feature Flag (code) | 2 min + build | Cleanest |
| Kill Switch (localStorage) | Instant | Per-device |
| URL Hotfix | Instant | Per-session |
| Git Revert | 5 min + build | Full rollback |

---

## 🔴 EMERGENCY: Disable Immediately

### Option 1: Feature Flag (Recommended)

Edit `src/config/featureFlags.ts`:

```typescript
export const NATIVE_PUSH_ENABLED = false;  // ← SET TO FALSE
```

Then rebuild and deploy:

```bash
npm run build
npx cap sync ios android
# Deploy to app stores or TestFlight
```

### Option 2: Kill Switch (Per-Device, Instant)

In browser console or app:

```javascript
window.pushKillSwitch.disable()
```

Or navigate to: `https://your-app.com/?__noPush=1`

This sets `localStorage.push:disable = '1'`

### Option 3: Git Revert (Full Rollback)

```bash
# Revert to pre-integration state
git checkout pre-native-cron-push-integration

# Or revert specific commits
git revert HEAD~3..HEAD

# Rebuild
npm run build
npx cap sync ios android
```

---

## 📋 Rollback Verification Checklist

After rollback, verify:

- [ ] No push permission prompts appear
- [ ] No token registration attempts in logs
- [ ] Existing users unaffected
- [ ] App loads normally without errors

---

## 🔧 Re-Enable After Fix

### Re-enable Feature Flag:

```typescript
export const NATIVE_PUSH_ENABLED = true;
```

### Clear Kill Switch:

```javascript
window.pushKillSwitch.enable()
// or
localStorage.removeItem('push:disable')
```

---

## 📊 Monitoring

Check these after rollback:

1. **Supabase Edge Function Logs**
   - No new token registrations
   - No push send attempts to disabled users

2. **Error Tracking (if configured)**
   - No push-related errors
   - No permission errors

3. **User Reports**
   - No unexpected push prompts
   - No app crashes

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `src/config/featureFlags.ts` | Feature flags |
| `src/utils/pushKillSwitch.ts` | Kill switch utility |
| `src/lib/nativePush.ts` | Main push implementation |
| `src/main.tsx` | App initialization |

---

## 📞 Escalation

If rollback doesn't work:

1. Check browser console for errors
2. Clear app data/cache
3. Reinstall app from scratch
4. Contact: wikus77@hotmail.it

---

*Last updated: 2026-01-24*
