-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- DNA Safe Profile Function
-- Ensures no NULL values propagate to client-side .length operations

CREATE OR REPLACE FUNCTION fn_safe_dna_profile(uid uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_build_object(
        'user_id', d.user_id,
        'intuito', COALESCE(d.intuito, 0),
        'audacia', COALESCE(d.audacia, 0),
        'etica', COALESCE(d.etica, 0),
        'rischio', COALESCE(d.rischio, 0),
        'vibrazione', COALESCE(d.vibrazione, 0),
        'archetype', COALESCE(d.archetype, 'Nomad'),
        'updated_at', COALESCE(d.updated_at, now())
      )
      FROM agent_dna d
      WHERE d.user_id = uid
    ),
    -- Fallback se nessun record esiste
    jsonb_build_object(
      'user_id', uid,
      'intuito', 50,
      'audacia', 50,
      'etica', 50,
      'rischio', 50,
      'vibrazione', 50,
      'archetype', 'Nomad',
      'updated_at', now()
    )
  );
$$;

COMMENT ON FUNCTION fn_safe_dna_profile IS 
'Returns DNA profile with guaranteed non-NULL values. Prevents .length errors in React Three Fiber renderer.';

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION fn_safe_dna_profile TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
