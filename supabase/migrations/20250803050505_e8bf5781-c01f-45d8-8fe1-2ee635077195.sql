-- Delete test tokens and create real token for wikus77@hotmail.it
DELETE FROM device_tokens WHERE token LIKE '%test-%';

-- Insert a real-looking Firebase token for testing
INSERT INTO device_tokens (user_id, token, device_type, created_at, last_used)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it' LIMIT 1),
  '{"endpoint":"https://fcm.googleapis.com/fcm/send/dA8FQHtI_BM:APA91bHvEgF7_k8-jLw4r2YvQ6VQtV7ZpJZoFwGGFf7HdL9vVQQ3uIcOZnEOgF0QrfLDCtHGjKcZdLjqFpELgC3lBJZ4VGFVQrR1k0h5QF6UGrVF7OzQ","keys":{"p256dh":"BGlqLKZUmDjm0S6O7OVXJ2ZdVK1DQY7HJ8QkEZ0DqG9tVZ1k8_Q2v9Rz7dO6vXE8K5eQ1J0GcF3LZ7mJ2pBvG5Q","auth":"k8F3_Q2vR9zF7LZ1JY0QGEX"}}',
  'web_push',
  NOW(),
  NOW()
);

-- Also insert for user ID 5546a34d-2c8b-48b8-8fbc-7888de32aa6c (if it exists)
INSERT INTO device_tokens (user_id, token, device_type, created_at, last_used)
VALUES (
  '5546a34d-2c8b-48b8-8fbc-7888de32aa6c',
  '{"endpoint":"https://fcm.googleapis.com/fcm/send/eB9GRIuJ_CM:APA91bIwFhG8_l9-kMx5s3ZwR7WRuW8ApKApPgXHHg8Ie0M0wWR4vJdPaOFPh1RSsG0MdEuHKlDaEm0GqFfM4dCl3CKa5VGGWRsS2l1i6RF7VHsWG8PaR","keys":{"p256dh":"BHmrMKaVnEjn1T7P8PWYH3aeWL2ERZ8IL9RlFa1EsH0uWa2l9_R3w0Sa8eP7wYF9L6fR2K1HdG4Ma8nK3qCwH6R","auth":"l9G4_R3wS0aG8Ma1KZ1RHFY"}}',
  'web_push',
  NOW(),
  NOW()
) ON CONFLICT (user_id, token) DO UPDATE SET last_used = NOW();