-- ✅ Create QR Rewards table for new M1SSION™ QR System
CREATE TABLE IF NOT EXISTS public.qr_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('buzz_gratis', 'indizio_segreto', 'enigma_misterioso', 'sorpresa_speciale')),
  message TEXT NOT NULL DEFAULT 'REWARD CLASSIFICATO',
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  scansioni INTEGER NOT NULL DEFAULT 0,
  attivo BOOLEAN NOT NULL DEFAULT true,
  creato_da UUID REFERENCES auth.users(id),
  redeemed_by UUID[] DEFAULT '{}',
  location_name TEXT NOT NULL,
  max_distance_meters INTEGER NOT NULL DEFAULT 50,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ✅ Enable RLS on qr_rewards
ALTER TABLE public.qr_rewards ENABLE ROW LEVEL SECURITY;

-- ✅ Create policies for qr_rewards
CREATE POLICY "Admins can manage all QR rewards" 
ON public.qr_rewards 
FOR ALL 
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

CREATE POLICY "Authenticated users can view active QR rewards" 
ON public.qr_rewards 
FOR SELECT 
USING (attivo = true AND auth.role() = 'authenticated');

-- ✅ Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_qr_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Create trigger for updated_at
CREATE TRIGGER update_qr_rewards_updated_at
  BEFORE UPDATE ON public.qr_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_qr_rewards_updated_at();

-- ✅ Create index for performance
CREATE INDEX idx_qr_rewards_location ON public.qr_rewards(lat, lon);
CREATE INDEX idx_qr_rewards_active ON public.qr_rewards(attivo) WHERE attivo = true;