# 🔐 M1SSION™ — PUSH GUARD Setup Instructions

## ✅ Status: Guard Script Ready

Il guard prebuild `scripts/push-guard.cjs` è stato creato e testato.

---

## 📝 Setup Automatico (Raccomandato)

### Comando One-Liner

Esegui questo comando per aggiungere automaticamente il prebuild hook:

```bash
node -e "const fs=require('fs');const p=require('./package.json');p.scripts=p.scripts||{};p.scripts.prebuild='node scripts/push-guard.cjs';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+String.fromCharCode(10));console.log('✅ prebuild hook added');"
```

### Verifica

```bash
# Controlla che sia stato aggiunto
grep -A 1 '"prebuild"' package.json

# Output atteso:
#   "prebuild": "node scripts/push-guard.cjs",
```

---

## 🛠️ Setup Manuale (Alternativa)

Se preferisci modificare manualmente `package.json`:

1. Apri `package.json`
2. Aggiungi nella sezione `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite",
    "prebuild": "node scripts/push-guard.cjs",  // ← ADD THIS LINE
    "build": "vite build",
    "build:dev": "vite build --mode development",
    // ... rest of scripts
  }
}
```

**Complete scripts section should look like**:
```json
"scripts": {
  "dev": "vite",
  "prebuild": "node scripts/push-guard.cjs",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview",
  "purge": "node purge-cache.js",
  "deploy:cf": "wrangler pages deploy dist --project-name=m1ssion-pwa --branch main --commit-dirty=true",
  "deploy:fb": "firebase deploy --only hosting:m1ssion-eu",
  "deploy:purge": "node purge-cache.js",
  "deploy:all": "npm run build && npm run deploy:cf && npm run deploy:fb && npm run deploy:purge",
  "build:release": "VITE_PWA_VERSION=$(date +%Y%m%d%H%M%S) npm run build",
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "test:install": "playwright install --with-deps"
},
```

---

### 2. Test the Guard

#### First Test (Should Pass)
```bash
# Test guard standalone
node scripts/push-guard.cjs

# Expected output:
# 🔒 M1SSION™ Push SAFE Guard - Starting checks...
# 
# 📋 Check 1: Service Worker uniqueness
# ✅ Service Worker: Only public/sw.js exists
# 
# 📋 Check 2: Cache headers configuration
# ✅ Headers: Cache-Control directives properly configured
# 
# 📋 Check 3: VAPID public key validation
# ✅ VAPID: Valid P-256 public key (65 bytes, prefix: BN399Y…)
# 
# 📋 Check 4: Scanning source for hardcoded secrets
# ✅ Source scan: No hardcoded secrets or unauthorized VAPID helpers detected
# 
# 📋 Check 5: Service Worker version bump
# ✅ Service Worker: Version sw-bump-2025-10-07-05
# 
# 📋 Check 6: VAPID loader module
# ✅ VAPID loader: src/lib/vapid-loader.ts exists
# 
# ============================================================
# ✅ ALL PUSH GUARD CHECKS PASSED
# ============================================================
# 
# 🚀 Proceeding with build...
```

#### Test Build (Should Run Guard Automatically)
```bash
pnpm run build

# Guard should run first, then build proceeds
```

---

### 3. Verify Guard Blocks Bad Patterns

#### Test: Hardcoded Secret Detection
```bash
# Create test file with forbidden pattern
echo 'const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";' > src/test-guard.ts

# Run guard (should FAIL)
node scripts/push-guard.cjs
# Expected: ❌ PUSH GUARD FAILED: Forbidden pattern found in src/test-guard.ts: Hardcoded JWT token

# Cleanup
rm src/test-guard.ts
```

#### Test: Invalid VAPID Key
```bash
# Backup current key
cp public/vapid-public.txt public/vapid-public.txt.bak

# Write invalid key
echo "INVALID_KEY_123" > public/vapid-public.txt

# Run guard (should FAIL)
node scripts/push-guard.cjs
# Expected: ❌ PUSH GUARD FAILED: VAPID key appears invalid (too short)

# Restore valid key
mv public/vapid-public.txt.bak public/vapid-public.txt
```

---

## 🚀 Deployment

### Git Workflow
```bash
# Create feature branch
git checkout -b chore/push-guard-safe

# Commit changes
git add scripts/push-guard.cjs
git add docs/push-guard.md
git add PUSH_GUARD_SETUP.md
git add package.json  # After manual edit
git commit -m "chore: SAFE Guard prebuild (SW/VAPID/tokens protection)"

# Push to remote
git push -u origin chore/push-guard-safe

# Create PR and merge after review
```

### CI/CD Integration
Once `prebuild` is added to `package.json`, **all CI/CD builds will automatically run the guard**.

No additional configuration needed for:
- ✅ Cloudflare Pages
- ✅ GitHub Actions
- ✅ Local builds
- ✅ Firebase Hosting

---

## 🔒 Security Benefits

After setup:

✅ **Prevents**:
- Hardcoded admin tokens in client code
- Accidental VAPID private key commits
- Multiple/unauthorized service workers
- Invalid VAPID public keys
- Missing cache headers

✅ **Enforces**:
- Single SW policy (`public/sw.js` only)
- Centralized VAPID access (`src/lib/vapid-loader.ts`)
- Proper cache directives for push infrastructure

✅ **Detects**:
- JWT tokens in source code
- Supabase credentials hardcoded
- Old/deprecated VAPID helper imports

---

## 📖 Documentation

Full documentation available at:
- **`docs/push-guard.md`** - Complete reference for all checks
- **`scripts/push-guard.cjs`** - Inline comments explain each check

---

## ✅ Checklist

- [ ] Read this setup guide
- [ ] Manually edit `package.json` to add `prebuild` script
- [ ] Run `node scripts/push-guard.cjs` to verify it works
- [ ] Test guard with bad patterns (see section 3 above)
- [ ] Run `pnpm run build` to verify automatic execution
- [ ] Commit and push changes
- [ ] Verify CI/CD builds run guard automatically

---

## 🆘 Troubleshooting

### Guard fails on valid code
1. Check error message - it will tell you exactly what pattern triggered
2. Review `docs/push-guard.md` for that specific check
3. Verify the file mentioned in error is actually safe
4. If false positive: Update `FORBIDDEN_PATTERNS` in `scripts/push-guard.cjs`

### Build succeeds but guard didn't run
1. Verify `prebuild` script is in `package.json`
2. Check `package.json` syntax is valid (no trailing commas, etc.)
3. Run `pnpm run prebuild` manually to test

### Permission errors
```bash
# Make script executable (Unix/Mac)
chmod +x scripts/push-guard.cjs
```

---

**Setup Status**: 🟡 Pending manual `package.json` edit  
**Next Step**: Edit `package.json` as shown in section 1 above
