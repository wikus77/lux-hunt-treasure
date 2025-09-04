-- Extend push_tokens table for Android support
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS endpoint_type TEXT DEFAULT 'android',
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing records to set default endpoint type
UPDATE public.push_tokens 
SET endpoint_type = CASE 
  WHEN platform = 'android' THEN 'fcm'
  WHEN platform = 'ios' THEN 'apns'
  ELSE 'unknown'
END
WHERE endpoint_type IS NULL;