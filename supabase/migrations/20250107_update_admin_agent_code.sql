-- Update admin agent_code from AG-X0197 to MCP
-- For user wikus77@hotmail.it
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

UPDATE profiles
SET agent_code = 'MCP'
WHERE email = 'wikus77@hotmail.it';

-- Also update pre_registered_users if exists
UPDATE pre_registered_users
SET agent_code = 'MCP'
WHERE email = 'wikus77@hotmail.it';

-- Verify the update
-- SELECT id, email, agent_code FROM profiles WHERE email = 'wikus77@hotmail.it';

