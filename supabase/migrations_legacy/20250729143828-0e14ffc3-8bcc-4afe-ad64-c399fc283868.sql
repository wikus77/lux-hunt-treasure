-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- CORREZIONE SISTEMATICA 26 POLICIES RLS CRITICHE - FASE 1: TABLES CRITICHE

-- 1. CRITICA: payment_intents - Solo service role e owner possono gestire
DROP POLICY IF EXISTS "Service role can manage all payment intents" ON public.payment_intents;

CREATE POLICY "System can manage payment intents for service" ON public.payment_intents
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view own payment intents" ON public.payment_intents  
FOR SELECT USING (auth.uid() = user_id);

-- 2. CRITICA: payment_transactions - Restrizioni per owner e admin
DROP POLICY IF EXISTS "System can insert payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "System can update payment transactions" ON public.payment_transactions;

CREATE POLICY "Service can insert payment transactions" ON public.payment_transactions
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service can update payment transactions" ON public.payment_transactions
FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
FOR SELECT USING (auth.uid() = user_id);

-- 3. CRITICA: user_credits - Solo owner può accedere ai suoi crediti
DROP POLICY IF EXISTS "System can manage credits" ON public.user_credits;

CREATE POLICY "Users can view own credits" ON public.user_credits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits" ON public.user_credits
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all credits" ON public.user_credits
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- 4. CRITICA: subscription_tiers - Pubblico ma solo lettura
DROP POLICY IF EXISTS "subscription_tiers_select" ON public.subscription_tiers;

CREATE POLICY "Public can view subscription tiers" ON public.subscription_tiers
FOR SELECT USING (true); -- Rimane pubblico per pricing page

-- 5. ALTA: security_audit_log - Solo admin lettura, sistema scrittura
DROP POLICY IF EXISTS "System can insert security events" ON public.security_audit_log;

CREATE POLICY "Admins can view security logs" ON public.security_audit_log
FOR SELECT USING (public.is_admin_secure());

CREATE POLICY "System can insert security logs" ON public.security_audit_log
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');

-- 6. ALTA: security_events - Solo admin e sistema
DROP POLICY IF EXISTS "System can log security events" ON public.security_events;

CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT USING (public.is_admin_secure());

CREATE POLICY "System can log security events" ON public.security_events
FOR INSERT WITH CHECK (auth.role() = 'authenticated');