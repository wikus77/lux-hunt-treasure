-- Create notification_counters table for real-time badge counts
CREATE TABLE public.notification_counters (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_counters ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own counter
CREATE POLICY "Users can view their own notification counter" 
ON public.notification_counters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification counter" 
ON public.notification_counters 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to safely upsert notification counter
CREATE OR REPLACE FUNCTION public.upsert_notification_counter(p_user_id UUID, p_delta INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.notification_counters (user_id, unread_count, updated_at)
  VALUES (p_user_id, GREATEST(0, p_delta), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    unread_count = GREATEST(0, notification_counters.unread_count + p_delta),
    updated_at = now()
  RETURNING unread_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Function to get current unread count for a user
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT unread_count INTO count_result
  FROM public.notification_counters
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(count_result, 0);
END;
$$;

-- Enable realtime for notification_counters
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_counters;

-- Set replica identity for complete row data in realtime updates
ALTER TABLE public.notification_counters REPLICA IDENTITY FULL;