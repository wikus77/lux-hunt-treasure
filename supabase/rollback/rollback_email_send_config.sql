-- ============================================================================
-- ROLLBACK: Ripristino public.email_send_config (stato pre-fix email pipeline)
-- NON committare se contiene valori reali di auth_token. Usare storage sicuro.
-- ============================================================================

-- 1) SELECT stato attuale (per riferimento; NON stampa auth_token in chiaro in log)
SELECT id, base_url,
  CASE WHEN auth_token IS NULL OR trim(auth_token) = '' THEN 'EMPTY' ELSE 'SET' END AS auth_token_status,
  updated_at
FROM public.email_send_config;

-- 2) UPDATE di ripristino (eseguire SOLO per rollback)
-- Sostituire <RESTORE_BASE_URL> e <RESTORE_AUTH_TOKEN> con i valori da ripristinare.
-- Es. pre-fix: base_url = 'https://vkjrqirvdvjbemsfzxof.functions.supabase.co', auth_token = '...'
-- UPDATE public.email_send_config
-- SET base_url = '<RESTORE_BASE_URL>',
--     auth_token = '<RESTORE_AUTH_TOKEN>',
--     updated_at = now()
-- WHERE id = 'default';
