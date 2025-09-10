-- Enable required extensions for cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Check if extensions are enabled
SELECT extname FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');