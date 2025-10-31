-- Fix Agent Code Protection and Create System Roles for MCP
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1) Drop the correct trigger name
DROP TRIGGER IF EXISTS block_agent_code_edit ON public.profiles;

-- 2) Update agent_code for Joseph Mulé
UPDATE public.profiles
SET agent_code = 'AG-X0197',
    updated_at = NOW()
WHERE LOWER(email) = 'wikus77@hotmail.it';

-- 3) Recreate trigger with admin bypass
CREATE OR REPLACE FUNCTION public.prevent_agent_code_modification()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Allow admin users to modify agent_code
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF is_admin THEN
    RETURN NEW;
  END IF;
  
  -- Block modification for non-admin users
  IF TG_OP = 'UPDATE' AND OLD.agent_code IS DISTINCT FROM NEW.agent_code THEN
    RAISE EXCEPTION 'Modifica di agent_code non consentita per utenti non-admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Recreate trigger with correct name
CREATE TRIGGER block_agent_code_edit
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_agent_code_modification();

-- 4) Create system_roles table to permanently store MCP designation
CREATE TABLE IF NOT EXISTS public.system_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read system roles
DROP POLICY IF EXISTS "system_roles_read_all" ON public.system_roles;
CREATE POLICY "system_roles_read_all" ON public.system_roles
FOR SELECT USING (true);

-- Insert MCP role for Joseph Mulé
INSERT INTO public.system_roles (user_id, code, label)
VALUES (
  (SELECT id FROM auth.users WHERE LOWER(email) = 'wikus77@hotmail.it'),
  'SRC-∞',
  'MASTER CONTROL PROGRAM'
)
ON CONFLICT (code) DO UPDATE 
SET label = 'MASTER CONTROL PROGRAM',
    updated_at = NOW();

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™