-- © 2025 Joseph MULÉ – M1SSION™
-- Database functions for marker reward system

-- Function to grant buzz credits to user
CREATE OR REPLACE FUNCTION grant_buzz(p_user uuid, p_source text, p_count int)
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER AS $$
  INSERT INTO buzz_grants(user_id, source, remaining)
  VALUES (p_user, p_source, p_count)
  ON CONFLICT (user_id, source)
  DO UPDATE SET remaining = buzz_grants.remaining + EXCLUDED.remaining;
$$;

-- Function to increment user XP atomically
CREATE OR REPLACE FUNCTION increment_xp(p_user uuid, p_amount int)
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER AS $$
  INSERT INTO user_xp(user_id, total_xp) 
  VALUES (p_user, COALESCE(p_amount, 0))
  ON CONFLICT (user_id) 
  DO UPDATE SET total_xp = COALESCE(user_xp.total_xp, 0) + COALESCE(p_amount, 0);
$$;