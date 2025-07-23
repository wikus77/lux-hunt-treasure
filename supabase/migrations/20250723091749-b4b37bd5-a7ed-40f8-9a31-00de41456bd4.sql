-- Add agent_code column to profiles and pre_registered_users tables
ALTER TABLE public.profiles 
ADD COLUMN agent_code TEXT UNIQUE;

ALTER TABLE public.pre_registered_users 
ADD COLUMN agent_code TEXT UNIQUE,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Create function to generate unique agent code
CREATE OR REPLACE FUNCTION public.generate_agent_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate AG-XXXX format with random alphanumeric
    new_code := 'AG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if code exists in either table
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE agent_code = new_code
      UNION
      SELECT 1 FROM public.pre_registered_users WHERE agent_code = new_code
    ) INTO code_exists;
    
    -- If unique, return the code
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger function to assign agent code on profile creation
CREATE OR REPLACE FUNCTION public.assign_agent_code_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.agent_code IS NULL THEN
    NEW.agent_code := public.generate_agent_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for both tables
CREATE TRIGGER trigger_assign_agent_code_profiles
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_agent_code_on_insert();

CREATE TRIGGER trigger_assign_agent_code_pre_registered
  BEFORE INSERT ON public.pre_registered_users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_agent_code_on_insert();

-- Update existing profiles without agent_code
UPDATE public.profiles 
SET agent_code = public.generate_agent_code()
WHERE agent_code IS NULL;

-- Update existing pre_registered_users without agent_code
UPDATE public.pre_registered_users 
SET agent_code = public.generate_agent_code()
WHERE agent_code IS NULL;