
-- Rimuove la funzione esistente e la ricrea con il tipo di ritorno corretto
DROP FUNCTION IF EXISTS get_user_by_email(text);

CREATE OR REPLACE FUNCTION get_user_by_email(email_param text)
RETURNS SETOF auth.users
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT * FROM auth.users WHERE email = email_param LIMIT 1;
$$;
