-- Fix v_latest_webpush_subscription view structure
DROP VIEW IF EXISTS public.v_latest_webpush_subscription;

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