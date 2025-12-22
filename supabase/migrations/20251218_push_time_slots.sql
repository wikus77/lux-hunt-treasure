-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Update auto-push cron schedule to 4 specific time slots
-- 
-- NEW SCHEDULE (Rome time):
--   - 09:00-09:59 (1 notification)
--   - 11:00-11:59 (1 notification)
--   - 15:00-15:59 (1 notification)
--   - 18:00-18:59 (1 notification)
--
-- UTC equivalents (December = CET = UTC+1):
--   - 08:00 UTC = 09:00 Rome
--   - 10:00 UTC = 11:00 Rome
--   - 14:00 UTC = 15:00 Rome
--   - 17:00 UTC = 18:00 Rome

-- Drop existing auto-push job
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'auto-push-hourly';

-- Create new job with 4 specific time slots
SELECT cron.schedule(
  'auto-push-hourly',
  '0 8,10,14,17 * * *',  -- 4 specific UTC hours → Rome: 09, 11, 15, 18
  $$SELECT public.invoke_auto_push_cron(jsonb_build_object('trigger', 'cron', 'dryRun', false))$$
);

-- Verify job updated
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'auto-push-hourly';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


