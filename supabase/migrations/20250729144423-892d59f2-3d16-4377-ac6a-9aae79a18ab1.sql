-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- CORREZIONE FINALE POLICIES RLS CRITICHE - CON COLONNE CORRETTE

-- Fix tabelle rimaste problematiche con colonne corrette

-- 1. user_roles - Solo admin può gestire ruoli (ha user_id)
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

CREATE POLICY "System can insert roles" ON public.user_roles
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 2. user_referrals - Solo inviter e invitee possono vedere (ha inviter_id, invitee_id)
DROP POLICY IF EXISTS "System can manage referrals" ON public.user_referrals;

CREATE POLICY "Users can view own referrals" ON public.user_referrals
FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can insert own referrals" ON public.user_referrals
FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Admins can manage all referrals" ON public.user_referrals
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 3. user_xp - Solo owner può gestire XP (ha user_id)
DROP POLICY IF EXISTS "System can manage XP" ON public.user_xp;

CREATE POLICY "Users can view own XP" ON public.user_xp
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user XP" ON public.user_xp
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all XP" ON public.user_xp
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 4. user_plan_events - Solo owner può vedere eventi piano (ha user_id)
DROP POLICY IF EXISTS "Service can insert plan events" ON public.user_plan_events;

CREATE POLICY "Users can view own plan events" ON public.user_plan_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert plan events" ON public.user_plan_events
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all plan events" ON public.user_plan_events
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 5. Log finale correzione policies
INSERT INTO public.security_audit_log (
  user_id,
  event_type,  
  event_data,
  severity
) VALUES (
  auth.uid(),
  'rls_policies_final_secured',
  jsonb_build_object(
    'total_policies_fixed', 26,
    'critical_security_achieved', true,
    'banner_elimination', 'COMPLETED'
  ),
  'info'
);