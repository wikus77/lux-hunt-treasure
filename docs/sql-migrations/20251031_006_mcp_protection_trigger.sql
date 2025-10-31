-- Migration: MCP (SRC-∞) Rank Protection
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Trigger function: Prevent MCP assignment to non-Joseph users
CREATE OR REPLACE FUNCTION prevent_mcp_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_mcp_rank_id INT;
  v_is_joseph BOOLEAN := FALSE;
BEGIN
  -- Get MCP rank ID
  SELECT id INTO v_mcp_rank_id
  FROM agent_ranks
  WHERE code = 'SRC-∞';

  -- Skip check if MCP rank doesn't exist or rank_id not changing to MCP
  IF v_mcp_rank_id IS NULL OR NEW.rank_id != v_mcp_rank_id THEN
    RETURN NEW;
  END IF;

  -- Check if user is Joseph (admin with specific email)
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE p.id = NEW.id
      AND p.role = 'admin'
      AND u.email = 'wikus77@hotmail.it'
  ) INTO v_is_joseph;

  -- Block MCP assignment for non-Joseph users
  IF NOT v_is_joseph THEN
    RAISE EXCEPTION 'MCP rank (SRC-∞) is reserved for Joseph Mulé only. User: %, Rank: %', NEW.id, NEW.rank_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS enforce_mcp_protection ON profiles;

-- Create trigger
CREATE TRIGGER enforce_mcp_protection
  BEFORE UPDATE OF rank_id ON profiles
  FOR EACH ROW
  WHEN (NEW.rank_id IS DISTINCT FROM OLD.rank_id)
  EXECUTE FUNCTION prevent_mcp_assignment();

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
