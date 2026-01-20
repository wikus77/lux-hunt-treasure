-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Create pre-registered users table for M1SSION™

CREATE TABLE IF NOT EXISTS public.pre_registered_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  agent_code TEXT NOT NULL UNIQUE,
  referral_code TEXT,
  subscription_plan TEXT DEFAULT 'base',
  early_access_granted BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pre_registered_users ENABLE ROW LEVEL SECURITY;

-- Create policies for pre-registered users
CREATE POLICY "Users can view their own pre-registration" 
ON public.pre_registered_users 
FOR SELECT 
USING (auth.uid()::text = id::text OR email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert their own pre-registration" 
ON public.pre_registered_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own pre-registration" 
ON public.pre_registered_users 
FOR UPDATE 
USING (auth.uid()::text = id::text OR email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage all pre-registrations" 
ON public.pre_registered_users 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Function to generate unique agent codes for pre-registration
CREATE OR REPLACE FUNCTION public.generate_pre_registration_agent_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate AG-XXXX2025 format
    new_code := 'AG-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '2025';
    
    -- Check if code exists
    SELECT EXISTS(
      SELECT 1 FROM public.pre_registered_users WHERE agent_code = new_code
      UNION
      SELECT 1 FROM public.profiles WHERE agent_code = new_code
    ) INTO code_exists;
    
    -- If unique, return the code
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Add trigger to auto-assign agent codes
CREATE OR REPLACE FUNCTION public.assign_pre_registration_agent_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.agent_code IS NULL THEN
    NEW.agent_code := public.generate_pre_registration_agent_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_pre_registration_agent_code_trigger
  BEFORE INSERT ON public.pre_registered_users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_pre_registration_agent_code();

-- Add updated_at trigger
CREATE TRIGGER update_pre_registered_users_updated_at
  BEFORE UPDATE ON public.pre_registered_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();