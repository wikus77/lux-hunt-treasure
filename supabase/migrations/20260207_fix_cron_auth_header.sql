-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FIX: Add Authorization header to pg_net call for auto-push-cron
-- 
-- PROBLEM: Supabase Gateway requires Authorization header even when verify_jwt=false
-- The pg_net call was sending only x-cron-secret, causing 401
--
-- SOLUTION: Add Authorization: Bearer <ANON_KEY> to the request headers
-- ANON_KEY is safe to use here (public key, not a secret)

-- 1. Add anon_key column to auto_push_config (if not exists)
ALTER TABLE public.auto_push_config 
  ADD COLUMN IF NOT EXISTS anon_key text;

-- 2. Set the anon key value
UPDATE public.auto_push_config 
SET anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
WHERE id IS NOT NULL;

-- 3. Recreate the invoker function with Authorization header
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
  v_anon_key text;
BEGIN
  -- 🔑 READ SECRETS FROM CONFIG TABLE (single source of truth)
  SELECT cron_secret, anon_key INTO v_cron_secret, v_anon_key
  FROM auto_push_config
  LIMIT 1;

  IF v_cron_secret IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CRON_SECRET not configured in auto_push_config table'
    );
  END IF;

  IF v_anon_key IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ANON_KEY not configured in auto_push_config table'
    );
  END IF;

  -- 🔧 FIX 2026-02-07: Include Authorization header with anon key
  -- Supabase Gateway requires this even when verify_jwt=false
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key,
      'x-cron-secret', v_cron_secret
    ),
    body := COALESCE(p_body, jsonb_build_object('trigger', 'cron', 'dryRun', false))
  ) INTO request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Auto-push cron invoked with Authorization + cron_secret headers',
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
'Invokes auto-push-cron Edge Function. FIX 2026-02-07: Added Authorization header (anon key) required by Supabase Gateway.';

-- 5. Verify the function was created correctly
SELECT 
  proname as function_name,
  prosrc LIKE '%Authorization%' as has_auth_header,
  prosrc LIKE '%x-cron-secret%' as has_cron_secret
FROM pg_proc 
WHERE proname = 'invoke_auto_push_cron';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
