-- BATTLE SYSTEM PHASE 2 - RPC FUNCTIONS (Transactional Logic)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Idempotent RPC for Battle System Phase 2

-- ============================================================================
-- 1. WALLET FUNCTIONS (M1U Economy)
-- ============================================================================

-- Debit M1U from user wallet (transactional)
CREATE OR REPLACE FUNCTION public.wallet_debit(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_ref_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_new_balance numeric;
BEGIN
  -- Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM m1u_ledger WHERE idempotency_key = p_idempotency_key) THEN
      RETURN json_build_object('success', true, 'idempotent', true, 'message', 'Already processed');
    END IF;
  END IF;

  -- Ensure wallet exists
  INSERT INTO user_wallet (user_id, m1u_balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current balance with lock
  SELECT m1u_balance INTO v_current_balance
  FROM user_wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient M1U balance', 'current_balance', v_current_balance);
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Update wallet
  UPDATE user_wallet
  SET m1u_balance = v_new_balance, updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO m1u_ledger (user_id, delta, reason, ref_id, idempotency_key)
  VALUES (p_user_id, -p_amount, p_reason, p_ref_id, p_idempotency_key);

  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Credit M1U to user wallet (transactional)
CREATE OR REPLACE FUNCTION public.wallet_credit(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_ref_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance numeric;
BEGIN
  -- Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM m1u_ledger WHERE idempotency_key = p_idempotency_key) THEN
      RETURN json_build_object('success', true, 'idempotent', true, 'message', 'Already processed');
    END IF;
  END IF;

  -- Ensure wallet exists
  INSERT INTO user_wallet (user_id, m1u_balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update wallet with lock
  UPDATE user_wallet
  SET m1u_balance = m1u_balance + p_amount, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING m1u_balance INTO v_new_balance;

  -- Log transaction
  INSERT INTO m1u_ledger (user_id, delta, reason, ref_id, idempotency_key)
  VALUES (p_user_id, p_amount, p_reason, p_ref_id, p_idempotency_key);

  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- ============================================================================
-- 2. ARSENAL CONSUMPTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.arsenal_consume(
  p_user_id uuid,
  p_item_key text,
  p_item_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_qty integer;
BEGIN
  -- Get current quantity with lock
  SELECT quantity INTO v_current_qty
  FROM user_arsenal
  WHERE user_id = p_user_id AND item_key = p_item_key AND item_type = p_item_type
  FOR UPDATE;

  IF v_current_qty IS NULL OR v_current_qty < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or insufficient quantity');
  END IF;

  -- Decrement quantity
  UPDATE user_arsenal
  SET quantity = quantity - 1, updated_at = now()
  WHERE user_id = p_user_id AND item_key = p_item_key AND item_type = p_item_type;

  RETURN json_build_object('success', true, 'remaining', v_current_qty - 1);
END;
$$;

-- ============================================================================
-- 3. PE & REPUTATION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.pe_credit(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_ref_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO pe_ledger (user_id, delta, reason, ref_id)
  VALUES (p_user_id, p_amount, p_reason, p_ref_id);

  RETURN json_build_object('success', true, 'delta', p_amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.reputation_credit(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_ref_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO reputation_ledger (user_id, delta, reason, ref_id)
  VALUES (p_user_id, p_amount, p_reason, p_ref_id);

  RETURN json_build_object('success', true, 'delta', p_amount);
END;
$$;

-- ============================================================================
-- 4. START BATTLE V2 (with economy)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.start_battle_v2(
  p_defender_id uuid,
  p_weapon_key text,
  p_client_nonce text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attacker_id uuid := auth.uid();
  v_session_id uuid;
  v_expires_at timestamptz;
  v_weapon record;
  v_seed_hash text;
  v_debit_result json;
  v_consume_result json;
  v_defender_online boolean;
  v_defender_stealth boolean;
BEGIN
  -- Validation: attacker != defender
  IF v_attacker_id = p_defender_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot attack yourself');
  END IF;

  -- Check if attacker has active battle
  IF EXISTS (
    SELECT 1 FROM battle_sessions 
    WHERE (attacker_id = v_attacker_id OR defender_id = v_attacker_id) 
    AND status = 'await_defense'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You already have an active battle');
  END IF;

  -- Check if defender has active battle
  IF EXISTS (
    SELECT 1 FROM battle_sessions 
    WHERE (attacker_id = p_defender_id OR defender_id = p_defender_id) 
    AND status = 'await_defense'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Defender is already in a battle');
  END IF;

  -- Check defender attackable status (online, not stealth)
  -- Assuming profiles table has online and is_stealth fields
  SELECT COALESCE(online, false), COALESCE(is_stealth, false)
  INTO v_defender_online, v_defender_stealth
  FROM profiles
  WHERE id = p_defender_id;

  IF NOT v_defender_online OR v_defender_stealth THEN
    RETURN json_build_object('success', false, 'error', 'Target is not attackable (offline or in stealth)');
  END IF;

  -- Get weapon details
  SELECT * INTO v_weapon
  FROM weapons_catalog
  WHERE key = p_weapon_key AND enabled = true;

  IF v_weapon IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Weapon not found or disabled');
  END IF;

  -- Check cooldown
  IF EXISTS (
    SELECT 1 FROM user_cooldowns
    WHERE user_id = v_attacker_id 
    AND cooldown_key = 'weapon_' || p_weapon_key
    AND until_ts > now()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Weapon is on cooldown');
  END IF;

  -- Debit M1U
  v_session_id := gen_random_uuid();
  v_debit_result := wallet_debit(
    v_attacker_id,
    v_weapon.m1u_cost,
    'battle_attack',
    v_session_id,
    v_session_id::text || '_attack'
  );

  IF NOT (v_debit_result->>'success')::boolean THEN
    RETURN v_debit_result;
  END IF;

  -- Consume weapon from arsenal
  v_consume_result := arsenal_consume(v_attacker_id, p_weapon_key, 'weapon');
  
  IF NOT (v_consume_result->>'success')::boolean THEN
    RETURN v_consume_result;
  END IF;

  -- Calculate expires_at
  v_expires_at := now() + interval '60 seconds';

  -- Generate deterministic seed hash
  v_seed_hash := encode(
    digest(
      v_attacker_id::text || p_defender_id::text || p_weapon_key || now()::text || COALESCE(p_client_nonce, ''),
      'sha256'
    ),
    'hex'
  );

  -- Create battle session
  INSERT INTO battle_sessions (
    id, attacker_id, defender_id, status, started_at, expires_at, 
    weapon_key, audit_seed_hash, version
  )
  VALUES (
    v_session_id, v_attacker_id, p_defender_id, 'await_defense', now(), v_expires_at,
    p_weapon_key, v_seed_hash, 1
  );

  -- Log attack action
  INSERT INTO battle_actions (session_id, user_id, role, action_type, item_key, energy_cost_m1u, nonce)
  VALUES (v_session_id, v_attacker_id, 'attacker', 'attack', p_weapon_key, v_weapon.m1u_cost, COALESCE(p_client_nonce, gen_random_uuid()::text));

  -- Set cooldown
  INSERT INTO user_cooldowns (user_id, cooldown_key, until_ts)
  VALUES (v_attacker_id, 'weapon_' || p_weapon_key, now() + (v_weapon.cooldown_sec || ' seconds')::interval)
  ON CONFLICT (user_id, cooldown_key) DO UPDATE SET until_ts = EXCLUDED.until_ts;

  -- Create notification for defender (for existing push pipeline)
  INSERT INTO battle_notifications (user_id_target, type, payload)
  VALUES (
    p_defender_id,
    'attack_started',
    json_build_object(
      'session_id', v_session_id,
      'attacker_id', v_attacker_id,
      'weapon_key', p_weapon_key,
      'weapon_name', v_weapon.name,
      'effect_key', v_weapon.effect_key,
      'expires_at', v_expires_at
    )
  );

  RETURN json_build_object(
    'success', true,
    'session_id', v_session_id,
    'expires_at', v_expires_at,
    'effect_key', v_weapon.effect_key,
    'weapon_name', v_weapon.name
  );
END;
$$;

-- ============================================================================
-- 5. SUBMIT DEFENSE V2 (with resolution)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.submit_defense_v2(
  p_session_id uuid,
  p_defense_key text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_defender_id uuid := auth.uid();
  v_session record;
  v_weapon record;
  v_defense record;
  v_debit_result json;
  v_consume_result json;
  v_att_power numeric;
  v_def_power numeric;
  v_winner_id uuid;
  v_loser_id uuid;
  v_rng_att numeric;
  v_rng_def numeric;
  v_base_m1u_reward numeric := 100;
  v_base_pe_reward numeric := 50;
  v_base_rep_reward numeric := 10;
BEGIN
  -- Get session with lock
  SELECT * INTO v_session
  FROM battle_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF v_session IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Battle session not found');
  END IF;

  -- Validation
  IF v_session.defender_id != v_defender_id THEN
    RETURN json_build_object('success', false, 'error', 'You are not the defender of this battle');
  END IF;

  IF v_session.status != 'await_defense' THEN
    RETURN json_build_object('success', false, 'error', 'Battle is not awaiting defense', 'status', v_session.status);
  END IF;

  IF now() > v_session.expires_at THEN
    RETURN json_build_object('success', false, 'error', 'Defense window expired');
  END IF;

  -- Get defense details
  SELECT * INTO v_defense
  FROM defense_catalog
  WHERE key = p_defense_key AND enabled = true;

  IF v_defense IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Defense not found or disabled');
  END IF;

  -- Check cooldown
  IF EXISTS (
    SELECT 1 FROM user_cooldowns
    WHERE user_id = v_defender_id 
    AND cooldown_key = 'defense_' || p_defense_key
    AND until_ts > now()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Defense is on cooldown');
  END IF;

  -- Debit M1U
  v_debit_result := wallet_debit(
    v_defender_id,
    v_defense.m1u_cost,
    'battle_defense',
    p_session_id,
    p_session_id::text || '_defense'
  );

  IF NOT (v_debit_result->>'success')::boolean THEN
    RETURN v_debit_result;
  END IF;

  -- Consume defense from arsenal
  v_consume_result := arsenal_consume(v_defender_id, p_defense_key, 'defense');
  
  IF NOT (v_consume_result->>'success')::boolean THEN
    RETURN v_consume_result;
  END IF;

  -- Get weapon
  SELECT * INTO v_weapon FROM weapons_catalog WHERE key = v_session.weapon_key;

  -- Deterministic RNG (simplified: use seed hash mod for pseudo-random [0.9-1.1])
  -- In production, use proper PRNG seeded with audit_seed_hash
  v_rng_att := 0.9 + (('x' || substring(v_session.audit_seed_hash, 1, 8))::bit(32)::bigint % 200) / 1000.0;
  v_rng_def := 0.9 + (('x' || substring(v_session.audit_seed_hash, 9, 8))::bit(32)::bigint % 200) / 1000.0;

  -- Calculate powers (base formula, no rank modifiers for now)
  v_att_power := v_weapon.power * v_rng_att;
  v_def_power := v_defense.power * v_rng_def;

  -- Determine winner
  IF v_att_power > v_def_power THEN
    v_winner_id := v_session.attacker_id;
    v_loser_id := v_session.defender_id;
  ELSE
    v_winner_id := v_session.defender_id;
    v_loser_id := v_session.attacker_id;
  END IF;

  -- Update session
  UPDATE battle_sessions
  SET status = 'resolved',
      defense_key = p_defense_key,
      ended_at = now(),
      winner_id = v_winner_id
  WHERE id = p_session_id;

  -- Log defense action
  INSERT INTO battle_actions (session_id, user_id, role, action_type, item_key, energy_cost_m1u)
  VALUES (p_session_id, v_defender_id, 'defender', 'defend', p_defense_key, v_defense.m1u_cost);

  -- Log result
  INSERT INTO battle_results (session_id, winner_id, outcome, summary)
  VALUES (
    p_session_id,
    v_winner_id,
    CASE WHEN v_winner_id = v_session.attacker_id THEN 'attacker_win' ELSE 'defender_win' END,
    json_build_object(
      'att_power', v_att_power,
      'def_power', v_def_power,
      'weapon', v_weapon.key,
      'defense', v_defense.key
    )
  );

  -- Reward winner
  PERFORM wallet_credit(v_winner_id, v_base_m1u_reward, 'battle_reward', p_session_id, p_session_id::text || '_reward_m1u');
  PERFORM pe_credit(v_winner_id, v_base_pe_reward, 'battle_reward', p_session_id);
  PERFORM reputation_credit(v_winner_id, v_base_rep_reward, 'battle_reward', p_session_id);

  -- Soft penalty for loser (PE/reputation only, no M1U loss beyond initial cost)
  PERFORM pe_credit(v_loser_id, -10, 'battle_loss', p_session_id);
  PERFORM reputation_credit(v_loser_id, -5, 'battle_loss', p_session_id);

  -- Set cooldown
  INSERT INTO user_cooldowns (user_id, cooldown_key, until_ts)
  VALUES (v_defender_id, 'defense_' || p_defense_key, now() + (v_defense.cooldown_sec || ' seconds')::interval)
  ON CONFLICT (user_id, cooldown_key) DO UPDATE SET until_ts = EXCLUDED.until_ts;

  -- Notifications for both players
  INSERT INTO battle_notifications (user_id_target, type, payload)
  VALUES 
    (v_session.attacker_id, 'battle_resolved', json_build_object('session_id', p_session_id, 'winner_id', v_winner_id)),
    (v_session.defender_id, 'battle_resolved', json_build_object('session_id', p_session_id, 'winner_id', v_winner_id));

  RETURN json_build_object(
    'success', true,
    'status', 'resolved',
    'winner_id', v_winner_id,
    'outcome', CASE WHEN v_winner_id = v_session.attacker_id THEN 'attacker_win' ELSE 'defender_win' END,
    'summary', json_build_object('att_power', v_att_power, 'def_power', v_def_power)
  );
END;
$$;

-- ============================================================================
-- 6. FINALIZE EXPIRED BATTLES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.finalize_expired_battles()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_session record;
  v_count integer := 0;
  v_base_m1u_reward numeric := 100;
  v_base_pe_reward numeric := 50;
  v_base_rep_reward numeric := 10;
BEGIN
  -- Use advisory lock to prevent concurrent runs
  IF NOT pg_try_advisory_xact_lock(hashtext('finalize_expired_battles')) THEN
    RETURN 0;
  END IF;

  FOR v_expired_session IN
    SELECT * FROM battle_sessions
    WHERE status = 'await_defense' AND expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Attacker wins by default (no defense)
    UPDATE battle_sessions
    SET status = 'resolved',
        ended_at = now(),
        winner_id = v_expired_session.attacker_id
    WHERE id = v_expired_session.id;

    -- Log result
    INSERT INTO battle_results (session_id, winner_id, outcome, summary)
    VALUES (
      v_expired_session.id,
      v_expired_session.attacker_id,
      'attacker_win_timeout',
      json_build_object('reason', 'no_defense')
    );

    -- Reward attacker
    PERFORM wallet_credit(v_expired_session.attacker_id, v_base_m1u_reward, 'battle_reward_timeout', v_expired_session.id, v_expired_session.id::text || '_timeout_m1u');
    PERFORM pe_credit(v_expired_session.attacker_id, v_base_pe_reward, 'battle_reward_timeout', v_expired_session.id);
    PERFORM reputation_credit(v_expired_session.attacker_id, v_base_rep_reward, 'battle_reward_timeout', v_expired_session.id);

    -- Soft penalty for defender
    PERFORM pe_credit(v_expired_session.defender_id, -10, 'battle_timeout_loss', v_expired_session.id);
    PERFORM reputation_credit(v_expired_session.defender_id, -5, 'battle_timeout_loss', v_expired_session.id);

    -- Notifications
    INSERT INTO battle_notifications (user_id_target, type, payload)
    VALUES 
      (v_expired_session.attacker_id, 'battle_resolved', json_build_object('session_id', v_expired_session.id, 'winner_id', v_expired_session.attacker_id, 'reason', 'timeout')),
      (v_expired_session.defender_id, 'battle_resolved', json_build_object('session_id', v_expired_session.id, 'winner_id', v_expired_session.attacker_id, 'reason', 'timeout'));

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ============================================================================
-- 7. UTILITY: GET WALLET BALANCE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_wallet_balance(p_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := COALESCE(p_user_id, auth.uid());
  v_balance numeric;
BEGIN
  SELECT m1u_balance INTO v_balance
  FROM user_wallet
  WHERE user_id = v_user_id;

  IF v_balance IS NULL THEN
    v_balance := 0;
  END IF;

  RETURN json_build_object('user_id', v_user_id, 'm1u_balance', v_balance);
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== PHASE 2 RPC VERIFICATION ===';
  RAISE NOTICE 'Functions created: wallet_debit, wallet_credit, arsenal_consume, pe_credit, reputation_credit';
  RAISE NOTICE 'Functions created: start_battle_v2, submit_defense_v2, finalize_expired_battles, get_wallet_balance';
  RAISE NOTICE 'Test: SELECT start_battle_v2(''defender-uuid'', ''plasma_strike'');';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
