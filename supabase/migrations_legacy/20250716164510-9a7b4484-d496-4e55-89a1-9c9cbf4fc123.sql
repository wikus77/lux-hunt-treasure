-- © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
-- M1SSION™ Database Security Fix - Final Cleanup of Remaining Functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix execute_sql function (kept but secured)
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Fix ensure_single_active_target function 
CREATE OR REPLACE FUNCTION public.ensure_single_active_target()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.buzz_game_targets 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix prevent_agent_code_modification function
CREATE OR REPLACE FUNCTION public.prevent_agent_code_modification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.agent_code IS DISTINCT FROM NEW.agent_code THEN
    RAISE EXCEPTION 'Modifica di agent_code non consentita';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix alert_if_x0197_used function
CREATE OR REPLACE FUNCTION public.alert_if_x0197_used()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.agent_code = 'AG-X0197' AND NEW.email <> 'wikus77@hotmail.it' THEN
    RAISE EXCEPTION 'AG-X0197 è riservato all''amministratore.';
  END IF;
  RETURN NEW;
END;
$$;