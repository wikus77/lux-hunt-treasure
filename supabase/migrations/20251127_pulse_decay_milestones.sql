-- ============================================================================
-- THE PULSE™ — DECAY SYSTEM + MILESTONE REWARDS
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. MILESTONE REWARDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pulse_milestones (
  id SERIAL PRIMARY KEY,
  pe_threshold INTEGER NOT NULL UNIQUE,
  reward_type TEXT NOT NULL, -- 'm1u', 'badge', 'bonus_multiplier', 'unlock'
  reward_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  title_it TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_it TEXT,
  description_en TEXT,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#00d4ff',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed milestone rewards
INSERT INTO pulse_milestones (pe_threshold, reward_type, reward_value, title_it, title_en, description_it, description_en, icon, color) VALUES
  (100, 'm1u', '{"amount": 50}', 'Primo Passo', 'First Step', 'Hai iniziato il tuo viaggio!', 'You started your journey!', '🚀', '#60A5FA'),
  (500, 'm1u', '{"amount": 150}', 'Agente Attivo', 'Active Agent', 'La tua energia cresce!', 'Your energy is growing!', '⚡', '#34D399'),
  (1000, 'badge', '{"badge_id": "field_agent", "m1u": 300}', 'Sul Campo', 'In The Field', 'Sei ufficialmente operativo!', 'You are officially operative!', '🔰', '#4A90E2'),
  (2500, 'm1u', '{"amount": 500}', 'Veterano', 'Veteran', 'Esperienza che conta', 'Experience that matters', '🎖️', '#8B5CF6'),
  (5000, 'bonus_multiplier', '{"multiplier": 1.1, "duration_days": 7, "m1u": 750}', 'Specialista', 'Specialist', '+10% M1U per 7 giorni!', '+10% M1U for 7 days!', '🎯', '#9370DB'),
  (10000, 'unlock', '{"feature": "early_clues", "m1u": 1000}', 'Ombra', 'Shadow', 'Accesso anticipato agli indizi!', 'Early access to clues!', '👁️', '#2F4F4F'),
  (25000, 'bonus_multiplier', '{"multiplier": 1.2, "duration_days": 14, "m1u": 2000}', 'Elite', 'Elite', '+20% M1U per 14 giorni!', '+20% M1U for 14 days!', '💠', '#F59E0B'),
  (50000, 'unlock', '{"feature": "final_shot_access", "m1u": 5000}', 'Comandante', 'Commander', 'Accesso al Final Shot!', 'Final Shot access!', '⚔️', '#EF4444'),
  (100000, 'm1u', '{"amount": 10000}', 'Direttore', 'Director', 'Leggenda vivente', 'Living legend', '🦅', '#DC2626'),
  (300000, 'unlock', '{"feature": "master_privileges", "m1u": 50000}', 'Maestro', 'Master', 'Vertice assoluto', 'Absolute peak', '💎', '#000080')
ON CONFLICT (pe_threshold) DO NOTHING;

-- RLS
ALTER TABLE pulse_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pulse_milestones_read" ON pulse_milestones FOR SELECT USING (active = true);

-- 2. USER MILESTONE CLAIMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pulse_milestone_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id INTEGER NOT NULL REFERENCES pulse_milestones(id),
  pe_at_claim INTEGER NOT NULL,
  reward_granted JSONB NOT NULL DEFAULT '{}'::jsonb,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX idx_milestone_claims_user ON pulse_milestone_claims(user_id);
CREATE INDEX idx_milestone_claims_milestone ON pulse_milestone_claims(milestone_id);

ALTER TABLE pulse_milestone_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestone_claims_own" ON pulse_milestone_claims FOR SELECT USING (auth.uid() = user_id);

-- 3. DECAY CONFIG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pulse_decay_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  enabled BOOLEAN DEFAULT true,
  grace_period_days INTEGER DEFAULT 2, -- No decay for first X days inactive
  decay_rate_percent NUMERIC(5,2) DEFAULT 5.0, -- % PE lost per day after grace
  max_decay_percent NUMERIC(5,2) DEFAULT 50.0, -- Max total decay (protection)
  min_pe_floor INTEGER DEFAULT 0, -- PE won't go below this
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pulse_decay_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE pulse_decay_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decay_config_read" ON pulse_decay_config FOR SELECT USING (true);

-- 4. LAST ACTIVITY TRACKING (add to profiles if not exists)
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS decay_protected_until TIMESTAMPTZ;

-- Update last_activity on any PE gain
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_activity_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_activity_on_buzz ON buzz_activations;
CREATE TRIGGER update_activity_on_buzz
  AFTER INSERT ON buzz_activations
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

DROP TRIGGER IF EXISTS update_activity_on_buzz_map ON buzz_map_actions;
CREATE TRIGGER update_activity_on_buzz_map
  AFTER INSERT ON buzz_map_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- 5. DECAY FUNCTION (called by cron)
-- ============================================================================
CREATE OR REPLACE FUNCTION apply_pulse_decay()
RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
  v_affected_count INTEGER := 0;
  v_total_decay INTEGER := 0;
  v_user RECORD;
  v_days_inactive INTEGER;
  v_decay_amount INTEGER;
BEGIN
  -- Get decay config
  SELECT * INTO v_config FROM pulse_decay_config WHERE id = 1;
  
  IF NOT v_config.enabled THEN
    RETURN jsonb_build_object('status', 'disabled', 'affected', 0);
  END IF;
  
  -- Process each user who hasn't been active recently
  FOR v_user IN 
    SELECT id, pulse_energy, last_activity_at, decay_protected_until
    FROM profiles
    WHERE pulse_energy > v_config.min_pe_floor
      AND (decay_protected_until IS NULL OR decay_protected_until < NOW())
      AND last_activity_at < NOW() - (v_config.grace_period_days || ' days')::INTERVAL
  LOOP
    -- Calculate days inactive (beyond grace period)
    v_days_inactive := EXTRACT(DAY FROM (NOW() - v_user.last_activity_at)) - v_config.grace_period_days;
    
    IF v_days_inactive > 0 THEN
      -- Calculate decay (capped at max_decay_percent of current PE)
      v_decay_amount := LEAST(
        FLOOR(v_user.pulse_energy * (v_config.decay_rate_percent / 100.0)),
        FLOOR(v_user.pulse_energy * (v_config.max_decay_percent / 100.0))
      );
      
      -- Ensure we don't go below floor
      v_decay_amount := LEAST(v_decay_amount, v_user.pulse_energy - v_config.min_pe_floor);
      
      IF v_decay_amount > 0 THEN
        UPDATE profiles
        SET pulse_energy = pulse_energy - v_decay_amount,
            updated_at = NOW()
        WHERE id = v_user.id;
        
        v_affected_count := v_affected_count + 1;
        v_total_decay := v_total_decay + v_decay_amount;
        
        -- Log the decay
        INSERT INTO user_notifications (user_id, type, title, message, data)
        VALUES (
          v_user.id,
          'pulse_decay',
          '⚠️ Energia in calo',
          'La tua inattività ha causato una perdita di ' || v_decay_amount || ' PE. Torna in missione!',
          jsonb_build_object('decay_amount', v_decay_amount, 'days_inactive', v_days_inactive)
        );
      END IF;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'status', 'completed',
    'affected_users', v_affected_count,
    'total_decay', v_total_decay,
    'executed_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. MILESTONE CHECK & CLAIM FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION check_and_claim_milestones(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_pe INTEGER;
  v_milestone RECORD;
  v_claimed_milestones JSONB := '[]'::jsonb;
  v_m1u_reward INTEGER := 0;
BEGIN
  -- Get user's current PE
  SELECT pulse_energy INTO v_user_pe FROM profiles WHERE id = p_user_id;
  
  IF v_user_pe IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;
  
  -- Check each unclaimed milestone
  FOR v_milestone IN 
    SELECT m.*
    FROM pulse_milestones m
    WHERE m.active = true
      AND m.pe_threshold <= v_user_pe
      AND NOT EXISTS (
        SELECT 1 FROM pulse_milestone_claims c 
        WHERE c.user_id = p_user_id AND c.milestone_id = m.id
      )
    ORDER BY m.pe_threshold ASC
  LOOP
    -- Claim this milestone
    INSERT INTO pulse_milestone_claims (user_id, milestone_id, pe_at_claim, reward_granted)
    VALUES (p_user_id, v_milestone.id, v_user_pe, v_milestone.reward_value);
    
    -- Grant M1U reward if present
    v_m1u_reward := COALESCE((v_milestone.reward_value->>'amount')::INTEGER, 0) +
                    COALESCE((v_milestone.reward_value->>'m1u')::INTEGER, 0);
    
    IF v_m1u_reward > 0 THEN
      UPDATE profiles SET m1u = m1u + v_m1u_reward WHERE id = p_user_id;
    END IF;
    
    -- Create notification
    INSERT INTO user_notifications (user_id, type, title, message, data)
    VALUES (
      p_user_id,
      'milestone_reached',
      v_milestone.icon || ' ' || v_milestone.title_it,
      v_milestone.description_it || CASE WHEN v_m1u_reward > 0 THEN ' (+' || v_m1u_reward || ' M1U)' ELSE '' END,
      jsonb_build_object(
        'milestone_id', v_milestone.id,
        'pe_threshold', v_milestone.pe_threshold,
        'reward', v_milestone.reward_value
      )
    );
    
    -- Add to result
    v_claimed_milestones := v_claimed_milestones || jsonb_build_object(
      'id', v_milestone.id,
      'title', v_milestone.title_it,
      'icon', v_milestone.icon,
      'm1u_granted', v_m1u_reward
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'claimed', v_claimed_milestones,
    'count', jsonb_array_length(v_claimed_milestones),
    'current_pe', v_user_pe
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. TRIGGER: Auto-check milestones when PE increases
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_milestone_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pulse_energy > OLD.pulse_energy THEN
    PERFORM check_and_claim_milestones(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_milestones_on_pe_change ON profiles;
CREATE TRIGGER check_milestones_on_pe_change
  AFTER UPDATE OF pulse_energy ON profiles
  FOR EACH ROW
  WHEN (NEW.pulse_energy > OLD.pulse_energy)
  EXECUTE FUNCTION trigger_milestone_check();

-- 8. RPC for frontend to get milestone status
-- ============================================================================
CREATE OR REPLACE FUNCTION rpc_get_milestone_status(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user_pe INTEGER;
  v_all_milestones JSONB;
  v_claimed_ids INTEGER[];
  v_next_milestone RECORD;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;
  
  SELECT pulse_energy INTO v_user_pe FROM profiles WHERE id = v_user_id;
  
  -- Get claimed milestone IDs
  SELECT ARRAY_AGG(milestone_id) INTO v_claimed_ids
  FROM pulse_milestone_claims WHERE user_id = v_user_id;
  
  -- Get all milestones with claimed status
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'pe_threshold', m.pe_threshold,
      'title', m.title_it,
      'description', m.description_it,
      'icon', m.icon,
      'color', m.color,
      'reward_type', m.reward_type,
      'reward_value', m.reward_value,
      'claimed', m.id = ANY(COALESCE(v_claimed_ids, ARRAY[]::INTEGER[])),
      'reachable', m.pe_threshold <= v_user_pe
    ) ORDER BY m.pe_threshold
  ) INTO v_all_milestones
  FROM pulse_milestones m WHERE m.active = true;
  
  -- Get next unclaimed milestone
  SELECT * INTO v_next_milestone
  FROM pulse_milestones
  WHERE active = true
    AND pe_threshold > v_user_pe
    AND id != ALL(COALESCE(v_claimed_ids, ARRAY[]::INTEGER[]))
  ORDER BY pe_threshold ASC
  LIMIT 1;
  
  RETURN jsonb_build_object(
    'current_pe', v_user_pe,
    'milestones', v_all_milestones,
    'claimed_count', COALESCE(array_length(v_claimed_ids, 1), 0),
    'total_count', jsonb_array_length(v_all_milestones),
    'next_milestone', CASE WHEN v_next_milestone.id IS NOT NULL THEN
      jsonb_build_object(
        'id', v_next_milestone.id,
        'pe_threshold', v_next_milestone.pe_threshold,
        'pe_remaining', v_next_milestone.pe_threshold - v_user_pe,
        'title', v_next_milestone.title_it,
        'icon', v_next_milestone.icon,
        'color', v_next_milestone.color
      )
    ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

