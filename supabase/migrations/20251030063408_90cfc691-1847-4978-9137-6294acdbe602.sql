-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- RPC: get_agent_dna_visual
-- Returns DNA values, target coordinates for panels, and visual seed

CREATE OR REPLACE FUNCTION get_agent_dna_visual(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dna_record RECORD;
  result jsonb;
BEGIN
  -- Security: ensure caller owns the data
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Fetch DNA or use defaults
  SELECT 
    COALESCE(intuito, 50) as intuito,
    COALESCE(audacia, 50) as audacia,
    COALESCE(etica, 50) as etica,
    COALESCE(rischio, 50) as rischio,
    COALESCE(vibrazione, 50) as vibrazione
  INTO dna_record
  FROM agent_dna
  WHERE agent_dna.user_id = get_agent_dna_visual.user_id;

  -- If no record exists, use defaults
  IF NOT FOUND THEN
    dna_record := ROW(50, 50, 50, 50, 50);
  END IF;

  -- Build response with DNA values, target coordinates, and seed
  result := jsonb_build_object(
    'dna', jsonb_build_object(
      'intuito', dna_record.intuito,
      'audacia', dna_record.audacia,
      'etica', dna_record.etica,
      'rischio', dna_record.rischio,
      'vibrazione', dna_record.vibrazione
    ),
    'targets', jsonb_build_object(
      'ETICA', jsonb_build_object('x', -1, 'y', 1, 'z', 0),
      'INTUITO', jsonb_build_object('x', 0, 'y', 1, 'z', 1),
      'AUDACIA', jsonb_build_object('x', 1, 'y', 0, 'z', -1),
      'VIBRAZIONE', jsonb_build_object('x', -1, 'y', -1, 'z', 1),
      'RISCHIO', jsonb_build_object('x', 1, 'y', -1, 'z', 0)
    ),
    'seed', encode(digest(user_id::text || 'DNA-VIS-1', 'sha256'), 'hex')
  );

  RETURN result;
END;
$$;

COMMENT ON FUNCTION get_agent_dna_visual IS 'Returns DNA values with target cube coordinates and visual seed for Tesseract rendering';

GRANT EXECUTE ON FUNCTION get_agent_dna_visual TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™