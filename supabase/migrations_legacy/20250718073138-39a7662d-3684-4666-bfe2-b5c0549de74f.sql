-- Clean up any unpaid user_map_areas that shouldn't exist
DELETE FROM public.user_map_areas 
WHERE user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.payment_transactions 
  WHERE status = 'succeeded' 
  AND (description ILIKE '%Buzz Map%' OR description ILIKE '%BUZZ MAPPA%')
  AND created_at >= '2025-07-17T00:00:00Z'
)
AND created_at >= '2025-07-17T00:00:00Z';

-- Add comment explaining the cleanup
COMMENT ON TABLE public.user_map_areas IS 'Areas are only valid with corresponding succeeded BUZZ MAP payments';