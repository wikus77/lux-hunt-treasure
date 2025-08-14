-- © 2025 Joseph MULÉ – M1SSION™
-- Marker Rewards System - Incremental Schema (avoiding conflicts)

-- Table: marker_rewards (multi-reward configuration per marker)
CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL, -- reference to existing marker (don't alter marker table)
  reward_type TEXT NOT NULL CHECK (reward_type IN ('buzz_free', 'message', 'xp_points', 'event_ticket', 'badge')),
  payload JSONB NOT NULL, -- e.g. {"buzzCount":1}, {"text":"..."}, {"xp":50}, {"event_id":"...", "ticket_type":"standard"}, {"badge_id":"..."}
  description TEXT, -- short text for popup display
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_marker_rewards_marker_id ON public.marker_rewards(marker_id);

-- Table: marker_claims (claim tracking - idempotent per user/marker)
CREATE TABLE IF NOT EXISTS public.marker_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL,
  user_id UUID NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(marker_id, user_id)
);

-- Table: buzz_grants (free buzz credits from markers)
CREATE TABLE IF NOT EXISTS public.buzz_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source TEXT NOT NULL, -- e.g. "marker:<marker_id>"
  remaining INTEGER NOT NULL CHECK (remaining >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: event_tickets (event tickets from markers)
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  ticket_type TEXT NOT NULL,
  source TEXT NOT NULL, -- "marker:<marker_id>"
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id, ticket_type, source)
);

-- Table: user_badges (badge grants from markers)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL,
  source TEXT NOT NULL, -- "marker:<marker_id>"
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id, source)
);

-- Optional catalog tables
CREATE TABLE IF NOT EXISTS public.badges (
  badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marker_rewards') THEN
    ALTER TABLE public.marker_rewards ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marker_claims') THEN
    ALTER TABLE public.marker_claims ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buzz_grants') THEN
    ALTER TABLE public.buzz_grants ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_tickets') THEN
    ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges') THEN
    ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges') THEN
    ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- RLS Policies - Create only if they don't exist
DO $$
BEGIN
  -- marker_rewards policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marker_rewards' AND policyname = 'Admin can manage marker rewards') THEN
    CREATE POLICY "Admin can manage marker rewards" ON public.marker_rewards
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marker_rewards' AND policyname = 'Public can view marker rewards') THEN
    CREATE POLICY "Public can view marker rewards" ON public.marker_rewards
    FOR SELECT USING (true);
  END IF;

  -- marker_claims policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marker_claims' AND policyname = 'Users can insert their own claims') THEN
    CREATE POLICY "Users can insert their own claims" ON public.marker_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marker_claims' AND policyname = 'Users can view their own claims') THEN
    CREATE POLICY "Users can view their own claims" ON public.marker_claims
    FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- buzz_grants policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buzz_grants' AND policyname = 'Users can view their own buzz grants') THEN
    CREATE POLICY "Users can view their own buzz grants" ON public.buzz_grants
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buzz_grants' AND policyname = 'System can manage buzz grants') THEN
    CREATE POLICY "System can manage buzz grants" ON public.buzz_grants
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  -- event_tickets policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_tickets' AND policyname = 'Users can view their own tickets') THEN
    CREATE POLICY "Users can view their own tickets" ON public.event_tickets
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_tickets' AND policyname = 'System can manage event tickets') THEN
    CREATE POLICY "System can manage event tickets" ON public.event_tickets
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  -- user_badges policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can view their own badges') THEN
    CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'System can manage user badges') THEN
    CREATE POLICY "System can manage user badges" ON public.user_badges
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  -- badges catalog policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Public can view badges catalog') THEN
    CREATE POLICY "Public can view badges catalog" ON public.badges
    FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Admin can manage badges catalog') THEN
    CREATE POLICY "Admin can manage badges catalog" ON public.badges
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  -- events catalog policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Public can view events catalog') THEN
    CREATE POLICY "Public can view events catalog" ON public.events
    FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Admin can manage events catalog') THEN
    CREATE POLICY "Admin can manage events catalog" ON public.events
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END
$$;

-- Triggers for updated_at (only create if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_marker_rewards_updated_at') THEN
    CREATE TRIGGER update_marker_rewards_updated_at
        BEFORE UPDATE ON public.marker_rewards
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_buzz_grants_updated_at') THEN
    CREATE TRIGGER update_buzz_grants_updated_at
        BEFORE UPDATE ON public.buzz_grants
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;