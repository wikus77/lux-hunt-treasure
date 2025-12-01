-- =====================================================================
-- FIX MISSING FUNCTIONS & TABLES
-- Resolve 400 Bad Request errors
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

-- ============================================
-- 1) user_locations table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_locations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  status TEXT DEFAULT 'online',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_locations_select_own' AND tablename = 'user_locations'
  ) THEN
    CREATE POLICY user_locations_select_own ON public.user_locations FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_locations_insert_own' AND tablename = 'user_locations'
  ) THEN
    CREATE POLICY user_locations_insert_own ON public.user_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_locations_update_own' AND tablename = 'user_locations'
  ) THEN
    CREATE POLICY user_locations_update_own ON public.user_locations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 2) set_my_agent_location RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.set_my_agent_location(
  p_lat double precision,
  p_lng double precision,
  p_accuracy double precision DEFAULT NULL,
  p_status text DEFAULT 'online'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_locations (user_id, lat, lng, accuracy, status, updated_at)
  VALUES (auth.uid(), p_lat, p_lng, p_accuracy, p_status, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    accuracy = EXCLUDED.accuracy,
    status = EXCLUDED.status,
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_my_agent_location(double precision, double precision, double precision, text) TO authenticated;

-- ============================================
-- 3) Views for compatibility
-- ============================================
CREATE OR REPLACE VIEW public.agent_locations AS
SELECT 
  l.user_id AS agent_id, 
  l.lat, 
  l.lng, 
  l.updated_at
FROM public.user_locations l;

CREATE OR REPLACE VIEW public.online_agents AS
SELECT 
  l.user_id, 
  l.lat, 
  l.lng, 
  l.updated_at,
  l.status,
  l.updated_at AS last_seen,
  l.accuracy
FROM public.user_locations l
WHERE l.status = 'online' 
  AND l.updated_at > NOW() - INTERVAL '15 minutes';

CREATE OR REPLACE VIEW public.v_online_agents AS
SELECT * FROM public.online_agents;

GRANT SELECT ON public.agent_locations TO authenticated;
GRANT SELECT ON public.online_agents TO authenticated;
GRANT SELECT ON public.v_online_agents TO authenticated;

-- ============================================
-- 4) battles table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  opponent_id UUID REFERENCES auth.users(id),
  stake_type TEXT DEFAULT 'm1u',
  stake_percentage INTEGER DEFAULT 25,
  stake_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'battles_select_all' AND tablename = 'battles'
  ) THEN
    CREATE POLICY battles_select_all ON public.battles FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'battles_insert_own' AND tablename = 'battles'
  ) THEN
    CREATE POLICY battles_insert_own ON public.battles FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'battles_update_own' AND tablename = 'battles'
  ) THEN
    CREATE POLICY battles_update_own ON public.battles FOR UPDATE TO authenticated USING (auth.uid() = creator_id OR auth.uid() = opponent_id);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.battles TO authenticated;

-- ============================================
-- 5) chat table stub (if feature needed)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'chat_select_own' AND tablename = 'chat_messages'
  ) THEN
    CREATE POLICY chat_select_own ON public.chat_messages FOR SELECT TO authenticated 
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;
END $$;

GRANT SELECT, INSERT ON public.chat_messages TO authenticated;

-- ============================================
-- 6) user_settings table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'it',
  notifications_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_settings_select_own' AND tablename = 'user_settings'
  ) THEN
    CREATE POLICY user_settings_select_own ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_settings_all_own' AND tablename = 'user_settings'
  ) THEN
    CREATE POLICY user_settings_all_own ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;

-- ============================================
-- DONE
-- ============================================
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™




