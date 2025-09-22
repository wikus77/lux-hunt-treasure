-- PUNTO 2: Setup cron job for geofence engine (corrected syntax)
DO $$
BEGIN
  -- Delete existing geofence cron job if exists
  DELETE FROM cron.job WHERE jobname = 'geo-push-geofence-engine';
  
  -- Create new cron job for geofence engine (every 2 minutes)
  SELECT cron.schedule(
    'geo-push-geofence-engine',
    '*/2 * * * *',
    'SELECT net.http_post(url := ''https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/geofence-engine'', headers := ''{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAzNDIyNiwiZXhwIjoyMDYwNjEwMjI2fQ.6f5tOHuGNDVKjRXtgvKfMhN-8s6hnqjCgVkKiWevVXQ"}''::jsonb, body := ''{"dry": true}''::jsonb) as request_id;'
  );
END $$;