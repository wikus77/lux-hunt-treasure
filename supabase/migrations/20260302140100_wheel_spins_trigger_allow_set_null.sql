-- Fix delete-account-v2: il trigger forbid_update_delete() blocca anche l'UPDATE con cui
-- Postgres applica ON DELETE SET NULL (SET user_id = NULL). Consentire solo quell'UPDATE.
--
-- Nuova funzione: blocca DELETE e blocca UPDATE tranne quando l'unica modifica è user_id -> NULL
-- (caso FK SET NULL alla cancellazione utente). Audit preservato per ogni altro UPDATE/DELETE.

CREATE OR REPLACE FUNCTION public.wheel_spins_immutable_guard()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'IMMUTABLE TABLE — DELETE operation not allowed on wheel_spins'
      USING HINT = 'This table is append-only for audit compliance. Contact engineering.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Consenti solo l'UPDATE che imposta user_id = NULL (FK ON DELETE SET NULL da auth.users)
    IF OLD.user_id IS NOT NULL AND NEW.user_id IS NULL AND
       OLD.id = NEW.id AND OLD.spin_date = NEW.spin_date AND OLD.segment_id = NEW.segment_id AND
       OLD.reward_type = NEW.reward_type AND OLD.reward_value = NEW.reward_value AND
       OLD.reward_label = NEW.reward_label AND OLD.created_at = NEW.created_at THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'IMMUTABLE TABLE — UPDATE operation not allowed on wheel_spins'
      USING HINT = 'This table is append-only for audit compliance. Contact engineering.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.wheel_spins_immutable_guard() IS
'Allow only FK SET NULL (user_id -> NULL) on wheel_spins; forbid all other UPDATE/DELETE for audit.';

-- Sostituisci il trigger: usa la nuova funzione invece di forbid_update_delete()
DROP TRIGGER IF EXISTS no_update_delete_wheel_spins ON public.wheel_spins;
CREATE TRIGGER no_update_delete_wheel_spins
  BEFORE UPDATE OR DELETE ON public.wheel_spins
  FOR EACH ROW
  EXECUTE FUNCTION public.wheel_spins_immutable_guard();
