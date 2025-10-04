// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: Enroll user in current active mission (Mission of the Month)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    // Find current active mission (mission of the month)
    const { data: missions, error: missionError } = await supabase
      .from('missions')
      .select('id, title, status')
      .eq('status', 'active')
      .order('starts_at', { ascending: false })
      .limit(1);

    if (missionError) {
      console.error('❌ [ENROLL-MISSION] Mission query error:', missionError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to find active mission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!missions || missions.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No active mission available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mission = missions[0];
    console.log('📍 [ENROLL-MISSION] Found mission:', mission.title, mission.id);

    // Enroll user (idempotent with ON CONFLICT DO NOTHING)
    const { error: enrollError } = await supabase
      .from('mission_enrollments')
      .insert({
        mission_id: mission.id,
        user_id: user.id,
      });

    // Ignore duplicate key error (user already enrolled)
    if (enrollError && !enrollError.message.includes('duplicate')) {
      console.error('❌ [ENROLL-MISSION] Enrollment error:', enrollError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to enroll in mission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log enrollment event in norah_events if table exists
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
