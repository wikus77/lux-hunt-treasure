-- M1SSION™ - Schedule norah-producer (OPTIONAL, SAFE MODE)
-- © 2025 Joseph MULÉ - NIYVORA KFT™
-- 
-- IMPORTANT: This migration contains PLACEHOLDERS for sensitive values.
-- Before executing, replace:
--   <SUPABASE_URL> with your actual Supabase URL
--   <CRON_SECRET> with your cron secret (from Supabase Dashboard > Edge Functions > Secrets)
--   <ANON_KEY> with your anon key
--
-- DO NOT commit secrets to version control!
--
-- NOTE: This is OPTIONAL. norah-producer creates AI-generated notification templates
-- but does NOT send push notifications. Templates are consumed by auto-push-cron.

-- Schedule norah-producer: daily at 08:00 (before auto-push-cron starts at 09:00)
SELECT cron.schedule(
  'norah-producer-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/norah-producer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>',
      'apikey', '<ANON_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);