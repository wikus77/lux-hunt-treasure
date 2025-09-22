-- Create v_latest_webpush_subscription view for notifier-engine hardening
CREATE OR REPLACE VIEW public.v_latest_webpush_subscription AS
SELECT 
  ws.id AS sub_id,
  ws.user_id,
  ws.endpoint,
  ws.created_at
FROM public.webpush_subscriptions ws
WHERE ws.is_active = true
  AND ws.id IN (
    SELECT DISTINCT ON (user_id) id
    FROM public.webpush_subscriptions
    WHERE is_active = true
    ORDER BY user_id, created_at DESC
  );

-- Create v_pref_users view for clean user enumeration  
CREATE OR REPLACE VIEW public.v_pref_users AS
SELECT DISTINCT np.user_id
FROM public.notification_preferences np
WHERE np.enabled = true
  AND np.user_id IS NOT NULL
ORDER BY np.user_id;