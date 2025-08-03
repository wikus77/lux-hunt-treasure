-- Insert test device tokens for debugging push notifications
INSERT INTO device_tokens (user_id, token, device_type, last_used) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it' LIMIT 1),
  '{"endpoint":"https://fcm.googleapis.com/fcm/send/test-endpoint-1","keys":{"p256dh":"test-p256dh-key","auth":"test-auth-key"}}',
  'web_push',
  now()
),
(
  gen_random_uuid(),
  '{"endpoint":"https://fcm.googleapis.com/fcm/send/test-endpoint-2","keys":{"p256dh":"test-p256dh-key-2","auth":"test-auth-key-2"}}',
  'web_push', 
  now()
);

-- Verify the data was inserted
SELECT count(*) as total_tokens FROM device_tokens;