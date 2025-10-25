-- TRON BATTLE: Random Opponent Picker & Top Agents View (NO METRICS)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Function to pick a random eligible opponent
CREATE OR REPLACE FUNCTION pick_random_opponent(p_me uuid)
RETURNS TABLE (
  id uuid, 
  username text, 
  agent_code text
)
LANGUAGE sql 
STABLE
AS $$
  SELECT id, username, agent_code
  FROM profiles
  WHERE id <> p_me
    AND id NOT IN (
      SELECT user_id FROM battle_ghost_mode 
      WHERE ghost_mode_active = true 
      AND ghost_until > now()
    )
  ORDER BY random()
  LIMIT 1;
$$;

-- View for top agents leaderboard (based on battles won)
CREATE OR REPLACE VIEW battle_top_agents AS
SELECT 
  p.id,
  COUNT(CASE WHEN b.winner_id = p.id THEN 1 END) as wins,
  1000 as elo,
  p.username,
  p.agent_code
FROM profiles p
LEFT JOIN battles b ON (b.creator_id = p.id OR b.opponent_id = p.id) AND b.status = 'completed'
GROUP BY p.id, p.username, p.agent_code
ORDER BY wins DESC
LIMIT 50;

-- Grant SELECT on view to authenticated users
GRANT SELECT ON battle_top_agents TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™