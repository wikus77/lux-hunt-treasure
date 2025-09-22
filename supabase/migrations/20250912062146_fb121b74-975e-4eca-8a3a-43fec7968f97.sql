-- B) Copia storici da public.user_notifications (solo type='push') → source='user_notifications'
INSERT INTO mirror_push.notification_logs
  (id, created_at, sent_at, user_id, provider, status_code,
   title, body, url, endpoint, project_ref, metadata, invocation_id, source)
SELECT
  gen_random_uuid(),
  u.created_at,
  u.created_at,                                     -- non abbiamo sent_at: ripieghiamo su created_at
  u.user_id,                                        -- QUI è UUID: niente ::text
  null::text,
  200,
  coalesce(u.title,'M1'),
  u.message,
  null, null,
  'vkjrqirvdvjbemsfzxof',
  jsonb_build_object('note','seed from user_notifications'),
  null,
  'user_notifications'
FROM public.user_notifications u
WHERE u.type='push'
  AND NOT EXISTS (
    SELECT 1 FROM mirror_push.notification_logs m
    WHERE m.created_at = u.created_at
      AND coalesce(m.title,'') = coalesce(u.title,'')
      AND coalesce(m.body,'')  = coalesce(u.message,'')
      AND m.source = 'user_notifications'
  )
LIMIT 1000;