-- Verification queries for the intelligent notifications system

-- Check if cron jobs are scheduled correctly
SELECT jobname, schedule, active 
FROM cron.job 
WHERE jobname LIKE 'm1_%';

-- Check external feed items
SELECT id, source, title, published_at, tags, brand
FROM external_feed_items
ORDER BY created_at DESC
LIMIT 5;

-- Check recent interest signals (mock data for demo)
SELECT COUNT(*) as signal_count, type, section
FROM interest_signals
WHERE created_at > now() - interval '1 hour'
GROUP BY type, section
ORDER BY signal_count DESC;

-- Check user interest profiles
SELECT user_id, topics, created_at, updated_at
FROM user_interest_profile
ORDER BY updated_at DESC
LIMIT 3;

-- Check suggested notifications
SELECT user_id, content_type, title, score, created_at
FROM suggested_notifications
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC
LIMIT 5;

-- Check notification quota today
SELECT user_id, daily_count, last_sent_at
FROM notification_quota
WHERE quota_date = CURRENT_DATE
ORDER BY daily_count DESC
LIMIT 3;