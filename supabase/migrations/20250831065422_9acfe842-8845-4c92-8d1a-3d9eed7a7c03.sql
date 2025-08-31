-- Add missing platform column and improve push_subscriptions schema
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS platform text,
ADD COLUMN IF NOT EXISTS ua text,
ADD COLUMN IF NOT EXISTS app_version text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_push_subscriptions_user
ON public.push_subscriptions (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_push_subscriptions_user_endpoint
ON public.push_subscriptions (user_id, endpoint);

-- Update RLS policies for proper access control
DROP POLICY IF EXISTS "insert_own_subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "select_own_subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "update_own_subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "edge_function_full_access" ON public.push_subscriptions;

-- Allow anon/authenticated to insert their own subscriptions
CREATE POLICY "insert_own_subscription"
ON public.push_subscriptions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated users can view their own subscriptions
CREATE POLICY "select_own_subscription"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can update their own subscriptions
CREATE POLICY "update_own_subscription"
ON public.push_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Service role has full access for edge functions
CREATE POLICY "edge_function_full_access"
ON public.push_subscriptions
FOR ALL
TO service_role
USING (true) WITH CHECK (true);