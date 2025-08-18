-- © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
-- Create markers table with active filter and populate from existing test data

-- Create the markers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  visible_from TIMESTAMPTZ DEFAULT NULL,
  visible_to TIMESTAMPTZ DEFAULT NULL,
  zoom_min INTEGER DEFAULT NULL,
  zoom_max INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can see active markers
CREATE POLICY IF NOT EXISTS "markers_select_auth" 
  ON public.markers FOR SELECT
  TO authenticated
  USING (active = true);

-- Insert test markers if none exist
INSERT INTO public.markers (id, title, lat, lng, active, visible_from, updated_at) 
VALUES 
  ('bb282fa1-1550-4887-9330-f2fa7ad28111', 'Marker Test 1', 45.463, 9.19, true, '2025-08-18 02:13:16.084724+00', now()),
  ('bb282fa1-1550-4887-9330-f2fa7ad28112', 'Marker Test 2', 45.465, 9.195, true, '2025-08-18 02:13:16.084724+00', now()),
  ('bb282fa1-1550-4887-9330-f2fa7ad28113', 'Marker Test 3', 45.467, 9.189, true, '2025-08-18 02:13:16.084724+00', now()),
  ('a3796c47-8ff4-46cc-af65-d077dcf79728', 'Test Marker Milan', 45.4642, 9.19, true, '2025-08-18 02:13:16.084724+00', now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  active = EXCLUDED.active,
  visible_from = EXCLUDED.visible_from,
  updated_at = now();

-- Create buzz_map_markers view for compatibility
CREATE OR REPLACE VIEW public.buzz_map_markers AS
SELECT 
  id,
  title,
  lat as latitude,
  lng as longitude,
  active,
  created_at,
  updated_at
FROM public.markers 
WHERE active = true;

-- Grant access to the view
GRANT SELECT ON public.buzz_map_markers TO authenticated, anon;