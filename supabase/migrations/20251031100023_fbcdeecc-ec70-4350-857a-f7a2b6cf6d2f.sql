-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Migration: RLS for mcp_whitelist table

-- Enable RLS on mcp_whitelist
ALTER TABLE mcp_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view MCP whitelist
CREATE POLICY "mcp_whitelist_admin_read"
ON mcp_whitelist
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

-- Policy: Only admins can modify MCP whitelist
CREATE POLICY "mcp_whitelist_admin_write"
ON mcp_whitelist
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

COMMENT ON POLICY "mcp_whitelist_admin_read" ON mcp_whitelist IS 'Only admins can view MCP whitelist';
COMMENT ON POLICY "mcp_whitelist_admin_write" ON mcp_whitelist IS 'Only admins can modify MCP whitelist';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™