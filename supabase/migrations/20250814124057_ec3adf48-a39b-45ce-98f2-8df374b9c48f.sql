-- © 2025 Joseph MULÉ – M1SSION™
-- Marker Rewards System - Complete Schema

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

-- Table: user_xp (XP tracking with upsert capability)
CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id UUID PRIMARY KEY,
  total_xp BIGINT NOT NULL DEFAULT 0,
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

-- Enable RLS on all new tables
ALTER TABLE public.marker_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marker_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzz_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marker_rewards (admin only for config)
CREATE POLICY "Admin can manage marker rewards" ON public.marker_rewards
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public can view marker rewards" ON public.marker_rewards
FOR SELECT USING (true);

-- RLS Policies for marker_claims (user can insert/select own claims)
CREATE POLICY "Users can insert their own claims" ON public.marker_claims
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claims" ON public.marker_claims
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for buzz_grants (user owns their grants)
CREATE POLICY "Users can view their own buzz grants" ON public.buzz_grants
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage buzz grants" ON public.buzz_grants
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for user_xp (user owns their XP)
CREATE POLICY "Users can view their own XP" ON public.user_xp
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user XP" ON public.user_xp
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for event_tickets (user owns their tickets)
CREATE POLICY "Users can view their own tickets" ON public.event_tickets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage event tickets" ON public.event_tickets
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for user_badges (user owns their badges)
CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user badges" ON public.user_badges
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for badges catalog (public read)
CREATE POLICY "Public can view badges catalog" ON public.badges
FOR SELECT USING (true);

CREATE POLICY "Admin can manage badges catalog" ON public.badges
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for events catalog (public read)
CREATE POLICY "Public can view events catalog" ON public.events
FOR SELECT USING (true);

CREATE POLICY "Admin can manage events catalog" ON public.events
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marker_rewards_updated_at
    BEFORE UPDATE ON public.marker_rewards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buzz_grants_updated_at
    BEFORE UPDATE ON public.buzz_grants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_xp_updated_at
    BEFORE UPDATE ON public.user_xp
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();