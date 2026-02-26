-- ============================================================================
-- PHASE 1 — VERIFY (read-only). Eseguire in Supabase SQL Editor.
-- ============================================================================

-- Config
SELECT id, base_url IS NOT NULL AND trim(coalesce(base_url,'')) <> '' AS base_url_set, auth_token IS NOT NULL AND trim(coalesce(auth_token,'')) <> '' AS auth_token_set FROM public.email_send_config;

-- Conteggio email_sends
SELECT count(*) AS email_sends_count FROM public.email_sends;

-- Tabelle nello schema net
SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'net' ORDER BY table_name;

-- Colonne net.http_request_queue (se esiste)
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'net' AND table_name = 'http_request_queue' ORDER BY ordinal_position;

-- Funzioni HTTP nello schema net
SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'net' AND p.proname ILIKE 'http%';
