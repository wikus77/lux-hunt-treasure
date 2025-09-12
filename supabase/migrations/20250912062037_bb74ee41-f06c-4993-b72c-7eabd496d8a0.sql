-- Estensioni necessarie (idempotente)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Colonne attese nella tabella mirror (non toccare altri schemi)
-- Aggiungi ciò che manca, NON rimuovere nulla esistente.
ALTER TABLE mirror_push.notification_logs
  ADD COLUMN IF NOT EXISTS source text,               -- 'panel' | 'user_notifications' | 'harvester'
  ADD COLUMN IF NOT EXISTS provider text,             -- 'APPLE' | 'FCM' | null
  ADD COLUMN IF NOT EXISTS status_code int,           -- HTTP/status provider se noto
  ADD COLUMN IF NOT EXISTS url text,                  -- deep link se noto
  ADD COLUMN IF NOT EXISTS endpoint text,             -- endpoint destinazione se noto
  ADD COLUMN IF NOT EXISTS project_ref text,          -- ref progetto
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS invocation_id text;        -- id invocazione edge logs quando presente

-- Assicurati che sent_by sia UUID (mittente/utente) e accetti NULL
-- (nessun cast distruttivo: solo se oggi NON è uuid).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='mirror_push' AND table_name='notification_logs'
      AND column_name='sent_by' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE mirror_push.notification_logs
      ALTER COLUMN sent_by DROP DEFAULT,
      ALTER COLUMN sent_by TYPE uuid USING nullif(sent_by::text,'')::uuid;
  END IF;
END $$;

-- Indici utili per ricerca (idempotente)
CREATE INDEX IF NOT EXISTS mirror_push_logs_created_at ON mirror_push.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS mirror_push_logs_provider ON mirror_push.notification_logs(provider);
CREATE INDEX IF NOT EXISTS mirror_push_logs_title_trgm ON mirror_push.notification_logs USING gin ((coalesce(title,'') ) extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS mirror_push_logs_body_trgm  ON mirror_push.notification_logs USING gin ((coalesce(body,'')  ) extensions.gin_trgm_ops);

-- A) Copia dai log panel (public.push_notification_logs) → source='panel'
INSERT INTO mirror_push.notification_logs
  (id, created_at, sent_at, sent_by, provider, status_code,
   title, body, url, endpoint, project_ref, metadata, invocation_id, source)
SELECT
  gen_random_uuid(),
  p.created_at,
  p.sent_at,
  null::uuid,                                       -- panel non ha mittente/utente -> NULL
  null::text,                                       -- provider sconosciuto nel panel
  CASE WHEN p.success THEN 200 ELSE 500 END,
  p.title,
  p.message,
  null,
  null,
  current_setting('app.settings.project_ref', true),
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

-- B) Copia storici da public.user_notifications (solo type='push') → source='user_notifications'
INSERT INTO mirror_push.notification_logs
  (id, created_at, sent_at, sent_by, provider, status_code,
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
  current_setting('app.settings.project_ref', true),
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

-- Vista di ricerca unificata
CREATE OR REPLACE VIEW mirror_push.v_search AS
SELECT created_at, sent_at, sent_by, provider, title, body, url, source
FROM mirror_push.notification_logs;