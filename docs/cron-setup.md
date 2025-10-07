# 🕐 M1SSION™ - Cron Setup (SAFE, placeholders)

**© 2025 Joseph MULÉ - NIYVORA KFT™**  
**Status:** SAFE MODE - No modifications to core push infrastructure

---

## 📋 Overview

Automated push notifications via Supabase cron jobs:

1. **auto-push-cron** - Hourly (9:00-20:00)
2. **norah-producer** - Daily at 8:00 (optional, template generation only)

**IMPORTANT:** Migrations contain PLACEHOLDERS. Update them manually in Supabase SQL Editor.

---

## 🔐 Required Values

### 1. Supabase URL
```
https://vkjrqirvdvjbemsfzxof.supabase.co
```

### 2. Anon Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk
```

### 3. Cron Secret
Generate and store in **Supabase Dashboard** > **Edge Functions** > **Secrets**:
```bash
openssl rand -hex 32  # Name: CRON_SECRET
```

---

## 🚀 Step 2: Update Cron Jobs with Real Values

The cron jobs have been created but contain placeholders. You must update them:

### Update auto-push-hourly

```sql
-- 1. First, unschedule the existing job with placeholders
SELECT cron.unschedule('auto-push-hourly');

-- 2. Then, schedule it again with REAL values (replace <...> with actual values)
SELECT cron.schedule(
  'auto-push-hourly',
  '0 9-20 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'YOUR_ACTUAL_CRON_SECRET_HERE',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### Update norah-producer-daily (Optional)

```sql
-- 1. Unschedule the placeholder version
SELECT cron.unschedule('norah-producer-daily');

-- 2. Schedule with REAL values
SELECT cron.schedule(
  'norah-producer-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/norah-producer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'YOUR_ACTUAL_CRON_SECRET_HERE',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## ✅ Step 3: Verify Cron Jobs

```sql
SELECT 
  jobname, 
  schedule, 
  active,
  command
FROM cron.job 
WHERE jobname IN ('auto-push-hourly', 'norah-producer-daily');
```

---

## 🧪 Step 4: Manual Testing

### Test auto-push-cron

```bash
export SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export CRON_SECRET="your_actual_cron_secret"
export ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"

curl -sS "$SUPABASE_URL/functions/v1/auto-push-cron" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "apikey: $ANON_KEY" | jq .
```

### Monitor Results

```sql
-- Count notifications sent in last hour
SELECT COUNT(*) 
FROM auto_push_log 
WHERE sent_at > NOW() - INTERVAL '1 hour';

-- View recent activity
SELECT 
  sent_at,
  user_id,
  template_kind,
  success
FROM auto_push_log 
ORDER BY sent_at DESC
LIMIT 10;
```

---

## 📚 Related Documentation

- [Norah Producer Guide](./norah-producer.md)
- [Prebuild Hook Instructions](./PACKAGE_JSON_PREBUILD_INSTRUCTIONS.md)
