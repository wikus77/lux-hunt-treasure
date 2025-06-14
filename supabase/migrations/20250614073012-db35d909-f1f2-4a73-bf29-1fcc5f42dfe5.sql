
-- Enable required PostgreSQL extensions for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily backup at 3:00 AM UTC
SELECT cron.schedule(
  'daily-database-backup-m1ssion',
  '0 3 * * *', -- ogni giorno alle 3:00 AM
  $$
  SELECT net.http_post(
    url:='https://vkjrqirvdvjbemsfzxof.functions.supabase.co/daily-database-backup',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule weekly leaderboard snapshot at 11:59 PM UTC every Sunday
SELECT cron.schedule(
  'weekly-leaderboard-snapshot-m1ssion',
  '59 23 * * 0', -- ogni domenica alle 23:59
  $$
  SELECT net.http_post(
    url:='https://vkjrqirvdvjbemsfzxof.functions.supabase.co/weekly-leaderboard-snapshot',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule cleanup of old logs once per day at 4:00 AM UTC
SELECT cron.schedule(
  'daily-logs-cleanup-m1ssion',
  '0 4 * * *', -- ogni giorno alle 4:00 AM
  $$
  DELETE FROM public.runtime_logs WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM public.abuse_logs WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM public.system_logs WHERE severity = 'info' AND timestamp < NOW() - INTERVAL '60 days';
  -- Keep error and high severity logs for longer
  DELETE FROM public.system_logs WHERE severity = 'warn' AND timestamp < NOW() - INTERVAL '180 days';
  -- Never auto-delete error and high severity logs
  $$
);
