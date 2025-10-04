-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Schedule Norah AI Proactive Analyzer to run every 4 hours

SELECT cron.schedule(
  'norah-proactive-analyzer',
  '0 */4 * * *', -- Every 4 hours at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/norah-proactive-analyzer',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);