-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Geofence Engine Scheduler Setup

-- Unschedule if exists (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('geo-push-geofence-engine');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Schedule new job every 2 minutes
SELECT cron.schedule(
  'geo-push-geofence-engine',
  '*/2 * * * *',  -- every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/geofence-engine',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('scheduled', true)
  )::text;
  $$
);