# Supabase Push Chain Rollback Guide

## Edge Functions Emergency Rollback

### 1. Export Current Functions (Backup)

```bash
# Create backup directory
mkdir -p infra/backups/$(date +%Y%m%d-%H%M)
cd infra/backups/$(date +%Y%m%d-%H%M)

# Download current functions
supabase functions download webpush-upsert --project-ref vkjrqirvdvjbemsfzxof
supabase functions download webpush-send --project-ref vkjrqirvdvjbemsfzxof

echo "Current functions backed up to: $(pwd)"
```

### 2. Deploy from Snapshot

```bash
# Find latest snapshot
ls -la infra/snapshots/functions/ | tail -5

# Deploy from specific snapshot
export SNAPSHOT_TS="20250909-1045"  # Replace with actual timestamp
cd infra/snapshots/functions/${SNAPSHOT_TS}

# Deploy functions
supabase functions deploy webpush-upsert --project-ref vkjrqirvdvjbemsfzxof
supabase functions deploy webpush-send --project-ref vkjrqirvdvjbemsfzxof
```

### 3. Verify Deployment

```bash
# Test upsert function
curl -X POST "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/webpush-upsert" \
  -H "content-type: application/json" \
  -d '{"test": true}'

# Should return CORS 400 error (expected for test payload)
# 500 errors indicate deployment issues

# Check logs
supabase functions logs webpush-upsert --project-ref vkjrqirvdvjbemsfzxof
```

## Database Schema Rollback

### 1. Check Current Schema

```bash
# Connect to database
psql $SUPABASE_DB_URL

# Check fcm_subscriptions table
\d fcm_subscriptions;
\d+ fcm_subscriptions;

# Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'fcm_subscriptions';
```

### 2. Restore from Snapshot (If Needed)

```bash
# Only if schema is corrupted
export SNAPSHOT_TS="20250909-1045"

# Restore schema (DANGER - test first)
psql $SUPABASE_DB_URL < infra/snapshots/schema/schema-${SNAPSHOT_TS}.sql

# Verify restoration
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM fcm_subscriptions;"
```

## Secrets Rollback

### 1. Check Current Secrets

```bash
# List secrets (names only)
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof

# Check presence of required secrets
supabase secrets get VAPID_PUBLIC_KEY --project-ref vkjrqirvdvjbemsfzxof
supabase secrets get VAPID_PRIVATE_KEY --project-ref vkjrqirvdvjbemsfzxof
supabase secrets get VAPID_SUBJECT --project-ref vkjrqirvdvjbemsfzxof
```

### 2. Restore Secrets (Manual)

```bash
# Secrets must be restored manually with correct values
# Check snapshot checksum file for verification

cat infra/snapshots/secrets/secrets-${SNAPSHOT_TS}.md

# Example restoration (use actual values)
supabase secrets set VAPID_PUBLIC_KEY="BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A" --project-ref vkjrqirvdvjbemsfzxof
supabase secrets set VAPID_PRIVATE_KEY="[actual private key]" --project-ref vkjrqirvdvjbemsfzxof
supabase secrets set VAPID_SUBJECT="mailto:wikus77@hotmail.it" --project-ref vkjrqirvdvjbemsfzxof
```

## Complete System Rollback

### Step-by-Step Recovery

1. **Export Current State** (backup)
   ```bash
   ./scripts/backup-current-state.sh
   ```

2. **Deploy Snapshot Functions**
   ```bash
   cd infra/snapshots/functions/${SNAPSHOT_TS}
   supabase functions deploy webpush-upsert --project-ref vkjrqirvdvjbemsfzxof
   supabase functions deploy webpush-send --project-ref vkjrqirvdvjbemsfzxof
   ```

3. **Verify Secrets** (don't change unless necessary)
   ```bash
   supabase secrets list --project-ref vkjrqirvdvjbemsfzxof
   ```

4. **Test Push Flow**
   ```bash
   # Test from iOS PWA
   # 1. Open https://m1ssion.eu on iPhone
   # 2. Add to home screen
   # 3. Enable push notifications
   # 4. Check edge function logs for success
   ```

5. **Monitor Logs**
   ```bash
   # Real-time monitoring
   supabase functions logs webpush-upsert --project-ref vkjrqirvdvjbemsfzxof --follow
   ```

## Verification Checklist

After rollback:

- [ ] `webpush-upsert` responds to OPTIONS with 204
- [ ] `webpush-upsert` accepts valid subscription payload
- [ ] `webpush-send` delivers notifications
- [ ] VAPID secrets are present and valid
- [ ] `fcm_subscriptions` table accessible
- [ ] RLS policies allow function access
- [ ] No 500 errors in function logs
- [ ] iOS PWA push subscription works

## Troubleshooting

### Function 500 Errors
- Check secrets are set: `supabase secrets list`
- Verify CORS configuration
- Check function logs for specific errors

### Database Connection Issues
- Verify SERVICE_ROLE_KEY secret
- Check network connectivity
- Ensure RLS policies don't block function

### VAPID Key Issues
- Verify public/private key pair match
- Check key format (base64url)
- Ensure subject is valid email

## Emergency Contacts

- **Critical Issues**: Create GitHub issue with `critical` label
- **Supabase Support**: Support portal for platform issues
- **Dev Team**: Monitor #alerts channel