-- Fix search_path for ensure_agent_dna function
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

DROP FUNCTION IF EXISTS public.ensure_agent_dna(uuid);

CREATE OR REPLACE FUNCTION public.ensure_agent_dna(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.agent_dna(user_id) 
  VALUES (p_user)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™