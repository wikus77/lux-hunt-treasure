-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

-- Create table for storing geo radar coordinates
CREATE TABLE public.geo_radar_coordinates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  label TEXT,
  radius DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geo_radar_coordinates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own geo radar coordinates" 
ON public.geo_radar_coordinates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own geo radar coordinates" 
ON public.geo_radar_coordinates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own geo radar coordinates" 
ON public.geo_radar_coordinates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own geo radar coordinates" 
ON public.geo_radar_coordinates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_geo_radar_coordinates_updated_at
BEFORE UPDATE ON public.geo_radar_coordinates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();