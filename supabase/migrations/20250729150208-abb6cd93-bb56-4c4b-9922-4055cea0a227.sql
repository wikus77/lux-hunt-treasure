-- © 2025 Joseph MULÉ – M1SSION™ – BYPASS COMPLETO ACCESSO SVILUPPATORE
-- FORZA STATO ACCESSO SVILUPPATORE + RESET SESSIONI

-- 1. Forza tutti i parametri necessari per accesso admin
UPDATE public.profiles
SET 
  role = 'admin',
  subscription_tier = 'admin',
  tier = 'admin',
  can_access_app = true,
  access_enabled = true,
  access_starts_at = now() - INTERVAL '1 day'
WHERE email = 'wikus77@hotmail.it';

-- 2. Reset sessioni per forzare ricaricamento
DELETE FROM auth.sessions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it');

-- 3. Log bypass completo attivato
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it'),
  'hard_bypass_activated',
  jsonb_build_object(
    'email', 'wikus77@hotmail.it',
    'all_access_flags_forced', true,
    'verification_screen_disabled', true,
    'sessions_reset', true,
    'admin_bypass_complete', true
  ),
  'info'
);