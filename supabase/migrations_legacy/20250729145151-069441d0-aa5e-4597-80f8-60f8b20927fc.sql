-- © 2025 Joseph MULÉ – M1SSION™ – RIPRISTINO ACCESSO SVILUPPATORE CORRETTO
-- RIPRISTINO ACCESSO SVILUPPATORE wikus77@hotmail.it

-- Aggiorna profilo a admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'wikus77@hotmail.it';

-- Assicura che abbia admin nei ruoli (senza app_role)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;

-- Log ripristino accesso
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it'),
  'developer_access_restored',
  jsonb_build_object(
    'email', 'wikus77@hotmail.it',
    'profile_role_updated', 'admin',
    'user_roles_confirmed', 'admin',
    'access_permanent', true
  ),
  'info'
);