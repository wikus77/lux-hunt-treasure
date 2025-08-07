-- Create QR Buzz Codes table for M1SSION™
CREATE TABLE public.qr_buzz_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  location_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('buzz', 'clue', 'enigma', 'fake')),
  reward_content JSONB DEFAULT '{}',
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  usage_attempts INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.qr_buzz_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for QR codes
CREATE POLICY "Admin can manage all QR codes" 
ON public.qr_buzz_codes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Public can view unused QR codes for redemption" 
ON public.qr_buzz_codes 
FOR SELECT 
USING (is_used = false AND (expires_at IS NULL OR expires_at > now()));

-- Create QR redemption logs table
CREATE TABLE public.qr_redemption_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_buzz_codes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  reward_granted JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for logs
ALTER TABLE public.qr_redemption_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for redemption logs
CREATE POLICY "Admin can view all redemption logs" 
ON public.qr_redemption_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own redemption logs" 
ON public.qr_redemption_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert redemption logs" 
ON public.qr_redemption_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to generate unique QR codes
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.qr_buzz_codes WHERE code = new_code) INTO code_exists;
    
    attempts := attempts + 1;
    
    -- If unique or too many attempts, return
    IF NOT code_exists OR attempts >= 50 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check distance between two points
CREATE OR REPLACE FUNCTION public.calculate_qr_distance(
  lat1 DOUBLE PRECISION, 
  lng1 DOUBLE PRECISION, 
  lat2 DOUBLE PRECISION, 
  lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  r DOUBLE PRECISION := 6371000; -- Earth radius in meters
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;