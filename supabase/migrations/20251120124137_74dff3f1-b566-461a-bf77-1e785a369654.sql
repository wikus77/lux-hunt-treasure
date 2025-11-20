-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- COMPATIBILITY MIGRATION: Adds views and minimal schema for legacy code compilation
-- ULTRA-CONSERVATIVE: Only adds what's absolutely needed, drops/recreates views

-- ============================================
-- 1) PROFILES - Add missing columns expected by code
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS access_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS access_start_date DATE,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ============================================
-- 2) BUZZ COUNTER COMPATIBILITY VIEWS
-- ============================================
-- Drop and recreate to avoid column name conflicts
DROP VIEW IF EXISTS public.v_user_buzz_daily CASCADE;
CREATE VIEW public.v_user_buzz_daily AS
SELECT 
  user_id, 
  daily_count AS buzz_count,
  counter_date AS date,
  updated_at
FROM public.user_buzz_counter
WHERE counter_date = CURRENT_DATE;

GRANT SELECT ON public.v_user_buzz_daily TO authenticated;

DROP VIEW IF EXISTS public.v_user_buzz_map_daily CASCADE;
CREATE VIEW public.v_user_buzz_map_daily AS
SELECT 
  user_id, 
  daily_count AS buzz_map_count,
  counter_date AS date,
  updated_at
FROM public.user_buzz_map_counter
WHERE counter_date = CURRENT_DATE;

GRANT SELECT ON public.v_user_buzz_map_daily TO authenticated;

-- ============================================
-- 3) WEBPUSH - Add endpoint column if missing
-- ============================================
ALTER TABLE public.webpush_subscriptions
  ADD COLUMN IF NOT EXISTS endpoint TEXT;

-- Drop and recreate push_subscriptions view
DROP VIEW IF EXISTS public.push_subscriptions CASCADE;
CREATE VIEW public.push_subscriptions AS
SELECT 
  id, 
  user_id, 
  'web' AS platform,
  subscription->>'endpoint' AS endpoint,
  is_active, 
  created_at, 
  updated_at
FROM public.webpush_subscriptions;

GRANT SELECT ON public.push_subscriptions TO authenticated;

-- ============================================
-- 4) QR SYSTEM - Drop and recreate view with correct schema
-- ============================================
DROP VIEW IF EXISTS public.qr_buzz_codes CASCADE;
CREATE VIEW public.qr_buzz_codes AS
SELECT
  c.id,
  c.code,
  c.lat,
  c.lng,
  c.location_name,
  c.reward_type,
  c.title,
  c.is_used,
  c.created_at
FROM public.qr_codes c
WHERE c.is_active = true;

GRANT SELECT ON public.qr_buzz_codes TO authenticated;

-- ============================================
-- 5) BUZZ GRANTS - Create if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.buzz_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source TEXT DEFAULT 'system',
  remaining INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'buzz_grants'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.buzz_grants ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'buzz_grants'
    AND policyname = 'buzz_grants_owner_rw'
  ) THEN
    CREATE POLICY "buzz_grants_owner_rw" ON public.buzz_grants
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END$$;

-- ============================================
-- 6) LEGACY FEATURE TABLES - Minimal schema
-- ============================================
CREATE TABLE IF NOT EXISTS public.mission_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID,
  state TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.buzz_game_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION DEFAULT 0.2,
  active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_mission_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  state TEXT DEFAULT 'idle',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Basic RLS for new tables
DO $$
BEGIN
  -- mission_enrollments
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'mission_enrollments'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'mission_enrollments'
  ) THEN
    ALTER TABLE public.mission_enrollments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "mission_enrollments_owner" ON public.mission_enrollments
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- user_mission_status
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_mission_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_mission_status'
  ) THEN
    ALTER TABLE public.user_mission_status ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "user_mission_status_owner" ON public.user_mission_status
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- subscriptions
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'subscriptions'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscriptions'
  ) THEN
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "subscriptions_owner" ON public.subscriptions
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- legal_documents
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'legal_documents'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'legal_documents'
  ) THEN
    ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "legal_documents_public_read" ON public.legal_documents
      FOR SELECT USING (true);
  END IF;
END$$;

-- ============================================
-- 7) RPC COMPATIBILITY STUBS
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_unique_agent_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  code TEXT;
BEGIN
  LOOP
    code := 'AG-' || LPAD((TRUNC(RANDOM()*99999))::INT::TEXT, 5, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE agent_code = code);
  END LOOP;
  RETURN code;
END$$;

CREATE OR REPLACE FUNCTION public.validate_buzz_user_id(p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user);
$$;

CREATE OR REPLACE FUNCTION public.can_user_access_mission(p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(access_enabled, true)
  FROM public.profiles
  WHERE id = p_user;
$$;

GRANT EXECUTE ON FUNCTION public.generate_unique_agent_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_buzz_user_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_access_mission(UUID) TO authenticated;

-- ============================================
-- 8) INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_buzz_grants_user_remaining 
  ON public.buzz_grants(user_id, remaining) WHERE remaining > 0;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™