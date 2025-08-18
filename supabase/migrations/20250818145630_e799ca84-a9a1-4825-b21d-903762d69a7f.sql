-- © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
-- Create view buzz_map_markers if it doesn't exist
CREATE OR REPLACE VIEW public.buzz_map_markers AS
SELECT 
  id::text as id,
  title,
  latitude,
  longitude,
  active
FROM public.qr_codes
WHERE active = true
UNION ALL
SELECT 
  code::text as id,
  'QR Marker' as title,
  lat as latitude,
  lng as longitude,
  is_active as active
FROM public.qr_buzz_codes
WHERE is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON public.buzz_map_markers TO authenticated, anon;