-- Fix RLS policies for new tables that are missing security policies

-- Enable RLS for external_feed_items (public readable)
ALTER TABLE public.external_feed_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read feed items (no auth required for news/content)
CREATE POLICY "external_feed_items_read_all" ON public.external_feed_items
  FOR SELECT USING (true);

-- Enable RLS for suggested_notifications  
ALTER TABLE public.suggested_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notification suggestions
CREATE POLICY "suggested_notifications_owner" ON public.suggested_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Enable RLS for notification_quota
ALTER TABLE public.notification_quota ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own quota
CREATE POLICY "notification_quota_owner" ON public.notification_quota
  FOR SELECT USING (auth.uid() = user_id);