-- STEP 1: Remove FCM validation constraint (if exists)
DO $$ 
BEGIN 
    -- Remove any existing check constraints on fcm_subscriptions
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fcm_subscriptions_token_check') THEN
        ALTER TABLE public.fcm_subscriptions DROP CONSTRAINT fcm_subscriptions_token_check;
    END IF;
    
    -- Remove any pattern check constraints that might exist
    PERFORM 1 FROM pg_constraint c 
    WHERE c.conrelid = 'public.fcm_subscriptions'::regclass 
    AND c.contype = 'c' 
    AND pg_get_constraintdef(c.oid) LIKE '%token%pattern%';
    
    IF FOUND THEN
        -- Get constraint name and drop it
        FOR rec IN 
            SELECT c.conname 
            FROM pg_constraint c 
            WHERE c.conrelid = 'public.fcm_subscriptions'::regclass 
            AND c.contype = 'c' 
            AND pg_get_constraintdef(c.oid) LIKE '%token%pattern%'
        LOOP
            EXECUTE 'ALTER TABLE public.fcm_subscriptions DROP CONSTRAINT ' || quote_ident(rec.conname);
        END LOOP;
    END IF;
END $$;

-- STEP 2: Create simplified upsert function without pattern validation
CREATE OR REPLACE FUNCTION public.upsert_fcm_subscription(
    p_user_id uuid, 
    p_token text, 
    p_platform text, 
    p_device_info jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result_record RECORD;
BEGIN
  -- Only basic validation - NO pattern checks
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id cannot be null');
  END IF;
  
  IF p_token IS NULL OR length(trim(p_token)) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'token must be at least 10 characters');
  END IF;
  
  -- Normalize platform
  p_platform := lower(trim(p_platform));
  IF p_platform NOT IN ('ios', 'android', 'desktop') THEN
    p_platform := 'desktop'; -- fallback
  END IF;
  
  -- Simple upsert without any pattern validation
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
    'platform', result_record.platform,
    'created_at', result_record.created_at
  );
EXCEPTION WHEN OTHERS THEN
  -- Enhanced error reporting
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'sqlstate', SQLSTATE,
    'detail', CASE 
      WHEN SQLSTATE = '23505' THEN 'Duplicate token conflict'
      WHEN SQLSTATE = '23502' THEN 'Required field is null'
      WHEN SQLSTATE = '23514' THEN 'Check constraint violation: ' || SQLERRM
      ELSE 'Database error: ' || SQLERRM
    END
  );
END;
$function$;