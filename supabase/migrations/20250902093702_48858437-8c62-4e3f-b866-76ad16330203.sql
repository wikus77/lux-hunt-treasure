-- M1SSION™ Push Subscriptions Schema Update
-- Create/migrate table with all required columns and proper constraints

-- Ensure table exists with all required columns
DO $$
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'push_subscriptions') THEN
    CREATE TABLE public.push_subscriptions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid,
      endpoint text unique not null,
      p256dh text not null,
      auth text not null,
      ua text,
      platform text,
      endpoint_type text default 'unknown',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    
    RAISE NOTICE 'Created push_subscriptions table';
  END IF;

  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'endpoint_type') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN endpoint_type text default 'unknown';
    RAISE NOTICE 'Added endpoint_type column';
  END IF;

END $$;

-- Update existing records to set proper endpoint_type based on URL
UPDATE public.push_subscriptions 
SET endpoint_type = CASE 
  WHEN endpoint LIKE '%web.push.apple.com%' THEN 'apns'
  WHEN endpoint LIKE '%fcm.googleapis.com%' THEN 'fcm'  
  WHEN endpoint LIKE '%wns.notify.windows.com%' THEN 'wns'
  ELSE 'unknown'
END
WHERE endpoint_type = 'unknown' OR endpoint_type IS NULL;

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger 
LANGUAGE plpgsql 
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- Drop and recreate trigger to ensure it's using the latest function
DROP TRIGGER IF EXISTS set_updated_at ON public.push_subscriptions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION public.tg_set_updated_at();

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS sub_select_own ON public.push_subscriptions;
DROP POLICY IF EXISTS sub_upsert_own ON public.push_subscriptions;
DROP POLICY IF EXISTS sub_update_own ON public.push_subscriptions;
DROP POLICY IF EXISTS sub_delete_own ON public.push_subscriptions;

-- Create comprehensive RLS policies
CREATE POLICY sub_select_own ON public.push_subscriptions
  FOR SELECT 
  USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

CREATE POLICY sub_upsert_own ON public.push_subscriptions
  FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

CREATE POLICY sub_update_own ON public.push_subscriptions
  FOR UPDATE 
  USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

CREATE POLICY sub_delete_own ON public.push_subscriptions
  FOR DELETE 
  USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_platform ON public.push_subscriptions(platform);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint_type ON public.push_subscriptions(endpoint_type);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON public.push_subscriptions(created_at);

COMMENT ON TABLE public.push_subscriptions IS 'M1SSION™ Push notification subscriptions with support for iOS PWA (APNs) and Desktop (FCM)';
COMMENT ON COLUMN public.push_subscriptions.endpoint_type IS 'Auto-detected from endpoint URL: apns, fcm, wns, unknown';
COMMENT ON COLUMN public.push_subscriptions.user_id IS 'Nullable to support guest subscriptions';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'Base64url encoded P-256 public key (65 bytes when decoded)';
COMMENT ON COLUMN public.push_subscriptions.auth IS 'Base64url encoded auth secret (16 bytes when decoded)';

-- Report final state
SELECT 
  'push_subscriptions' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE endpoint_type = 'apns') as apns_count,
  COUNT(*) FILTER (WHERE endpoint_type = 'fcm') as fcm_count,
  COUNT(*) FILTER (WHERE endpoint_type = 'unknown') as unknown_count,
  COUNT(*) FILTER (WHERE user_id IS NULL) as guest_subscriptions
FROM public.push_subscriptions;