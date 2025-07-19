-- Create current_mission_data table for mission configuration
CREATE TABLE public.current_mission_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  street TEXT NOT NULL,
  street_number TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_color TEXT NOT NULL,
  prize_material TEXT NOT NULL,
  prize_category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.current_mission_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only admin with specific email hash can access
CREATE POLICY "Admin can manage mission data"
ON public.current_mission_data
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND encode(digest(email, 'sha256'), 'hex') = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND encode(digest(email, 'sha256'), 'hex') = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52'
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_current_mission_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_current_mission_data_updated_at
  BEFORE UPDATE ON public.current_mission_data
  FOR EACH ROW
  EXECUTE FUNCTION update_current_mission_data_updated_at();