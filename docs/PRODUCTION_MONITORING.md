# M1SSION™ Production Monitoring Guide

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

---

## 📊 Key Metrics to Monitor

### User Engagement
```sql
-- Active users last 24h
SELECT COUNT(DISTINCT id) as active_users
FROM profiles
WHERE updated_at >= NOW() - INTERVAL '24 hours';

-- New registrations today
SELECT COUNT(*) as new_users
FROM profiles
WHERE created_at >= CURRENT_DATE;

-- Mission enrollments
SELECT COUNT(*) as enrollments
FROM user_mission_registrations
WHERE created_at >= CURRENT_DATE;
```

### M1U System
```sql
-- M1U balance distribution
SELECT 
  CASE 
    WHEN m1_units = 0 THEN '0'
    WHEN m1_units < 100 THEN '1-99'
    WHEN m1_units < 500 THEN '100-499'
    ELSE '500+'
  END as balance_range,
  COUNT(*) as users
FROM profiles
GROUP BY 1
ORDER BY 1;

-- M1U transactions today
SELECT COUNT(*) as transactions, SUM(amount) as total_m1u
FROM m1u_transactions
WHERE created_at >= CURRENT_DATE;
```

### Push Notifications
```sql
-- Push subscriptions by platform
SELECT platform, COUNT(*) as count
FROM fcm_subscriptions
WHERE is_active = true
GROUP BY platform;

-- Auto-push delivery today
SELECT status, COUNT(*) as count
FROM auto_push_log
WHERE sent_date = CURRENT_DATE
GROUP BY status;
```

### Buzz System
```sql
-- Buzz activations today
SELECT COUNT(*) as buzzes
FROM user_buzz_counter
WHERE date = CURRENT_DATE;

-- Map areas created today
SELECT COUNT(*) as areas
FROM user_map_areas
WHERE created_at >= CURRENT_DATE;
```

---

## 🔔 Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate (5min) | > 1% | > 5% |
| Response time p99 | > 2s | > 5s |
| Push failure rate | > 10% | > 30% |
| Auth failures | > 50/hour | > 200/hour |
| Edge Function errors | > 10/hour | > 50/hour |

---

## 🔧 Supabase Dashboard Checks

### Daily
1. Check Edge Function logs for errors
2. Review realtime subscription count
3. Verify database connections
4. Check storage usage

### Weekly
1. Review slow queries
2. Analyze Edge Function duration
3. Check rate limit violations
4. Review auth logs

---

## 📱 Push Notification Health

### Verify FCM Status
```bash
# Test FCM send (via Edge Function)
curl -X POST 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/fcm-send' \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"user_id": "test-user-id", "title": "Test", "body": "Test notification"}'
```

### Check Subscription Tables
```sql
-- FCM subscriptions health
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active) as active,
  COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '30 days') as stale
FROM fcm_subscriptions;

-- WebPush subscriptions health  
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active) as active
FROM webpush_subscriptions;
```

---

## ⚠️ Common Issues & Solutions

### Issue: Push notifications not delivered
**Check:**
1. FCM_SERVICE_ACCOUNT_JSON configured?
2. VAPID keys set?
3. User has active subscription?

**Fix:**
```sql
-- Check user's push subscriptions
SELECT * FROM fcm_subscriptions WHERE user_id = '<user_id>';
SELECT * FROM webpush_subscriptions WHERE user_id = '<user_id>';
```

### Issue: M1U not deducting
**Check:**
1. profiles.m1_units balance
2. Edge Function logs for errors
3. RPC functions exist

### Issue: Map not loading
**Check:**
1. VITE_MAPTILER_KEY_DEV/PROD set?
2. MapTiler API quota available?
3. Browser console for 401/403 errors

---

## 📈 Performance Benchmarks

| Endpoint | Target p50 | Target p99 |
|----------|------------|------------|
| handle-buzz-press | < 200ms | < 500ms |
| buzz-map-resolve | < 300ms | < 800ms |
| fcm-send | < 500ms | < 1s |
| enroll-mission | < 200ms | < 500ms |

---

## 🚨 Incident Response

### Severity 1 (Critical)
- App completely down
- No users can login
- Payment processing failed

**Action:** Immediate investigation, rollback if needed

### Severity 2 (High)  
- Push notifications failing
- Map not loading
- M1U transactions failing

**Action:** Investigate within 1 hour

### Severity 3 (Medium)
- Slow response times
- Minor UI issues
- Non-critical feature broken

**Action:** Investigate within 24 hours

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

