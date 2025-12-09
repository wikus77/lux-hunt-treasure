-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Funzione per reset globale di TUTTI gli utenti quando si lancia una nuova missione
-- V2 - FIX: Cancella TUTTE le notifiche, non solo alcuni tipi

-- ============================================
-- FUNZIONE: reset_all_users_mission
-- Resetta i progressi di TUTTI gli utenti per una nuova missione
-- ============================================

DROP FUNCTION IF EXISTS public.reset_all_users_mission();

CREATE OR REPLACE FUNCTION public.reset_all_users_mission()
RETURNS jsonb AS $$
DECLARE
  reset_date TIMESTAMP WITH TIME ZONE := NOW();
  users_reset INTEGER := 0;
  tables_cleared TEXT[] := ARRAY[]::TEXT[];
  deleted_count INTEGER;
BEGIN
  -- 1. 🔥 CRITICAL: Delete ALL notifications (not just some types!)
  -- This is the main source of "clue count" that was causing data to reappear
  DELETE FROM public.user_notifications;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  tables_cleared := array_append(tables_cleared, 'user_notifications: ' || deleted_count);

  -- 2. Delete ALL user clues
  DELETE FROM public.user_clues;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  tables_cleared := array_append(tables_cleared, 'user_clues: ' || deleted_count);

  -- 3. 🔥 CRITICAL: Delete ALL buzz_map_actions (source of clue_count!)
  DELETE FROM public.buzz_map_actions;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  tables_cleared := array_append(tables_cleared, 'buzz_map_actions: ' || deleted_count);

  -- 4. Delete ALL user map areas
  DELETE FROM public.user_map_areas;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  tables_cleared := array_append(tables_cleared, 'user_map_areas: ' || deleted_count);

  -- 4b. 🔥 NEW: Delete ALL search_areas (questa tabella mancava!)
  DELETE FROM public.search_areas;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  tables_cleared := array_append(tables_cleared, 'search_areas: ' || deleted_count);

  -- 5. Delete ALL BUZZ counters
  DELETE FROM public.user_buzz_counter;
  DELETE FROM public.user_buzz_map_counter;
  tables_cleared := array_append(tables_cleared, 'user_buzz_counter');
  tables_cleared := array_append(tables_cleared, 'user_buzz_map_counter');

  -- 6. Delete ALL final shot attempts
  DELETE FROM public.final_shots;
  DELETE FROM public.daily_final_shot_limits;
  tables_cleared := array_append(tables_cleared, 'final_shots');
  tables_cleared := array_append(tables_cleared, 'daily_final_shot_limits');

  -- 7. Delete ALL geo radar coordinates
  DELETE FROM public.geo_radar_coordinates;
  tables_cleared := array_append(tables_cleared, 'geo_radar_coordinates');

  -- 8. Delete ALL map click events
  DELETE FROM public.map_click_events;
  tables_cleared := array_append(tables_cleared, 'map_click_events');

  -- 9. Delete ALL map points
  DELETE FROM public.map_points;
  tables_cleared := array_append(tables_cleared, 'map_points');

  -- 10. Reset mission enrollments
  DELETE FROM public.mission_enrollments;
  tables_cleared := array_append(tables_cleared, 'mission_enrollments');

  -- 11. 🔥 LAST: Reset user_mission_status per TUTTI gli utenti
  -- This must be AFTER deleting all other data sources!
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

-- ============================================
-- POLICY: Solo service_role può eseguire reset globale
-- ============================================
COMMENT ON FUNCTION public.reset_all_users_mission() IS 
'Resetta i progressi di TUTTI gli utenti per una nuova missione. 
Solo chiamabile da Edge Functions con service_role.
© 2025 Joseph MULÉ – M1SSION™';

