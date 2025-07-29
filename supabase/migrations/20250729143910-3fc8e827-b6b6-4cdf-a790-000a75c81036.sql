-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- CORREZIONE SISTEMATICA 26 POLICIES RLS CRITICHE - FASE 2: TABLES MEDIE E BASSE

-- MEDIA: user_clues - Solo owner può gestire i propri clues
DROP POLICY IF EXISTS "Service role can insert clues for any user" ON public.user_clues;
DROP POLICY IF EXISTS "Service role can select any clues" ON public.user_clues;

CREATE POLICY "Users can view own clues" ON public.user_clues
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert clues for users" ON public.user_clues
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all clues" ON public.user_clues
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- MEDIA: user_logs - Solo owner può vedere i propri logs
DROP POLICY IF EXISTS "System can insert logs" ON public.user_logs;

CREATE POLICY "Users can view own logs" ON public.user_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user logs" ON public.user_logs
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view all logs" ON public.user_logs
FOR SELECT USING (public.is_admin_secure());

-- MEDIA: user_notifications - Solo owner può gestire le proprie notifiche
DROP POLICY IF EXISTS "System can manage notifications" ON public.user_notifications;

CREATE POLICY "Users can view own notifications" ON public.user_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.user_notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.user_notifications
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all notifications" ON public.user_notifications
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());

-- BASSA: api_rate_limits - Solo sistema e admin
-- (Mantiene policies esistenti ma definitive)

-- BASSA: backup_logs - Solo sistema e admin
-- (Mantiene policies esistenti ma definitive)

-- BASSA: blocked_ips - Solo sistema e admin  
-- (Mantiene policies esistenti ma definitive)

-- BASSA: buzz_map_actions - Solo owner può vedere le proprie azioni
DROP POLICY IF EXISTS "Only authenticated users can access buzz_map_actions" ON public.buzz_map_actions;

CREATE POLICY "Users can view own buzz map actions" ON public.buzz_map_actions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own buzz map actions" ON public.buzz_map_actions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all buzz map actions" ON public.buzz_map_actions
FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());