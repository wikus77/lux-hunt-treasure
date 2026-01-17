-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRAZIONE: KPI Snapshot Extension - Streak, Wheel, Minigames
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- OBIETTIVO: Estendere admin_kpi_snapshot con metriche per:
-- - Daily Streak check-ins
-- - Fortune Wheel spins
-- - Minigames runs/completions
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop existing view to recreate with new columns
DROP VIEW IF EXISTS public.admin_kpi_snapshot;

-- Recreate view with extended metrics
CREATE OR REPLACE VIEW public.admin_kpi_snapshot AS
SELECT
  -- USERS
  (SELECT count(DISTINCT user_id)
   FROM public.analytics_events
   WHERE server_ts > now() - interval '24 hours') AS active_users_24h,
   
  (SELECT count(DISTINCT user_id)
   FROM public.analytics_events
   WHERE server_ts > now() - interval '7 days') AS active_users_7d,
   
  (SELECT count(DISTINCT anon_id)
   FROM public.analytics_events
   WHERE user_id IS NULL
   AND server_ts > now() - interval '24 hours') AS anon_users_24h,
   
  -- EVENTS TOTALS
  (SELECT count(*) FROM public.analytics_events) AS total_events,
  
  (SELECT count(*)
   FROM public.analytics_events
   WHERE server_ts > now() - interval '24 hours') AS events_24h,
   
  -- FINAL SHOT
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'final_shot_attempted') AS final_shot_attempts,
   
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'final_shot_won') AS final_shot_wins,
   
  (SELECT winner_user_id
   FROM public.final_shoot_winners
   ORDER BY won_at DESC
   LIMIT 1) AS last_final_winner_id,
   
  (SELECT won_at
   FROM public.final_shoot_winners
   ORDER BY won_at DESC
   LIMIT 1) AS last_final_win_at,
   
  -- PRIZES
  (SELECT count(*)
   FROM public.prize_awards
   WHERE award_type = 'secondary') AS secondary_prizes_awarded,
   
  (SELECT count(*)
   FROM public.prize_awards
   WHERE award_type = 'final') AS final_prizes_awarded,
   
  (SELECT count(*) FROM public.secondary_prize_claims) AS secondary_claims_total,
  
  (SELECT count(*) FROM public.final_prize_claims) AS final_claims_total,
  
  (SELECT count(*)
   FROM public.prize_awards
   WHERE award_type = 'marker') AS marker_rewards_claimed,
   
  -- AUTH
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'login_success'
   AND server_ts > now() - interval '24 hours') AS logins_24h,
   
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'signup_completed'
   AND server_ts > now() - interval '24 hours') AS signups_24h,
   
  -- LANDING / SPECTATOR
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'screen_viewed'
   AND props->>'route' IN ('/landing', '/')
   AND server_ts > now() - interval '24 hours') AS landing_views_24h,
   
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'screen_viewed'
   AND props->>'route' = '/spectator'
   AND server_ts > now() - interval '24 hours') AS spectator_views_24h,

  -- ═══════════════════════════════════════════════════════════════
  -- 🆕 STREAK METRICS - Added 17/01/2026
  -- ═══════════════════════════════════════════════════════════════
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name IN ('daily_streak_started', 'daily_streak_incremented')
   AND server_ts > now() - interval '24 hours') AS streak_checkins_24h,

  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'daily_streak_broken'
   AND server_ts > now() - interval '24 hours') AS streak_breaks_24h,

  (SELECT count(DISTINCT user_id)
   FROM public.analytics_events
   WHERE event_name IN ('daily_streak_started', 'daily_streak_incremented')
   AND server_ts > now() - interval '7 days') AS streak_active_users_7d,

  -- ═══════════════════════════════════════════════════════════════
  -- 🆕 FORTUNE WHEEL METRICS - Added 17/01/2026
  -- ═══════════════════════════════════════════════════════════════
  (SELECT count(*)
   FROM public.wheel_spins
   WHERE created_at > now() - interval '24 hours') AS wheel_spins_24h,

  (SELECT count(*)
   FROM public.wheel_spins
   WHERE reward_type IN ('m1u', 'pe', 'clue')
   AND reward_value > 0
   AND created_at > now() - interval '24 hours') AS wheel_rewards_24h,

  (SELECT count(*) FROM public.wheel_spins) AS wheel_spins_total,

  (SELECT SUM(reward_value)
   FROM public.wheel_spins
   WHERE reward_type = 'm1u') AS wheel_m1u_distributed,

  (SELECT SUM(reward_value)
   FROM public.wheel_spins
   WHERE reward_type = 'pe') AS wheel_pe_distributed,

  -- ═══════════════════════════════════════════════════════════════
  -- 🆕 MINIGAME METRICS - Added 17/01/2026
  -- ═══════════════════════════════════════════════════════════════
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'minigame_started'
   AND server_ts > now() - interval '24 hours') AS minigame_runs_24h,

  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'minigame_completed'
   AND server_ts > now() - interval '24 hours') AS minigame_completions_24h,

  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'minigame_abandoned'
   AND server_ts > now() - interval '24 hours') AS minigame_abandons_24h,

  (SELECT ROUND(
    (SELECT count(*)::numeric FROM public.analytics_events 
     WHERE event_name = 'minigame_completed' AND server_ts > now() - interval '7 days')
    /
    NULLIF((SELECT count(*)::numeric FROM public.analytics_events 
            WHERE event_name = 'minigame_started' AND server_ts > now() - interval '7 days'), 0)
    * 100, 2
  )) AS minigame_completion_rate_7d,

  -- METADATA
  (SELECT max(server_ts) FROM public.analytics_events) AS last_event_ts,
  
  now() AS snapshot_ts;

