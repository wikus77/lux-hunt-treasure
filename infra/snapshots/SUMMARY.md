# Push Chain Snapshots Summary

## Latest Snapshots

### Frontend (Repository)
- **Tag**: `push-stable-20250909-1045` (example)
- **Files Protected**: 8 critical files
- **SW Hash**: `a1b2c3d4...` (calculated by scripts/hash-sw.mjs)
- **VAPID Key**: `BBjgzW...y8Q` (redacted)

### Backend (Supabase)
- **Functions**: webpush-upsert, webpush-send
- **Schema**: fcm_subscriptions table + RLS policies
- **Secrets**: VAPID_PUBLIC/PRIVATE/SUBJECT, ORIGIN_WEB/APP

## Snapshot Directory Structure

```
infra/snapshots/
├── SUMMARY.md (this file)
├── functions/
│   ├── 20250909-1045/
│   │   ├── webpush-upsert/
│   │   │   └── index.ts
│   │   └── webpush-send/
│   │       └── index.ts
│   └── [other timestamps]/
├── schema/
│   ├── schema-20250909-1045.sql
│   └── data-fcm-subscriptions-20250909-1045.sql
└── secrets/
    └── secrets-20250909-1045.md
```

## Hash Verification

Run to verify current state:
```bash
node scripts/hash-sw.mjs
```

## Rollback Procedures

See `docs/ROLLBACK_PUSH.md` for complete instructions.

Quick rollback:
```bash
git checkout tags/push-stable-YYYYMMDD-HHMM
```

## Guard Status

- **Frontend Guard**: `.github/workflows/push-guard.yml` active
- **Test Command**: `npm run test:push`
- **Override Label**: `override-push-guard` required for protected file changes

## Notes

- Snapshots are created before any major push chain changes
- All critical files are SHA256 hashed for integrity verification
- Edge functions include runtime guard logging
- Database schema includes minimal dump for fcm_subscriptions