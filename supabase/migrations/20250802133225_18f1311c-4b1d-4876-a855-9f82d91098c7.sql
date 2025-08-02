-- Crea tabella semplificata per i log delle notifiche push
CREATE TABLE IF NOT EXISTS public.push_notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'user')),
  target_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  devices_sent INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy per admin (può fare tutto)
CREATE POLICY "Admin can manage push logs" 
ON public.push_notification_logs 
FOR ALL
USING (
  auth.jwt() ->> 'email' = 'wikus77@hotmail.it'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'wikus77@hotmail.it'
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_admin_user_id ON public.push_notification_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_created_at ON public.push_notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_notification_logs_status ON public.push_notification_logs(status);