-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- VERIFICA CRON → EDGE (da eseguire in Supabase Dashboard SQL Editor)
-- URL: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/sql/new

-- ================================================================
-- 1. VERIFICA pg_cron JOB
-- ================================================================
SELECT 
  jobid, 
  jobname, 
  schedule, 
  active,
  LEFT(command, 100) as command_preview
FROM cron.job 
WHERE jobname ILIKE '%push%' 
   OR command ILIKE '%auto-push%'
   OR command ILIKE '%invoke_auto_push%';

-- ================================================================
-- 2. VERIFICA ULTIMI RUN DEL CRON
-- ================================================================
SELECT 
  runid,
  jobid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- ================================================================
-- 3. VERIFICA FUNZIONE invoke_auto_push_cron
-- ================================================================
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as full_definition
FROM pg_proc 
WHERE proname = 'invoke_auto_push_cron';

-- ================================================================
-- 4. VERIFICA COLONNA cron_secret IN auto_push_config
-- ================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'auto_push_config' 
  AND table_schema = 'public';

-- ================================================================
-- 5. VERIFICA VALORE cron_secret (MASCHERATO)
-- ================================================================
SELECT 
  id,
  enabled,
  LEFT(cron_secret, 8) || '...' || RIGHT(cron_secret, 4) as cron_secret_masked,
  LENGTH(cron_secret) as secret_length
FROM auto_push_config
LIMIT 1;

-- ================================================================
-- 6. VERIFICA HTTP REQUESTS INVIATI DA pg_net (ultimi 20)
-- ================================================================
SELECT 
  id,
  created_at,
  url,
  headers::text LIKE '%x-cron-secret%' as has_cron_secret_header,
  LEFT(body::text, 100) as body_preview
FROM net.http_request_queue 
ORDER BY id DESC 
LIMIT 20;

-- ================================================================
-- 7. VERIFICA HTTP RESPONSES (status codes)
-- ================================================================
SELECT 
  id,
  created,
  status_code,
  LEFT(error_msg, 100) as error_msg
FROM net._http_response 
ORDER BY id DESC 
LIMIT 50;

-- ================================================================
-- 8. TEST MANUALE: Simula chiamata cron (DRY RUN)
-- ================================================================
-- ATTENZIONE: Questo invoca REALMENTE la funzione!
-- SELECT public.invoke_auto_push_cron(
--   jsonb_build_object('trigger', 'test', 'dryRun', true, 'bypassQuietHours', true)
-- );
