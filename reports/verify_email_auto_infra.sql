-- ============================================================================
-- READ-ONLY: Verifica email auto infra (tabelle, trigger, funzioni, pg_net, config)
-- Progetto: vkjrqirvdvjbemsfzxof
-- Eseguire in Supabase Dashboard → SQL Editor. Nessuna modifica, nessuna migration.
-- ============================================================================

-- 1) TABELLE: esistenza (YES/NO) e colonne principali
SELECT t.tname AS table_name,
  CASE WHEN i.table_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS exists,
  COALESCE(
    (SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
     FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.table_name = t.tname),
    '—'
  ) AS main_columns
FROM (VALUES ('email_sends'), ('email_send_config'), ('prize_claims'), ('final_shoot_winners')) AS t(tname)
LEFT JOIN information_schema.tables i ON i.table_schema = 'public' AND i.table_name = t.tname;

-- 2) TRIGGER: nome, tabella, funzione, AFTER INSERT, attivo
SELECT t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  CASE WHEN t.tgtype & 2 = 2 THEN 'AFTER' ELSE 'BEFORE' END AS timing,
  CASE WHEN t.tgenabled = 'O' THEN 'YES' ELSE 'NO' END AS active
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal
  AND t.tgname IN ('trigger_email_marker_physical_prize', 'trigger_email_final_shoot_winner');

-- 3) FUNZIONI: esistenza e SECURITY DEFINER
SELECT p.proname AS function_name,
  CASE WHEN p.prosecdef THEN 'YES' ELSE 'NO' END AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = 'public'
WHERE p.proname IN ('queue_and_invoke_marker_prize_email', 'queue_and_invoke_final_shoot_winner_email');

-- 4) ESTENSIONE pg_net
SELECT CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN 'YES' ELSE 'NO' END AS pg_net_installed;

-- 5) CONFIG: riga, base_url SET/NULL, auth_token SET/NULL (valore token NON mostrato)
-- 5a) Controllo esistenza tabella (sempre sicuro, nessun riferimento a email_send_config)
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'email_send_config'
) AS config_table_exists;
-- Se config_table_exists = false → usare: row_exists = NO, base_url = NULL, auth_token = NULL
-- Se config_table_exists = true  → eseguire la query 5b sotto.

-- 5b) Eseguire SOLO se la tabella email_send_config esiste (altrimenti errore 42P01)
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM public.email_send_config LIMIT 1) THEN 'YES' ELSE 'NO' END AS row_exists,
  (SELECT CASE WHEN base_url IS NOT NULL AND trim(base_url) <> '' THEN 'SET' ELSE 'NULL' END FROM public.email_send_config LIMIT 1) AS base_url_status,
  (SELECT CASE WHEN auth_token IS NOT NULL AND trim(auth_token) <> '' THEN 'SET' ELSE 'NULL' END FROM public.email_send_config LIMIT 1) AS auth_token_status;
