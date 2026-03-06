-- Fix delete-account-v2: "IMMUTABLE TABLE — DELETE operation not allowed on wheel_spins"
-- Causa: wheel_spins ha FK user_id → auth.users ON DELETE CASCADE + trigger forbid_update_delete()
-- che blocca qualsiasi DELETE. Alla cancellazione utente Postgres tenta CASCADE delete su wheel_spins
-- e il trigger solleva l'errore.
--
-- Soluzione: ON DELETE SET NULL + user_id nullable. Alla delete utente Postgres imposta user_id = NULL
-- (nessun DELETE su wheel_spins), il trigger non si attiva, audit preservato, utente eliminabile.
--
-- Rollback: vedere commenti in fondo.

DO $$
BEGIN
  -- Rendi user_id nullable (per permettere SET NULL alla delete utente)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wheel_spins' AND column_name = 'user_id') THEN
    ALTER TABLE public.wheel_spins ALTER COLUMN user_id DROP NOT NULL;
  END IF;

  -- Sostituisci FK CASCADE con SET NULL
  ALTER TABLE public.wheel_spins DROP CONSTRAINT IF EXISTS wheel_spins_user_id_fkey;
  ALTER TABLE public.wheel_spins
    ADD CONSTRAINT wheel_spins_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;

-- ROLLBACK (solo se necessario; richiede che non esistano righe con user_id NULL):
-- ALTER TABLE public.wheel_spins DROP CONSTRAINT IF EXISTS wheel_spins_user_id_fkey;
-- DELETE FROM public.wheel_spins WHERE user_id IS NULL;  -- opzionale
-- ALTER TABLE public.wheel_spins ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.wheel_spins ADD CONSTRAINT wheel_spins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
