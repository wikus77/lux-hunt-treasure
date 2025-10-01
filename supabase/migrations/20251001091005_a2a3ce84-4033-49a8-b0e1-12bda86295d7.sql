-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Populate agent_profiles from existing profiles table

INSERT INTO public.agent_profiles (user_id, agent_code, nickname)
SELECT 
  p.id,
  p.agent_code,
  p.full_name
FROM public.profiles p
WHERE p.agent_code IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.agent_profiles ap WHERE ap.user_id = p.id
  )
ON CONFLICT (user_id) DO NOTHING;