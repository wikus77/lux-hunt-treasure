-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix CRON job auto-push-hourly with real values (no placeholders)
-- Schedule: Every hour from 09:00 to 20:00 UTC (10:00-21:00 Europe/Rome)

-- Drop existing jobs if present (safe cleanup)
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname IN ('auto-push-hourly', 'norah-producer-daily');

-- Create auto-push-hourly job with REAL project values
-- Uses CRON_SECRET from edge function environment (secure)
SELECT cron.schedule(
  'auto-push-hourly',
  '0 9-20 * * *',  -- Every hour from 09:00 to 20:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true),
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
    ),
    body := jsonb_build_object('trigger','cron','dryRun',false)
  );
  $$
);

-- Verify job created
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'auto-push-hourly';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™