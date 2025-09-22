-- Add sample seed data to external_feed_items
INSERT INTO external_feed_items (
  source, title, url, content_hash, published_at, summary, tags, brand
) VALUES 
(
  'luxury_news', 
  'Nuove tendenze luxury 2025', 
  'https://example.com/luxury-trends-2025',
  'hash_luxury_' || extract(epoch from now())::text,
  now() - interval '10 minutes',
  'Le ultime tendenze nel settore luxury per il 2025',
  ARRAY['luxury', 'fashion', 'trends'],
  'LuxuryBrand'
),
(
  'automotive_feed',
  'Auto elettriche: il futuro è ora',
  'https://example.com/electric-cars-future',
  'hash_auto_' || extract(epoch from now())::text,
  now() - interval '15 minutes', 
  'Novità nel mondo delle auto elettriche',
  ARRAY['auto', 'electric', 'technology'],
  'AutoMag'
),
(
  'mission_updates',
  'Missioni segrete: nuovi sviluppi',
  'https://example.com/secret-missions',
  'hash_mission_' || extract(epoch from now())::text,
  now() - interval '5 minutes',
  'Aggiornamenti sulle missioni in corso',
  ARRAY['mission', 'secret', 'intelligence'],
  'IntelSource'
);

-- Schedule cron jobs for the intelligent notifications system
SELECT cron.schedule(
  'm1_profile_reducer',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/profile-reducer',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'm1_feed_crawler',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/feed-crawler',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'm1_notifier_engine',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/notifier-engine',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);