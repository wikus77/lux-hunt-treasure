
-- Enable RLS on tables that don't have it yet and add appropriate policies

-- 1. Enable RLS on user_clues table and add policy
ALTER TABLE public.user_clues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_clues
  FOR ALL USING (auth.uid() = user_id);

-- 2. Enable RLS on user_buzz_counter table and add policy
ALTER TABLE public.user_buzz_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_buzz_counter
  FOR ALL USING (auth.uid() = user_id);

-- 3. Enable RLS on user_buzz_map_counter table and add policy
ALTER TABLE public.user_buzz_map_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_buzz_map_counter
  FOR ALL USING (auth.uid() = user_id);

-- 4. Enable RLS on user_map_areas table and add policy
ALTER TABLE public.user_map_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_map_areas
  FOR ALL USING (auth.uid() = user_id);

-- 5. Enable RLS on user_buzz_bonuses table and add policy
ALTER TABLE public.user_buzz_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_buzz_bonuses
  FOR ALL USING (auth.uid() = user_id);

-- 6. Enable RLS on user_minigames_progress table and add policy
ALTER TABLE public.user_minigames_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_minigames_progress
  FOR ALL USING (auth.uid() = user_id);

-- 7. Enable RLS on user_notifications table and add policy
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_notifications
  FOR ALL USING (auth.uid() = user_id);

-- 8. Enable RLS on user_payment_methods table and add policy
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- 9. Enable RLS on map_points table and add policy
ALTER TABLE public.map_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.map_points
  FOR ALL USING (auth.uid() = user_id);

-- 10. Enable RLS on search_areas table and add policy
ALTER TABLE public.search_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.search_areas
  FOR ALL USING (auth.uid() = user_id);

-- 11. Enable RLS on subscriptions table and add policy
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 12. Enable RLS on payment_transactions table and add policy
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.payment_transactions
  FOR ALL USING (auth.uid() = user_id);

-- 13. Enable RLS on device_tokens table and add policy
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.device_tokens
  FOR ALL USING (auth.uid() = user_id);

-- 14. Enable RLS on live_activity_state table and add policy
ALTER TABLE public.live_activity_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.live_activity_state
  FOR ALL USING (auth.uid() = user_id);

-- 15. Enable RLS on user_buzz_map table and add policy
ALTER TABLE public.user_buzz_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.user_buzz_map
  FOR ALL USING (auth.uid() = user_id);

-- 16. Enable RLS on buzz_map_actions table and add policy
ALTER TABLE public.buzz_map_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.buzz_map_actions
  FOR ALL USING (auth.uid() = user_id);

-- 17. Enable RLS on pre_registrations table with special policy for created_by
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to creator" ON public.pre_registrations
  FOR ALL USING (auth.uid() = created_by OR auth.uid() = user_id);

-- 18. Enable RLS on newsletter_subscribers table with user_id policy
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to owner" ON public.newsletter_subscribers
  FOR ALL USING (auth.uid() = user_id);

-- Admin-only tables: Enable RLS with admin access
-- 19. Enable RLS on abuse_logs table (admin only)
ALTER TABLE public.abuse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only" ON public.abuse_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 20. Enable RLS on abuse_alerts table (admin only)
ALTER TABLE public.abuse_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only" ON public.abuse_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 21. Enable RLS on app_messages table (admin only)
ALTER TABLE public.app_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only" ON public.app_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 22. Enable RLS on missions table (admin only)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only" ON public.missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public tables: Enable RLS with public access
-- 23. Enable RLS on clues table (public read access)
ALTER TABLE public.clues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.clues
  FOR SELECT USING (true);

CREATE POLICY "Admin write access - insert" ON public.clues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin write access - update" ON public.clues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin write access - delete" ON public.clues
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 24. Enable RLS on prizes table (public read access)
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.prizes
  FOR SELECT USING (true);

CREATE POLICY "Admin write access - insert" ON public.prizes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin write access - update" ON public.prizes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin write access - delete" ON public.prizes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 25. Enable RLS on prize_clues table (public read access)
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.prize_clues
  FOR SELECT USING (true);

CREATE POLICY "Admin write access - insert" ON public.prize_clues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin write access - update" ON public.prize_clues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin write access - delete" ON public.prize_clues
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 26. Enable RLS on contacts table (allow users to insert their own contacts)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read access" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
