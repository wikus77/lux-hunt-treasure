-- Clean up any areas created without valid payments after 2025-07-17
DELETE FROM public.user_map_areas 
WHERE created_at >= '2025-07-17T00:00:00Z'
  AND user_id NOT IN (
    SELECT DISTINCT user_id 
    FROM public.payment_transactions 
    WHERE status = 'succeeded' 
      AND description ILIKE '%Buzz Map%'
      AND created_at >= '2025-07-17T00:00:00Z'
  );

-- Add index for better payment validation performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_status_desc 
ON public.payment_transactions(user_id, status, created_at) 
WHERE status = 'succeeded' AND description ILIKE '%Buzz Map%';

-- Add index for user map areas performance
CREATE INDEX IF NOT EXISTS idx_user_map_areas_user_created 
ON public.user_map_areas(user_id, created_at);

-- Log the cleanup action
INSERT INTO public.admin_logs (event_type, context, note) 
VALUES (
  'buzz_map_cleanup',
  '{"action": "removed_unpaid_areas", "date": "2025-07-18", "reason": "critical_fix"}',
  'Removed BUZZ MAP areas created without valid succeeded payments'
);