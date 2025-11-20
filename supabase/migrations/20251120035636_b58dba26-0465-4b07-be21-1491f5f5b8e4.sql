-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- MASTER MIGRATION: Complete Database Restoration
-- Target Project: vkjrqirvdvjbemsfzxof
-- CRITICAL: This migration restores ALL missing tables for full app functionality

-- ============================================================================
-- PART 1: CORE ENUMS AND TYPES
-- ============================================================================

-- App role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'agent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Referral status enum
DO $$ BEGIN
  CREATE TYPE public.referral_status AS ENUM ('pending', 'registered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PART 2: CORE PROFILES TABLE (ESSENTIAL FOR ALL OPERATIONS)
-- ============================================================================

-- Create comprehensive profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_code TEXT UNIQUE,
  nickname TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  
  -- M1SSION System fields
  m1_units INTEGER NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  
  -- Rank & Pulse Energy
  pulse_energy INTEGER DEFAULT 0 NOT NULL,
  rank_id INTEGER,
  rank_updated_at TIMESTAMPTZ,
  
  -- Referral system
  invited_by_code TEXT,
  referral_code_used BOOLEAN DEFAULT FALSE,
  
  -- Role (legacy - will be moved to user_roles)
  role TEXT DEFAULT 'agent',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_agent_code ON profiles (agent_code);
CREATE INDEX IF NOT EXISTS idx_profiles_pulse_energy ON profiles (pulse_energy DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rank_id ON profiles (rank_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PART 3: AGENT RANKS SYSTEM
-- ============================================================================

-- Agent ranks table
CREATE TABLE IF NOT EXISTS public.agent_ranks (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_it TEXT NOT NULL,
  description TEXT,
  pe_min INTEGER NOT NULL DEFAULT 0,
  pe_max INTEGER,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  symbol TEXT NOT NULL DEFAULT '⭐',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_ranks_pe_min ON agent_ranks (pe_min);
CREATE INDEX IF NOT EXISTS idx_agent_ranks_pe_max ON agent_ranks (pe_max);
CREATE INDEX IF NOT EXISTS idx_agent_ranks_code ON agent_ranks (code);

-- Seed data for agent ranks
INSERT INTO agent_ranks (code, name_en, name_it, description, pe_min, pe_max, color, symbol)
VALUES
  ('RCT', 'Recruit', 'Recluta', 'New agent starting their journey', 0, 1000, '#94A3B8', '🔰'),
  ('OPR', 'Operative', 'Operativo', 'Proven agent in the field', 1000, 5000, '#60A5FA', '⚡'),
  ('SPL', 'Specialist', 'Specialista', 'Highly skilled agent', 5000, 25000, '#3B82F6', '💠'),
  ('ELT', 'Elite', 'Elite', 'Top tier operative', 25000, 100000, '#8B5CF6', '💎'),
  ('LEG', 'Legend', 'Leggenda', 'Legendary agent', 100000, NULL, '#EF4444', '👑'),
  ('SRC-∞', 'MCP', 'MCP', 'Master Control Program - Reserved for Joseph Mulé', 1000000000, NULL, '#FFD700', '∞')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS
ALTER TABLE public.agent_ranks ENABLE ROW LEVEL SECURITY;

-- Public read policy
DROP POLICY IF EXISTS "agent_ranks_public_read" ON agent_ranks;
CREATE POLICY "agent_ranks_public_read" ON agent_ranks
  FOR SELECT USING (true);

-- Add foreign key from profiles to agent_ranks (if not exists)
DO $$ BEGIN
  ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_rank_id_fkey 
  FOREIGN KEY (rank_id) REFERENCES agent_ranks(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PART 4: RANK HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_rank_id INTEGER REFERENCES agent_ranks(id),
  new_rank_id INTEGER NOT NULL REFERENCES agent_ranks(id),
  delta_pe INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rank_history_user_id ON rank_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_history_new_rank ON rank_history (new_rank_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_created_at ON rank_history (created_at DESC);

-- Enable RLS
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
DROP POLICY IF EXISTS "rank_history_self_read" ON rank_history;
CREATE POLICY "rank_history_self_read" ON rank_history
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert
DROP POLICY IF EXISTS "rank_history_service_insert" ON rank_history;
CREATE POLICY "rank_history_service_insert" ON rank_history
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- ============================================================================
-- PART 5: USER XP SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_since_reward INTEGER NOT NULL DEFAULT 0,
  buzz_xp_progress INTEGER NOT NULL DEFAULT 0,
  map_xp_progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own XP" ON user_xp;
CREATE POLICY "Users can view their own XP" ON user_xp
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage user XP" ON user_xp;
CREATE POLICY "System can manage user XP" ON user_xp
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- PART 6: USER CREDITS AND REFERRALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  free_buzz_credit INTEGER NOT NULL DEFAULT 0,
  free_buzz_map_credit INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  xp_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inviter_id, invitee_id)
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage credits" ON user_credits;
CREATE POLICY "System can manage credits" ON user_credits
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for user_referrals
DROP POLICY IF EXISTS "Users can view their referrals" ON user_referrals;
CREATE POLICY "Users can view their referrals" ON user_referrals
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "System can manage referrals" ON user_referrals;
CREATE POLICY "System can manage referrals" ON user_referrals
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- PART 7: USER CLUES SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clue_id TEXT NOT NULL,
  title_it TEXT,
  buzz_cost INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_clues_user_id ON user_clues (user_id);
CREATE INDEX IF NOT EXISTS idx_user_clues_created_at ON user_clues (created_at DESC);

-- Enable RLS
ALTER TABLE public.user_clues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own clues" ON user_clues;
CREATE POLICY "Users can view own clues" ON user_clues
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clues" ON user_clues;
CREATE POLICY "Users can insert own clues" ON user_clues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 8: BUZZ ACTIVATION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.buzz_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.buzz_map_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buzz_activations_user_id ON buzz_activations (user_id);
CREATE INDEX IF NOT EXISTS idx_buzz_map_activations_user_id ON buzz_map_activations (user_id);

-- Enable RLS
ALTER TABLE public.buzz_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzz_map_activations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can insert own buzz activations" ON buzz_activations;
CREATE POLICY "Users can insert own buzz activations" ON buzz_activations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own buzz activations" ON buzz_activations;
CREATE POLICY "Users can view own buzz activations" ON buzz_activations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own buzz map activations" ON buzz_map_activations;
CREATE POLICY "Users can insert own buzz map activations" ON buzz_map_activations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own buzz map activations" ON buzz_map_activations;
CREATE POLICY "Users can view own buzz map activations" ON buzz_map_activations
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- PART 9: BUZZ MAP ACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.buzz_map_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cost_eur NUMERIC(10,2),
  cost_m1u INTEGER,
  radius_generated DOUBLE PRECISION,
  clue_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buzz_map_actions_user_id ON buzz_map_actions (user_id);
CREATE INDEX IF NOT EXISTS idx_buzz_map_actions_created_at ON buzz_map_actions (created_at DESC);

-- Enable RLS
ALTER TABLE public.buzz_map_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own buzz map actions" ON buzz_map_actions;
CREATE POLICY "Users can view own buzz map actions" ON buzz_map_actions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own buzz map actions" ON buzz_map_actions;
CREATE POLICY "Users can insert own buzz map actions" ON buzz_map_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 10: DAILY BUZZ COUNTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_buzz_counter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, counter_date)
);

CREATE TABLE IF NOT EXISTS public.user_buzz_map_counter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, counter_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_buzz_counter_user_date ON user_buzz_counter (user_id, counter_date);
CREATE INDEX IF NOT EXISTS idx_user_buzz_map_counter_user_date ON user_buzz_map_counter (user_id, counter_date);

-- Enable RLS
ALTER TABLE public.user_buzz_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_buzz_map_counter ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own buzz counter" ON user_buzz_counter;
CREATE POLICY "Users can manage own buzz counter" ON user_buzz_counter
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own buzz map counter" ON user_buzz_map_counter;
CREATE POLICY "Users can manage own buzz map counter" ON user_buzz_map_counter
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 11: USER ROLES SYSTEM (SECURITY HARDENING)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (user_id, role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PART 12: ADMIN LOGS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_event_type ON admin_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs (created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert logs" ON admin_logs;
CREATE POLICY "System can insert logs" ON admin_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PART 13: PUSH NOTIFICATIONS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_webpush_subscriptions_user_id ON webpush_subscriptions (user_id);

-- Enable RLS
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own tokens" ON device_tokens;
CREATE POLICY "Users can manage own tokens" ON device_tokens
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own push tokens" ON push_tokens;
CREATE POLICY "Users can manage own push tokens" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own webpush subscriptions" ON webpush_subscriptions;
CREATE POLICY "Users can manage own webpush subscriptions" ON webpush_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 14: NORAH AI CONTEXT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.norah_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_norah_events_user_id ON norah_events (user_id);
CREATE INDEX IF NOT EXISTS idx_norah_events_created_at ON norah_events (created_at DESC);

-- Enable RLS
ALTER TABLE public.norah_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can insert own events" ON norah_events;
CREATE POLICY "Users can insert own events" ON norah_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own events" ON norah_events;
CREATE POLICY "Users can view own events" ON norah_events
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- PART 15: APP MESSAGES SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('info', 'warning', 'critical', 'feature')),
  target_users JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_messages_active ON app_messages (is_active);
CREATE INDEX IF NOT EXISTS idx_app_messages_created_at ON app_messages (created_at DESC);

-- Enable RLS
ALTER TABLE public.app_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Active messages are public" ON app_messages;
CREATE POLICY "Active messages are public" ON app_messages
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage messages" ON app_messages;
CREATE POLICY "Admins can manage messages" ON app_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PART 16: MISSIONS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  rewards JSONB DEFAULT '{}'::jsonb,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  progress JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_missions_active ON missions (is_active);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions (status);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Active missions are public" ON missions;
CREATE POLICY "Active missions are public" ON missions
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can view own missions" ON user_missions;
CREATE POLICY "Users can view own missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own missions" ON user_missions;
CREATE POLICY "Users can insert own missions" ON user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own missions" ON user_missions;
CREATE POLICY "Users can update own missions" ON user_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- PART 17: CORE FUNCTIONS - Pulse Energy & Rank System
-- ============================================================================

-- Award pulse energy function
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

-- Recompute rank function
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

-- Has role function (for RLS policies)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Overload for text role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

-- Current user role function
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role::text
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'agent' THEN 3
    END
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ============================================================================
-- PART 18: BUZZ TRIGGERS (PE Awards)
-- ============================================================================

-- Buzz activation trigger
CREATE OR REPLACE FUNCTION handle_buzz_pe_award()
RETURNS TRIGGER AS $$
BEGIN
  -- Award +15 PE for Buzz activation
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS buzz_awards_pe ON buzz_activations;
CREATE TRIGGER buzz_awards_pe
  AFTER INSERT ON buzz_activations
  FOR EACH ROW
  EXECUTE FUNCTION handle_buzz_pe_award();

-- Buzz map activation trigger
CREATE OR REPLACE FUNCTION handle_buzz_map_pe_award()
RETURNS TRIGGER AS $$
BEGIN
  -- Award +10 PE for Buzz Map activation
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS buzz_map_awards_pe ON buzz_map_activations;
CREATE TRIGGER buzz_map_awards_pe
  AFTER INSERT ON buzz_map_activations
  FOR EACH ROW
  EXECUTE FUNCTION handle_buzz_map_pe_award();

-- Referral trigger
CREATE OR REPLACE FUNCTION handle_referral_pe_award()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter_id UUID;
BEGIN
  -- Only award if user was invited by someone
  IF NEW.invited_by_code IS NOT NULL THEN
    -- Find inviter by agent_code
    SELECT id INTO v_inviter_id
    FROM profiles
    WHERE agent_code = NEW.invited_by_code;

    -- Award +25 PE to inviter
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS referral_awards_pe ON profiles;
CREATE TRIGGER referral_awards_pe
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_pe_award();

-- ============================================================================
-- PART 19: MCP RANK PROTECTION TRIGGER
-- ============================================================================

-- Prevent MCP assignment to non-Joseph users
CREATE OR REPLACE FUNCTION prevent_mcp_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_mcp_rank_id INT;
  v_is_joseph BOOLEAN := FALSE;
BEGIN
  -- Get MCP rank ID
  SELECT id INTO v_mcp_rank_id
  FROM agent_ranks
  WHERE code = 'SRC-∞';

  -- Skip check if MCP rank doesn't exist or rank_id not changing to MCP
  IF v_mcp_rank_id IS NULL OR NEW.rank_id != v_mcp_rank_id THEN
    RETURN NEW;
  END IF;

  -- Check if user is Joseph
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE p.id = NEW.id
      AND u.email = 'wikus77@hotmail.it'
  ) INTO v_is_joseph;

  -- Block MCP assignment for non-Joseph users
  IF NOT v_is_joseph THEN
    RAISE EXCEPTION 'MCP rank (SRC-∞) is reserved for Joseph Mulé only. User: %, Rank: %', NEW.id, NEW.rank_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_mcp_protection ON profiles;
CREATE TRIGGER enforce_mcp_protection
  BEFORE UPDATE OF rank_id ON profiles
  FOR EACH ROW
  WHEN (NEW.rank_id IS DISTINCT FROM OLD.rank_id)
  EXECUTE FUNCTION prevent_mcp_assignment();

-- ============================================================================
-- PART 20: UPDATE TIMESTAMP TRIGGERS
-- ============================================================================

-- Generic update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_xp_updated_at ON user_xp;
CREATE TRIGGER update_user_xp_updated_at
  BEFORE UPDATE ON user_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_buzz_counter_updated_at ON user_buzz_counter;
CREATE TRIGGER update_user_buzz_counter_updated_at
  BEFORE UPDATE ON user_buzz_counter
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_buzz_map_counter_updated_at ON user_buzz_map_counter;
CREATE TRIGGER update_user_buzz_map_counter_updated_at
  BEFORE UPDATE ON user_buzz_map_counter
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 21: INITIALIZE PULSE ENERGY FROM USER_XP
-- ============================================================================

-- Initialize pulse_energy from user_xp.total_xp (if exists)
UPDATE profiles p
SET pulse_energy = COALESCE(
  (SELECT total_xp FROM user_xp WHERE user_id = p.id),
  0
)
WHERE pulse_energy = 0;

-- Calculate initial rank_id based on pulse_energy
UPDATE profiles p
SET 
  rank_id = (
    SELECT id FROM agent_ranks
    WHERE pe_min <= p.pulse_energy
      AND (pe_max IS NULL OR p.pulse_energy < pe_max)
    ORDER BY pe_min DESC
    LIMIT 1
  ),
  rank_updated_at = NOW()
WHERE rank_id IS NULL;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™