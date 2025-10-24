-- The Pulse™ — Global Ritual Orchestration Tables & Functions
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Table: pulse_rituals (one active ritual at a time)
CREATE TABLE IF NOT EXISTS pulse_rituals (
  id bigserial PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  scale_applied boolean DEFAULT false,
  reward_package jsonb NOT NULL DEFAULT '{}'::jsonb,
  snapshot numeric(5,2) DEFAULT 100.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: pulse_ritual_claims (user claims per ritual, idempotent)
CREATE TABLE IF NOT EXISTS pulse_ritual_claims (
  id bigserial PRIMARY KEY,
  ritual_id bigint NOT NULL REFERENCES pulse_rituals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ritual_id, user_id)
);

-- Table: pulse_global_triggers (audit log for ritual events)
CREATE TABLE IF NOT EXISTS pulse_global_triggers (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE pulse_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_ritual_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_global_triggers ENABLE ROW LEVEL SECURITY;

-- pulse_rituals: authenticated users can read, only service can write
CREATE POLICY "pulse_rituals_select_auth" ON pulse_rituals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pulse_rituals_insert_service" ON pulse_rituals
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "pulse_rituals_update_service" ON pulse_rituals
  FOR UPDATE USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- pulse_ritual_claims: users can insert/select their own claims
CREATE POLICY "pulse_ritual_claims_select_own" ON pulse_ritual_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pulse_ritual_claims_insert_own" ON pulse_ritual_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- pulse_global_triggers: admin read, service write
CREATE POLICY "pulse_global_triggers_select_admin" ON pulse_global_triggers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "pulse_global_triggers_insert_service" ON pulse_global_triggers
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- RPC: Check if ritual can start
CREATE OR REPLACE FUNCTION rpc_pulse_ritual_can_start()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_pulse numeric(5,2);
  open_ritual_id bigint;
BEGIN
  -- Get current pulse value
  SELECT COALESCE(value, 0) INTO current_pulse FROM pulse_state LIMIT 1;
  
  -- Check for open ritual
  SELECT id INTO open_ritual_id FROM pulse_rituals 
  WHERE ended_at IS NULL 
  ORDER BY started_at DESC 
  LIMIT 1;
  
  IF current_pulse >= 100 AND open_ritual_id IS NULL THEN
    RETURN jsonb_build_object('can', true, 'ritual_id', null, 'pulse_value', current_pulse);
  ELSE
    RETURN jsonb_build_object('can', false, 'ritual_id', open_ritual_id, 'pulse_value', current_pulse);
  END IF;
END;
$$;

-- RPC: Start ritual (service role only)
CREATE OR REPLACE FUNCTION rpc_pulse_ritual_start()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_ritual_id bigint;
  current_pulse numeric(5,2);
  reward_pkg jsonb;
BEGIN
  -- Only service role can start rituals
  IF (auth.jwt() ->> 'role'::text) != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: service role required';
  END IF;
  
  -- Get current pulse
  SELECT COALESCE(value, 0) INTO current_pulse FROM pulse_state LIMIT 1;
  
  -- Generate reward package (cosmetic/narrative only)
  reward_pkg := jsonb_build_object(
    'tier', CASE 
      WHEN current_pulse >= 100 THEN 'legendary'
      WHEN current_pulse >= 75 THEN 'epic'
      WHEN current_pulse >= 50 THEN 'rare'
      ELSE 'common'
    END,
    'items', jsonb_build_array(
      jsonb_build_object('type', 'echo_clue', 'rarity', 'legendary', 'title', 'The Echo Signal'),
      jsonb_build_object('type', 'sigil', 'rarity', 'epic', 'title', 'Pulse Convergence Sigil')
    ),
    'expires_at', (now() + interval '7 days')::text,
    'copy', 'The world listened. The echo answered.'
  );
  
  -- Create ritual
  INSERT INTO pulse_rituals (snapshot, reward_package)
  VALUES (current_pulse, reward_pkg)
  RETURNING id INTO new_ritual_id;
  
  -- Log trigger
  INSERT INTO pulse_global_triggers (type, payload)
  VALUES ('ritual_started', jsonb_build_object('ritual_id', new_ritual_id, 'pulse_value', current_pulse));
  
  RETURN jsonb_build_object(
    'success', true,
    'ritual_id', new_ritual_id,
    'reward_package', reward_pkg
  );
END;
$$;

-- RPC: Claim ritual reward (authenticated users)
CREATE OR REPLACE FUNCTION rpc_pulse_ritual_claim(p_user uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_ritual_id bigint;
  reward_pkg jsonb;
  existing_claim_id bigint;
BEGIN
  -- Verify user is claiming for themselves
  IF p_user != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: can only claim for yourself';
  END IF;
  
  -- Get active ritual
  SELECT id, reward_package INTO active_ritual_id, reward_pkg
  FROM pulse_rituals 
  WHERE ended_at IS NULL 
  ORDER BY started_at DESC 
  LIMIT 1;
  
  IF active_ritual_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active ritual');
  END IF;
  
  -- Check if already claimed (idempotent)
  SELECT id INTO existing_claim_id 
  FROM pulse_ritual_claims 
  WHERE ritual_id = active_ritual_id AND user_id = p_user;
  
  IF existing_claim_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_claimed', true,
      'reward_package', reward_pkg
    );
  END IF;
  
  -- Create claim
  INSERT INTO pulse_ritual_claims (ritual_id, user_id)
  VALUES (active_ritual_id, p_user);
  
  RETURN jsonb_build_object(
    'success', true,
    'already_claimed', false,
    'reward_package', reward_pkg
  );
END;
$$;

-- RPC: Close ritual and scale pulse (service role only)
CREATE OR REPLACE FUNCTION rpc_pulse_ritual_close()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_ritual_id bigint;
  new_pulse_value numeric(5,2);
BEGIN
  -- Only service role can close rituals
  IF (auth.jwt() ->> 'role'::text) != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: service role required';
  END IF;
  
  -- Get active ritual
  SELECT id INTO active_ritual_id
  FROM pulse_rituals 
  WHERE ended_at IS NULL 
  ORDER BY started_at DESC 
  LIMIT 1;
  
  IF active_ritual_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active ritual');
  END IF;
  
  -- Scale pulse down by 35%
  UPDATE pulse_state 
  SET value = GREATEST(0, value - 35)
  RETURNING value INTO new_pulse_value;
  
  -- Close ritual
  UPDATE pulse_rituals 
  SET ended_at = now(), scale_applied = true
  WHERE id = active_ritual_id;
  
  -- Log trigger
  INSERT INTO pulse_global_triggers (type, payload)
  VALUES ('ritual_closed', jsonb_build_object('ritual_id', active_ritual_id, 'new_pulse_value', new_pulse_value));
  
  RETURN jsonb_build_object(
    'success', true,
    'ritual_id', active_ritual_id,
    'new_pulse_value', new_pulse_value
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION rpc_pulse_ritual_can_start() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION rpc_pulse_ritual_start() TO service_role;
GRANT EXECUTE ON FUNCTION rpc_pulse_ritual_claim(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_pulse_ritual_close() TO service_role;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™