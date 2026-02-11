# ROLLBACK IAP V13 - Edge Function

## Current State
- **Branch**: `hotfix/iap-v12-productcode-null`
- **Backup Tag (pre-V13)**: `backup_before_iap_fix_20260211_141521`
- **V13 Commit**: `f5a53bbf` (fix: Add missing product_code, store_product_id, product_type)

## ROOT CAUSE FIXED
- `iap_transactions` table requires `product_code NOT NULL`, `store_product_id NOT NULL`, `product_type NOT NULL`
- Edge Function INSERT was missing these fields → 500 error
- V13 adds `productCodeMap` to derive `product_code` from `product_id`

## IMMEDIATE ROLLBACK (if needed)

### Step 1: Restore code to backup state
```bash
cd /Users/josephmule/lux-hunt-treasure
git checkout backup_before_iap_fix_20260211_141521 -- supabase/functions/verify-iap-purchase/index.ts supabase/functions/_shared/rateLimit.ts
```

### Step 2: Re-deploy Edge Function
```bash
supabase functions deploy verify-iap-purchase --project-ref vkjrqirvdvjbemsfzxof
```

### Step 3: Verify
- Check Supabase Dashboard: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions
- Invocations should return 2xx (or expected status)

## FULL ROLLBACK (nuclear option)
```bash
git reset --hard backup_before_iap_fix_20260211_141521
supabase functions deploy verify-iap-purchase --project-ref vkjrqirvdvjbemsfzxof
```

## Previous Working State
If V12b was already broken, rollback further to:
```bash
git checkout f6cbb18d -- supabase/functions/verify-iap-purchase/index.ts
supabase functions deploy verify-iap-purchase --project-ref vkjrqirvdvjbemsfzxof
```

## Contact
- Issue: `product_code` NULL causing 500 errors
- Root cause: INSERT into audit/log table with NULL product_code violates NOT NULL constraint
