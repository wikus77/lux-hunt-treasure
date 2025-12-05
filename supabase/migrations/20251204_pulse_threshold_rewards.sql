-- =====================================================
-- PULSE THRESHOLD REWARDS SYSTEM
-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
-- =====================================================

-- 1. Tabella per tracciare i contributori del ciclo corrente
CREATE TABLE IF NOT EXISTS public.pulse_cycle_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id INTEGER NOT NULL DEFAULT 1,
  contribution_count INTEGER DEFAULT 1,
  total_weight NUMERIC(8,2) DEFAULT 0,
  first_contribution_at TIMESTAMPTZ DEFAULT now(),
  last_contribution_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cycle_id)
);

-- 2. Tabella per tracciare le ricompense distribuite
CREATE TABLE IF NOT EXISTS public.pulse_rewards_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id INTEGER NOT NULL,
  threshold INTEGER NOT NULL CHECK (threshold IN (25, 50, 75, 100)),
  base_reward INTEGER NOT NULL,
  bonus_reward INTEGER DEFAULT 0,
  total_reward INTEGER NOT NULL,
  is_contributor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Aggiungi cycle_id a pulse_state
ALTER TABLE public.pulse_state 
ADD COLUMN IF NOT EXISTS cycle_id INTEGER DEFAULT 1;

-- 4. Configurazione ricompense per soglia
CREATE TABLE IF NOT EXISTS public.pulse_reward_config (
  threshold INTEGER PRIMARY KEY CHECK (threshold IN (25, 50, 75, 100)),
  base_reward INTEGER NOT NULL,
  contributor_bonus INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true
);

INSERT INTO public.pulse_reward_config (threshold, base_reward, contributor_bonus) VALUES
  (25, 5, 2),
  (50, 10, 3),
  (75, 15, 5),
  (100, 30, 10)
ON CONFLICT (threshold) DO UPDATE SET 
  base_reward = EXCLUDED.base_reward,
  contributor_bonus = EXCLUDED.contributor_bonus;

