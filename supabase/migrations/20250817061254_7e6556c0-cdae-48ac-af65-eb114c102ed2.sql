-- Remove security definer views that cause security issues
-- These views are no longer needed as the frontend now queries tables directly

-- Drop the problematic security definer views
DROP VIEW IF EXISTS public.buzz_map_markers CASCADE;
DROP VIEW IF EXISTS public.qr_codes_markers CASCADE; 
DROP VIEW IF EXISTS public.marker_by_code CASCADE;

-- Add comment explaining the security fix
COMMENT ON TABLE public.qr_codes IS 'QR codes table - frontend queries directly to avoid security definer view issues';
COMMENT ON TABLE public.qr_code_links IS 'QR code links table - frontend queries directly to avoid security definer view issues';