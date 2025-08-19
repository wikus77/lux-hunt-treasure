-- © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
-- Create push notifications log table for advanced token tracking

CREATE TABLE IF NOT EXISTS public.push_notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  token TEXT,
  platform TEXT,
  device_info JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_notifications_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own push logs" 
ON public.push_notifications_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert push logs" 
ON public.push_notifications_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all push logs" 
ON public.push_notifications_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create index for performance
CREATE INDEX idx_push_notifications_log_user_id ON public.push_notifications_log(user_id);
CREATE INDEX idx_push_notifications_log_event_type ON public.push_notifications_log(event_type);
CREATE INDEX idx_push_notifications_log_created_at ON public.push_notifications_log(created_at);