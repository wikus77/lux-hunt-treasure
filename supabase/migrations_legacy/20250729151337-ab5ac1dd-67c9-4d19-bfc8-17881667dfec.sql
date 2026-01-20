-- © 2025 Joseph MULÉ – M1SSION™ – CORREZIONE FINALE ACCESS SVILUPPATORE
-- FORZA SESSIONE VALIDA + BYPASS COMPLETO

-- 1. Assicura tutti i parametri database per accesso immediato
UPDATE public.profiles
SET 
  role = 'admin',
  subscription_tier = 'admin',
  tier = 'admin',
  can_access_app = true,
  access_enabled = true,
  access_starts_at = now() - INTERVAL '1 day',
  status = 'admin_access_granted',
  subscription_plan = 'ADMIN'
WHERE email = 'wikus77@hotmail.it';

-- 2. Log correzione finale
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'wikus77@hotmail.it'),
  'final_admin_correction',
  jsonb_build_object(
    'email', 'wikus77@hotmail.it',
    'all_database_flags_forced', true,
    'subscription_plan_admin_set', true,
    'routing_bypass_implemented', true,
    'choose_plan_bypass_added', true
  ),
  'info'
);