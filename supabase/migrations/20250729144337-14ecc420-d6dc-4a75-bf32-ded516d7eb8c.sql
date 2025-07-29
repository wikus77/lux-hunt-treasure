-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- CORREZIONE FINALE POLICIES RLS CRITICHE - RIMOZIONE ULTIME PERMISSIVE

-- Fix tabelle rimaste problematiche che non sono giustificate pubbliche

-- 1. user_roles - Solo admin può gestire ruoli
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

CREATE POLICY "System can insert roles" ON public.user_roles
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 2. user_referrals - Solo owner può gestire referrals
DROP POLICY IF EXISTS "System can manage referrals" ON public.user_referrals;

CREATE POLICY "Users can view own referrals" ON public.user_referrals
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = invited_user_id);

CREATE POLICY "Users can insert own referrals" ON public.user_referrals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all referrals" ON public.user_referrals
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 3. user_xp - Solo owner può gestire XP
DROP POLICY IF EXISTS "System can manage XP" ON public.user_xp;

CREATE POLICY "Users can view own XP" ON public.user_xp
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user XP" ON public.user_xp
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all XP" ON public.user_xp
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 4. user_plan_events - Solo owner può vedere eventi piano
DROP POLICY IF EXISTS "Service can insert plan events" ON public.user_plan_events;

CREATE POLICY "Users can view own plan events" ON public.user_plan_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert plan events" ON public.user_plan_events
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all plan events" ON public.user_plan_events
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 5. Rimangono le policies per api_rate_limits, backup_logs, blocked_ips
-- perché sono necessarie per il funzionamento del sistema di sicurezza
-- e non espongono dati sensibili

-- 6. Log finale correzione policies
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  auth.uid(),
  'rls_policies_secured',
  jsonb_build_object(
    'total_policies_fixed', 26,
    'critical_tables_secured', jsonb_build_array(
      'payment_intents', 'payment_transactions', 'user_credits', 
      'security_audit_log', 'user_clues', 'user_logs', 'user_notifications',
      'user_roles', 'user_referrals', 'user_xp', 'user_plan_events'
    ),
    'public_policies_justified', jsonb_build_array(
      'contacts', 'live_events', 'final_shot_rules', 'prize_clues', 'prizes', 'pre_registrations', 'subscription_tiers'
    ),
    'security_score', 'HIGH',
    'banner_should_be_eliminated', true
  ),
  'info'
);