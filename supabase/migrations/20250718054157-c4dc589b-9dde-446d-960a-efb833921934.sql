-- Fix BUZZ MAPPA: Delete wrong areas and update payment status for testing
-- Delete areas with wrong coordinates (not near Agrigento)
DELETE FROM user_map_areas 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180' 
  AND (lat > 40 OR lat < 35 OR lng > 15 OR lng < 12);

-- Update the successful payment to succeeded status for area display
UPDATE payment_transactions 
SET status = 'succeeded' 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180' 
  AND description ILIKE '%Buzz Map%' 
  AND status = 'pending';