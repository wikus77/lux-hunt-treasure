-- ===========================================
-- FIX: Geofence CRON job - Remove dry mode
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- ===========================================

DO $$
BEGIN
  -- Delete existing geofence cron job
  DELETE FROM cron.job WHERE jobname = 'geo-push-geofence-engine';
  
  -- Recreate with dry: FALSE (production mode)
  PERFORM cron.schedule(
    'geo-push-geofence-engine',
    '*/2 * * * *',
    'SELECT net.http_post(
      url := ''https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/geofence-engine'', 
      headers := ''{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAzNDIyNiwiZXhwIjoyMDYwNjEwMjI2fQ.6f5tOHuGNDVKjRXtgvKfMhN-8s6hnqjCgVkKiWevVXQ"}''::jsonb, 
      body := ''{"dry": false}''::jsonb
    ) as request_id;'
  );
  
  RAISE NOTICE 'Geofence CRON job recreated with dry: false (production mode)';
END $$;
