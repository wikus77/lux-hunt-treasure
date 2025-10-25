-- TRON BATTLE: RPC wrapper for top agents view
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- RPC function to query top agents (workaround for TypeScript types)
CREATE OR REPLACE FUNCTION get_top_agents()
RETURNS TABLE (
  id uuid,
  wins bigint,
  elo integer,
  username text,
  agent_code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, wins, elo, username, agent_code
  FROM battle_top_agents
  LIMIT 10;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_top_agents() TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™