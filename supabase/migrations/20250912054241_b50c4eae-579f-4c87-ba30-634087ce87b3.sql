-- Add metadata column to mirror_push.notification_logs if it doesn't exist
ALTER TABLE mirror_push.notification_logs 
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Add invocation_id column for correlation
ALTER TABLE mirror_push.notification_logs 
ADD COLUMN IF NOT EXISTS invocation_id uuid;