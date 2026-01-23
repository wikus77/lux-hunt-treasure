-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FIX: Make CRON_SECRET a single source of truth (not hardcoded)
-- 
-- PROBLEM: cron_secret was hardcoded in invoke_auto_push_cron()
-- When Edge env secret was rotated, DB still sent old value → 401
--
-- SOLUTION: Store canonical secret in auto_push_config table
-- SQL invoker reads from table, not hardcoded literal

-- 1. Add cron_secret column to auto_push_config (if not exists)
ALTER TABLE public.auto_push_config 
  ADD COLUMN IF NOT EXISTS cron_secret text;

-- 2. Set the canonical secret value (this is the CURRENT working secret)
-- IMPORTANT: Update this value when you rotate secrets
UPDATE public.auto_push_config 
SET cron_secret = 'c0585c71cb3fc28a7cb72edc309ff80fb88dd6832f3e6281453faa9a7fc9e322'
WHERE id IS NOT NULL;

-- 3. Recreate the invoker function to READ from config table
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron();
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron(jsonb);

CREATE OR REPLACE FUNCTION public.invoke_auto_push_cron(p_body jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
  v_cron_secret text;
BEGIN
  -- 🔑 READ SECRET FROM CONFIG TABLE (single source of truth)
  SELECT cron_secret INTO v_cron_secret
  FROM auto_push_config
  LIMIT 1;

  IF v_cron_secret IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CRON_SECRET not configured in auto_push_config table'
    );
  END IF;

  -- Call auto-push-cron via pg_net with secret from config
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_cron_secret
    ),
    body := COALESCE(p_body, jsonb_build_object('trigger', 'cron', 'dryRun', false))
  ) INTO request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Auto-push cron invoked successfully (secret from config table)',
    'timestamp', now()
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO service_role;

COMMENT ON FUNCTION public.invoke_auto_push_cron(jsonb) IS 
'Invokes auto-push-cron Edge Function. Secret read from auto_push_config.cron_secret (single source of truth). Updated 2026-01-23.';

-- 5. Verify the function was created
SELECT 
  proname as function_name,
  prosrc LIKE '%auto_push_config%' as reads_from_config
FROM pg_proc 
WHERE proname = 'invoke_auto_push_cron';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
