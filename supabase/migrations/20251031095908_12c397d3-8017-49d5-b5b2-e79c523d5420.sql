-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Migration: MCP Whitelist + Rank Protection Enhancement

-- 1) Create MCP whitelist table
CREATE TABLE IF NOT EXISTS mcp_whitelist (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- 2) Insert Joseph into whitelist
INSERT INTO mcp_whitelist (user_id)
VALUES ('495246c1-9154-4f01-a428-7f37fe230180')
ON CONFLICT (user_id) DO NOTHING;

-- 3) Force Joseph to MCP rank
UPDATE profiles
SET rank_id = (SELECT id FROM agent_ranks WHERE code = 'SRC-∞'),
    pulse_energy = GREATEST(pulse_energy, 1000000000),
    rank_updated_at = NOW()
WHERE id = '495246c1-9154-4f01-a428-7f37fe230180';

-- 4) Drop and recreate recompute_rank with MCP whitelist support
DROP FUNCTION IF EXISTS recompute_rank(uuid);

CREATE FUNCTION recompute_rank(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_pe numeric;
  v_target_rank_id uuid;
  v_is_mcp boolean;
BEGIN
  -- Check if user is in MCP whitelist
  SELECT EXISTS (
    SELECT 1 FROM mcp_whitelist WHERE user_id = p_user_id
  ) INTO v_is_mcp;

  -- If MCP, force SRC-∞ rank
  IF v_is_mcp THEN
    SELECT id INTO v_target_rank_id 
    FROM agent_ranks 
    WHERE code = 'SRC-∞';
    
    UPDATE profiles
    SET rank_id = v_target_rank_id,
        rank_updated_at = NOW()
    WHERE id = p_user_id
      AND rank_id IS DISTINCT FROM v_target_rank_id;
    
    RETURN;
  END IF;

  -- Standard rank calculation for non-MCP users
  SELECT pulse_energy INTO v_current_pe
  FROM profiles
  WHERE id = p_user_id;

  IF v_current_pe IS NULL THEN
    RETURN;
  END IF;

  -- Find appropriate rank based on PE thresholds
  SELECT id INTO v_target_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_current_pe
    AND (pe_max IS NULL OR pe_max > v_current_pe)
    AND code != 'SRC-∞'  -- Exclude MCP from standard calculation
  ORDER BY pe_min DESC
  LIMIT 1;

  -- Update rank if changed
  IF v_target_rank_id IS NOT NULL THEN
    UPDATE profiles
    SET rank_id = v_target_rank_id,
        rank_updated_at = NOW()
    WHERE id = p_user_id
      AND rank_id IS DISTINCT FROM v_target_rank_id;
  END IF;
END;
$$;

COMMENT ON TABLE mcp_whitelist IS 'MCP (SRC-∞) rank whitelist - reserved for Joseph Mulé';
COMMENT ON FUNCTION recompute_rank IS 'Recompute user rank based on PE - respects MCP whitelist';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™