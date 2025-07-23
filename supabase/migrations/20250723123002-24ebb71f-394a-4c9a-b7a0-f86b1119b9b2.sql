-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Reset password per novaearch@hotmail.com alla password temporanea corretta

-- L'utente esiste ma ha password sbagliata. Deve usare: AGECDF2025!
-- Aggiorno manualmente la password per questo utente

UPDATE auth.users 
SET 
  encrypted_password = crypt('AGECDF2025!', gen_salt('bf')),
  raw_user_meta_data = raw_user_meta_data || '{"password_reset": true}'::jsonb
WHERE email = 'novaearch@hotmail.com';