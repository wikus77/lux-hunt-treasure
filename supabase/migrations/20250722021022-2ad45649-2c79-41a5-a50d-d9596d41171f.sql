-- Create scheduled_notifications table for BUZZ cooldown notifications
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scheduled notifications" 
ON public.scheduled_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage scheduled notifications" 
ON public.scheduled_notifications 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_scheduled_notifications_due ON public.scheduled_notifications (scheduled_for, status) WHERE status = 'scheduled';
CREATE INDEX idx_scheduled_notifications_user ON public.scheduled_notifications (user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_scheduled_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_notifications_updated_at
BEFORE UPDATE ON public.scheduled_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_scheduled_notifications_updated_at();