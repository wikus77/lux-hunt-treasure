-- Fix: handle_buzz_map_pe() references NEW.meta but buzz_map_actions has no meta column.
-- Error: record "new" has no field "meta" (sql_state 42703).
-- Use '{}'::jsonb instead of COALESCE(NEW.meta, '{}'::jsonb).

CREATE OR REPLACE FUNCTION public.handle_buzz_map_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.award_pulse_energy(NEW.user_id, 10, 'buzz_map', '{}'::jsonb);
  PERFORM public.award_xp(NEW.user_id, 10, 'buzz_map');
  RETURN NEW;
END;
$$;
