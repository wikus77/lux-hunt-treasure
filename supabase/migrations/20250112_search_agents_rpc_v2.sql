-- Search agents RPC function for TRON Battle - FIXED VERSION
-- Bypasses RLS to allow searching for other agents
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Drop old function if exists
DROP FUNCTION IF EXISTS search_agents_for_battle(TEXT, UUID, INT);

-- Create corrected function
CREATE OR REPLACE FUNCTION search_agents_for_battle(
  search_term TEXT,
  exclude_user_id UUID DEFAULT NULL,
  max_results INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  agent_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.agent_code
  FROM profiles p
  WHERE 
    -- Exclude the searching user
    (exclude_user_id IS NULL OR p.id != exclude_user_id)
    AND (
      -- Search by username (case insensitive)
      p.username ILIKE '%' || search_term || '%'
      OR
      -- Search by agent_code (case insensitive)
      p.agent_code ILIKE '%' || search_term || '%'
    )
    -- Only return users with username or agent_code set
    AND (p.username IS NOT NULL OR p.agent_code IS NOT NULL)
  ORDER BY p.username NULLS LAST
  LIMIT max_results;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION search_agents_for_battle TO authenticated;

COMMENT ON FUNCTION search_agents_for_battle IS 'Search for agents by username or agent_code for TRON Battle system';

