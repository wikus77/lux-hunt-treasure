-- © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
-- Drop existing view and recreate with correct structure
DROP VIEW IF EXISTS public.buzz_map_markers;

CREATE VIEW public.buzz_map_markers AS
SELECT 
  id::text as id,
  COALESCE(title, 'QR Marker') as title,
  lat as latitude,
  lng as longitude,
  is_active as active
FROM public.qr_codes
WHERE is_active = true
UNION ALL
SELECT 
  code::text as id,
  COALESCE(location_name, 'QR Code') as title,
  lat as latitude,
  lng as longitude,
  NOT is_used as active
FROM public.qr_buzz_codes
WHERE NOT is_used AND expires_at > now();

-- Grant appropriate permissions
GRANT SELECT ON public.buzz_map_markers TO authenticated, anon;