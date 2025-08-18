-- © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
-- Create markers table with simpler policy syntax

-- Drop policy first if exists
DROP POLICY IF EXISTS "markers_select_auth" ON public.markers;

-- Create policy with standard syntax 
CREATE POLICY "markers_select_auth" 
  ON public.markers FOR SELECT
  TO authenticated
  USING (active = true);

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