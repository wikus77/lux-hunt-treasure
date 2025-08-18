-- Fix the view creation with correct column names
DROP VIEW IF EXISTS public.buzz_map_markers;

-- Create secure view without SECURITY DEFINER using correct columns
CREATE VIEW public.buzz_map_markers AS
SELECT 
  id,
  location_name as title,
  latitude,
  longitude,
  active
FROM public.qr_buzz_codes 
WHERE active = true;

-- Enable RLS on the view's underlying table if not already enabled
ALTER TABLE public.qr_buzz_codes ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for qr_buzz_codes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'qr_buzz_codes' 
    AND policyname = 'Public can view active QR codes'
  ) THEN
    CREATE POLICY "Public can view active QR codes" 
    ON public.qr_buzz_codes 
    FOR SELECT 
    USING (active = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'qr_buzz_codes' 
    AND policyname = 'Admin can manage QR codes'
  ) THEN
    CREATE POLICY "Admin can manage QR codes" 
    ON public.qr_buzz_codes 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;