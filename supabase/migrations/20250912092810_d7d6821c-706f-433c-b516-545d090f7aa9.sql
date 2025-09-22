-- Recreate the missing views correctly
CREATE OR REPLACE VIEW geo_push.v_positions AS
SELECT 
  user_id::uuid AS user_id,
  lat::float8 AS lat,
  lng::float8 AS lng,
  updated_at::timestamptz AS updated_at
FROM public.geo_radar_coordinates
WHERE updated_at IS NOT NULL
  AND lat IS NOT NULL 
  AND lng IS NOT NULL;