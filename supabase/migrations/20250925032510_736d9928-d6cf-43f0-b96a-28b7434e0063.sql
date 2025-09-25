-- Add missing columns to user_map_areas table for BUZZ MAP functionality
ALTER TABLE public.user_map_areas 
ADD COLUMN IF NOT EXISTS center_lat double precision,
ADD COLUMN IF NOT EXISTS center_lng double precision;

-- Add indexes for better performance on map queries  
CREATE INDEX IF NOT EXISTS idx_user_map_areas_center_coords ON public.user_map_areas (center_lat, center_lng);
CREATE INDEX IF NOT EXISTS idx_user_map_areas_user_id ON public.user_map_areas (user_id);