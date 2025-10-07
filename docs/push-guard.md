# M1SSION™ Push SAFE Guard
**Security prebuild script to prevent push notification infrastructure tampering**

---

## 🎯 Purpose

The Push SAFE Guard (`scripts/push-guard.cjs`) runs **before every build** to ensure:
- Service Worker integrity
- VAPID key validity
- No hardcoded secrets in client code
- Proper caching headers
- Authorized VAPID access patterns

**If any check fails → build is blocked immediately.**

---

## 📋 Security Checks

### ✅ Check 1: Service Worker Uniqueness
**What**: Ensures only `public/sw.js` exists, no unauthorized service workers.

**Fails if**:
- Multiple service worker files found (e.g., `custom-sw.js`, `old-sw.js`)
- `public/sw.js` is missing

**Why**: Prevents accidental/malicious SW duplication that could hijack push handling.

---

### ✅ Check 2: Cache Headers Configuration
**What**: Validates `public/_headers` contains proper no-cache directives.

**Required headers**:
```
/vapid-public.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: no-store

/sw.js
  Service-Worker-Allowed: /
  Cache-Control: no-store
```

**Fails if**:
- `public/_headers` file missing
- Missing `Cache-Control: no-store` for VAPID or SW
- (Warns) Missing `Service-Worker-Allowed: /`

**Why**: Prevents browsers from caching stale VAPID keys or service workers.

---

### ✅ Check 3: VAPID Public Key Validation
**What**: Decodes and validates P-256 VAPID public key format.

**Validation**:
1. File `public/vapid-public.txt` exists
2. Key decodes from base64url successfully
3. Key is exactly **65 bytes** (P-256 uncompressed point)
4. First byte is `0x04` (uncompressed format indicator)

**Fails if**:
- VAPID file missing
- Key too short (< 60 chars)
- Invalid base64url encoding
- Wrong length or format byte

**Why**: Ensures VAPID key is cryptographically valid before deploying.

---

### ✅ Check 4: Forbidden Patterns in Source
**What**: Scans `src/` directory for hardcoded secrets and unauthorized patterns.

**Forbidden patterns**:
| Pattern | Description |
|---------|-------------|
| `x-admin-token: ...` | Admin push token in code |
| `PUSH_ADMIN_TOKEN = \"...\"` | Hardcoded admin constant |
| `ADMIN_BROADCAST_TOKEN = \"...\"` | Hardcoded broadcast token |
| `VAPID_PRIVATE_KEY = \"...\"` | Private VAPID key (critical!) |
| `Bearer eyJ...` | Hardcoded JWT tokens |
| `SUPABASE_URL = \"https://...\"` | Hardcoded Supabase URL |
| `SUPABASE_ANON_KEY = \"eyJ...\"` | Hardcoded anon key |
| `vkjrqirvdvjbemsfzxof` | Project ref directly in code |

**VAPID Loader Enforcement**:
- Only `src/lib/vapid-loader.ts` can contain VAPID logic
- Old helpers like `vapid-helper.ts`, `getVapidPublicKey()` are forbidden

**Fails if**:
- Any forbidden pattern found
- Unauthorized VAPID helper imports detected

**Why**: Prevents accidental secret commits that could expose admin access.

---

### ✅ Check 5: Service Worker Version Bump (Optional)
**What**: Checks if `public/sw.js` first line contains version comment.

**Expected format**:
```javascript
// sw-bump-2025-10-07-05
```

**Warns if**:
- Missing version bump header (not critical, just recommended)

**Why**: Helps track SW changes in git history and debugging.

---

### ✅ Check 6: VAPID Loader Module Exists
**What**: Confirms `src/lib/vapid-loader.ts` is present.

**Fails if**:
- File doesn't exist

**Why**: Enforces centralized VAPID access point (easier to audit).

---

## 🚀 Usage

### Automatic (Recommended)
Added to `package.json`:
```json
{
  "scripts": {
    "prebuild": "node scripts/push-guard.cjs",
    "build": "vite build"
  }
}
```

**Runs automatically before every `pnpm run build`** or `npm run build`.

### Manual Testing
```bash
# Run guard standalone
node scripts/push-guard.cjs

# Expected output if all checks pass:
# ✅ Service Worker: Only public/sw.js exists
# ✅ Headers: Cache-Control directives properly configured
# ✅ VAPID: Valid P-256 public key (65 bytes, prefix: BN399Y…)
# ✅ Source scan: No hardcoded secrets detected
# ⚠️  Service Worker missing version bump header (recommended)
# ✅ VAPID loader: src/lib/vapid-loader.ts exists
# ============================================================
# ✅ ALL PUSH GUARD CHECKS PASSED
# ============================================================
```

---

## ❌ Handling Failures

### Example: Hardcoded Secret Found
```bash
❌ PUSH GUARD FAILED: Forbidden pattern found in src/api/push.ts: Hardcoded JWT token

# Fix: Remove hardcoded token, use Supabase session instead
```

