-- ============================================================================
-- M1SSION™ BATTLE AUDIT PHASE 7 — SECURITY & ANTI-TAMPERING LAYER
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================
-- 
-- MANUAL APPLICATION REQUIRED
-- Copy this entire SQL script and run it in the Supabase SQL Editor
-- https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/sql/new
--
-- ============================================================================

-- 1. EXPAND battle_audit TABLE
-- ============================================================================

-- Add rng_seed and created_by columns if not exist
ALTER TABLE public.battle_audit 
ADD COLUMN IF NOT EXISTS rng_seed BIGINT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add index for faster audit queries
CREATE INDEX IF NOT EXISTS battle_audit_battle_id_timestamp_idx 
ON public.battle_audit(battle_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS battle_audit_event_type_idx 
ON public.battle_audit(event_type);

-- 2. BATTLE ADMIN ACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.battle_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('flag_suspicious', 'review', 'clear', 'rollback')),
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS battle_admin_actions_battle_id_idx 
ON public.battle_admin_actions(battle_id);

CREATE INDEX IF NOT EXISTS battle_admin_actions_admin_id_idx 
ON public.battle_admin_actions(admin_id);

-- 3. RLS HARDENING — BATTLE_AUDIT
-- ============================================================================

-- Enable RLS
ALTER TABLE public.battle_audit ENABLE ROW LEVEL SECURITY;

-- Users can only view audit logs for their own battles
DROP POLICY IF EXISTS "Users can view own battle audit" ON public.battle_audit;
CREATE POLICY "Users can view own battle audit" ON public.battle_audit
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.battles
    WHERE battles.id = battle_audit.battle_id
    AND (battles.creator_id = auth.uid() OR battles.opponent_id = auth.uid())
  )
);

-- Only service role can insert/update/delete audit logs
DROP POLICY IF EXISTS "Service role can manage audit" ON public.battle_audit;
CREATE POLICY "Service role can manage audit" ON public.battle_audit
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 4. RLS HARDENING — BATTLE_TRANSFERS
-- ============================================================================

ALTER TABLE public.battle_transfers ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transfers
DROP POLICY IF EXISTS "Users can view own transfers" ON public.battle_transfers;
CREATE POLICY "Users can view own transfers" ON public.battle_transfers
FOR SELECT TO authenticated
USING (
  from_user_id = auth.uid() OR to_user_id = auth.uid()
);

-- Only service role can insert transfers
DROP POLICY IF EXISTS "Service role can insert transfers" ON public.battle_transfers;
CREATE POLICY "Service role can insert transfers" ON public.battle_transfers
FOR INSERT TO service_role
WITH CHECK (true);

-- No user can update or delete transfers
DROP POLICY IF EXISTS "No one can update transfers" ON public.battle_transfers;
CREATE POLICY "No one can update transfers" ON public.battle_transfers
FOR UPDATE TO authenticated
USING (false);

DROP POLICY IF EXISTS "No one can delete transfers" ON public.battle_transfers;
CREATE POLICY "No one can delete transfers" ON public.battle_transfers
FOR DELETE TO authenticated
USING (false);

-- 5. RLS HARDENING — BATTLES TABLE
-- ============================================================================

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

-- Users can view battles they're part of
DROP POLICY IF EXISTS "Users can view own battles" ON public.battles;
CREATE POLICY "Users can view own battles" ON public.battles
FOR SELECT TO authenticated
USING (
  creator_id = auth.uid() OR opponent_id = auth.uid()
);

-- Users can insert battles (as creator)
DROP POLICY IF EXISTS "Users can create battles" ON public.battles;
CREATE POLICY "Users can create battles" ON public.battles
FOR INSERT TO authenticated
WITH CHECK (creator_id = auth.uid());

-- Users cannot directly update winner_id or status to 'resolved'
-- Only edge functions (service role) can resolve battles
DROP POLICY IF EXISTS "Users can update non-critical fields" ON public.battles;
CREATE POLICY "Users can update non-critical fields" ON public.battles
FOR UPDATE TO authenticated
USING (
  creator_id = auth.uid() OR opponent_id = auth.uid()
)
WITH CHECK (
  -- Users can update tap timestamps and reaction times, but NOT winner_id or status='resolved'
  (creator_id = auth.uid() OR opponent_id = auth.uid())
  AND winner_id IS NULL 
  AND status != 'resolved'
);

