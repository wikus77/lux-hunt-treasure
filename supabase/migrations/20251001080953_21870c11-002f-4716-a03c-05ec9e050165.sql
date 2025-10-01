-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- READ-ONLY views for AI Intelligence context (conservative, no spoilers)

-- View 1: Agent Profile (basic info only)
CREATE OR REPLACE VIEW public.v_agent_profile AS
SELECT 
  id as user_id,
  COALESCE(agent_code, 'AG-UNKNOWN') as agent_code,
  COALESCE(full_name, 'Agent') as display_name,
  COALESCE(subscription_plan, 'base') as plan_type,
  updated_at
FROM public.profiles
WHERE id = auth.uid();

GRANT SELECT ON public.v_agent_profile TO authenticated;

COMMENT ON VIEW public.v_agent_profile IS 'Agent basic profile - READ ONLY';

-- View 2: Agent Status (progress, no spoilers)
CREATE OR REPLACE VIEW public.v_agent_status AS
SELECT 
  p.id as user_id,
  COALESCE(p.agent_code, 'AG-UNKNOWN') as agent_code,
  1 as current_week,
  0 as progress_ratio
FROM public.profiles p
WHERE p.id = auth.uid();

GRANT SELECT ON public.v_agent_status TO authenticated;

COMMENT ON VIEW public.v_agent_status IS 'Agent status - READ ONLY';