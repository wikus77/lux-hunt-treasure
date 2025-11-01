-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- SAFE CRON FIX: Function wrapper for auto-push-cron with secure secret management

-- Step 1: Create secure function to invoke auto-push-cron
-- This function will be called by cron and handles the HTTP call with proper auth
CREATE OR REPLACE FUNCTION public.invoke_auto_push_cron()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  response_data jsonb;
  http_response record;
BEGIN
  -- Call auto-push-cron via pg_net
  -- Note: CRON_SECRET must be configured in edge function environment
  -- The apikey is sufficient for basic auth, x-cron-secret validates at edge level
  SELECT * INTO http_response
  FROM net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'x-cron-secret', current_setting('app.supabase_cron_secret', false)
    ),
    body := jsonb_build_object('trigger', 'cron', 'dryRun', false)
  );
  
  RETURN jsonb_build_object(
    'status', http_response.status,
    'content', http_response.content::jsonb
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'status', 500
  );
END;
$$;

-- Step 2: Drop old broken job
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'auto-push-hourly';

-- Step 3: Create new cron job using the secure wrapper function
SELECT cron.schedule(
  'auto-push-hourly',
  '0 9-20 * * *',  -- Every hour from 09:00 to 20:00 UTC
  $$SELECT public.invoke_auto_push_cron()$$
);

-- Verify job created
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'auto-push-hourly';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™