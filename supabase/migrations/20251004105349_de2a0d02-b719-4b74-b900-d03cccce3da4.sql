-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Norah Proactive Notifications System

-- Tabella per tracciare notifiche proattive inviate
CREATE TABLE IF NOT EXISTS public.norah_proactive_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'pattern_found', 'new_prize_nearby', 'finalshot_suggestion', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT now(),
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index per performance
CREATE INDEX idx_norah_proactive_user ON public.norah_proactive_notifications(user_id);
CREATE INDEX idx_norah_proactive_type ON public.norah_proactive_notifications(notification_type);
CREATE INDEX idx_norah_proactive_sent ON public.norah_proactive_notifications(sent_at);

-- RLS policies
ALTER TABLE public.norah_proactive_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proactive notifications"
  ON public.norah_proactive_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert proactive notifications"
  ON public.norah_proactive_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notification clicks"
  ON public.norah_proactive_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function per marcare notifica come cliccata
CREATE OR REPLACE FUNCTION public.mark_norah_notification_clicked(p_notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.norah_proactive_notifications
  SET clicked = true,
      clicked_at = now()
  WHERE id = p_notification_id
    AND user_id = auth.uid();
END;
$function$;