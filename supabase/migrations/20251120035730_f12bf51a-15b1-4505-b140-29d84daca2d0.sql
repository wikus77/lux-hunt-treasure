-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- SECURITY FIX: Add search_path to all trigger functions
-- Target: Resolve 7 security warnings from previous migration

-- Fix award_pulse_energy function
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
  SELECT pulse_energy, rank_id INTO v_old_pe, v_old_rank_id
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found in profiles', p_user_id;
  END IF;

  v_new_pe := v_old_pe + p_delta_pe;

  UPDATE profiles
  SET 
    pulse_energy = v_new_pe,
    updated_at = NOW()
  WHERE id = p_user_id;

  UPDATE user_xp
  SET 
    total_xp = v_new_pe,
    xp_since_reward = xp_since_reward + p_delta_pe
  WHERE user_id = p_user_id;

  SELECT id INTO v_new_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_new_pe
    AND (pe_max IS NULL OR v_new_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  IF v_new_rank_id IS DISTINCT FROM v_old_rank_id THEN
    v_rank_changed := TRUE;

    UPDATE profiles
    SET 
      rank_id = v_new_rank_id,
      rank_updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO rank_history (user_id, old_rank_id, new_rank_id, delta_pe, reason, metadata)
    VALUES (p_user_id, v_old_rank_id, v_new_rank_id, p_delta_pe, p_reason, p_metadata);
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix recompute_rank function
CREATE OR REPLACE FUNCTION recompute_rank(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_pe INT;
  v_correct_rank_id INT;
  v_updated BOOLEAN := FALSE;
BEGIN
  SELECT pulse_energy INTO v_current_pe
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found in profiles', p_user_id;
  END IF;

  SELECT id INTO v_correct_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_current_pe
    AND (pe_max IS NULL OR v_current_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  UPDATE profiles
  SET 
    rank_id = v_correct_rank_id,
    rank_updated_at = NOW()
  WHERE id = p_user_id
    AND rank_id IS DISTINCT FROM v_correct_rank_id;

  v_updated := FOUND;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_buzz_pe_award trigger function
CREATE OR REPLACE FUNCTION handle_buzz_pe_award()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_pulse_energy(
    NEW.user_id,
    15,
    'buzz',
    jsonb_build_object(
      'buzz_id', NEW.id,
      'location', NEW.location,
      'timestamp', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_buzz_map_pe_award trigger function
CREATE OR REPLACE FUNCTION handle_buzz_map_pe_award()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_pulse_energy(
    NEW.user_id,
    10,
    'buzz_map',
    jsonb_build_object(
      'map_id', NEW.id,
      'timestamp', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_referral_pe_award trigger function
CREATE OR REPLACE FUNCTION handle_referral_pe_award()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter_id UUID;
BEGIN
  IF NEW.invited_by_code IS NOT NULL THEN
    SELECT id INTO v_inviter_id
    FROM profiles
    WHERE agent_code = NEW.invited_by_code;

    IF FOUND THEN
      PERFORM award_pulse_energy(
        v_inviter_id,
        25,
        'referral',
        jsonb_build_object(
          'invited_user_id', NEW.id,
          'referral_code', NEW.invited_by_code,
          'timestamp', NEW.created_at
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix prevent_mcp_assignment trigger function
CREATE OR REPLACE FUNCTION prevent_mcp_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_mcp_rank_id INT;
  v_is_joseph BOOLEAN := FALSE;
BEGIN
  SELECT id INTO v_mcp_rank_id
  FROM agent_ranks
  WHERE code = 'SRC-∞';

  IF v_mcp_rank_id IS NULL OR NEW.rank_id != v_mcp_rank_id THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE p.id = NEW.id
      AND u.email = 'wikus77@hotmail.it'
  ) INTO v_is_joseph;

  IF NOT v_is_joseph THEN
    RAISE EXCEPTION 'MCP rank (SRC-∞) is reserved for Joseph Mulé only. User: %, Rank: %', NEW.id, NEW.rank_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™