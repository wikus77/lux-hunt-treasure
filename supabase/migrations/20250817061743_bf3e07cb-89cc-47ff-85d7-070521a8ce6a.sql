-- Create QR code discoveries tracking table for secure gameplay
-- This ensures users can only see QR codes they've legitimately found

-- Create qr_code_discoveries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.qr_code_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  discovery_latitude DOUBLE PRECISION,
  discovery_longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate discoveries
  UNIQUE(qr_code_id, user_id)
);

-- Enable RLS on discoveries table
ALTER TABLE public.qr_code_discoveries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for qr_code_discoveries
CREATE POLICY "users_can_view_own_discoveries" 
ON public.qr_code_discoveries 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_discoveries" 
ON public.qr_code_discoveries 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_discoveries" 
ON public.qr_code_discoveries 
FOR SELECT 
TO authenticated
USING (is_admin_secure());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_discoveries_user_id ON public.qr_code_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_discoveries_qr_code_id ON public.qr_code_discoveries(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_discoveries_discovered_at ON public.qr_code_discoveries(discovered_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_qr_discoveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the table purpose
COMMENT ON TABLE public.qr_code_discoveries IS 'Tracks legitimate QR code discoveries by authenticated users for secure gameplay';