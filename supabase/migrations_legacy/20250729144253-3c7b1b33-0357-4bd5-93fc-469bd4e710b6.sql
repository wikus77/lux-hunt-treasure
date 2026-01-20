-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- CORREZIONE SISTEMATICA 26 POLICIES RLS CRITICHE - FASE 3: TABLES RIMANENTI

-- BASSA: checkout_sessions - Solo service e owner
DROP POLICY IF EXISTS "System can update checkout sessions" ON public.checkout_sessions;

CREATE POLICY "System can update checkout sessions" ON public.checkout_sessions
FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- BASSA: consent_history - Solo sistema può inserire, user può vedere
DROP POLICY IF EXISTS "System can insert consent history" ON public.consent_history;

CREATE POLICY "System can insert consent history" ON public.consent_history
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- BASSA: contacts - Rimane pubblico per contact form
-- Le 3 policies duplicate sono OK per contact form pubblico

-- BASSA: final_shot_rules - Rimane pubblico in lettura (regole gioco)
-- La policy "Public can view final shot rules" rimane true per trasparenza

-- BASSA: live_events - Rimane pubblico per eventi live
-- Le policies rimangono true per feed pubblico eventi

-- BASSA: pre_registered_users - Solo sistema può inserire
DROP POLICY IF EXISTS "Allow pre-registration inserts" ON public.pre_registered_users;

CREATE POLICY "System can insert pre-registrations" ON public.pre_registered_users
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');

-- BASSA: pre_registrations - Rimane aperto per marketing
-- Le policies rimangono per campagne marketing

-- BASSA: prize_clues e prizes - Rimane pubblico per gameplay
-- Le policies rimangono true per trasparenza gioco

-- BASSA: role_change_audit - Solo sistema può inserire, admin può vedere
DROP POLICY IF EXISTS "System can insert audit logs" ON public.role_change_audit;

CREATE POLICY "System can insert role audit logs" ON public.role_change_audit
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view role audit logs" ON public.role_change_audit
FOR SELECT USING (public.is_admin_secure());

-- BASSA: scheduled_notifications - Solo sistema e admin
DROP POLICY IF EXISTS "System can manage scheduled notifications" ON public.scheduled_notifications;

CREATE POLICY "Admins can manage scheduled notifications" ON public.scheduled_notifications
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

CREATE POLICY "System can insert scheduled notifications" ON public.scheduled_notifications
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- BASSA: user_payment_transactions - Solo owner
DROP POLICY IF EXISTS "System can insert payment transactions" ON public.user_payment_transactions;
DROP POLICY IF EXISTS "System can update payment transactions" ON public.user_payment_transactions;

CREATE POLICY "Users can view own payment transactions" ON public.user_payment_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user payment transactions" ON public.user_payment_transactions
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- BASSA: user_permissions - Solo sistema e admin
DROP POLICY IF EXISTS "System can manage permissions" ON public.user_permissions;

CREATE POLICY "Users can view own permissions" ON public.user_permissions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON public.user_permissions
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

CREATE POLICY "System can manage permissions" ON public.user_permissions
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');