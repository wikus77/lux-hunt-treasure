-- Manual test run of the edge functions
SELECT net.http_post(
  url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/profile-reducer',
  headers := jsonb_build_object(
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
    'Content-Type', 'application/json'
  ),
  body := '{}'::jsonb
) as profile_reducer_test;

SELECT net.http_post(
  url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/notifier-engine',
  headers := jsonb_build_object(
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
    'Content-Type', 'application/json'
  ),
  body := '{}'::jsonb
) as notifier_engine_test;