-- Enhanced reset_user_mission_full function for complete mission reset
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

CREATE OR REPLACE FUNCTION public.reset_user_mission_full(user_id_input UUID)
RETURNS jsonb AS $$
DECLARE
  reset_date TIMESTAMP WITH TIME ZONE := NOW();
  result jsonb;
BEGIN
  -- 1. Reset base mission (counters, radius, etc.) with new start date
  INSERT INTO public.user_mission_status (
    user_id,
    clues_found,
    mission_progress_percent,
    mission_started_at,
    mission_days_remaining,
    buzz_counter,
    map_radius_km,
    map_area_generated,
    updated_at
  ) VALUES (
    user_id_input,
    0,
    0,
    reset_date,
    30,
    0,
    NULL,
    FALSE,
    reset_date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    clues_found = 0,
    mission_progress_percent = 0,
    mission_started_at = reset_date,
    mission_days_remaining = 30,
    buzz_counter = 0,
    map_radius_km = NULL,
    map_area_generated = FALSE,
    updated_at = reset_date;
  
  -- 2. Delete all user clues found
  DELETE FROM public.user_clues WHERE user_id = user_id_input;
  
  -- 3. Delete all user map areas generated
  DELETE FROM public.user_map_areas WHERE user_id = user_id_input;
  
  -- 4. Delete all BUZZ counters (daily and map)
  DELETE FROM public.user_buzz_counter WHERE user_id = user_id_input;
  DELETE FROM public.user_buzz_map_counter WHERE user_id = user_id_input;
  
  -- 5. Delete all notifications
  DELETE FROM public.user_notifications WHERE user_id = user_id_input;
  
  -- 6. Delete all final shot attempts
  DELETE FROM public.final_shots WHERE user_id = user_id_input;
  DELETE FROM public.daily_final_shot_limits WHERE user_id = user_id_input;
  
  -- 7. Delete all geo radar coordinates
  DELETE FROM public.geo_radar_coordinates WHERE user_id = user_id_input;
  
  -- 8. Delete all map click events
  DELETE FROM public.map_click_events WHERE user_id = user_id_input;
  
  -- 9. Delete all map points
  DELETE FROM public.map_points WHERE user_id = user_id_input;
  
  -- 10. Delete all intelligence tool usage
  DELETE FROM public.intelligence_tool_usage WHERE user_id = user_id_input;
  
  -- 11. Delete all buzz map actions
  DELETE FROM public.buzz_map_actions WHERE user_id = user_id_input;
  
  -- 12. Reset weekly buzz allowances (if exists)
  DELETE FROM public.weekly_buzz_allowances WHERE user_id = user_id_input;
  
  -- 13. Reset live activity state
  DELETE FROM public.live_activity_state WHERE user_id = user_id_input;
  
  -- Build success result
  result := jsonb_build_object(
    'success', true,
    'reset_date', reset_date,
    'mission_days_remaining', 30,
    'tables_reset', jsonb_build_array(
      'user_mission_status',
      'user_clues',
      'user_map_areas', 
      'user_buzz_counter',
      'user_buzz_map_counter',
      'user_notifications',
      'final_shots',
      'daily_final_shot_limits',
      'geo_radar_coordinates',
      'map_click_events',
      'map_points',
      'intelligence_tool_usage',
      'buzz_map_actions',
      'weekly_buzz_allowances',
      'live_activity_state'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;