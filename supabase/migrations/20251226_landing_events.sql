-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- Landing Events Tracking Table (Enterprise)

-- Create landing_events table
CREATE TABLE IF NOT EXISTS public.landing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_name text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text NOT NULL,
  path text,
  referrer text,
  ua text,
  country text,
  user_id uuid REFERENCES auth.users(id),
  ip_hash text,
  
  -- Indexes for common queries
  CONSTRAINT landing_events_event_name_check CHECK (event_name IN (
    'landing_cta_primary_click',
    'landing_minitest_choice',
    'landing_premium_toggle_open',
    'landing_plan_select',
    'landing_spectator_click',
    'landing_install_click',
    'spectator_page_view',
    'spectator_locked_click',
    'spectator_join_click'
  ))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_landing_events_created_at ON public.landing_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_landing_events_event_name ON public.landing_events(event_name);
CREATE INDEX IF NOT EXISTS idx_landing_events_session_id ON public.landing_events(session_id);

-- Enable RLS
ALTER TABLE public.landing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- INSERT: Only via service role (Edge Function)
-- SELECT: Only admin users
-- UPDATE/DELETE: Disabled

-- Policy for SELECT - Admin only (replace with your admin user_id or role check)
CREATE POLICY "Admin can view landing_events" ON public.landing_events
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
      OR email LIKE '%@m1ssion.eu'
    )
  );

-- No INSERT policy for regular users - Edge Function uses service_role
-- This effectively blocks client-side inserts

-- Comment for documentation
COMMENT ON TABLE public.landing_events IS 'Enterprise tracking for landing page funnel events. Inserts via Edge Function only.';

