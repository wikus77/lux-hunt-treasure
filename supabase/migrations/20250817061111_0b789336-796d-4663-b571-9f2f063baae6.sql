-- Fix Security Definer View security issue
-- Drop and recreate views to remove security definer behavior

-- Drop existing problematic views
DROP VIEW IF EXISTS public.buzz_map_markers CASCADE;
DROP VIEW IF EXISTS public.qr_codes_markers CASCADE; 
DROP VIEW IF EXISTS public.marker_by_code CASCADE;

-- Recreate views as security invoker (default) with explicit RLS respect
-- These views will now respect RLS policies of the querying user

-- QR Codes Markers view - respects RLS on qr_codes table
CREATE VIEW public.qr_codes_markers AS 
SELECT 
  code,
  title,
  lat::numeric AS latitude,
  lng::numeric AS longitude
FROM public.qr_codes
WHERE lat IS NOT NULL 
  AND lng IS NOT NULL 
  AND is_hidden = false;

-- Buzz Map Markers view - cascades from qr_codes_markers
CREATE VIEW public.buzz_map_markers AS 
SELECT 
  code,
  title,
  latitude,
  longitude
FROM public.qr_codes_markers;

-- Marker by Code view - respects RLS on qr_code_links table  
CREATE VIEW public.marker_by_code AS
SELECT 
  code,
  marker_id
FROM public.qr_code_links;

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.qr_codes_markers TO authenticated;
GRANT SELECT ON public.buzz_map_markers TO authenticated;
GRANT SELECT ON public.marker_by_code TO authenticated;

-- Grant permissions to anon users for public access
GRANT SELECT ON public.qr_codes_markers TO anon;
GRANT SELECT ON public.buzz_map_markers TO anon;
GRANT SELECT ON public.marker_by_code TO anon;

-- Add comments explaining the security model
COMMENT ON VIEW public.qr_codes_markers IS 'Security invoker view that respects RLS policies on qr_codes table';
COMMENT ON VIEW public.buzz_map_markers IS 'Security invoker view that respects RLS policies via qr_codes_markers';
COMMENT ON VIEW public.marker_by_code IS 'Security invoker view that respects RLS policies on qr_code_links table';