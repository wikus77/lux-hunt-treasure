
-- Crea la funzione SQL per accedere agli utenti via RPC
CREATE OR REPLACE FUNCTION get_user_by_email(email_param text)
RETURNS TABLE (id uuid)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM auth.users WHERE email = email_param;
$$;
