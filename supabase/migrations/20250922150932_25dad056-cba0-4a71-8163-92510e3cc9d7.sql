-- Fix RLS policies for webpush_subscriptions to allow client registration
-- Add policy for authenticated users to insert/update their own subscriptions

-- Remove existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage webpush subscriptions" ON public.webpush_subscriptions;

-- Add policies for clients to manage their own subscriptions
CREATE POLICY "Users can manage their own webpush subscriptions" 
ON public.webpush_subscriptions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Keep service role access for admin operations
CREATE POLICY "Service role can manage all webpush subscriptions"
ON public.webpush_subscriptions FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);