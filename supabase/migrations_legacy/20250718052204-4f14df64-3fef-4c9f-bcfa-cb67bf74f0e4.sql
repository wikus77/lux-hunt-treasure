-- Clean up test areas with wrong coordinates (Rome instead of Agrigento)
DELETE FROM user_map_areas WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180' AND lat BETWEEN 41.8 AND 42.0 AND lng BETWEEN 12.4 AND 12.6;

-- Insert a test completed payment transaction for BUZZ MAP to verify the flow
INSERT INTO payment_transactions (
  user_id,
  amount,
  currency,
  provider,
  provider_transaction_id,
  status,
  description,
  created_at
) VALUES (
  '495246c1-9154-4f01-a428-7f37fe230180',
  4.99,
  'EUR',
  'stripe',
  'cs_test_buzzmap_simulation_2025',
  'succeeded',
  'M1SSION™ Buzz Map Purchase - RESET COMPLETO 17/07/2025',
  NOW()
);