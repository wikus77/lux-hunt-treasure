-- M1SSION™ - Schedule auto-push-cron (SAFE MODE)
-- © 2025 Joseph MULÉ - NIYVORA KFT™
-- 
-- IMPORTANT: This migration contains PLACEHOLDERS for sensitive values.
-- Before executing, replace:
--   <SUPABASE_URL> with your actual Supabase URL
--   <CRON_SECRET> with your cron secret (from Supabase Dashboard > Edge Functions > Secrets)
--   <ANON_KEY> with your anon key
--
-- DO NOT commit secrets to version control!

-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule auto-push-cron: every hour 9-20 (project timezone)
-- This will trigger automatic push notifications during active hours
SELECT cron.schedule(
  'auto-push-hourly',
  '0 9-20 * * *',
  $$
  SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/auto-push-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>',
      'apikey', '<ANON_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);