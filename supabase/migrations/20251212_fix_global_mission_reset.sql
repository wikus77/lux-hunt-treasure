-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Funzione ROBUSTA per reset globale di TUTTI gli utenti quando si lancia una nuova missione
-- V3 - FIX: Gestisce tabelle mancanti senza errori

-- ============================================
-- FUNZIONE: reset_all_users_mission
-- Resetta i progressi di TUTTI gli utenti per una nuova missione
-- V3: Più robusta, ignora tabelle mancanti
-- ============================================

DROP FUNCTION IF EXISTS public.reset_all_users_mission();

CREATE OR REPLACE FUNCTION public.reset_all_users_mission()
RETURNS jsonb AS $$
DECLARE
  reset_date TIMESTAMP WITH TIME ZONE := NOW();
  users_reset INTEGER := 0;
  tables_cleared TEXT[] := ARRAY[]::TEXT[];
  deleted_count INTEGER;
  table_exists BOOLEAN;
BEGIN
  -- Helper to safely delete from a table
  
  -- 1. user_notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_notifications') THEN
    DELETE FROM public.user_notifications;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'user_notifications: ' || deleted_count);
  END IF;

  -- 2. user_clues
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_clues') THEN
    DELETE FROM public.user_clues;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'user_clues: ' || deleted_count);
  END IF;

  -- 3. buzz_map_actions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buzz_map_actions') THEN
    DELETE FROM public.buzz_map_actions;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'buzz_map_actions: ' || deleted_count);
  END IF;

  -- 4. user_map_areas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_map_areas') THEN
    DELETE FROM public.user_map_areas;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'user_map_areas: ' || deleted_count);
  END IF;

  -- 5. search_areas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_areas') THEN
    DELETE FROM public.search_areas;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'search_areas: ' || deleted_count);
  END IF;

  -- 6. user_buzz_counter
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_buzz_counter') THEN
    DELETE FROM public.user_buzz_counter;
    tables_cleared := array_append(tables_cleared, 'user_buzz_counter');
  END IF;

  -- 7. user_buzz_map_counter
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_buzz_map_counter') THEN
    DELETE FROM public.user_buzz_map_counter;
    tables_cleared := array_append(tables_cleared, 'user_buzz_map_counter');
  END IF;

  -- 8. final_shoot_attempts (nome corretto della tabella!)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'final_shoot_attempts') THEN
    DELETE FROM public.final_shoot_attempts;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'final_shoot_attempts: ' || deleted_count);
  END IF;

  -- 9. final_shots (legacy, se esiste)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'final_shots') THEN
    DELETE FROM public.final_shots;
    tables_cleared := array_append(tables_cleared, 'final_shots');
  END IF;

  -- 10. daily_final_shot_limits (se esiste)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_final_shot_limits') THEN
    DELETE FROM public.daily_final_shot_limits;
    tables_cleared := array_append(tables_cleared, 'daily_final_shot_limits');
  END IF;

  -- 11. geo_radar_coordinates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geo_radar_coordinates') THEN
    DELETE FROM public.geo_radar_coordinates;
    tables_cleared := array_append(tables_cleared, 'geo_radar_coordinates');
  END IF;

  -- 12. map_click_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'map_click_events') THEN
    DELETE FROM public.map_click_events;
    tables_cleared := array_append(tables_cleared, 'map_click_events');
  END IF;

  -- 13. map_points
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'map_points') THEN
    DELETE FROM public.map_points;
    tables_cleared := array_append(tables_cleared, 'map_points');
  END IF;

  -- 14. mission_enrollments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mission_enrollments') THEN
    DELETE FROM public.mission_enrollments;
    tables_cleared := array_append(tables_cleared, 'mission_enrollments');
  END IF;

  -- 15. marker_claims (reset claim dei marker)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marker_claims') THEN
    DELETE FROM public.marker_claims;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'marker_claims: ' || deleted_count);
  END IF;

  -- 16. LAST: Reset user_mission_status per TUTTI gli utenti
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_mission_status') THEN
    UPDATE public.user_mission_status SET
      clues_found = 0,
      mission_progress_percent = 0,
      mission_started_at = reset_date,
      mission_days_remaining = 30,
      buzz_counter = 0,
      map_radius_km = NULL,
      map_area_generated = FALSE,
      updated_at = reset_date;
    
    GET DIAGNOSTICS users_reset = ROW_COUNT;
    tables_cleared := array_append(tables_cleared, 'user_mission_status: ' || users_reset || ' users');
  END IF;

  -- Return summary
  RETURN jsonb_build_object(
    'success', TRUE,
    'reset_date', reset_date,
    'users_reset', users_reset,
    'tables_cleared', tables_cleared,
    'mission_days_remaining', 30
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role only (Edge Functions)
REVOKE ALL ON FUNCTION public.reset_all_users_mission() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_all_users_mission() TO service_role;

COMMENT ON FUNCTION public.reset_all_users_mission() IS 
'Resetta i progressi di TUTTI gli utenti per una nuova missione. 
V3: Robusta, ignora tabelle mancanti.
Solo chiamabile da Edge Functions con service_role.
© 2025 Joseph MULÉ – M1SSION™';




