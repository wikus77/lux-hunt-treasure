-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- DNA Visual Data RPC Function
-- Returns DNA scores with target coordinates and visual seed for tesseract renderer

CREATE OR REPLACE FUNCTION public.get_agent_dna_visual(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dna_row agent_dna%ROWTYPE;
  v_seed text;
  v_result jsonb;
BEGIN
  -- Security check
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized access to DNA data';
  END IF;

  -- Get DNA scores
  SELECT * INTO v_dna_row
  FROM public.agent_dna
  WHERE agent_dna.user_id = get_agent_dna_visual.user_id
  LIMIT 1;

  -- Generate stable seed for visual jitter
  v_seed := encode(digest(user_id::text || 'DNA-VIS-1', 'sha256'), 'hex');

  -- Build result with COALESCE fallback to 50
  v_result := jsonb_build_object(
    'dna', jsonb_build_object(
      'intuito', COALESCE(v_dna_row.intuito, 50),
      'audacia', COALESCE(v_dna_row.audacia, 50),
      'etica', COALESCE(v_dna_row.etica, 50),
      'rischio', COALESCE(v_dna_row.rischio, 50),
      'vibrazione', COALESCE(v_dna_row.vibrazione, 50)
    ),
    'targets', jsonb_build_object(
      'ETICA', jsonb_build_object('x', -1, 'y', 1, 'z', 0),
      'INTUITO', jsonb_build_object('x', 0, 'y', 1, 'z', 1),
      'AUDACIA', jsonb_build_object('x', 1, 'y', 0, 'z', -1),
      'VIBRAZIONE', jsonb_build_object('x', -1, 'y', -1, 'z', 1),
      'RISCHIO', jsonb_build_object('x', 1, 'y', -1, 'z', 0)
    ),
    'seed', v_seed
  );

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_agent_dna_visual(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_agent_dna_visual IS 
'Returns DNA profile with target coordinates and visual seed for tesseract renderer. Security: user can only access their own data.';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™