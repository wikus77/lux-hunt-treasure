-- ============================================================================
-- THE PULSE™ — Complete Backend Implementation (Fixed)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- Drop existing tables if any (idempotent)
DROP TABLE IF EXISTS public.pulse_user_cosmetics CASCADE;
DROP TABLE IF EXISTS public.pulse_cosmetics CASCADE;
DROP TABLE IF EXISTS public.pulse_sponsor_slots CASCADE;
DROP TABLE IF EXISTS public.pulse_abuse_counters CASCADE;
DROP TABLE IF EXISTS public.pulse_thresholds_log CASCADE;
DROP TABLE IF EXISTS public.pulse_events CASCADE;
DROP TABLE IF EXISTS public.pulse_config_weights CASCADE;
DROP TABLE IF EXISTS public.pulse_state CASCADE;

-- 1. PULSE STATE (singleton - stato globale corrente)
CREATE TABLE public.pulse_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  value NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (value >= 0 AND value <= 100),
  last_threshold INTEGER NOT NULL DEFAULT 0 CHECK (last_threshold IN (0, 25, 50, 75, 100)),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.pulse_state (id, value, last_threshold) VALUES (1, 0, 0);

COMMENT ON TABLE public.pulse_state IS 'Stato globale singleton del Pulse (0-100)';

-- 2. PULSE CONFIG WEIGHTS
CREATE TABLE public.pulse_config_weights (
  type TEXT PRIMARY KEY,
  weight NUMERIC(6,2) NOT NULL CHECK (weight >= 0),
  cooldown_sec INTEGER NOT NULL DEFAULT 0 CHECK (cooldown_sec >= 0),
  per_user_cap_day INTEGER NOT NULL DEFAULT 0 CHECK (per_user_cap_day >= 0),
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pulse_config_enabled ON public.pulse_config_weights(enabled) WHERE enabled = true;

INSERT INTO public.pulse_config_weights (type, weight, cooldown_sec, per_user_cap_day, enabled, description) VALUES
  ('BUZZ_COMPLETED', 2.5, 300, 10, true, 'Buzz completato con successo'),
  ('PORTAL_DISCOVERED', 5.0, 600, 5, true, 'Nuovo portale scoperto'),
  ('DAILY_STREAK', 1.5, 86400, 1, true, 'Login giornaliero consecutivo'),
  ('QR_SCAN_VERIFIED', 3.0, 180, 15, true, 'QR code scansionato e verificato'),
  ('NORAH_STORY_BEAT', 1.0, 120, 20, true, 'Interazione significativa con Norah AI'),
  ('MISSION_COMPLETED', 10.0, 3600, 3, true, 'Missione completata'),
  ('SPONSOR_SPIKE', 15.0, 0, 0, true, 'Evento sponsorizzato programmato');

-- 3. PULSE EVENTS
CREATE TABLE public.pulse_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL REFERENCES public.pulse_config_weights(type),
  weight NUMERIC(6,2) NOT NULL CHECK (weight >= 0),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  device_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pulse_events_created ON public.pulse_events(created_at DESC);
CREATE INDEX idx_pulse_events_user ON public.pulse_events(user_id, created_at DESC);
CREATE INDEX idx_pulse_events_type ON public.pulse_events(type, created_at DESC);

-- 4. PULSE THRESHOLDS LOG
CREATE TABLE public.pulse_thresholds_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold INTEGER NOT NULL CHECK (threshold IN (25, 50, 75, 100)),
  value_snapshot NUMERIC(5,2) NOT NULL,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pulse_thresholds ON public.pulse_thresholds_log(reached_at DESC);

-- 5. PULSE ABUSE COUNTERS
CREATE TABLE public.pulse_abuse_counters (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (user_id, type, window_start)
);

CREATE INDEX idx_pulse_abuse_window ON public.pulse_abuse_counters(window_start DESC);

-- 6. PULSE COSMETICS
CREATE TABLE public.pulse_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1 CHECK (tier >= 1),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.pulse_cosmetics (key, display_name, description, tier) VALUES
  ('halo_neon_cyan', 'Cyan Halo', 'Alone neon ciano intorno al tuo contributo', 1),
  ('trail_spark', 'Spark Trail', 'Scia di scintille luminose', 1),
  ('aurora_effect', 'Aurora Effect', 'Effetto aurora boreale premium', 2),
  ('pulse_amplifier', 'Pulse Amplifier', 'Amplifica visivamente il tuo impatto', 2);

-- 7. PULSE USER COSMETICS
CREATE TABLE public.pulse_user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmetic_key TEXT NOT NULL REFERENCES public.pulse_cosmetics(key) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cosmetic_key)
);

CREATE INDEX idx_pulse_user_cosmetics ON public.pulse_user_cosmetics(user_id);

-- 8. PULSE SPONSOR SLOTS
CREATE TABLE public.pulse_sponsor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_name TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  intended_delta NUMERIC(5,2) NOT NULL CHECK (intended_delta > 0),
  creative_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pulse_sponsor_window ON public.pulse_sponsor_slots(window_start, window_end);
