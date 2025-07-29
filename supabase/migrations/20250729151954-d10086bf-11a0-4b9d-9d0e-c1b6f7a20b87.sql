-- © 2025 Joseph MULÉ – M1SSION™ – EMERGENCY ADMIN UNLOCK
-- FORZA SESSIONE VALIDA + BYPASS CRITICO RAZZA CONDITION

-- 1. Reset completo sessioni per eliminare cache corrupta
DELETE FROM auth.sessions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it');

-- 2. FORZA OGNI SINGOLO PARAMETRO NECESSARIO 
UPDATE public.profiles
SET 
  role = 'admin',
  subscription_tier = 'admin',
  tier = 'admin', 
  subscription_plan = 'ADMIN',
  can_access_app = true,
  access_enabled = true,
  access_starts_at = now() - INTERVAL '7 days',
  status = 'admin_access_granted',
  updated_at = now()
WHERE email = 'wikus77@hotmail.it';

-- 3. Log emergenza critica
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it'),
  'emergency_critical_admin_unlock',
  jsonb_build_object(
    'emergency_unlock', true,
    'all_parameters_forced', true,
    'race_condition_fix', true,
    'instant_bypass_enabled', true
  ),
  'critical'
);