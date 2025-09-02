-- FIX: Update 'unknown' endpoint_type to correct values based on endpoint URL
UPDATE push_subscriptions 
SET endpoint_type = CASE 
  WHEN endpoint LIKE '%fcm.googleapis.com%' THEN 'fcm'
  WHEN endpoint LIKE '%web.push.apple.com%' THEN 'apns'
  WHEN endpoint LIKE '%wns.notify.windows.com%' THEN 'wns'
  ELSE 'unknown'
END
WHERE endpoint_type = 'unknown' OR endpoint_type IS NULL;

-- Add comment to document the fix
COMMENT ON COLUMN push_subscriptions.endpoint_type IS 'Endpoint type: fcm|apns|wns - derived from endpoint URL';