CREATE INDEX idx_pulse_sponsor_status ON public.pulse_sponsor_slots(status);

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_pulse_event_record(
  p_user_id UUID,
  p_type TEXT,
  p_meta JSONB DEFAULT '{}'::jsonb
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
  v_device TEXT;
  v_window TIMESTAMPTZ;
  v_abuse_cnt INTEGER;
  v_daily_cnt INTEGER;
  v_last TIMESTAMPTZ;
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
  
  INSERT INTO public.pulse_events (user_id, type, weight, meta, device_hash)
  VALUES (p_user_id, p_type, v_weight, p_meta, v_device);
  
  SELECT value INTO v_current FROM public.pulse_state WHERE id = 1 FOR UPDATE;
  v_new := LEAST(100, v_current + (v_weight * 0.1));
  
  UPDATE public.pulse_state SET value = v_new, updated_at = now() WHERE id = 1;
  
  -- Check thresholds
  FOR v_threshold IN SELECT unnest(ARRAY[25, 50, 75, 100]) LOOP
    IF v_current < v_threshold AND v_new >= v_threshold THEN
      INSERT INTO public.pulse_thresholds_log (threshold, value_snapshot) VALUES (v_threshold, v_new);
      PERFORM pg_notify('pulse_channel', json_build_object('value', v_new, 'delta', (v_new - v_current), 'threshold', v_threshold)::text);
      UPDATE public.pulse_state SET last_threshold = v_threshold WHERE id = 1;
      EXIT;
    END IF;
  END LOOP;
  
  IF v_threshold IS NULL THEN
    PERFORM pg_notify('pulse_channel', json_build_object('value', v_new, 'delta', (v_new - v_current), 'threshold', NULL)::text);
  END IF;
  
  RETURN json_build_object('accepted', true, 'new_value', v_new, 'delta', (v_new - v_current), 'threshold_triggered', v_threshold);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_pulse_state_read()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object('current_value', value, 'last_threshold', last_threshold, 'updated_at', updated_at)
  FROM public.pulse_state WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION public.rpc_pulse_decay_tick(p_decay_percent NUMERIC DEFAULT 0.5)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current NUMERIC(5,2);
  v_new NUMERIC(5,2);
  v_delta NUMERIC(5,2);
BEGIN
  SELECT value INTO v_current FROM public.pulse_state WHERE id = 1 FOR UPDATE;
  v_new := GREATEST(0, v_current - p_decay_percent);
  v_delta := v_new - v_current;
  
  IF ABS(v_delta) >= 0.2 THEN
    UPDATE public.pulse_state SET value = v_new, updated_at = now() WHERE id = 1;
    PERFORM pg_notify('pulse_channel', json_build_object('value', v_new, 'delta', v_delta, 'threshold', NULL, 'type', 'decay')::text);
  END IF;
  
  RETURN json_build_object('previous_value', v_current, 'new_value', v_new, 'delta', v_delta, 'applied', ABS(v_delta) >= 0.2);
END;
$$;

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW public.pulse_leaderboard_daily AS
SELECT p.full_name, p.agent_code, COUNT(pe.id) AS event_count, SUM(pe.weight) AS total_contribution, MAX(pe.created_at) AS last_contribution
FROM public.pulse_events pe
JOIN public.profiles p ON p.id = pe.user_id
WHERE pe.created_at >= CURRENT_DATE
GROUP BY p.id, p.full_name, p.agent_code
ORDER BY total_contribution DESC LIMIT 100;

CREATE OR REPLACE VIEW public.pulse_leaderboard_weekly AS
SELECT p.full_name, p.agent_code, COUNT(pe.id) AS event_count, SUM(pe.weight) AS total_contribution, MAX(pe.created_at) AS last_contribution
FROM public.pulse_events pe
JOIN public.profiles p ON p.id = pe.user_id
WHERE pe.created_at >= (CURRENT_DATE - INTERVAL '7 days')
GROUP BY p.id, p.full_name, p.agent_code
ORDER BY total_contribution DESC LIMIT 100;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.pulse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_config_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_thresholds_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_abuse_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_sponsor_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pulse_events_no_access" ON public.pulse_events FOR ALL USING (false);
CREATE POLICY "pulse_config_read" ON public.pulse_config_weights FOR SELECT USING (true);
CREATE POLICY "pulse_state_read" ON public.pulse_state FOR SELECT USING (true);
CREATE POLICY "pulse_thresholds_read" ON public.pulse_thresholds_log FOR SELECT USING (true);
CREATE POLICY "pulse_abuse_no_access" ON public.pulse_abuse_counters FOR ALL USING (false);
CREATE POLICY "pulse_cosmetics_read" ON public.pulse_cosmetics FOR SELECT USING (active = true);
CREATE POLICY "pulse_user_cosmetics_read" ON public.pulse_user_cosmetics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pulse_sponsor_read" ON public.pulse_sponsor_slots FOR SELECT USING (status IN ('active', 'scheduled'));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION pulse_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pulse_config_weights_updated BEFORE UPDATE ON public.pulse_config_weights FOR EACH ROW EXECUTE FUNCTION pulse_updated_at();
CREATE TRIGGER pulse_sponsor_slots_updated BEFORE UPDATE ON public.pulse_sponsor_slots FOR EACH ROW EXECUTE FUNCTION pulse_updated_at();

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_state;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON public.pulse_state TO anon, authenticated;
GRANT SELECT ON public.pulse_config_weights TO anon, authenticated;
GRANT SELECT ON public.pulse_thresholds_log TO anon, authenticated;
GRANT SELECT ON public.pulse_cosmetics TO anon, authenticated;
GRANT SELECT ON public.pulse_user_cosmetics TO authenticated;
GRANT SELECT ON public.pulse_sponsor_slots TO anon, authenticated;
GRANT SELECT ON public.pulse_leaderboard_daily TO anon, authenticated;
GRANT SELECT ON public.pulse_leaderboard_weekly TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_pulse_event_record TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_pulse_state_read TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_pulse_decay_tick TO service_role;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™