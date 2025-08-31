-- © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
-- Complete RLS policies for push_subscriptions

-- Allow anonymous/users to insert their own subscriptions
CREATE POLICY "push_sub_anon_insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to read their own subscriptions or anonymous ones
CREATE POLICY "push_sub_read_own" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own subscriptions
CREATE POLICY "push_sub_update_own" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own subscriptions
CREATE POLICY "push_sub_delete_own" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);