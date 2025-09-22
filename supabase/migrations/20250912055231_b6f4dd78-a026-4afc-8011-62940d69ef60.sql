-- Update cron schedule for mirror-push-log-harvester to run every minute
-- First, try to unschedule if exists (ignore error if not found)
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('mirror-push-harvester');
  EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore errors if job doesn't exist
  END;
END $$;

-- Schedule the mirror-push-log-harvester to run every minute
SELECT cron.schedule(
  'mirror-push-harvester',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/mirror-push-log-harvester',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Update the manual trigger function to use correct API
CREATE OR REPLACE FUNCTION public.trigger_mirror_push_harvest()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow admins to trigger this
  IF NOT is_admin_secure() THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;
  
  -- Make the HTTP request to trigger harvesting
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/mirror-push-log-harvester',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"}'::jsonb,
    body := '{"manual_trigger": true}'::jsonb
  ) INTO result;
  
  RETURN jsonb_build_object(
    'success', true,
    'request_id', result,
    'message', 'Harvester triggered successfully'
  );
END;
$$;