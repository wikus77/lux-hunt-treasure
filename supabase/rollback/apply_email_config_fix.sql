-- ============================================================================
-- FIX 2.1 + 2.2: Correzione base_url e auth_token per pipeline email (pg_net → Edge)
-- Eseguire in Supabase SQL Editor. Sostituire <AUTH_TOKEN> con il valore reale
-- (SUPABASE_SERVICE_ROLE_KEY JWT oppure EMAIL_INVOKE_SECRET) — NON committare con valore reale.
-- ============================================================================

UPDATE public.email_send_config
SET base_url = 'https://vkjrqirvdvjbemsfzxof.supabase.co',
    auth_token = '<AUTH_TOKEN>',
    updated_at = now()
WHERE id = 'default';
