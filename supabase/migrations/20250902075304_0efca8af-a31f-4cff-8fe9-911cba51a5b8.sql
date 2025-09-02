-- Update endpoint_type for existing subscriptions
UPDATE public.push_subscriptions 
SET endpoint_type = CASE 
  WHEN endpoint LIKE '%web.push.apple.com%' OR endpoint LIKE '%api.push.apple.com%' THEN 'apns'
  WHEN endpoint LIKE '%fcm.googleapis.com%' THEN 'fcm'
  WHEN endpoint LIKE '%wns.notify.windows.com%' THEN 'wns'
  ELSE 'unknown'
END
WHERE endpoint_type = 'unknown' OR endpoint_type IS NULL;