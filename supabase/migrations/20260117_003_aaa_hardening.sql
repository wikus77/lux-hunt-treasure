-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- AAA+ HARDENING: Event Versioning + Immutability Guard + Admin KPI View
-- 
-- MODIFICHE ADDITIVE ONLY - Nessuna alterazione del core loop

-- ============================================================================
-- FASE 1: EVENT VERSIONING
-- ============================================================================

-- Aggiunge colonna event_version per evoluzione futura dei payload
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS event_version INT NOT NULL DEFAULT 1;

-- Indice per filtrare per versione (utile per analisi storiche)
CREATE INDEX IF NOT EXISTS idx_ae_version 
ON public.analytics_events(event_version);

COMMENT ON COLUMN public.analytics_events.event_version IS 
'Schema version del payload evento. Do NOT bump without migration plan. Default: 1';

-- ============================================================================
-- FASE 2: IMMUTABILITY GUARD (LEGAL-GRADE)
-- ============================================================================
-- Rende impossibile UPDATE/DELETE anche da errore umano o admin distratto

-- Funzione trigger universale per bloccare UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.forbid_update_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE TABLE — % operation not allowed on %', TG_OP, TG_TABLE_NAME
    USING HINT = 'This table is append-only for audit compliance. Contact engineering.';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.forbid_update_delete() IS 
'M1SSION™ Immutability Guard - Blocca UPDATE/DELETE per audit compliance';

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger per analytics_events
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS immutable_analytics_events ON public.analytics_events;
CREATE TRIGGER immutable_analytics_events
BEFORE UPDATE OR DELETE ON public.analytics_events
FOR EACH ROW EXECUTE FUNCTION public.forbid_update_delete();

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger per prize_awards
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS immutable_prize_awards ON public.prize_awards;
CREATE TRIGGER immutable_prize_awards
BEFORE UPDATE OR DELETE ON public.prize_awards
FOR EACH ROW EXECUTE FUNCTION public.forbid_update_delete();

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger per final_prize_claims
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS immutable_final_prize_claims ON public.final_prize_claims;
CREATE TRIGGER immutable_final_prize_claims
BEFORE UPDATE OR DELETE ON public.final_prize_claims
FOR EACH ROW EXECUTE FUNCTION public.forbid_update_delete();

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger per secondary_prize_claims
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS immutable_secondary_prize_claims ON public.secondary_prize_claims;
CREATE TRIGGER immutable_secondary_prize_claims
BEFORE UPDATE OR DELETE ON public.secondary_prize_claims
FOR EACH ROW EXECUTE FUNCTION public.forbid_update_delete();

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger per final_shoot_winners
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS immutable_final_shoot_winners ON public.final_shoot_winners;
CREATE TRIGGER immutable_final_shoot_winners
BEFORE UPDATE OR DELETE ON public.final_shoot_winners
FOR EACH ROW EXECUTE FUNCTION public.forbid_update_delete();

-- ============================================================================
-- FASE 3: ADMIN KPI SNAPSHOT VIEW
-- ============================================================================
-- View SQL per KPI snapshot - SOLO admin/service_role

DROP VIEW IF EXISTS public.admin_kpi_snapshot;

CREATE OR REPLACE VIEW public.admin_kpi_snapshot AS
SELECT
  -- UTENTI ATTIVI
  (SELECT count(DISTINCT user_id)
   FROM public.analytics_events
   WHERE server_ts > now() - interval '24 hours'
   AND user_id IS NOT NULL) AS active_users_24h,
   
  (SELECT count(DISTINCT user_id)
   FROM public.analytics_events
   WHERE server_ts > now() - interval '7 days'
   AND user_id IS NOT NULL) AS active_users_7d,
   
  (SELECT count(DISTINCT anon_id)
   FROM public.analytics_events
   WHERE server_ts > now() - interval '24 hours'
   AND anon_id IS NOT NULL
   AND user_id IS NULL) AS anon_users_24h,
   
  -- EVENTI TOTALI
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
   
  -- PREMI
  (SELECT count(*)
   FROM public.prize_awards
   WHERE award_type = 'secondary') AS secondary_prizes_awarded,
   
  (SELECT count(*)
   FROM public.prize_awards
   WHERE award_type = 'final') AS final_prizes_awarded,
   
  (SELECT count(*)
   FROM public.secondary_prize_claims) AS secondary_claims_total,
   
  (SELECT count(*)
   FROM public.final_prize_claims) AS final_claims_total,
   
  -- MARKER REWARDS
  (SELECT count(*)
   FROM public.analytics_events
   WHERE event_name = 'secondary_reward_won') AS marker_rewards_claimed,
   
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
   
  -- METADATA
  (SELECT max(server_ts) FROM public.analytics_events) AS last_event_ts,
  
  now() AS snapshot_ts;

COMMENT ON VIEW public.admin_kpi_snapshot IS 
'M1SSION™ Admin KPI Snapshot - Query per demo, audit, export. SOLO admin/service_role.';

-- Grant: SOLO admin e service_role possono vedere la view
REVOKE ALL ON public.admin_kpi_snapshot FROM PUBLIC;
REVOKE ALL ON public.admin_kpi_snapshot FROM anon;
REVOKE ALL ON public.admin_kpi_snapshot FROM authenticated;
GRANT SELECT ON public.admin_kpi_snapshot TO service_role;

-- RLS non si applica alle VIEW, quindi usiamo una funzione wrapper per admin check
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
'M1SSION™ Admin KPI Snapshot (RPC) - Wrapper con check admin role.';

-- ============================================================================
-- COMMENTI FINALI
-- ============================================================================

COMMENT ON TRIGGER immutable_analytics_events ON public.analytics_events IS 
'Immutability Guard - Blocca UPDATE/DELETE per audit compliance';

COMMENT ON TRIGGER immutable_prize_awards ON public.prize_awards IS 
'Immutability Guard - Blocca UPDATE/DELETE per audit compliance';

COMMENT ON TRIGGER immutable_final_prize_claims ON public.final_prize_claims IS 
'Immutability Guard - Blocca UPDATE/DELETE per audit compliance';

COMMENT ON TRIGGER immutable_secondary_prize_claims ON public.secondary_prize_claims IS 
'Immutability Guard - Blocca UPDATE/DELETE per audit compliance';

COMMENT ON TRIGGER immutable_final_shoot_winners ON public.final_shoot_winners IS 
'Immutability Guard - Blocca UPDATE/DELETE per audit compliance';

