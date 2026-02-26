-- ============================================================================
-- FIX EMAIL PIPELINE: base_url corretta + auth_token (configurazione pg_net → Edge)
-- Eseguire in Supabase Dashboard → SQL Editor.
-- PRIMA di eseguire: sostituire <AUTH_TOKEN> con SUPABASE_SERVICE_ROLE_KEY (JWT).
-- NON committare il file con il token reale.
-- ============================================================================

UPDATE public.email_send_config
SET base_url = 'https://vkjrqirvdvjbemsfzxof.supabase.co',
    auth_token = '<AUTH_TOKEN>',
    updated_at = now()
WHERE id = 'default';

-- ============================================================================
-- VERIFICA POST-FIX (eseguire dopo l'UPDATE; non stampa il token)
-- ============================================================================

-- Config: base_url e se auth_token è valorizzato (SET/NULL)
SELECT id, base_url,
  CASE WHEN auth_token IS NOT NULL AND trim(auth_token) <> '' THEN 'SET' ELSE 'NULL' END AS auth_token_status,
  updated_at
FROM public.email_send_config;

-- Ultime righe email_sends (atteso: status sent/failed dopo prossimo trigger o test)
SELECT id, template_id, status, error_code, created_at, recipient_email
FROM public.email_sends
ORDER BY created_at DESC
LIMIT 10;

-- Ultime risposte pg_net (atteso: status_code 200 per le chiamate alle Edge email)
SELECT id, status_code, created, left(content::text, 150) AS content_preview
FROM net._http_response
ORDER BY id DESC
LIMIT 10;
