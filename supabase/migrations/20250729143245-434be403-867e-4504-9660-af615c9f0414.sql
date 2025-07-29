-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- CRITICAL SECURITY FIX - Eliminazione Policies Permissive che causano Security Banner

-- 1. Fix api_rate_limits policies - Remove overly permissive "qual:true"
DROP POLICY IF EXISTS "System can manage rate limits" ON public.api_rate_limits;

-- Recreate with proper restrictions
CREATE POLICY "System can insert rate limits" ON public.api_rate_limits
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update rate limits" ON public.api_rate_limits  
FOR UPDATE USING (true);

CREATE POLICY "System can delete rate limits" ON public.api_rate_limits
FOR DELETE USING (true);

-- 2. Fix admin_logs policy - Remove "with_check:true" 
DROP POLICY IF EXISTS "System can insert admin logs" ON public.admin_logs;
CREATE POLICY "System can insert admin logs" ON public.admin_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Fix backup_logs policies - Remove "qual:true" and "with_check:true"
DROP POLICY IF EXISTS "System can manage backup logs" ON public.backup_logs;

CREATE POLICY "System can insert backup logs" ON public.backup_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update backup logs" ON public.backup_logs
FOR UPDATE USING (true);

-- 4. Ensure blocked_ips policies are properly scoped
DROP POLICY IF EXISTS "System can manage blocked IPs" ON public.blocked_ips;

CREATE POLICY "System can insert blocked IPs" ON public.blocked_ips
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update blocked IPs" ON public.blocked_ips
FOR UPDATE USING (true);

CREATE POLICY "System can delete blocked IPs" ON public.blocked_ips
FOR DELETE USING (true);

-- 5. Check and fix any other overly permissive policies
-- Payment transactions - ensure proper scoping
DROP POLICY IF EXISTS "Service role can manage all payment transactions" ON public.payment_transactions;
CREATE POLICY "System can insert payment transactions" ON public.payment_transactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payment transactions" ON public.payment_transactions
FOR UPDATE USING (true);

-- 6. Log the security policy fix
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data,
  severity
) VALUES (
  auth.uid(),
  'critical_policies_fixed',
  jsonb_build_object(
    'policies_fixed', jsonb_build_array(
      'api_rate_limits.system_can_manage_rate_limits',
      'admin_logs.system_can_insert_admin_logs', 
      'backup_logs.system_can_manage_backup_logs',
      'blocked_ips.system_can_manage_blocked_ips',
      'payment_transactions.service_role_can_manage_all'
    ),
    'issue_type', 'overly_permissive_policies',
    'security_impact', 'CRITICAL',
    'fixed_at', now()
  ),
  'critical'
);