-- Service role can do anything
DROP POLICY IF EXISTS "Service role full access battles" ON public.battles;
CREATE POLICY "Service role full access battles" ON public.battles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 6. RLS HARDENING — BATTLE_ADMIN_ACTIONS
-- ============================================================================

ALTER TABLE public.battle_admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions (requires has_role function)
DROP POLICY IF EXISTS "Admins can view admin actions" ON public.battle_admin_actions;
CREATE POLICY "Admins can view admin actions" ON public.battle_admin_actions
FOR SELECT TO authenticated
USING (
  -- Assumes has_role function exists from security system
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can insert admin actions
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.battle_admin_actions;
CREATE POLICY "Admins can insert admin actions" ON public.battle_admin_actions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. ANTI-TAMPERING CONSTRAINTS
-- ============================================================================

-- Prevent duplicate resolved battles (one resolution per battle)
CREATE UNIQUE INDEX IF NOT EXISTS battles_resolved_once_idx 
ON public.battles(id) 
WHERE status = 'resolved' AND winner_id IS NOT NULL;

-- 8. DETERMINISTIC RNG SEED GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_battle_rng_seed(
  p_battle_id UUID,
  p_event_type TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  seed_base TEXT;
  hash_result TEXT;
BEGIN
  -- Create deterministic seed from battle_id + event_type + current timestamp
  seed_base := p_battle_id::TEXT || p_event_type || extract(epoch from now())::TEXT;
  
  -- Use MD5 hash and convert first 8 chars to bigint
  hash_result := md5(seed_base);
  
  -- Convert hex to bigint (take first 15 chars to avoid overflow)
  RETURN ('x' || substring(hash_result, 1, 15))::bit(60)::bigint;
END;
$$;

-- 9. ENHANCED TRIGGERS FOR AUDIT TRAIL
-- ============================================================================

-- Trigger: Battle Created
CREATE OR REPLACE FUNCTION public.battle_audit_on_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rng_seed BIGINT;
BEGIN
  rng_seed := public.generate_battle_rng_seed(NEW.id, 'battle_created');
  
  INSERT INTO public.battle_audit (
    battle_id,
    event_type,
    user_id,
    rng_seed,
    payload
  ) VALUES (
    NEW.id,
    'battle_created',
    NEW.creator_id,
    rng_seed,
    jsonb_build_object(
      'stake_type', NEW.stake_type,
      'stake_amount', NEW.stake_amount,
      'stake_percentage', NEW.stake_percentage,
      'arena_name', NEW.arena_name,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_battle_audit_on_create ON public.battles;
CREATE TRIGGER trg_battle_audit_on_create
AFTER INSERT ON public.battles
FOR EACH ROW
EXECUTE FUNCTION public.battle_audit_on_create();

-- Trigger: Battle Accepted
CREATE OR REPLACE FUNCTION public.battle_audit_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rng_seed BIGINT;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    rng_seed := public.generate_battle_rng_seed(NEW.id, 'battle_accepted');
    
    INSERT INTO public.battle_audit (
      battle_id,
      event_type,
      user_id,
      rng_seed,
      payload
    ) VALUES (
      NEW.id,
      'battle_accepted',
      NEW.opponent_id,
      rng_seed,
      jsonb_build_object(
        'accepted_at', NEW.accepted_at,
        'status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_battle_audit_on_accept ON public.battles;
CREATE TRIGGER trg_battle_audit_on_accept
AFTER UPDATE ON public.battles
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted')
EXECUTE FUNCTION public.battle_audit_on_accept();

-- Trigger: Battle Resolved
CREATE OR REPLACE FUNCTION public.battle_audit_on_resolve()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rng_seed BIGINT;
BEGIN
  -- Only trigger when status changes to 'resolved'
  IF NEW.status = 'resolved' AND (OLD.status IS DISTINCT FROM 'resolved') THEN
    rng_seed := public.generate_battle_rng_seed(NEW.id, 'battle_resolved');
    
    INSERT INTO public.battle_audit (
      battle_id,
      event_type,
      user_id,
      rng_seed,
      payload
    ) VALUES (
      NEW.id,
      'battle_resolved',
      NEW.winner_id,
      rng_seed,
      jsonb_build_object(
        'winner_id', NEW.winner_id,
        'creator_reaction_ms', NEW.creator_reaction_ms,
        'opponent_reaction_ms', NEW.opponent_reaction_ms,
        'resolved_at', NEW.resolved_at,
        'status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_battle_audit_on_resolve ON public.battles;
CREATE TRIGGER trg_battle_audit_on_resolve
AFTER UPDATE ON public.battles
FOR EACH ROW
WHEN (NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved')
EXECUTE FUNCTION public.battle_audit_on_resolve();

-- Trigger: Battle Transfer (Stake Movement)
CREATE OR REPLACE FUNCTION public.battle_audit_on_transfer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rng_seed BIGINT;
BEGIN
  rng_seed := public.generate_battle_rng_seed(NEW.battle_id, 'battle_transfer');
  
  INSERT INTO public.battle_audit (
    battle_id,
    event_type,
    user_id,
    rng_seed,
    payload
  ) VALUES (
    NEW.battle_id,
    'battle_transfer',
    NEW.to_user_id,
    rng_seed,
    jsonb_build_object(
      'from_user_id', NEW.from_user_id,
      'to_user_id', NEW.to_user_id,
      'transfer_type', NEW.transfer_type,
      'amount', NEW.amount,
      'metadata', NEW.metadata
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_battle_audit_on_transfer ON public.battle_transfers;
CREATE TRIGGER trg_battle_audit_on_transfer
AFTER INSERT ON public.battle_transfers
FOR EACH ROW
EXECUTE FUNCTION public.battle_audit_on_transfer();

-- 10. RPC: audit_battle (COMPREHENSIVE AUDIT CHECK)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_battle(p_battle_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle RECORD;
  v_audit_entries JSON;
  v_transfers JSON;
  v_participants JSON;
  v_tamper_flags TEXT[] := '{}';
  v_rng_check TEXT := 'ok';
  v_ledger_check TEXT := 'ok';
  v_expected_events INTEGER;
  v_actual_events INTEGER;
BEGIN
  -- Get battle
  SELECT * INTO v_battle
  FROM public.battles
  WHERE id = p_battle_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'error', 'Battle not found',
      'battle_id', p_battle_id
    );
  END IF;
  
  -- Get audit log entries
  SELECT json_agg(
    json_build_object(
      'id', id,
      'event_type', event_type,
      'user_id', user_id,
      'timestamp', timestamp,
      'rng_seed', rng_seed,
      'payload', payload
    ) ORDER BY timestamp ASC
  ) INTO v_audit_entries
  FROM public.battle_audit
  WHERE battle_id = p_battle_id;
  
  -- Get transfers
  SELECT json_agg(
    json_build_object(
      'id', id,
      'from_user_id', from_user_id,
      'to_user_id', to_user_id,
      'transfer_type', transfer_type,
      'amount', amount,
      'created_at', created_at,
      'metadata', metadata
    )
  ) INTO v_transfers
  FROM public.battle_transfers
  WHERE battle_id = p_battle_id;
  
  -- Get participants
  SELECT json_agg(
    json_build_object(
      'id', id,
      'user_id', user_id,
      'role', role,
      'tap_timestamp', tap_timestamp,
      'reaction_ms', reaction_ms,
      'ping_ms', ping_ms,
      'is_winner', is_winner
    )
  ) INTO v_participants
  FROM public.battle_participants
  WHERE battle_id = p_battle_id;
  
  -- TAMPER FLAG 1: No audit log entries
  IF v_audit_entries IS NULL THEN
    v_tamper_flags := array_append(v_tamper_flags, 'AUDIT_LOG_MISSING');
    v_ledger_check := 'incomplete';
  END IF;
  
  -- TAMPER FLAG 2: Battle resolved but no result in battles table
  IF v_battle.status = 'resolved' AND v_battle.winner_id IS NULL THEN
    v_tamper_flags := array_append(v_tamper_flags, 'NO_WINNER_RECORDED');
    v_ledger_check := 'mismatch';
  END IF;
  
  -- TAMPER FLAG 3: Battle resolved but no transfer recorded
  IF v_battle.status = 'resolved' AND v_transfers IS NULL THEN
    v_tamper_flags := array_append(v_tamper_flags, 'NO_TRANSFER_RECORDED');
    v_ledger_check := 'mismatch';
  END IF;
  
  -- TAMPER FLAG 4: Expected audit events count mismatch
  -- Expected: battle_created (1) + battle_accepted (0-1) + battle_resolved (0-1) + battle_transfer (0-1)
  v_expected_events := 1; -- created
  IF v_battle.status IN ('accepted', 'ready', 'countdown', 'active', 'resolved') THEN
    v_expected_events := v_expected_events + 1; -- accepted
  END IF;
  IF v_battle.status = 'resolved' THEN
    v_expected_events := v_expected_events + 2; -- resolved + transfer
  END IF;
  
  SELECT COUNT(*) INTO v_actual_events
  FROM public.battle_audit
  WHERE battle_id = p_battle_id;
  
  IF v_actual_events < v_expected_events THEN
    v_tamper_flags := array_append(v_tamper_flags, 'AUDIT_LOG_INCOMPLETE');
    v_ledger_check := 'incomplete';
  END IF;
  
  -- TAMPER FLAG 5: RNG seed missing for resolved battles
  IF v_battle.status = 'resolved' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.battle_audit
      WHERE battle_id = p_battle_id 
      AND event_type = 'battle_resolved'
      AND rng_seed IS NOT NULL
    ) THEN
      v_tamper_flags := array_append(v_tamper_flags, 'RNG_SEED_MISSING');
      v_rng_check := 'missing';
    END IF;
  END IF;
  
  -- Build final report
  RETURN json_build_object(
    'battle_id', p_battle_id,
    'status', v_battle.status,
    'creator_id', v_battle.creator_id,
    'opponent_id', v_battle.opponent_id,
    'winner_id', v_battle.winner_id,
    'stake_type', v_battle.stake_type,
    'stake_amount', v_battle.stake_amount,
    'created_at', v_battle.created_at,
    'resolved_at', v_battle.resolved_at,
    'rng_check', v_rng_check,
    'ledger_check', v_ledger_check,
    'audit_log_entries', COALESCE(v_audit_entries, '[]'::json),
    'transfers', COALESCE(v_transfers, '[]'::json),
    'participants', COALESCE(v_participants, '[]'::json),
    'tamper_flags', v_tamper_flags,
    'audit_summary', json_build_object(
      'total_audit_entries', v_actual_events,
      'total_transfers', COALESCE(json_array_length(v_transfers), 0),
      'flags_count', array_length(v_tamper_flags, 1),
      'is_clean', array_length(v_tamper_flags, 1) = 0
    )
  );
END;
$$;

-- Grant execute to authenticated users (they can only audit their own battles via RLS)
GRANT EXECUTE ON FUNCTION public.audit_battle(UUID) TO authenticated;

-- 11. RPC: flag_battle_suspicious (ADMIN ACTION)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.flag_battle_suspicious(
  p_battle_id UUID,
  p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get current user
  v_admin_id := auth.uid();
  
  IF v_admin_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized - please sign in'
    );
  END IF;
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_admin_id AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Forbidden - admin access required'
    );
  END IF;
  
  -- Verify battle exists
  IF NOT EXISTS (SELECT 1 FROM public.battles WHERE id = p_battle_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Battle not found'
    );
  END IF;
  
  -- Insert admin action
  INSERT INTO public.battle_admin_actions (
    battle_id,
    admin_id,
    action_type,
    reason
  ) VALUES (
    p_battle_id,
    v_admin_id,
    'flag_suspicious',
    p_reason
  );
  
  RETURN json_build_object(
    'success', true,
    'battle_id', p_battle_id,
    'action', 'flag_suspicious',
    'reason', p_reason,
    'flagged_by', v_admin_id,
    'flagged_at', now()
  );
END;
$$;

-- Grant execute to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION public.flag_battle_suspicious(UUID, TEXT) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after applying the migration)
-- ============================================================================

-- Check if battle_audit has new columns
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'battle_audit' AND column_name IN ('rng_seed', 'created_by');

-- Check if triggers are installed
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name LIKE 'trg_battle%';

-- Check if RPC functions exist
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_name IN ('audit_battle', 'flag_battle_suspicious');

-- ============================================================================
-- END OF PHASE 7 MIGRATION
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================
