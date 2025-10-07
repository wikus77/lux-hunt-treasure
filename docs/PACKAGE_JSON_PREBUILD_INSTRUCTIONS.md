# 📋 Package.json Prebuild Hook - Installation Guide

**File:** `package.json` (READ-ONLY in Lovable)  
**Purpose:** Add security guard to run before every build  
**Status:** ⚠️ Requires manual action (cannot be automated)

---

## ✅ RECOMMENDED METHOD (New Helper Script)

We've created a dedicated helper script for a cleaner installation:

```bash
# From project root
node scripts/add-prebuild-hook.cjs
```

**What it does:**
- Reads `package.json`
- Adds `"prebuild": "node scripts/push-guard.cjs"` to the `scripts` section
- Writes back with proper formatting (2-space indent + trailing newline)
- Idempotent (safe to run multiple times)
- Confirms success

---

## ✅ ALTERNATIVE: ONE-LINER COMMAND

If you prefer a one-liner (does the same thing):

```bash
node -e "let p=require('./package.json');p.scripts=p.scripts||{};p.scripts.prebuild='node scripts/push-guard.cjs';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');console.log('✅ prebuild hook added')"
```

**What it does:**
- Reads `package.json`
- Adds `"prebuild": "node scripts/push-guard.cjs"` to the `scripts` section
- Saves the file
- Confirms success

---

## ✅ ALTERNATIVE: Manual Edit

If you prefer to edit manually, open `package.json` and add this line:

**Before:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    ...
  }
}
```

**After:**
```json
{
  "scripts": {
    "dev": "vite",
    "prebuild": "node scripts/push-guard.cjs",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    ...
  }
}
```

**Location:** Add `"prebuild"` right after `"dev"` (before `"build"`)

---

## ✅ VERIFICATION

After adding the hook, test it:

```bash
pnpm run build
```

**Expected output:**
```
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

**If guard fails:**
```
❌ Push Guard Failed: <reason>
```
The build will **STOP** (this is the security feature working!)

---

## ✅ WHAT THE GUARD DOES

The `scripts/push-guard.cjs` performs **6 security checks** before every build:

1. **Unique SW**: Only `public/sw.js` exists (no duplicates)
2. **Cache Headers**: `public/_headers` has `no-store` for SW/VAPID
3. **VAPID Valid**: `public/vapid-public.txt` is valid P-256 (65 bytes, `0x04` prefix)
4. **No Secrets**: Client code scanned for:
   - `x-admin-token`
   - `PUSH_ADMIN_TOKEN`
   - `VAPID_PRIVATE_KEY`
   - `Bearer eyJ` (JWT tokens)
   - Hardcoded Supabase URLs/keys
5. **SW Bump** (Optional): Checks for `// sw-bump-...` if SW modified
6. **VAPID Loader**: Ensures only `src/lib/vapid-loader.ts` is used

**If ANY check fails → Build is BLOCKED**

---

## ✅ WHY THIS IS IMPORTANT

**Without the guard:**
- Secrets might leak into production bundle
- Multiple SW files could conflict
- VAPID keys could be exposed
- Stale SW could be cached

**With the guard:**
- Automated security checks on every build
- Prevents accidental push chain breaks
- Ensures single source of truth (vapid-loader.ts)
- Blocks unsafe builds before deployment

---

## ✅ TROUBLESHOOTING

### "Command not found: node"

Install Node.js:
```bash
# macOS (Homebrew)
brew install node

# Linux (Ubuntu/Debian)
sudo apt-get install nodejs npm

# Windows (Chocolatey)
choco install nodejs
```

### "Cannot find module './package.json'"

Make sure you're in the **project root** directory:
```bash
cd /path/to/m1ssion-project
pwd  # Should show project root
```

### "Guard fails with false positive"

Check the error message. If it's a legitimate issue (e.g., multiple SW files), fix it first.

If it's a false positive, you can temporarily disable the guard:
```bash
# Build without guard (NOT RECOMMENDED for production)
pnpm run build --skip-prebuild
```

But **always investigate why it failed** before deploying!

---

## ✅ NEXT STEPS

1. ✅ Add `prebuild` hook (using one-liner or manual edit)
2. ✅ Test with `pnpm run build`
3. ✅ Verify all checks pass
4. ✅ Deploy normally (guard runs automatically)

---

**Status:** ⏳ **PENDING** (awaiting manual action)  
**File:** `package.json`  
**Script:** `scripts/push-guard.cjs` (already present)  
**One-Liner:** See top of this document

---

*Once added, the guard will run automatically on every `pnpm run build`. No further action needed!*
