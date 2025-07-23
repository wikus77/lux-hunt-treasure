-- Check if agent_code columns exist and add missing ones
DO $$ 
BEGIN
  -- Add is_verified to pre_registered_users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_registered_users' 
    AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE public.pre_registered_users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add agent_code to pre_registered_users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_registered_users' 
    AND column_name = 'agent_code'
  ) THEN
    ALTER TABLE public.pre_registered_users ADD COLUMN agent_code TEXT UNIQUE;
  END IF;
END $$;

-- Create or replace function to generate unique agent code
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

-- Create or replace trigger function to assign agent code on profile creation
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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_assign_agent_code_profiles ON public.profiles;
DROP TRIGGER IF EXISTS trigger_assign_agent_code_pre_registered ON public.pre_registered_users;

-- Create triggers for both tables
CREATE TRIGGER trigger_assign_agent_code_profiles
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_agent_code_on_insert();

CREATE TRIGGER trigger_assign_agent_code_pre_registered
  BEFORE INSERT ON public.pre_registered_users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_agent_code_on_insert();

-- Update existing records without agent_code
UPDATE public.profiles 
SET agent_code = public.generate_agent_code()
WHERE agent_code IS NULL;

UPDATE public.pre_registered_users 
SET agent_code = public.generate_agent_code()
WHERE agent_code IS NULL;