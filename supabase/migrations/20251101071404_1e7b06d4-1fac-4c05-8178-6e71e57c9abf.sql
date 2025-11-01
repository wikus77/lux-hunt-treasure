-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Update invoke_auto_push_cron to use the configured CRON_SECRET

-- Drop and recreate the function with the correct secret value
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron();

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
  -- Call auto-push-cron via pg_net with configured CRON_SECRET
  SELECT * INTO http_response
  FROM net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'x-cron-secret', '0f13afa7560be8f8d12d62005b00bd8d0aadd26d67d10d867a402cb6acc483f2'
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

-- Verify the cron job is active
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'auto-push-hourly';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™