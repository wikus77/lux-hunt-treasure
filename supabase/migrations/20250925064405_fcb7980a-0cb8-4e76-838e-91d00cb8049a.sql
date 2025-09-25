-- Fix the buzz_today_count function (already exists, updating)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_buzz_map_counter_user_day_uniq'
  ) THEN
    ALTER TABLE public.user_buzz_map_counter
    ADD CONSTRAINT user_buzz_map_counter_user_day_uniq
    UNIQUE (user_id, "date");
  END IF;
END$$;

-- Create the correct RPC functions for daily buzz counting
CREATE OR REPLACE FUNCTION public.buzz_today_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE((
    SELECT buzz_map_count
    FROM   public.user_buzz_map_counter
    WHERE  user_id = p_user_id
    AND    "date" = (now() AT TIME ZONE 'Europe/Rome')::date
  ), 0);
$$;

CREATE OR REPLACE FUNCTION public.inc_buzz_today(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  d date := (now() AT TIME ZONE 'Europe/Rome')::date;
  new_count integer;
BEGIN
  INSERT INTO public.user_buzz_map_counter (user_id, "date", buzz_map_count, week_map_counts)
  VALUES (p_user_id, d, 1, ARRAY[0,0,0,0,0,0,0])
  ON CONFLICT (user_id, "date")
  DO UPDATE SET buzz_map_count = public.user_buzz_map_counter.buzz_map_count + 1
  RETURNING buzz_map_count INTO new_count;

  RETURN new_count;
END;
$$;