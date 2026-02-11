# ROLLBACK IAP V12 - Edge Function

## Current State
- **Branch**: `hotfix/iap-v12-productcode-null`
- **Backup Tag**: `backup_before_iap_fix_20260211_141521`
- **HEAD**: `bf400def` (fix(edge-function): V12b - Add product fallback + robust M1U crediting)

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
