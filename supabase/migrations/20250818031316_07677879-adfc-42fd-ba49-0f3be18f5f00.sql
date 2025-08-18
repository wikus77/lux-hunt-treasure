-- © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
-- 🔒 SECURITY & FUNCTIONALITY FIX: Markers Visibility + Security Remediation
-- Root cause: Missing RLS policies for anon users + security vulnerabilities

-- 1) FIX MARKERS TABLE - Missing visible_from/to columns and proper RLS
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markers' AND column_name = 'visible_from') THEN
    ALTER TABLE public.markers ADD COLUMN visible_from TIMESTAMPTZ NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markers' AND column_name = 'visible_to') THEN
    ALTER TABLE public.markers ADD COLUMN visible_to TIMESTAMPTZ NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markers' AND column_name = 'zoom_min') THEN
    ALTER TABLE public.markers ADD COLUMN zoom_min INTEGER NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markers' AND column_name = 'zoom_max') THEN
    ALTER TABLE public.markers ADD COLUMN zoom_max INTEGER NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'markers' AND column_name = 'updated_at') THEN
    ALTER TABLE public.markers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Drop existing restrictive policy and create new ones
DROP POLICY IF EXISTS "markers_select_auth" ON public.markers;

-- CRITICAL: Allow anon users to see active visible markers
CREATE POLICY "markers_visible_to_public"
ON public.markers
FOR SELECT
TO anon, authenticated
USING (
  active = true 
  AND (visible_from IS NULL OR visible_from <= now()) 
  AND (visible_to IS NULL OR visible_to >= now())
);

-- Admin access for management
CREATE POLICY "markers_admin_full_access"
ON public.markers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add coordinate validation
ALTER TABLE public.markers 
ADD CONSTRAINT markers_lat_valid CHECK (lat >= -90 AND lat <= 90),
ADD CONSTRAINT markers_lng_valid CHECK (lng >= -180 AND lng <= 180),
ADD CONSTRAINT markers_zoom_valid CHECK (zoom_min IS NULL OR (zoom_min >= 1 AND zoom_min <= 22));

-- 2) FIX SECURITY ISSUES - Newsletter Subscriber Data Protection
-- Drop overly permissive policies if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Public can view newsletter subscriptions') THEN
    DROP POLICY "Public can view newsletter subscriptions" ON public.newsletter_subscriptions;
  END IF;
END $$;

-- Create secure newsletter policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'newsletter_subscriptions') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
    
    -- Only admins can view all newsletter subscriptions
    DROP POLICY IF EXISTS "newsletter_admin_access" ON public.newsletter_subscriptions;
    CREATE POLICY "newsletter_admin_access"
    ON public.newsletter_subscriptions
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    -- Users can only subscribe (insert only)
    DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscriptions;
    CREATE POLICY "newsletter_public_insert"
    ON public.newsletter_subscriptions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- 3) FIX Function Search Path Security Warnings
-- Update functions with mutable search paths
DO $$
DECLARE
  func_rec RECORD;
BEGIN
  -- Get all user-defined functions with mutable search paths
  FOR func_rec IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'award_xp', 'calculate_access_start_time', 'generate_referral_code',
        'sync_user_permissions', 'get_user_sync_status', 'consume_buzz_mappa'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = pg_catalog, public',
      func_rec.schema_name, func_rec.function_name, func_rec.args);
  END LOOP;
END $$;

-- 4) ADD UPDATED_AT TRIGGER FOR MARKERS
CREATE OR REPLACE FUNCTION public.update_markers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_markers_updated_at ON public.markers;
CREATE TRIGGER trigger_update_markers_updated_at
  BEFORE UPDATE ON public.markers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_markers_updated_at();

-- 5) REALTIME ENABLEMENT
ALTER TABLE public.markers REPLICA IDENTITY FULL;
DO $$ 
BEGIN
  -- Enable realtime if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'markers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.markers;
  END IF;
END $$;

-- 6) INSERT TEST MARKERS (if none exist)
INSERT INTO public.markers (title, lat, lng, active, visible_from, zoom_min)
SELECT 'Test Marker Milan', 45.4642, 9.19, true, now() - interval '1 hour', 10
WHERE NOT EXISTS (SELECT 1 FROM public.markers WHERE title = 'Test Marker Milan');

-- Log completion
INSERT INTO public.admin_logs (event_type, note, context)
VALUES ('markers_security_fix', 'Fixed markers visibility and security issues', 'audit_2025');