COMMENT ON VIEW public.admin_kpi_snapshot IS 
'M1SSION™ Admin KPI Snapshot v2 - Extended with Streak, Wheel, Minigames metrics (17/01/2026)';

-- Grant: SOLO admin e service_role possono vedere la view
REVOKE ALL ON public.admin_kpi_snapshot FROM PUBLIC;
REVOKE ALL ON public.admin_kpi_snapshot FROM anon;
REVOKE ALL ON public.admin_kpi_snapshot FROM authenticated;
GRANT SELECT ON public.admin_kpi_snapshot TO service_role;

-- Update the RPC function with new columns
DROP FUNCTION IF EXISTS public.get_admin_kpi_snapshot();

CREATE OR REPLACE FUNCTION public.get_admin_kpi_snapshot()
RETURNS TABLE (
  active_users_24h BIGINT,
  active_users_7d BIGINT,
  anon_users_24h BIGINT,
  total_events BIGINT,
  events_24h BIGINT,
  final_shot_attempts BIGINT,
  final_shot_wins BIGINT,
  last_final_winner_id UUID,
  last_final_win_at TIMESTAMPTZ,
  secondary_prizes_awarded BIGINT,
  final_prizes_awarded BIGINT,
  secondary_claims_total BIGINT,
  final_claims_total BIGINT,
  marker_rewards_claimed BIGINT,
  logins_24h BIGINT,
  signups_24h BIGINT,
  landing_views_24h BIGINT,
  spectator_views_24h BIGINT,
  -- 🆕 Streak metrics
  streak_checkins_24h BIGINT,
  streak_breaks_24h BIGINT,
  streak_active_users_7d BIGINT,
  -- 🆕 Wheel metrics
  wheel_spins_24h BIGINT,
  wheel_rewards_24h BIGINT,
  wheel_spins_total BIGINT,
  wheel_m1u_distributed BIGINT,
  wheel_pe_distributed BIGINT,
  -- 🆕 Minigame metrics
  minigame_runs_24h BIGINT,
  minigame_completions_24h BIGINT,
  minigame_abandons_24h BIGINT,
  minigame_completion_rate_7d NUMERIC,
  -- Metadata
  last_event_ts TIMESTAMPTZ,
  snapshot_ts TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verifica che l'utente sia admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.'
      USING HINT = 'Only admin users can access KPI snapshot.';
  END IF;
  
  RETURN QUERY SELECT * FROM public.admin_kpi_snapshot;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_kpi_snapshot() TO authenticated;

COMMENT ON FUNCTION public.get_admin_kpi_snapshot() IS 
'M1SSION™ Admin KPI Snapshot v2 (RPC) - Extended with Streak, Wheel, Minigames metrics';

