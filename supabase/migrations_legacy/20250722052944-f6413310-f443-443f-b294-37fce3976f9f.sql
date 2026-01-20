-- M1SSION™ System Fix: Clean up duplicate subscriptions and force sync
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1. Function to clean up duplicate active subscriptions
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For each user, keep only the most recent active subscription
  WITH ranked_subs AS (
    SELECT 
      id,
      user_id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.subscriptions 
    WHERE status = 'active'
  )
  UPDATE public.subscriptions 
  SET status = 'canceled', updated_at = now()
  WHERE id IN (
    SELECT id FROM ranked_subs WHERE rn > 1
  );
  
  -- Log cleanup action
  INSERT INTO public.panel_logs (event_type, details)
  VALUES ('subscription_cleanup', jsonb_build_object('action', 'duplicate_cleanup', 'timestamp', now()));
END;
$$;

-- 2. Function to force subscription sync
CREATE OR REPLACE FUNCTION public.force_subscription_sync(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_sub RECORD;
  final_tier TEXT := 'Base';
BEGIN
  -- Get most recent active subscription
  SELECT * INTO active_sub
  FROM public.subscriptions
  WHERE user_id = p_user_id 
    AND status = 'active'
    AND (end_date IS NULL OR end_date > now())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Determine final tier
  IF active_sub.id IS NOT NULL THEN
    final_tier := active_sub.tier;
  END IF;
  
  -- Developer override
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id AND email = 'wikus77@hotmail.it') THEN
    final_tier := 'Titanium';
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    subscription_tier = final_tier,
    tier = final_tier,
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;

-- 3. Clean up current duplicate subscriptions
SELECT public.cleanup_duplicate_subscriptions();

-- 4. Force sync for the current user
SELECT public.force_subscription_sync('495246c1-9154-4f01-a428-7f37fe230180');