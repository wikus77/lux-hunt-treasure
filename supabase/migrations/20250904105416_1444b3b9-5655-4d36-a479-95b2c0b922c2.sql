-- Add device_info column to push_subscriptions table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'push_subscriptions' 
                   AND column_name = 'device_info') THEN
        ALTER TABLE public.push_subscriptions 
        ADD COLUMN device_info JSONB DEFAULT '{}';
    END IF;
END $$;