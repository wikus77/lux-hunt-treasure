-- © 2025 Joseph MULÉ – M1SSION™ – RIPRISTINO COMPLETO ACCESSO SVILUPPATORE
-- FORZA ACCESSO PERMANENTE wikus77@hotmail.it

-- 1. Forza profilo admin completo
UPDATE public.profiles
SET 
  role = 'admin',
  can_access_app = true,
  subscription_tier = 'admin',
  tier = 'admin'
WHERE email = 'wikus77@hotmail.it';

-- 2. Assicura doppi ruoli admin + developer
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'developer' FROM auth.users WHERE email = 'wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Log sblocco completo
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it'),
  'complete_developer_unlock',
  jsonb_build_object(
    'email', 'wikus77@hotmail.it',
    'profile_admin_forced', true,
    'access_app_enabled', true,
    'roles', ARRAY['admin', 'developer'],
    'bypass_verification_screen', true
  ),
  'info'
);