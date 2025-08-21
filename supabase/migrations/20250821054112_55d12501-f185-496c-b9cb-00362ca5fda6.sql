-- © 2025 M1SSION™ – Security Patch 1 – NIYVORA KFT – Joseph MULÉ
-- Fix contacts table RLS policy to prevent public data exposure

DROP POLICY IF EXISTS "anon_can_only_insert_contacts" ON contacts;
DROP POLICY IF EXISTS "auth_non_admin_can_only_insert_contacts" ON contacts;

-- Create secure admin-only policy for contacts
CREATE POLICY "admin_only_contacts" ON contacts 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow anonymous users to insert contact forms only
CREATE POLICY "anon_insert_only_contacts" ON contacts 
FOR INSERT 
TO anon
WITH CHECK (true);

-- © 2025 M1SSION™ – Security Patch 2 – NIYVORA KFT – Joseph MULÉ  
-- Fix search_path in security definer functions

ALTER FUNCTION public.update_push_notifications_log_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path TO 'public';
ALTER FUNCTION public.update_user_mission_status_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.has_mission_started() SET search_path TO 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_current_week_and_year() SET search_path TO 'public';
ALTER FUNCTION public.award_xp(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path TO 'public';
ALTER FUNCTION public.generate_qr_code() SET search_path TO 'public';
ALTER FUNCTION public.has_role(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.handle_plan_change() SET search_path TO 'public';
ALTER FUNCTION public.calculate_buzz_price(integer) SET search_path TO 'public';
ALTER FUNCTION public.get_current_mission_week() SET search_path TO 'public';
ALTER FUNCTION public.increment_buzz_counter(uuid) SET search_path TO 'public';
ALTER FUNCTION public.increment_map_generation_counter(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_map_radius_km(integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.generate_unique_agent_code() SET search_path TO 'public';
ALTER FUNCTION public.award_xp(uuid, integer, text) SET search_path TO 'public';
ALTER FUNCTION public.get_max_map_generations(integer) SET search_path TO 'public';
ALTER FUNCTION public.ensure_single_active_target() SET search_path TO 'public';
ALTER FUNCTION public.can_use_intelligence_tool(uuid, uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.update_monthly_missions_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.update_weekly_buzz_limits_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.can_user_access_mission(uuid) SET search_path TO 'public';
ALTER FUNCTION public.log_user_action(uuid, text, jsonb, inet, text) SET search_path TO 'public';
ALTER FUNCTION public.send_user_notification(uuid, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.calculate_distance_meters(double precision, double precision, double precision, double precision) SET search_path TO 'public';
ALTER FUNCTION public.calculate_direction(double precision, double precision, double precision, double precision) SET search_path TO 'public';
ALTER FUNCTION public.get_current_game_week() SET search_path TO 'public';
ALTER FUNCTION public.get_max_buzz_for_week(integer) SET search_path TO 'public';
ALTER FUNCTION public.is_ip_blocked(inet) SET search_path TO 'public';
ALTER FUNCTION public.get_week_start_date() SET search_path TO 'public';
ALTER FUNCTION public.can_user_buzz_mappa(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_rate_limit(inet, text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.setup_developer_user(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_daily_final_shot_limit(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.increment_daily_final_shot_counter(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.process_stripe_webhook_completed(text, text, text, integer) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.update_checkout_sessions_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.calculate_access_start_time(text) SET search_path TO 'public';
ALTER FUNCTION public.force_subscription_sync(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_weekly_buzz_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.calculate_access_start_date(text) SET search_path TO 'public';
ALTER FUNCTION public.ensure_referral_code() SET search_path TO 'public';
ALTER FUNCTION public.update_user_plan_complete(uuid, text, text, text, numeric, text) SET search_path TO 'public';
ALTER FUNCTION public.reset_user_mission_full(uuid) SET search_path TO 'public';
ALTER FUNCTION public.calculate_qr_distance(double precision, double precision, double precision, double precision) SET search_path TO 'public';
ALTER FUNCTION public.consume_credit(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_duplicate_subscriptions() SET search_path TO 'public';
ALTER FUNCTION public.log_failed_auth() SET search_path TO 'public';
ALTER FUNCTION public.update_user_plan_events_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.get_user_xp_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_qr_rewards_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_current_mission_data_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_scheduled_notifications_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.get_user_role_safe(uuid) SET search_path TO 'public';
ALTER FUNCTION public.log_role_changes() SET search_path TO 'public';
ALTER FUNCTION public.sync_subscription_tier() SET search_path TO 'public';
ALTER FUNCTION public.reset_user_mission(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_active_subscription(uuid) SET search_path TO 'public';
ALTER FUNCTION public.validate_buzz_user_id(uuid) SET search_path TO 'public';
ALTER FUNCTION public.can_user_use_buzz(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_my_agent_code() SET search_path TO 'public';
ALTER FUNCTION public.get_user_by_email(text) SET search_path TO 'public';
ALTER FUNCTION public.consume_buzz_usage(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_qr_discoveries_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_contact_access() SET search_path TO 'public';
ALTER FUNCTION public.assign_area_radius(uuid) SET search_path TO 'public';