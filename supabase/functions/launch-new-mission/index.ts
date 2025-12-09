// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: Launch New Mission with Global User Reset

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Admin emails autorizzate (hash SHA-256)
const ADMIN_EMAIL_HASHES = [
  '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52', // wikus77@hotmail.it
];

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface LaunchMissionRequest {
  mission_id?: string;
  mission_name: string;
  send_push?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 [LAUNCH-NEW-MISSION] Starting...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid JWT token');
    }

    console.log(`👤 [LAUNCH-NEW-MISSION] User: ...${user.id.slice(-8)}`);

    // 2. Verify admin email
    const emailHash = await hashEmail(user.email || '');
    if (!ADMIN_EMAIL_HASHES.includes(emailHash)) {
      console.error('❌ [LAUNCH-NEW-MISSION] Unauthorized email');
      throw new Error('Unauthorized: Admin access required');
    }

    console.log('✅ [LAUNCH-NEW-MISSION] Admin verified');

    // 3. Parse request body
    const body: LaunchMissionRequest = await req.json();
    const { mission_id, mission_name, send_push = true } = body;

    if (!mission_name) {
      throw new Error('mission_name is required');
    }

    console.log(`📋 [LAUNCH-NEW-MISSION] Mission: ${mission_name}`);

    // 4. Deactivate ALL previous missions
    console.log('🔄 [LAUNCH-NEW-MISSION] Deactivating previous missions...');
    
    const { error: deactivateError1 } = await supabase
      .from('current_mission_data')
      .update({ is_active: false, mission_status: 'archived' })
      .eq('is_active', true);

    if (deactivateError1) {
      console.warn('⚠️ [LAUNCH-NEW-MISSION] Deactivate current_mission_data warning:', deactivateError1.message);
    }

    const { error: deactivateError2 } = await supabase
      .from('missions')
      .update({ status: 'completed' })
      .eq('status', 'active');

    if (deactivateError2) {
      console.warn('⚠️ [LAUNCH-NEW-MISSION] Deactivate missions warning:', deactivateError2.message);
    }

    // 5. Activate new mission in current_mission_data
    console.log('✅ [LAUNCH-NEW-MISSION] Activating new mission...');
    
    const { error: activateError } = await supabase
      .from('current_mission_data')
      .update({
        is_active: true,
        mission_status: 'active',
        mission_started_at: new Date().toISOString(),
      })
      .eq('mission_name', mission_name);

    if (activateError) {
      console.error('❌ [LAUNCH-NEW-MISSION] Activate error:', activateError.message);
      // Try to activate by ID if name didn't work
      if (mission_id) {
        await supabase
          .from('current_mission_data')
          .update({
            is_active: true,
            mission_status: 'active',
            mission_started_at: new Date().toISOString(),
          })
          .eq('id', mission_id);
      }
    }

    // Also activate in missions table if linked
    if (mission_id) {
      await supabase
        .from('missions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
        })
        .eq('id', mission_id);
    }

    // 6. CRITICAL: Reset ALL users' mission progress
    console.log('🔥 [LAUNCH-NEW-MISSION] Resetting ALL users progress...');
    
    const { data: resetResult, error: resetError } = await supabase.rpc('reset_all_users_mission');

    if (resetError) {
      console.error('❌ [LAUNCH-NEW-MISSION] Reset error:', resetError.message);
      throw new Error(`Failed to reset users: ${resetError.message}`);
    }

    console.log('✅ [LAUNCH-NEW-MISSION] Reset result:', resetResult);

    // 7. Send push notification to ALL users (if enabled)
    if (send_push) {
      console.log('📤 [LAUNCH-NEW-MISSION] Sending push notification...');
      
      try {
        await supabase.functions.invoke('webpush-send', {
          body: {
            broadcast: true,
            title: '🚀 NUOVA M1SSION ATTIVA!',
            body: `${mission_name} - La caccia al tesoro inizia ORA! I tuoi progressi sono stati azzerati.`,
            url: '/home',
          },
        });
        console.log('✅ [LAUNCH-NEW-MISSION] Push sent');
      } catch (pushErr) {
        console.warn('⚠️ [LAUNCH-NEW-MISSION] Push error (non-blocking):', pushErr);
      }
    }

    // 8. Log the action
    await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'MISSION_LAUNCH_GLOBAL_RESET',
      context: `Launched mission "${mission_name}" with global user reset`,
      status_code: 200,
      note: JSON.stringify(resetResult),
    });

    console.log('✅ [LAUNCH-NEW-MISSION] Complete!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Mission "${mission_name}" launched successfully`,
        reset_result: resetResult,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [LAUNCH-NEW-MISSION] Error:', error.message);
    
    const statusCode = error.message.includes('Unauthorized') ? 403 : 
                       error.message.includes('required') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


