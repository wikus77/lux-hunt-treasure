
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix auto-push cron authentication flow

-- Update invoke_auto_push_cron to accept custom body and use correct secret
CREATE OR REPLACE FUNCTION public.invoke_auto_push_cron(p_body jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
  -- This is the cron secret that must match the CRON_SECRET in Edge Function env
  cron_secret text := '0f13afa7560be8f8d12d62005b00bd8d0aadd26d67d10d867a402cb6acc483f2';
BEGIN
  -- Call auto-push-cron via pg_net with proper authentication
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'x-cron-secret', cron_secret
    ),
    body := COALESCE(p_body, jsonb_build_object('trigger', 'cron', 'dryRun', false))
  ) INTO request_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Auto-push cron invoked successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO anon;

COMMENT ON FUNCTION public.invoke_auto_push_cron(jsonb) IS 'Invokes auto-push-cron edge function with proper authentication. Accepts custom body for testing (e.g., force_user_id, bypass_quiet_hours, dry_run).';
