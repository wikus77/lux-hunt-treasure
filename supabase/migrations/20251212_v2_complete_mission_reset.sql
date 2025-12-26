-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- V2: Complete Mission Reset RPC Function
-- This function GUARANTEES deletion of all mission data

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.reset_all_users_mission();
DROP FUNCTION IF EXISTS public.complete_mission_reset();

-- Create a robust reset function
CREATE OR REPLACE FUNCTION public.complete_mission_reset()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    reset_timestamp TIMESTAMP WITH TIME ZONE := NOW();
    result jsonb := '{}'::jsonb;
    table_name TEXT;
    deleted_count INTEGER;
    tables_to_clear TEXT[] := ARRAY[
        'user_notifications',
        'user_clues',
        'buzz_map_actions',
        'user_map_areas',
        'search_areas',
        'final_shoot_attempts',
        'marker_claims',
        'map_click_events',
        'map_points',
        'mission_enrollments',
        'geo_radar_coordinates',
        'user_buzz_counter',
        'user_buzz_map_counter'
    ];
BEGIN
    -- Reset each table
    FOREACH table_name IN ARRAY tables_to_clear
    LOOP
        BEGIN
            -- Check if table exists
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = table_name
            ) THEN
                -- Execute dynamic DELETE
                EXECUTE format('DELETE FROM public.%I', table_name);
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                result := result || jsonb_build_object(table_name, deleted_count);
                RAISE NOTICE 'Cleared table %: % rows', table_name, deleted_count;
            ELSE
                result := result || jsonb_build_object(table_name, 'TABLE_NOT_FOUND');
            END IF;
        EXCEPTION WHEN OTHERS THEN
            result := result || jsonb_build_object(table_name, SQLERRM);
            RAISE NOTICE 'Error clearing %: %', table_name, SQLERRM;
        END;
    END LOOP;

    -- Reset user_mission_status
    BEGIN
        UPDATE public.user_mission_status SET
            clues_found = 0,
            mission_progress_percent = 0,
            mission_started_at = reset_timestamp,
            mission_days_remaining = 30,
            buzz_counter = 0,
            map_radius_km = NULL,
            map_area_generated = false,
            updated_at = reset_timestamp;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := result || jsonb_build_object('user_mission_status_reset', deleted_count);
    EXCEPTION WHEN OTHERS THEN
        result := result || jsonb_build_object('user_mission_status', SQLERRM);
    END;

    -- Reset profiles.clues_unlocked
    BEGIN
        UPDATE public.profiles SET 
            clues_unlocked = 0,
            updated_at = reset_timestamp;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        result := result || jsonb_build_object('profiles_clues_reset', deleted_count);
    EXCEPTION WHEN OTHERS THEN
        result := result || jsonb_build_object('profiles', SQLERRM);
    END;

    -- Add metadata
    result := result || jsonb_build_object(
        'success', true,
        'reset_timestamp', reset_timestamp,
        'version', 'v2'
    );

    RETURN result;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.complete_mission_reset() TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_mission_reset() TO authenticated;

-- Create alias for backward compatibility
CREATE OR REPLACE FUNCTION public.reset_all_users_mission()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.complete_mission_reset();
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_all_users_mission() TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_all_users_mission() TO authenticated;

-- Log this migration
INSERT INTO public.admin_logs (event_type, context, note, status_code)
VALUES ('DB_MIGRATION', 'complete_mission_reset', 'Created complete_mission_reset() RPC function v2', 200);




