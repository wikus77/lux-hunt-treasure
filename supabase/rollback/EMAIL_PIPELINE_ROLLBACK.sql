-- ============================================================================
-- ROLLBACK: Ripristino public.email_send_config (stato pre-fix email pipeline)
-- Eseguire SOLO per annullare le modifiche applicate con EMAIL_PIPELINE_APPLY.sql.
-- NON committare questo file se contiene il valore reale di auth_token.
-- ============================================================================

-- 1) Stato attuale (solo per riferimento; auth_token non mostrato in chiaro)
SELECT id, base_url,
  CASE WHEN auth_token IS NULL OR trim(auth_token) = '' THEN 'EMPTY' ELSE 'SET' END AS auth_token_status,
  updated_at
FROM public.email_send_config;

-- 2) RIPRISTINO: sostituire <RESTORE_BASE_URL> e <RESTORE_AUTH_TOKEN> con i valori
--    salvati prima del fix (es. da password manager). Poi eseguire l'UPDATE sotto.
--    Es. base_url pre-fix: https://vkjrqirvdvjbemsfzxof.functions.supabase.co

UPDATE public.email_send_config
SET base_url = '<RESTORE_BASE_URL>',
    auth_token = '<RESTORE_AUTH_TOKEN>',
    updated_at = now()
WHERE id = 'default';
