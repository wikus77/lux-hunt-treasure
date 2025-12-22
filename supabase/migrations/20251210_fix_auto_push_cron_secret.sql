-- FIX: Update invoke_auto_push_cron function with CORRECT CRON_SECRET
-- The previous function had an outdated secret, causing 401 errors

-- Drop existing function
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron();
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron(jsonb);

-- Create updated function with CORRECT secret
CREATE OR REPLACE FUNCTION public.invoke_auto_push_cron(p_body jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  -- 🔥 CORRECT CRON_SECRET - Updated 2025-12-10
  cron_secret text := 'c0585c71cb3fc28a7cb72edc309ff80fb88dd6832f3e6281453faa9a7fc9e322';
BEGIN
  -- Call auto-push-cron via pg_net with proper authentication
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', cron_secret
    ),
    body := COALESCE(p_body, jsonb_build_object('trigger', 'cron', 'dryRun', false))
  ) INTO request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Auto-push cron invoked successfully',
    'timestamp', now()
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO service_role;

COMMENT ON FUNCTION public.invoke_auto_push_cron(jsonb) IS 'Invokes auto-push-cron edge function with CORRECT CRON_SECRET. Fixed 2025-12-10.';

-- Verify the cron job is using the correct function
SELECT jobid, jobname, schedule, active, command
FROM cron.job 
WHERE jobname LIKE '%auto%push%' OR command LIKE '%auto%push%';



