-- Create table for push notification logs
CREATE TABLE IF NOT EXISTS public.push_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('all', 'specific')),
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  devices_targeted integer DEFAULT 0,
  fcm_sent integer DEFAULT 0,
  fcm_failed integer DEFAULT 0,
  apns_sent integer DEFAULT 0,
  apns_failed integer DEFAULT 0,
  success boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb
);

-- Enable RLS
ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all push logs" 
ON public.push_notification_logs 
FOR SELECT 
USING (public.is_admin_user());

CREATE POLICY "Admins can insert push logs" 
ON public.push_notification_logs 
FOR INSERT 
WITH CHECK (public.is_admin_user());

-- Create index for better performance
CREATE INDEX idx_push_logs_sent_by ON public.push_notification_logs(sent_by);
CREATE INDEX idx_push_logs_created_at ON public.push_notification_logs(created_at DESC);
CREATE INDEX idx_push_logs_target_type ON public.push_notification_logs(target_type);