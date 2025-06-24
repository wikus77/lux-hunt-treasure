
-- Crea l'utente sviluppatore wikus77@hotmail.it nella tabella auth.users
-- Rimuovo ON CONFLICT dato che non c'è un constraint UNIQUE sull'email
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role,
  is_sso_user
) 
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'wikus77@hotmail.it',
  '$2a$10$dummyhashedpasswordfortesting',
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Developer User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'wikus77@hotmail.it'
);
