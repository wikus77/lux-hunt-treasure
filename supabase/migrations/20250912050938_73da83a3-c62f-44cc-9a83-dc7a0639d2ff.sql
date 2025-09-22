-- Mirror Push Audit Schema Migration - Correzione Struttura Esistente
-- Obiettivo: sistema di audit isolato per ricerca e analisi notifiche

-- 0) Estensioni necessarie (idempotenti)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 1) Schema isolato già esiste
CREATE SCHEMA IF NOT EXISTS mirror_push;

-- 2) Adatta tabella notification_logs esistente alla struttura target
-- Prima controlla struttura attuale e la adatta
DO $$
BEGIN
  -- Aggiungi colonne mancanti (idempotente)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'created_at') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'title') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'body') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN body text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'url') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'sent_by') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN sent_by uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'project_ref') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN project_ref text;
  END IF;
END $$;

-- 3) Crea sync_watermarks se non esiste già con struttura corretta
CREATE TABLE IF NOT EXISTS mirror_push.sync_watermarks (
  name text PRIMARY KEY,
  last_run_at timestamptz NOT NULL
);

-- Seed watermark sicuro (idempotente)
INSERT INTO mirror_push.sync_watermarks (name, last_run_at)
VALUES ('harvester', '1970-01-01')
ON CONFLICT (name) DO NOTHING;

-- 4) Indici GIN trigram separati e robusti (solo dopo aver aggiunto le colonne)
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
    COALESCE(m.created_at, m.sent_at) AS created_at,
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