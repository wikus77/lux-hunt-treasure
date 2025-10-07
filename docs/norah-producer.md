# 🤖 M1SSION™ - Norah Producer Guide

**© 2025 Joseph MULÉ - NIYVORA KFT™**  
**Status:** SAFE MODE - Template generation only

---

## 📋 Overview

`norah-producer` is an AI-powered notification template generator:

- **Creates AI templates** daily at 8:00
- **Stores in** `auto_push_templates` table
- **Does NOT send** push notifications
- **Templates consumed** by `auto-push-cron`

---

## 🧪 Manual Testing

```bash
export SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export CRON_SECRET="your_cron_secret"
export ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"

curl -sS "$SUPABASE_URL/functions/v1/norah-producer" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "apikey: $ANON_KEY" | jq .
```

---

## 📊 Verify Templates

```sql
-- Count Norah templates
SELECT COUNT(*) 
FROM auto_push_templates 
WHERE kind = 'norah_ai';

-- View recent templates
SELECT 
  created_at,
  title_it,
  body_it,
  target_segments
FROM auto_push_templates 
WHERE kind = 'norah_ai'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📚 Related

- [Cron Setup](./cron-setup.md)
- [Auto-Push Documentation](../supabase/functions/auto-push-cron/)
