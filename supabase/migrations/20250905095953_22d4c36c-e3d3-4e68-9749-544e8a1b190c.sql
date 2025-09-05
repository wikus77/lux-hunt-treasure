-- Fix FCM subscriptions and create upsert function
-- Remove existing trigger and function first to avoid conflicts
DROP TRIGGER IF EXISTS update_fcm_subscriptions_updated_at ON public.fcm_subscriptions;
DROP FUNCTION IF EXISTS update_fcm_subscriptions_updated_at();

-- Create better upsert function for FCM subscriptions
CREATE OR REPLACE FUNCTION public.upsert_fcm_subscription(
  p_user_id uuid, 
  p_token text, 
  p_platform text, 
  p_device_info jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL OR p_token IS NULL OR p_token = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid user_id or token');
  END IF;
  
  -- Normalize platform
  p_platform := lower(trim(p_platform));
  IF p_platform NOT IN ('ios', 'android', 'desktop') THEN
    p_platform := 'desktop'; -- fallback
  END IF;
  
  -- Upsert the subscription
  INSERT INTO public.fcm_subscriptions (user_id, token, platform, device_info, is_active, created_at, updated_at)
  VALUES (p_user_id, p_token, p_platform, COALESCE(p_device_info, '{}'::jsonb), true, now(), now())
  ON CONFLICT (token) 
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    platform = EXCLUDED.platform,
    device_info = EXCLUDED.device_info,
    is_active = true,
    updated_at = now()
  RETURNING * INTO result_record;
  
  RETURN jsonb_build_object(
    'success', true, 
    'id', result_record.id,
    'token_prefix', left(result_record.token, 20) || '...',
    'platform', result_record.platform
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'hint', 'Check user_id format and token validity'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_fcm_subscription TO authenticated;

-- Create new updated_at trigger with better function
CREATE OR REPLACE FUNCTION public.update_fcm_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger
CREATE TRIGGER update_fcm_subscriptions_updated_at
  BEFORE UPDATE ON public.fcm_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_fcm_subscriptions_updated_at();