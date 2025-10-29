-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- M1SSION DNA™ — Core Schema Evolution

-- Add archetype and mutated_at to agent_dna
ALTER TABLE public.agent_dna 
ADD COLUMN IF NOT EXISTS archetype text DEFAULT 'Nomad',
ADD COLUMN IF NOT EXISTS mutated_at timestamptz DEFAULT now();

-- Update existing records to have archetype
UPDATE public.agent_dna 
SET archetype = CASE
  WHEN intuito >= 70 AND vibrazione >= 70 THEN 'Seeker'
  WHEN audacia >= 65 AND rischio >= 65 THEN 'Breaker'
  WHEN intuito >= 65 AND etica >= 65 THEN 'Oracle'
  WHEN etica >= 75 AND rischio < 40 THEN 'Warden'
  ELSE 'Nomad'
END
WHERE archetype IS NULL OR archetype = 'Nomad';

-- Add note column to agent_dna_events if not exists
ALTER TABLE public.agent_dna_events 
ADD COLUMN IF NOT EXISTS note text;

-- Function: compute archetype from DNA scores
CREATE OR REPLACE FUNCTION public.fn_dna_compute_archetype(
  p_i smallint, 
  p_a smallint, 
  p_e smallint, 
  p_r smallint, 
  p_v smallint
) 
RETURNS text 
LANGUAGE sql 
IMMUTABLE 
AS $$
  SELECT CASE
    WHEN p_i >= 70 AND p_v >= 70 THEN 'Seeker'
    WHEN p_a >= 65 AND p_r >= 65 THEN 'Breaker'
    WHEN p_i >= 65 AND p_e >= 65 THEN 'Oracle'
    WHEN p_e >= 75 AND p_r < 40 THEN 'Warden'
    ELSE 'Nomad'
  END;
$$;

-- Function: apply DNA delta safely (clamp 0-100) + update archetype
CREATE OR REPLACE FUNCTION public.fn_dna_apply_delta(
  p_user uuid, 
  p_delta jsonb, 
  p_source text, 
  p_note text DEFAULT NULL
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur record;
  i int; a int; e int; r int; v int;
  new_archetype text;
BEGIN
  -- Ensure DNA exists
  INSERT INTO public.agent_dna(user_id) 
  VALUES (p_user)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock and get current values
  SELECT * INTO cur 
  FROM public.agent_dna 
  WHERE user_id = p_user 
  FOR UPDATE;

  -- Apply delta with clamping (0-100)
  i := GREATEST(0, LEAST(100, COALESCE(cur.intuito, 50) + COALESCE((p_delta->>'intuito')::int, 0)));
  a := GREATEST(0, LEAST(100, COALESCE(cur.audacia, 50) + COALESCE((p_delta->>'audacia')::int, 0)));
  e := GREATEST(0, LEAST(100, COALESCE(cur.etica, 50) + COALESCE((p_delta->>'etica')::int, 0)));
  r := GREATEST(0, LEAST(100, COALESCE(cur.rischio, 50) + COALESCE((p_delta->>'rischio')::int, 0)));
  v := GREATEST(0, LEAST(100, COALESCE(cur.vibrazione, 50) + COALESCE((p_delta->>'vibrazione')::int, 0)));

  -- Compute new archetype
  new_archetype := public.fn_dna_compute_archetype(i, a, e, r, v);

  -- Update DNA profile
  UPDATE public.agent_dna
  SET 
    intuito = i,
    audacia = a,
    etica = e,
    rischio = r,
    vibrazione = v,
    archetype = new_archetype,
    mutated_at = now(),
    updated_at = now()
  WHERE user_id = p_user;

  -- Log the event
  INSERT INTO public.agent_dna_events(user_id, source, delta, note)
  VALUES (p_user, p_source, p_delta, p_note);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fn_dna_compute_archetype TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_dna_apply_delta TO authenticated;

-- Ensure Realtime is enabled with FULL replica identity
ALTER TABLE public.agent_dna REPLICA IDENTITY FULL;
ALTER TABLE public.agent_dna_events REPLICA IDENTITY FULL;

-- Create index for events timeline query
CREATE INDEX IF NOT EXISTS agent_dna_events_user_timeline_idx 
ON public.agent_dna_events(user_id, created_at DESC);

-- Trigger: auto-update archetype on DNA changes
CREATE OR REPLACE FUNCTION public.trg_dna_update_archetype()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.archetype := public.fn_dna_compute_archetype(
    NEW.intuito, 
    NEW.audacia, 
    NEW.etica, 
    NEW.rischio, 
    NEW.vibrazione
  );
  NEW.mutated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dna_archetype_update ON public.agent_dna;
CREATE TRIGGER dna_archetype_update
BEFORE UPDATE OF intuito, audacia, etica, rischio, vibrazione
ON public.agent_dna
FOR EACH ROW
EXECUTE FUNCTION public.trg_dna_update_archetype();

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™