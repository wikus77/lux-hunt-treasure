-- Add indices for FCM subscriptions performance
-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_fcm_subscriptions_user_active 
ON public.fcm_subscriptions (user_id, is_active) 
WHERE is_active = true;

-- Index for token uniqueness (already covered by constraint)
-- Ensure proper RLS policies are in place
-- Users can only CRUD their own FCM subscription rows

-- Verify current RLS policies exist
DO $$
BEGIN
  -- Check if policies exist, if not create them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'fcm_subscriptions' 
    AND policyname = 'Users can manage their own FCM subscriptions'
  ) THEN
    -- Enable RLS first
    ALTER TABLE public.fcm_subscriptions ENABLE ROW LEVEL SECURITY;
    
    -- Create comprehensive policy for users to manage their own records
    CREATE POLICY "Users can manage their own FCM subscriptions"
    ON public.fcm_subscriptions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;