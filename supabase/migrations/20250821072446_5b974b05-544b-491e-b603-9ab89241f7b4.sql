-- Add missing is_active column to device_tokens table
ALTER TABLE public.device_tokens 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update all existing device tokens to be active
UPDATE public.device_tokens 
SET is_active = true 
WHERE is_active IS NULL;