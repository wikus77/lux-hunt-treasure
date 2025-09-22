-- Mirror Push Audit Schema Migration - Idempotente con Struttura Esistente
-- Obiettivo: sistema di audit isolato per ricerca e analisi notifiche

-- 0) Estensioni necessarie (idempotenti)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 1) Schema isolato
CREATE SCHEMA IF NOT EXISTS mirror_push;

-- 2) Drop delle tabelle sbagliate dalla migration precedente
DROP TABLE IF EXISTS mirror_push.harvested_logs CASCADE;
DROP TABLE IF EXISTS mirror_push.harvest_watermarks CASCADE;

-- 3) Adatta tabella sync_watermarks esistente alla struttura target
-- Controlla se esiste e la riallinea
DO $$ 
BEGIN
  -- Se sync_watermarks esiste ma ha colonne sbagliate, ricostruisci
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'mirror_push' AND table_name = 'sync_watermarks') THEN
    
    -- Verifica se ha la struttura corretta (name come PK)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'mirror_push' 
                   AND table_name = 'sync_watermarks' 
                   AND column_name = 'name') THEN
      -- Struttura sbagliata, drop e ricrea
      DROP TABLE mirror_push.sync_watermarks CASCADE;
    END IF;
  END IF;
END $$;

-- Crea sync_watermarks con struttura corretta
CREATE TABLE IF NOT EXISTS mirror_push.sync_watermarks (
  name text PRIMARY KEY,
  last_run_at timestamptz NOT NULL
);

-- 4) Crea/adatta notification_logs alla struttura target  
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

-- Aggiungi colonne mancanti se la tabella esiste già
DO $$
BEGIN
  -- Aggiungi colonne se mancanti (idempotente)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'sent_at') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN sent_at timestamptz;
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
                 AND column_name = 'provider') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN provider text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'status_code') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN status_code integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'endpoint') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN endpoint text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'mirror_push' 
                 AND table_name = 'notification_logs' 
                 AND column_name = 'project_ref') THEN
    ALTER TABLE mirror_push.notification_logs ADD COLUMN project_ref text;
  END IF;
END $$;

-- 5) Seed watermark sicuro (idempotente)
INSERT INTO mirror_push.sync_watermarks (name, last_run_at)
VALUES ('harvester', '1970-01-01')
ON CONFLICT (name) DO NOTHING;

-- 6) Indici GIN trigram separati e robusti
CREATE INDEX IF NOT EXISTS idx_mirror_title 
  ON mirror_push.notification_logs 
  USING gin ((coalesce(title,'')) extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mirror_body 
  ON mirror_push.notification_logs 
  USING gin ((coalesce(body,'')) extensions.gin_trgm_ops);

-- 7) Vista unificata di sola lettura (NO MODIFICA tabelle esistenti)
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

-- 8) RLS solo admin su tutto lo schema mirror_push
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