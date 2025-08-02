-- Crea tabella per i log delle notifiche push
CREATE TABLE IF NOT EXISTS public.push_notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'user')),
  target_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  devices_sent INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy per admin (può vedere tutto)
CREATE POLICY "Admin can view all push logs" 
ON public.push_notification_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR 
  auth.jwt() ->> 'email' = 'wikus77@hotmail.it'
);

-- Policy per admin (può inserire log)
CREATE POLICY "Admin can insert push logs" 
ON public.push_notification_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR 
  auth.jwt() ->> 'email' = 'wikus77@hotmail.it'
);

-- Policy per admin (può aggiornare log)
CREATE POLICY "Admin can update push logs" 
ON public.push_notification_logs 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR 
  auth.jwt() ->> 'email' = 'wikus77@hotmail.it'
);

-- Trigger per updated_at
CREATE TRIGGER update_push_notification_logs_updated_at
  BEFORE UPDATE ON public.push_notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_user_id ON public.push_notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_created_at ON public.push_notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_status ON public.push_notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_target_type ON public.push_notification_logs(target_type);