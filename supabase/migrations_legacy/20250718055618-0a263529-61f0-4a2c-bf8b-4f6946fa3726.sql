-- Fix BUZZ MAPPA: Clean up wrong coordinates and update payment statuses
-- Delete areas with coordinates outside Italy (wrong generation)
DELETE FROM user_map_areas 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180' 
  AND (lat > 47 OR lat < 35 OR lng > 19 OR lng < 6);

-- Update pending "Buzz Map" payments to succeeded for testing
UPDATE payment_transactions 
SET status = 'succeeded' 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180' 
  AND (description ILIKE '%Buzz Map%' OR description ILIKE '%BUZZ MAPPA%')
  AND status = 'pending'
  AND created_at >= '2025-07-17T00:00:00Z';