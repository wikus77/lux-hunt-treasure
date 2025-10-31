-- Migration: Create award_pulse_energy and recompute_rank functions
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Main function: Award PE and auto-rank-up
CREATE OR REPLACE FUNCTION award_pulse_energy(
  p_user_id UUID,
  p_delta_pe INT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_old_pe INT;
  v_new_pe INT;
  v_old_rank_id INT;
  v_new_rank_id INT;
  v_rank_changed BOOLEAN := FALSE;
BEGIN
  -- Lock profile row for update
  SELECT pulse_energy, rank_id INTO v_old_pe, v_old_rank_id
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found in profiles', p_user_id;
  END IF;

  -- Calculate new PE
  v_new_pe := v_old_pe + p_delta_pe;

  -- Update pulse_energy in profiles
  UPDATE profiles
  SET 
    pulse_energy = v_new_pe,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Sync user_xp for backward compatibility
  UPDATE user_xp
  SET 
    total_xp = v_new_pe,
    xp_since_reward = xp_since_reward + p_delta_pe
  WHERE user_id = p_user_id;

  -- Recompute rank based on new PE
  SELECT id INTO v_new_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_new_pe
    AND (pe_max IS NULL OR v_new_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  -- Check if rank changed
  IF v_new_rank_id IS DISTINCT FROM v_old_rank_id THEN
    v_rank_changed := TRUE;

    -- Update rank in profiles
    UPDATE profiles
    SET 
      rank_id = v_new_rank_id,
      rank_updated_at = NOW()
    WHERE id = p_user_id;

    -- Log rank change in history
    INSERT INTO rank_history (user_id, old_rank_id, new_rank_id, delta_pe, reason, metadata)
    VALUES (p_user_id, v_old_rank_id, v_new_rank_id, p_delta_pe, p_reason, p_metadata);
  END IF;

  -- Return result JSON
  RETURN jsonb_build_object(
    'success', TRUE,
    'old_pe', v_old_pe,
    'new_pe', v_new_pe,
    'delta_pe', p_delta_pe,
    'rank_changed', v_rank_changed,
    'old_rank_id', v_old_rank_id,
    'new_rank_id', v_new_rank_id,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function: Recompute rank (idempotent)
CREATE OR REPLACE FUNCTION recompute_rank(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_pe INT;
  v_correct_rank_id INT;
  v_updated BOOLEAN := FALSE;
BEGIN
  -- Get current PE
  SELECT pulse_energy INTO v_current_pe
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found in profiles', p_user_id;
  END IF;

  -- Calculate correct rank
  SELECT id INTO v_correct_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_current_pe
    AND (pe_max IS NULL OR v_current_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  -- Update if different
  UPDATE profiles
  SET 
    rank_id = v_correct_rank_id,
    rank_updated_at = NOW()
  WHERE id = p_user_id
    AND rank_id IS DISTINCT FROM v_correct_rank_id;

  v_updated := FOUND;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
