-- Add metadata column to user_notifications if missing
ALTER TABLE public.user_notifications 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Ensure proper RLS policies for user_notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.user_notifications;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.user_notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications" 
ON public.user_notifications 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');