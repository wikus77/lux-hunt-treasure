-- Create markers table with proper structure for map display
CREATE TABLE IF NOT EXISTS public.markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on markers table
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select active markers
DROP POLICY IF EXISTS "markers_select_auth" ON public.markers;
CREATE POLICY "markers_select_auth"
  ON public.markers FOR SELECT
  TO authenticated
  USING (active = true);

-- Insert demo markers for testing
INSERT INTO public.markers (id, title, lat, lng, active) VALUES
  ('bb282fa1-1550-4887-9330-f2fa7ad28111', 'Marker Test 1', 45.463, 9.19, true),
  ('bb282fa1-1550-4887-9330-f2fa7ad28112', 'Marker Test 2', 45.465, 9.195, true),
  ('bb282fa1-1550-4887-9330-f2fa7ad28113', 'Marker Test 3', 45.467, 9.189, true)
ON CONFLICT (id) DO NOTHING;