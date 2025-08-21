-- Add missing device_info column to device_tokens table
ALTER TABLE public.device_tokens 
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}';

-- Update any existing rows to have valid device_info
UPDATE public.device_tokens 
SET device_info = '{"platform": "web", "source": "migrated"}' 
WHERE device_info IS NULL;