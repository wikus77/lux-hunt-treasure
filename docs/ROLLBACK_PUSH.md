# Push Chain Rollback Guide

## Emergency Rollback Procedure

### 1. Identify Target Tag

Find the latest stable push tag:
```bash
git tag -l "push-stable-*" | sort -r | head -5
```

### 2. Create Hotfix Branch

```bash
# Example with specific timestamp
export TARGET_TAG="push-stable-20250909-1045"

# Create hotfix branch from tag
git checkout -b hotfix/rollback-push-${TARGET_TAG} tags/${TARGET_TAG}
```

### 3. Verify Snapshot Integrity

```bash
# Run hash verification
node scripts/hash-sw.mjs

# Compare with snapshot in docs/PUSH_CHAIN_SNAPSHOT.md
# Ensure all critical files match expected hashes
```

### 4. Deploy Rollback

```bash
# Force push to main (emergency only)
git checkout main
git reset --hard tags/${TARGET_TAG}
git push --force-with-lease origin main

# Or merge hotfix (safer)
git checkout main
git merge hotfix/rollback-push-${TARGET_TAG}
git push origin main
```

### 5. Verify Deployment

1. Check that SW registration is single: `/sw.js` only
2. Verify VAPID key matches snapshot (redacted form)
3. Test push subscription on iOS PWA
4. Monitor edge function logs for errors

## File Recovery

### Individual File Rollback

```bash
# Rollback specific protected file
git checkout tags/${TARGET_TAG} -- public/sw.js
git commit -m "rollback: restore SW from ${TARGET_TAG}"

# Or multiple files
git checkout tags/${TARGET_TAG} -- src/components/WebPushToggle.tsx src/utils/vapidHelper.ts
```

### Environment Variables

```bash
# Check .env against snapshot
diff .env .env.snapshot.${TARGET_TAG}

# Restore specific VAPID key
# VITE_VAPID_PUBLIC_KEY="[from snapshot]"
```

## Edge Functions Rollback

### Export Current Functions (backup)

```bash
mkdir -p infra/backups/$(date +%Y%m%d-%H%M)
cd infra/backups/$(date +%Y%m%d-%H%M)

# Export current versions
supabase functions download webpush-upsert
supabase functions download webpush-send
```

### Restore from Snapshot

```bash
# Deploy from snapshot directory
cd infra/snapshots/${TARGET_TAG}/functions

supabase functions deploy webpush-upsert --project-ref vkjrqirvdvjbemsfzxof
supabase functions deploy webpush-send --project-ref vkjrqirvdvjbemsfzxof
```

### Database Schema Rollback

```bash
# Only if schema changes broke push functionality
psql ${SUPABASE_DB_URL} < infra/snapshots/${TARGET_TAG}/schema.sql

# Verify fcm_subscriptions table integrity
psql ${SUPABASE_DB_URL} -c "\\d fcm_subscriptions;"
```

## Verification Checklist

After rollback, verify:

- [ ] Single SW registration: `/sw.js` scope `/`
- [ ] No `firebase-messaging-sw.js` active
- [ ] VAPID key matches snapshot (first/last 6 chars)
- [ ] Push subscription works on iOS PWA
- [ ] `webpush-upsert` accepts valid payloads (no 400 errors)
- [ ] `webpush-send` delivers notifications
- [ ] Debug panel shows controller=true, subscribed=true

## Prevention

To prevent future issues:

1. Always create tags before push chain changes
2. Use `override-push-guard` label only with approval
3. Test on iOS PWA before merging
4. Monitor edge function logs after deployment
5. Keep snapshots up to date

## Emergency Contacts

- **Lead Developer**: Joseph MULÉ
- **Push Chain Owner**: M1SSION™ Team
- **Critical Issue**: Create GitHub issue with `critical` label