### Example: Invalid VAPID Key
```bash
❌ PUSH GUARD FAILED: VAPID key invalid length: 32 bytes (expected 65 for P-256)

# Fix: Regenerate VAPID keys:
npx web-push generate-vapid-keys
# Copy public key to public/vapid-public.txt
```

### Example: Unauthorized Service Worker
```bash
❌ PUSH GUARD FAILED: Unauthorized service workers found: old-sw.js, custom-sw.js. Only public/sw.js is allowed.

# Fix: Remove extra SW files
rm public/old-sw.js public/custom-sw.js
```

---

## 🔒 Security Benefits

### 1. **Prevents Accidental Commits**
- Developers can't accidentally commit admin tokens or private keys
- Build fails immediately if secrets are detected

### 2. **Enforces Best Practices**
- No-cache headers required for VAPID/SW
- Centralized VAPID access via loader module
- Single service worker policy

### 3. **Cryptographic Validation**
- VAPID key format verified before deployment
- Ensures push notifications will work (no invalid key errors)

### 4. **Audit Trail**
- SW version bumps help track changes
- Easy to identify when push infrastructure was modified

---

## 🧪 Testing the Guard

### Test 1: Add Forbidden Secret
```bash
# Add to src/test.ts temporarily
echo 'const token = \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\";' > src/test.ts

# Run guard
node scripts/push-guard.cjs
# Expected: ❌ PUSH GUARD FAILED: Forbidden pattern found in src/test.ts: Hardcoded JWT token

# Cleanup
rm src/test.ts
```

### Test 2: Corrupt VAPID Key
```bash
# Backup current key
cp public/vapid-public.txt public/vapid-public.txt.bak

# Write invalid key
echo "INVALID_KEY_123" > public/vapid-public.txt

# Run guard
node scripts/push-guard.cjs
# Expected: ❌ PUSH GUARD FAILED: VAPID key decode error: ...

# Restore
mv public/vapid-public.txt.bak public/vapid-public.txt
```

### Test 3: Add Extra Service Worker
```bash
# Create fake SW
touch public/custom-sw.js

# Run guard
node scripts/push-guard.cjs
# Expected: ❌ PUSH GUARD FAILED: Unauthorized service workers found: custom-sw.js

# Cleanup
rm public/custom-sw.js
```

---

## 🔧 Maintenance

### Updating Forbidden Patterns
Edit `scripts/push-guard.cjs` → `FORBIDDEN_PATTERNS` array:

```javascript
const FORBIDDEN_PATTERNS = [
  { regex: /NEW_FORBIDDEN_PATTERN/i, desc: 'Description' },
  // ... existing patterns
];
```

### Disabling a Check (Not Recommended)
Comment out the check in `scripts/push-guard.cjs`:

```javascript
// ===== CHECK 2: Headers Configuration =====
// console.log('\n📋 Check 2: Cache headers configuration');
// ... (rest of check)
```

⚠️ **Warning**: Only disable checks if you understand the security implications.

---

## 📊 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Guard runs automatically via prebuild
      - run: pnpm install
      - run: pnpm run build  # ← Guard runs here
      
      # Deploy only if build succeeds (guard passed)
      - run: npx wrangler pages deploy dist
```

### Cloudflare Pages (Build Settings)
```bash
Build command: pnpm run build  # Guard runs via prebuild
Build output directory: dist
```

---

## 🚨 Emergency Override

**Only use in extreme emergencies** (e.g., production down, guard false positive):

```bash
# Temporary skip (not recommended)
SKIP_PUSH_GUARD=1 pnpm run build

# Better: Fix the issue and keep guard enabled
```

To add skip support, modify `scripts/push-guard.cjs`:
```javascript
if (process.env.SKIP_PUSH_GUARD === '1') {
  console.warn('⚠️  PUSH GUARD SKIPPED (EMERGENCY OVERRIDE)');
  process.exit(0);
}
```

---

## 📝 Changelog

### 2025-10-07
- ✅ Initial implementation
- ✅ 6 security checks active
- ✅ Integrated into prebuild hook
- ✅ Documentation complete

---

## 🤝 Contributing

When modifying push infrastructure:

1. **Run guard locally first**: `node scripts/push-guard.cjs`
2. **Update SW bump version**: Edit first line of `public/sw.js`
3. **Test on preview branch**: Deploy to staging first
4. **Document changes**: Update this file if checks change

---

## 📞 Support

If the guard blocks your build incorrectly:

1. **Check error message**: It will tell you exactly what failed
2. **Review this documentation**: Each check has a "Fix" section
3. **Ask DevOps team**: They can help interpret cryptic errors

**Never disable the guard without understanding the security implications.**

---

**Last Updated**: 2025-10-07  
**Maintained By**: M1SSION™ DevOps Team
