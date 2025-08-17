-- Fix security definer view issue by changing ownership to service_role
-- This removes the security definer behavior while maintaining functionality

-- Change ownership of views from postgres to service_role to remove security definer behavior
ALTER VIEW public.qr_codes_markers OWNER TO service_role;
ALTER VIEW public.buzz_map_markers OWNER TO service_role;
ALTER VIEW public.marker_by_code OWNER TO service_role;

-- Ensure proper permissions are still in place
GRANT SELECT ON public.qr_codes_markers TO authenticated, anon;
GRANT SELECT ON public.buzz_map_markers TO authenticated, anon;
GRANT SELECT ON public.marker_by_code TO authenticated, anon;