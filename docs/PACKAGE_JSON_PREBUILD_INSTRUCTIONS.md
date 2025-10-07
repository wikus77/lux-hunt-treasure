# 📋 Activate Prebuild Guard (SAFE)

**© 2025 Joseph MULÉ - NIYVORA KFT™**  
**Purpose:** Add security guard to run before every build  
**Status:** ⚠️ Requires manual action (cannot be automated in Lovable)

---

## 🚀 Quick Activation (Run Locally)

This does NOT modify the core push infrastructure (SW/VAPID remain untouched).

```bash
# From project root
node scripts/add-prebuild-hook.cjs
pnpm run build
```

**Expected output:**
```
✅ prebuild hook added to package.json

> prebuild
> node scripts/push-guard.cjs

✅ Push Guard: All checks passed
✅ Service Worker: Only public/sw.js found
✅ Cache Headers: Present and correct
✅ VAPID Public Key: Valid P-256 format
✅ No hardcoded secrets detected
✅ VAPID Loader: Centralized usage confirmed

> build
> vite build
...
```

---

## 🔒 What the Guard Does

The `scripts/push-guard.cjs` performs **6 security checks** before every build:

1. **Unique SW**: Only `public/sw.js` exists (no duplicates)
2. **Cache Headers**: `public/_headers` has `no-store` for SW/VAPID
3. **VAPID Valid**: `public/vapid-public.txt` is valid P-256 (65 bytes, `0x04` prefix)
4. **No Secrets**: Client code scanned for hardcoded tokens/keys
5. **SW Bump** (Optional): Checks for version comment if SW modified
6. **VAPID Loader**: Ensures only `src/lib/vapid-loader.ts` is used

**If ANY check fails → Build is BLOCKED**

---

## 📚 Related

- [Cron Setup](./cron-setup.md)
- [Norah Producer](./norah-producer.md)
