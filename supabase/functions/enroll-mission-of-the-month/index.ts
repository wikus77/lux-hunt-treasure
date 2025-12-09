// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: Enroll user in current active mission (Mission of the Month)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrollmentResponse {
  ok: boolean;
  mission_id?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 [ENROLL-MISSION] User:', user.id);

    // Find current active mission from current_mission_data (where admin creates missions)
    const { data: missionData, error: missionError } = await supabase
      .from('current_mission_data')
      .select('id, mission_name, mission_status, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (missionError) {
      console.error('❌ [ENROLL-MISSION] Mission query error:', missionError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to find active mission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!missionData) {
      console.warn('⚠️ [ENROLL-MISSION] No active mission in current_mission_data');
      return new Response(
        JSON.stringify({ ok: false, error: 'No active mission available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map to expected format
    const mission = {
      id: missionData.id,
      title: missionData.mission_name,
      status: missionData.mission_status,
    };
    console.log('📍 [ENROLL-MISSION] Found mission:', mission.title, mission.id);

    // 🔥 SYNC: Ensure mission exists in `missions` table (for foreign key constraint)
    // This is needed because mission_enrollments.mission_id references missions.id
    const { error: syncError } = await supabase
      .from('missions')
      .upsert({
        id: mission.id,
        title: mission.title,
        status: 'active',
        start_date: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (syncError) {
      console.warn('⚠️ [ENROLL-MISSION] Mission sync warning (non-blocking):', syncError.message);
    } else {
      console.log('✅ [ENROLL-MISSION] Mission synced to missions table');
    }

    // Enroll user (idempotent with ON CONFLICT DO NOTHING)
    const { error: enrollError } = await supabase
      .from('mission_enrollments')
      .insert({
        mission_id: mission.id,
        user_id: user.id,
      });

    // Ignore duplicate key error (user already enrolled) or foreign key errors after sync
    if (enrollError && 
        !enrollError.message.includes('duplicate') && 
        !enrollError.message.includes('already exists')) {
      console.error('❌ [ENROLL-MISSION] Enrollment error:', enrollError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to enroll in mission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔥 CRITICAL: Initialize/Reset user_mission_status for this user
    // This ensures the user has fresh progress data for the new mission
    const { error: statusError } = await supabase
      .from('user_mission_status')
      .upsert({
        user_id: user.id,
        clues_found: 0,
        mission_progress_percent: 0,
        mission_started_at: new Date().toISOString(),
        mission_days_remaining: 30,
        buzz_counter: 0,
        map_radius_km: null,
        map_area_generated: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (statusError) {
      console.warn('⚠️ [ENROLL-MISSION] Status init warning:', statusError.message);
    } else {
      console.log('✅ [ENROLL-MISSION] User mission status initialized');
    }

    // Log enrollment event in ai_events if table exists
    try {
      await supabase.from('ai_events').insert({
        user_id: user.id,
        event_type: 'mission_enroll',
        payload: {
          mission_id: mission.id,
          mission_name: mission.title,
          enrolled_at: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn('⚠️ [ENROLL-MISSION] Failed to log event (non-critical):', e);
    }

    const response: EnrollmentResponse = {
      ok: true,
      mission_id: mission.id,
    };

    console.log('✅ [ENROLL-MISSION] Success:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [ENROLL-MISSION] Unexpected error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
