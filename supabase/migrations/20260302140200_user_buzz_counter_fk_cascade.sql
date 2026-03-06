-- Fix delete-account: "update or delete on table profiles violates foreign key constraint
-- user_buzz_counter_user_id_fkey on table user_buzz_counter"
-- Alla delete utente, auth.users CASCADE elimina profiles; user_buzz_counter blocca se la sua
-- FK verso profiles non è CASCADE. Impostare ON DELETE CASCADE (dati utente: si eliminano con il profilo).

DO $$
BEGIN
  ALTER TABLE public.user_buzz_counter DROP CONSTRAINT IF EXISTS user_buzz_counter_user_id_fkey;
  ALTER TABLE public.user_buzz_counter
    ADD CONSTRAINT user_buzz_counter_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;
