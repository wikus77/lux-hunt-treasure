-- Mirror Push Audit Schema Migration - Zero Impact su Catena Push
-- Obiettivo: sistema di audit isolato per ricerca e analisi notifiche

-- 0) Estensioni necessarie (idempotenti)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 1) Schema isolato
CREATE SCHEMA IF NOT EXISTS mirror_push;

-- 2) Tabella notification_logs (pulita e allineata alle specifiche)
-- Prima rimuovi la tabella harvested_logs se esiste (era sbagliata)
DROP TABLE IF EXISTS mirror_push.harvested_logs CASCADE;
DROP TABLE IF EXISTS mirror_push.harvest_watermarks CASCADE;

CREATE TABLE IF NOT EXISTS mirror_push.notification_logs (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  sent_by uuid,
  provider text,
  status_code integer,
  title text,
  body text,
  url text,
  endpoint text,
  project_ref text
);

-- 3) Tabella sync_watermarks con name come PK (non id!)
CREATE TABLE IF NOT EXISTS mirror_push.sync_watermarks (
  name text PRIMARY KEY,
  last_run_at timestamptz NOT NULL
);

-- Seed watermark sicuro
INSERT INTO mirror_push.sync_watermarks (name, last_run_at)
VALUES ('harvester', '1970-01-01')
ON CONFLICT (name) DO NOTHING;

-- 4) Indici GIN trigram separati e robusti
CREATE INDEX IF NOT EXISTS idx_mirror_title 
  ON mirror_push.notification_logs 
  USING gin ((coalesce(title,'')) extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mirror_body 
  ON mirror_push.notification_logs 
  USING gin ((coalesce(body,'')) extensions.gin_trgm_ops);

-- 5) Vista unificata di sola lettura (NO MODIFICA tabelle esistenti)
CREATE OR REPLACE VIEW mirror_push.v_search AS
  -- A) Log del Panel (fonte: public.push_notification_logs)
  SELECT
    p.created_at,
    p.sent_at,
    'panel'::text AS src,
    NULL::uuid AS sent_by,
    NULL::integer AS status_code,
    NULL::text AS provider,
    p.title,
    p.message AS body,
    NULL::text AS url
  FROM public.push_notification_logs p

  UNION ALL

  -- B) Messaggi utente storici tipo='push' (fonte: public.user_notifications)  
  SELECT
    u.created_at,
    NULL::timestamptz AS sent_at,
    'user_notifications'::text AS src,
    u.user_id AS sent_by,
    NULL::integer AS status_code,
    NULL::text AS provider,
    u.title,
    u.message AS body,
    NULL::text AS url
  FROM public.user_notifications u
  WHERE u.type = 'push'

  UNION ALL

  -- C) Eventuali log mirror futuri (fonte: mirror_push.notification_logs)
  SELECT
    m.created_at,
    m.sent_at,
    'mirror_logs'::text AS src,
    m.sent_by,
    m.status_code,
    m.provider,
    m.title,
    m.body,
    m.url
  FROM mirror_push.notification_logs m;

-- 6) RLS solo admin su tutto lo schema mirror_push
ALTER TABLE mirror_push.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_push.sync_watermarks ENABLE ROW LEVEL SECURITY;

-- Policy per notification_logs
DROP POLICY IF EXISTS mirror_push_logs_admin ON mirror_push.notification_logs;
CREATE POLICY mirror_push_logs_admin
  ON mirror_push.notification_logs
  FOR ALL
  TO authenticated
  USING (is_admin_secure())
  WITH CHECK (is_admin_secure());

-- Policy per sync_watermarks  
DROP POLICY IF EXISTS mirror_push_watermarks_admin ON mirror_push.sync_watermarks;
CREATE POLICY mirror_push_watermarks_admin
  ON mirror_push.sync_watermarks
  FOR ALL
  TO authenticated
  USING (is_admin_secure())
  WITH CHECK (is_admin_secure());