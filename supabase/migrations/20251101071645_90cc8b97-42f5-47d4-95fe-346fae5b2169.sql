-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix invoke_auto_push_cron function to handle pg_net response correctly

DROP FUNCTION IF EXISTS public.invoke_auto_push_cron();

CREATE OR REPLACE FUNCTION public.invoke_auto_push_cron()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
  response_status int;
  response_body text;
BEGIN
  -- Call auto-push-cron via pg_net
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'x-cron-secret', '0f13afa7560be8f8d12d62005b00bd8d0aadd26d67d10d867a402cb6acc483f2'
    ),
    body := jsonb_build_object('trigger', 'cron', 'dryRun', false)
  ) INTO request_id;
  
  -- Wait briefly for response (async call)
  PERFORM pg_sleep(0.5);
  
  -- Get result from pg_net
  SELECT status, content::text
  INTO response_status, response_body
  FROM net.http_get_result(request_id);
  
  RETURN jsonb_build_object(
    'request_id', request_id,
    'status', response_status,
    'body', response_body
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'status', 500
  );
END;
$$;

-- Test the function
SELECT public.invoke_auto_push_cron() AS test_invocation;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™