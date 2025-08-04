-- ✅ CRITICAL FIX: Add unique constraint for device_tokens upsert to work
ALTER TABLE public.device_tokens 
ADD CONSTRAINT device_tokens_user_device_unique 
UNIQUE (user_id, device_type);

-- ✅ Also add index for better performance
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_device 
ON public.device_tokens (user_id, device_type);