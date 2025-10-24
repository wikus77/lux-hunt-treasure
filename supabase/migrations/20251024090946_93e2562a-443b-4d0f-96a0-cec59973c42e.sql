
-- ============================================================================
-- The Pulse™ — Ritual Automation, Rate-Limit, Performance Indexes, Test Fire
-- Adds rate limiting to claims, performance indexes, and test sandbox function
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1) ADD RATE-LIMIT TO rpc_pulse_ritual_claim
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_pulse_ritual_claim(p_user uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_ritual_id bigint;
  reward_pkg jsonb;
  existing_claim_id bigint;
  recent_attempts int;
BEGIN
  -- Verify user is claiming for themselves
  IF p_user != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: can only claim for yourself';
  END IF;
  
  -- RATE LIMIT: Check recent claim attempts (max 3 per minute)
  SELECT COUNT(*) INTO recent_attempts
  FROM pulse_ritual_claims
  WHERE user_id = p_user
    AND claimed_at > NOW() - INTERVAL '1 minute';
  
  IF recent_attempts >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 3 claims per minute';
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
  
  -- Check if already claimed (idempotent) - use INSERT ... ON CONFLICT
  INSERT INTO pulse_ritual_claims (ritual_id, user_id)
  VALUES (active_ritual_id, p_user)
  ON CONFLICT (ritual_id, user_id) DO NOTHING
  RETURNING id INTO existing_claim_id;
  
  -- If no rows inserted, claim already existed
  IF existing_claim_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_claimed', true,
      'reward_package', reward_pkg
    );
  END IF;
  
  -- Successfully created new claim
  RETURN jsonb_build_object(
    'success', true,
    'already_claimed', false,
    'reward_package', reward_pkg
  );
END;
$$;

-- 2) CREATE PERFORMANCE INDEXES
-- ============================================================================
-- Index for finding open rituals (used frequently by orchestrator and claims)
CREATE INDEX IF NOT EXISTS idx_pulse_rituals_open 
  ON pulse_rituals(started_at DESC) 
  WHERE ended_at IS NULL;

-- Index for user ritual claims (used for rate limiting and claim checks)
CREATE INDEX IF NOT EXISTS idx_pulse_ritual_claims_user 
  ON pulse_ritual_claims(user_id, ritual_id);

-- Index for recent claim attempts (used for rate limit checks)
CREATE INDEX IF NOT EXISTS idx_pulse_ritual_claims_recent 
  ON pulse_ritual_claims(user_id, claimed_at DESC);

-- 3) CREATE TEST FIRE FUNCTION (Sandbox Only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_pulse_ritual_test_fire()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_ritual_id bigint;
BEGIN
  -- Create a test ritual record (will be closed immediately)
  INSERT INTO pulse_rituals (
    started_at, 
    ended_at, 
    scale_applied,
    reward_package
  )
  VALUES (
    NOW(),
    NOW() + INTERVAL '10 seconds', -- Auto-close after 10s
    0, -- No scale applied (test only)
    jsonb_build_object(
      'type', 'test_essence',
      'message', '🧪 Test Ritual Essence (Sandbox)',
      'test', true
    )
  )
  RETURNING id INTO test_ritual_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'test_ritual_id', test_ritual_id,
    'message', 'Test ritual created for sandbox broadcast'
  );
END;
$$;

-- Grant execute to service_role (for edge function)
GRANT EXECUTE ON FUNCTION public.rpc_pulse_ritual_test_fire() TO service_role;

-- Allow authenticated users to call (will be filtered by admin check in frontend)
GRANT EXECUTE ON FUNCTION public.rpc_pulse_ritual_test_fire() TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
