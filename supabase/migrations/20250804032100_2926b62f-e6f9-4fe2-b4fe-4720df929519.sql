-- Fix push_notification_logs table structure
ALTER TABLE public.push_notification_logs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS devices_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have status
UPDATE public.push_notification_logs 
SET status = CASE 
  WHEN success = true THEN 'sent' 
  ELSE 'failed' 
END
WHERE status IS NULL;