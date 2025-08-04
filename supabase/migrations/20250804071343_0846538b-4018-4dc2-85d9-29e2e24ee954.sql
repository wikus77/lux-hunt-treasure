-- Add missing metadata column to user_notifications
ALTER TABLE public.user_notifications 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add service role policy for push notifications
CREATE POLICY "Service role can manage all notifications"
ON public.user_notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update device registration to handle iOS/Android properly
-- No schema changes needed for device_tokens as it already supports ios/android types