-- 5. Funzione per distribuire le ricompense quando si raggiunge una soglia
CREATE OR REPLACE FUNCTION public.rpc_pulse_distribute_threshold_rewards(
  p_threshold INTEGER,
  p_cycle_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_user RECORD;
  v_contributor RECORD;
  v_total_distributed INTEGER := 0;
  v_users_rewarded INTEGER := 0;
  v_contributors_count INTEGER := 0;
BEGIN
  -- Get reward config for this threshold
  SELECT * INTO v_config FROM public.pulse_reward_config 
  WHERE threshold = p_threshold AND enabled = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Threshold config not found');
  END IF;
  
  -- Check if already distributed for this cycle/threshold
  IF EXISTS (
    SELECT 1 FROM public.pulse_rewards_log 
    WHERE cycle_id = p_cycle_id AND threshold = p_threshold LIMIT 1
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already distributed for this cycle/threshold');
  END IF;
  
  -- Get all contributors for this cycle
  SELECT array_agg(user_id) INTO v_contributors_count 
  FROM public.pulse_cycle_contributors WHERE cycle_id = p_cycle_id;
  
  -- Distribute BASE reward to ALL active users (who played in last 7 days)
  FOR v_user IN 
    SELECT DISTINCT p.id as user_id 
    FROM public.profiles p
    WHERE p.id IN (
      SELECT DISTINCT user_id FROM public.buzz_map_actions 
      WHERE created_at > now() - INTERVAL '7 days'
      UNION
      SELECT DISTINCT user_id FROM public.pulse_events 
      WHERE created_at > now() - INTERVAL '7 days'
    )
  LOOP
    -- Check if user is a contributor (gets bonus)
    SELECT * INTO v_contributor 
    FROM public.pulse_cycle_contributors 
    WHERE user_id = v_user.user_id AND cycle_id = p_cycle_id;
    
    DECLARE
      v_bonus INTEGER := 0;
      v_total INTEGER;
      v_is_contributor BOOLEAN := false;
    BEGIN
      IF v_contributor IS NOT NULL THEN
        v_bonus := v_config.contributor_bonus;
        v_is_contributor := true;
      END IF;
      
      v_total := v_config.base_reward + v_bonus;
      
      -- Add M1U to user
      UPDATE public.profiles 
      SET m1_units = COALESCE(m1_units, 0) + v_total 
      WHERE id = v_user.user_id;
      
      -- Log the reward
      INSERT INTO public.pulse_rewards_log 
        (user_id, cycle_id, threshold, base_reward, bonus_reward, total_reward, is_contributor)
      VALUES 
        (v_user.user_id, p_cycle_id, p_threshold, v_config.base_reward, v_bonus, v_total, v_is_contributor);
      
      v_total_distributed := v_total_distributed + v_total;
      v_users_rewarded := v_users_rewarded + 1;
    END;
  END LOOP;
  
  -- 🔔 Call Edge Function to send push notifications (async, non-blocking)
  BEGIN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/pulse-threshold-notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'threshold', p_threshold,
        'cycle_id', p_cycle_id
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Non-blocking: log error but don't fail the transaction
    RAISE WARNING '[PULSE] Push notification call failed: %', SQLERRM;
  END;
  
  RETURN json_build_object(
    'success', true,
    'threshold', p_threshold,
    'cycle_id', p_cycle_id,
    'users_rewarded', v_users_rewarded,
    'total_m1u_distributed', v_total_distributed,
    'base_reward', v_config.base_reward,
    'contributor_bonus', v_config.contributor_bonus
  );
END;
$$;

-- 6. Funzione aggiornata per registrare eventi Pulse CON rewards
CREATE OR REPLACE FUNCTION public.rpc_pulse_event_record(
  p_user_id UUID,
  p_type TEXT,
  p_meta JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_weight NUMERIC(6,2);
  v_current NUMERIC(5,2);
  v_new NUMERIC(5,2);
  v_threshold INTEGER := NULL;
  v_triggered_threshold INTEGER := NULL;
  v_device TEXT;
  v_window TIMESTAMPTZ;
  v_abuse_cnt INTEGER;
  v_daily_cnt INTEGER;
  v_last TIMESTAMPTZ;
  v_cycle_id INTEGER;
  v_reward_result JSON;
BEGIN
  SELECT * INTO v_config FROM public.pulse_config_weights WHERE type = p_type AND enabled = true;
  IF NOT FOUND THEN
    RETURN json_build_object('accepted', false, 'error', 'Invalid type');
  END IF;
  
  v_device := p_meta->>'device_hash';
  
  -- Cooldown check
  IF v_config.cooldown_sec > 0 THEN
    SELECT created_at INTO v_last FROM public.pulse_events
    WHERE user_id = p_user_id AND type = p_type ORDER BY created_at DESC LIMIT 1;
    
    IF v_last IS NOT NULL AND EXTRACT(EPOCH FROM (now() - v_last)) < v_config.cooldown_sec THEN
      RETURN json_build_object('accepted', false, 'error', 'Cooldown active');
    END IF;
  END IF;
  
  -- Daily cap check
  IF v_config.per_user_cap_day > 0 THEN
    SELECT COUNT(*) INTO v_daily_cnt FROM public.pulse_events
    WHERE user_id = p_user_id AND type = p_type AND created_at >= CURRENT_DATE;
    
    IF v_daily_cnt >= v_config.per_user_cap_day THEN
      RETURN json_build_object('accepted', false, 'error', 'Daily cap reached');
    END IF;
  END IF;
  
  -- Rate limit check
  v_window := date_trunc('hour', now());
  INSERT INTO public.pulse_abuse_counters (user_id, type, window_start, count)
  VALUES (p_user_id, p_type, v_window, 1)
  ON CONFLICT (user_id, type, window_start) DO UPDATE SET count = pulse_abuse_counters.count + 1
  RETURNING count INTO v_abuse_cnt;
  
  IF v_abuse_cnt > 50 THEN
    RETURN json_build_object('accepted', false, 'error', 'Rate limit exceeded');
  END IF;
  
  -- Dedup check
  IF v_device IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.pulse_events WHERE user_id = p_user_id AND type = p_type AND device_hash = v_device AND created_at > (now() - INTERVAL '5 minutes')) THEN
      RETURN json_build_object('accepted', false, 'error', 'Duplicate event');
    END IF;
  END IF;
  
  v_weight := v_config.weight;
  
  -- Insert pulse event
  INSERT INTO public.pulse_events (user_id, type, weight, meta, device_hash)
  VALUES (p_user_id, p_type, v_weight, p_meta, v_device);
  
  -- Get current state including cycle_id
  SELECT value, COALESCE(cycle_id, 1) INTO v_current, v_cycle_id 
  FROM public.pulse_state WHERE id = 1 FOR UPDATE;
  
  v_new := LEAST(100, v_current + (v_weight * 0.1));
  
  -- 🔥 NEW: Track contributor for this cycle
  INSERT INTO public.pulse_cycle_contributors (user_id, cycle_id, contribution_count, total_weight, last_contribution_at)
  VALUES (p_user_id, v_cycle_id, 1, v_weight, now())
  ON CONFLICT (user_id, cycle_id) DO UPDATE SET 
    contribution_count = pulse_cycle_contributors.contribution_count + 1,
    total_weight = pulse_cycle_contributors.total_weight + v_weight,
    last_contribution_at = now();
  
  -- Update pulse state
  UPDATE public.pulse_state SET value = v_new, updated_at = now() WHERE id = 1;
  
  -- Check thresholds and distribute rewards
  FOR v_threshold IN SELECT unnest(ARRAY[25, 50, 75, 100]) LOOP
    IF v_current < v_threshold AND v_new >= v_threshold THEN
      -- Log threshold reached
      INSERT INTO public.pulse_thresholds_log (threshold, value_snapshot) VALUES (v_threshold, v_new);
      
      -- 🔥 NEW: Distribute rewards for this threshold
      SELECT public.rpc_pulse_distribute_threshold_rewards(v_threshold, v_cycle_id) INTO v_reward_result;
      
      -- Notify clients
      PERFORM pg_notify('pulse_channel', json_build_object(
        'value', v_new, 
        'delta', (v_new - v_current), 
        'threshold', v_threshold,
        'rewards_distributed', true,
        'cycle_id', v_cycle_id
      )::text);
      
      UPDATE public.pulse_state SET last_threshold = v_threshold WHERE id = 1;
      v_triggered_threshold := v_threshold;
      
      -- 🔥 NEW: If 100% reached, reset to 0% and start new cycle
      IF v_threshold = 100 THEN
        UPDATE public.pulse_state SET 
          value = 0, 
          last_threshold = 0,
          cycle_id = v_cycle_id + 1,
          updated_at = now()
        WHERE id = 1;
        
        -- Clear contributors for new cycle (keep history in rewards_log)
        DELETE FROM public.pulse_cycle_contributors WHERE cycle_id = v_cycle_id;
        
        -- Notify clients about reset
        PERFORM pg_notify('pulse_channel', json_build_object(
          'value', 0, 
          'delta', -100, 
          'threshold', NULL,
          'cycle_reset', true,
          'new_cycle_id', v_cycle_id + 1
        )::text);
        
        -- Return with reset info
        RETURN json_build_object(
          'accepted', true, 
          'new_value', 0, 
          'delta', (v_new - v_current), 
          'threshold_triggered', 100,
          'cycle_reset', true,
          'new_cycle_id', v_cycle_id + 1,
          'rewards', v_reward_result
        );
      END IF;
      
      EXIT;
    END IF;
  END LOOP;
  
  -- Normal notification if no threshold triggered
  IF v_triggered_threshold IS NULL THEN
    PERFORM pg_notify('pulse_channel', json_build_object('value', v_new, 'delta', (v_new - v_current), 'threshold', NULL)::text);
  END IF;
  
  RETURN json_build_object(
    'accepted', true, 
    'new_value', v_new, 
    'delta', (v_new - v_current), 
    'threshold_triggered', v_triggered_threshold,
    'cycle_id', v_cycle_id,
    'rewards', v_reward_result
  );
END;
$$;

-- 7. RLS Policies
ALTER TABLE public.pulse_cycle_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_rewards_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_reward_config ENABLE ROW LEVEL SECURITY;

-- Users can see their own rewards
CREATE POLICY "users_own_rewards" ON public.pulse_rewards_log
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can read reward config
CREATE POLICY "read_reward_config" ON public.pulse_reward_config
  FOR SELECT USING (true);

-- Contributors tracked internally
CREATE POLICY "contributors_internal" ON public.pulse_cycle_contributors
  FOR ALL USING (auth.uid() = user_id);

-- 8. Grants
GRANT SELECT ON public.pulse_rewards_log TO authenticated;
GRANT SELECT ON public.pulse_reward_config TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.pulse_cycle_contributors TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_pulse_distribute_threshold_rewards TO authenticated;

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_pulse_rewards_user ON public.pulse_rewards_log(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_rewards_cycle ON public.pulse_rewards_log(cycle_id, threshold);
CREATE INDEX IF NOT EXISTS idx_pulse_contributors_cycle ON public.pulse_cycle_contributors(cycle_id);

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

