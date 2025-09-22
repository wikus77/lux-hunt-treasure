-- Fix: rendere user_id nullable per supportare record panel
ALTER TABLE mirror_push.notification_logs 
ALTER COLUMN user_id DROP NOT NULL;

-- Fix: rendere endpoint nullable per supportare record senza endpoint
ALTER TABLE mirror_push.notification_logs 
ALTER COLUMN endpoint DROP NOT NULL;

-- Fix: rendere provider nullable per supportare record senza provider
ALTER TABLE mirror_push.notification_logs 
ALTER COLUMN provider DROP NOT NULL;

-- Ora eseguiamo il backfill corretto con user_id nullable
-- A) Copia dai log panel (public.push_notification_logs) → source='panel'
INSERT INTO mirror_push.notification_logs
  (id, created_at, sent_at, user_id, provider, status_code,
   title, body, url, endpoint, project_ref, metadata, invocation_id, source)
SELECT
  gen_random_uuid(),
  p.created_at,
  p.sent_at,
  null::uuid,                                       -- panel non ha user_id specifico
  null::text,                                       -- provider sconosciuto nel panel
  CASE WHEN p.success THEN 200 ELSE 500 END,
  p.title,
  p.message,
  null,
  null,
  'vkjrqirvdvjbemsfzxof',
  jsonb_build_object(
    'status', p.status,
    'success', p.success,
    'devices_targeted', p.devices_targeted,
    'devices_sent', p.devices_sent,
    'fcm_sent', p.fcm_sent,
    'fcm_failed', p.fcm_failed,
    'apns_sent', p.apns_sent,
    'apns_failed', p.apns_failed,
    'error_message', p.error_message
  ),
  null,
  'panel'
FROM public.push_notification_logs p
WHERE NOT EXISTS (
  SELECT 1 FROM mirror_push.notification_logs m
  WHERE m.created_at = p.created_at
    AND coalesce(m.title,'') = coalesce(p.title,'')
    AND coalesce(m.body,'')  = coalesce(p.message,'')
    AND m.source = 'panel'
)
LIMIT 500;