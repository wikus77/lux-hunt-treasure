-- Add client column to track non-UUID identifiers
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS client TEXT;

-- Add endpoint_type column if it doesn't exist 
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS endpoint_type TEXT DEFAULT 'unknown';

-- Create index on endpoint_type for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint_type 
ON public.push_subscriptions(endpoint_type);

-- Create index on client for better queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client 
ON public.push_subscriptions(client);

-- Add comment for tracking
COMMENT ON COLUMN public.push_subscriptions.client IS 'Stores non-UUID client identifiers when user_id is invalid';