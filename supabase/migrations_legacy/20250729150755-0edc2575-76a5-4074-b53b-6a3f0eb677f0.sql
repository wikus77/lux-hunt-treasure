-- © 2025 Joseph MULÉ – M1SSION™ – SBLOCCO DEFINITIVO + RESET SESSIONI
-- RIPRISTINO TOKEN SUPABASE + SESSIONE VALIDA

-- 1. Reset completo sessioni per forzare nuovo login
DELETE FROM auth.sessions 
WHERE user_id = (SELECT id FROM auth.users WHERE email='wikus77@hotmail.it');

-- 2. Forza TUTTI i parametri di accesso admin
UPDATE public.profiles
SET 
  can_access_app = true,
  role = 'admin',
  subscription_tier = 'admin',
  tier = 'admin',
  access_enabled = true,
  access_starts_at = now() - INTERVAL '1 day',
  status = 'admin_access_granted'
WHERE email='wikus77@hotmail.it';

-- 3. Verifica che esista almeno un ruolo admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email='wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Log sblocco definitivo
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it'),
  'definitive_unlock_auto_home',
  jsonb_build_object(
    'email', 'wikus77@hotmail.it',
    'sessions_reset', true,
    'all_access_flags_forced', true,
    'auto_redirect_home_enabled', true,
    'verification_screen_bypassed', true
  ),
  'info'
);