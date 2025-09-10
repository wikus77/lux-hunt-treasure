-- M1SSION™ Intelligent Notifications Engine - Interest Signals Schema
-- Create tables for tracking user interests and external content

-- A) Raw interest signals from client
CREATE TABLE IF NOT EXISTS public.interest_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('view','click','dwell','favorite')),
  section text,         -- Map | Intel | Notice | Rewards | BuzzMap | ...
  category text,        -- brand|mission|reward|topic...
  meta jsonb DEFAULT '{}',
  device text,          -- ios_pwa|safari|chrome|desktop
  keywords text[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.interest_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only insert their own signals
CREATE POLICY "interest_signals_owner" ON public.interest_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- B) User interest profiles (synthesized)
CREATE TABLE IF NOT EXISTS public.user_interest_profile (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  topics jsonb NOT NULL DEFAULT '{}'::jsonb,  -- {"luxury_auto":0.82,"watches":0.55}
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_interest_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "profile_owner" ON public.user_interest_profile
  FOR SELECT USING (auth.uid() = user_id);

-- C) External feed items (curated news/events)
CREATE TABLE IF NOT EXISTS public.external_feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,             -- "gq", "hodinkee", "press_porsche", ...
  title text NOT NULL,
  url text NOT NULL,
  summary text DEFAULT '',
  tags text[] DEFAULT '{}',         -- ["auto","luxury","mission"]
  brand text,
  published_at timestamptz NOT NULL,
  content_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- D) Notification suggestions queue
CREATE TABLE IF NOT EXISTS public.suggested_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.external_feed_items(id),
  reason text NOT NULL,             -- "profile_match" | "mission_context" | ...
  score numeric NOT NULL CHECK (score >= 0 AND score <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  dedupe_key text NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_suggested_notifications_user_created 
ON public.suggested_notifications(user_id, created_at DESC);

-- E) Notification quota/throttling
CREATE TABLE IF NOT EXISTS public.notification_quota (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_reset timestamptz NOT NULL DEFAULT date_trunc('day', now()),
  sent_today int NOT NULL DEFAULT 0
);

-- RPC for ingest from frontend
CREATE OR REPLACE FUNCTION public.interest_track(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u uuid := (payload->>'user_id')::uuid;
  s uuid := (payload->>'session_id')::uuid;
  evs jsonb := payload->'events';
  e jsonb;
BEGIN
  -- Validate payload
  IF u IS NULL OR s IS NULL OR evs IS NULL THEN
    RAISE EXCEPTION 'invalid payload';
  END IF;

  -- Verify user is authenticated and matches
  IF auth.uid() != u THEN
    RAISE EXCEPTION 'unauthorized user_id';
  END IF;

  -- Insert events
  FOR e IN SELECT * FROM jsonb_array_elements(evs)
  LOOP
    INSERT INTO public.interest_signals(user_id, session_id, ts, type, section, category, meta, device, keywords)
    VALUES (
      u, s,
      COALESCE((e->>'ts')::timestamptz, now()),
      e->>'type',
      e->>'section',
      e->>'category',
      COALESCE(e->'meta','{}'::jsonb),
      e->>'device',
      COALESCE(string_to_array(COALESCE(e->>'keywords',''), ',')::text[], '{}')
    );
  END LOOP;
END $$;

-- Create some sample feed items for testing
INSERT INTO public.external_feed_items (source, title, url, summary, tags, brand, published_at, content_hash)
VALUES 
  ('gq', 'Luxury Watch Trends 2025', 'https://example.com/watches', 'Latest luxury timepieces', ARRAY['luxury','watches','mission'], 'GQ', now() - interval '1 hour', 'hash1'),
  ('hodinkee', 'Porsche x Swiss Timepieces', 'https://example.com/porsche', 'Exclusive automotive watches', ARRAY['auto','luxury','porsche'], 'Hodinkee', now() - interval '2 hours', 'hash2'),
  ('press', 'M1SSION Technology Update', 'https://example.com/tech', 'Latest mission tech', ARRAY['mission','tech','innovation'], 'M1SSION', now() - interval '30 minutes', 'hash3')
ON CONFLICT (content_hash) DO NOTHING;