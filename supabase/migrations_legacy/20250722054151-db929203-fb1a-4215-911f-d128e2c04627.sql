-- M1SSION™ Fix Database Function Conflict and Force Cleanup
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1. Drop existing function to avoid return type conflict
DROP FUNCTION IF EXISTS public.cleanup_duplicate_subscriptions();

-- 2. Create new enhanced cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_subscriptions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  cleaned_count INTEGER := 0;
BEGIN
  -- For each user, keep only the most recent subscription of each tier
  WITH ranked_subs AS (
    SELECT 
      id,
      user_id,
      tier,
      status,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, tier 
        ORDER BY created_at DESC
      ) as rn,
      ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY 
          CASE WHEN status = 'active' THEN 1 ELSE 2 END,
          created_at DESC
      ) as global_rn
    FROM public.subscriptions
  ),
  to_cancel AS (
    SELECT id 
    FROM ranked_subs 
    WHERE rn > 1 OR (global_rn > 1 AND status = 'active')
  )
  UPDATE public.subscriptions 
  SET 
    status = 'canceled',
    updated_at = now()
  WHERE id IN (SELECT id FROM to_cancel)
    AND status != 'canceled';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  result := jsonb_build_object(
    'success', true,
    'duplicates_cleaned', cleaned_count,
    'timestamp', now()
  );
  
  -- Log cleanup action
  INSERT INTO public.panel_logs (event_type, details)
  VALUES ('aggressive_cleanup', result);
  
  RETURN result;
END;
$$;

-- 3. Create force user to base function
CREATE OR REPLACE FUNCTION public.force_user_to_base_tier(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  cleaned_subs INTEGER;
BEGIN
  -- Force cancel ALL subscriptions for user
  UPDATE public.subscriptions 
  SET 
    status = 'canceled',
    updated_at = now()
  WHERE user_id = p_user_id 
    AND status != 'canceled';
  
  GET DIAGNOSTICS cleaned_subs = ROW_COUNT;
  
  -- Force profile to Base (ignore developer override for this function)
  UPDATE public.profiles
  SET 
    subscription_tier = 'Base',
    tier = 'Base',
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Build result
  result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'subscriptions_canceled', cleaned_subs,
    'profile_reset', true,
    'timestamp', now()
  );
  
  -- Log the operation
  INSERT INTO public.panel_logs (event_type, details)
  VALUES ('force_base_tier', result);
  
  RETURN result;
END;
$$;

-- 4. Execute cleanup for current user
SELECT public.force_user_to_base_tier('495246c1-9154-4f01-a428-7f37fe230180');

-- 5. Clean up all duplicates system-wide
SELECT public.cleanup_duplicate_subscriptions();