// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: Launch New Mission with COMPLETE Global Reset
// V5 - FIXED: Handles tables with different primary key structures

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADMIN_EMAIL_HASHES = [
  '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52',
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

// Tables with their KEY columns for DELETE
// 🔧 FIX: user_clues e user_notifications usano user_id, NON id!
const TABLES_CONFIG = [
  { name: 'user_notifications', keyColumn: 'user_id' },  // 🔧 FIX: era 'id'
  { name: 'user_clues', keyColumn: 'user_id' },          // 🔧 FIX: era 'id' - CAUSA DEL BUG!
  { name: 'buzz_map_actions', keyColumn: 'id' },
  { name: 'user_map_areas', keyColumn: 'id' },
  { name: 'search_areas', keyColumn: 'id' },
  { name: 'final_shoot_attempts', keyColumn: 'id' },
  { name: 'marker_claims', keyColumn: 'id' },
  { name: 'map_click_events', keyColumn: 'id' },
  { name: 'map_points', keyColumn: 'id' },
  { name: 'geo_radar_coordinates', keyColumn: 'id' },
  { name: 'user_buzz_counter', keyColumn: 'id' },
  { name: 'user_buzz_map_counter', keyColumn: 'id' },
  { name: 'user_buzz_weekly', keyColumn: 'id' },
  { name: 'buzz_activations', keyColumn: 'id' },
  { name: 'mission_enrollments', keyColumn: 'user_id' },
];

// 🔧 FIX: Simple DELETE ALL - more reliable than batch approach
async function executeDelete(supabase: any, tableName: string, keyColumn: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // First count rows
    const { count: beforeCount, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn(`⚠️ [DELETE] ${tableName} count error:`, countError.message);
    }
    
    const rowsBefore = beforeCount || 0;
    
    if (rowsBefore === 0) {
      console.log(`✅ [DELETE] ${tableName}: Already empty (0 rows)`);
      return { success: true, count: 0 };
    }
    
    console.log(`🗑️ [DELETE] ${tableName}: Found ${rowsBefore} rows to delete`);
    
    // 🔧 FIX: Use neq filter with impossible value to delete ALL rows
    // Handle both 'id' and 'user_id' as key columns
    let deleteError;
    if (keyColumn === 'user_id') {
      const result = await supabase
        .from(tableName)
        .delete()
        .neq('user_id', '00000000-0000-0000-0000-000000000000');
      deleteError = result.error;
    } else {
      const result = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      deleteError = result.error;
    }
    
    if (deleteError) {
      console.error(`❌ [DELETE] ${tableName} error:`, deleteError.message);
      return { success: false, count: 0, error: deleteError.message };
    }
    
    // Verify deletion
    const { count: afterCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    const rowsAfter = afterCount || 0;
    const deletedCount = rowsBefore - rowsAfter;
    
    console.log(`✅ [DELETE] ${tableName}: Deleted ${deletedCount}/${rowsBefore} rows (remaining: ${rowsAfter})`);
    return { success: rowsAfter === 0, count: deletedCount };
    
  } catch (e: any) {
    console.error(`❌ [DELETE] ${tableName} exception:`, e.message);
    return { success: false, count: 0, error: e.message };
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    log('🚀 [LAUNCH-NEW-MISSION V5] Starting COMPLETE reset...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

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

    log(`👤 User: ...${user.id.slice(-8)}`);

    // 2. Verify admin email
    const emailHash = await hashEmail(user.email || '');
    if (!ADMIN_EMAIL_HASHES.includes(emailHash)) {
      throw new Error('Unauthorized: Admin access required');
    }

    log('✅ Admin verified');

    // 3. Parse request body
    const body: LaunchMissionRequest = await req.json();
    const { mission_id, mission_name, send_push = true } = body;

    if (!mission_name) {
      throw new Error('mission_name is required');
    }

    log(`📋 Mission: ${mission_name}`);

    // 4. Deactivate ALL previous missions
    log('🔄 Deactivating previous missions...');
    await supabase.from('current_mission_data').update({ is_active: false, mission_status: 'archived' }).eq('is_active', true);
    await supabase.from('missions').update({ status: 'completed' }).eq('status', 'active');

    // 5. Activate new mission
    log('✅ Activating new mission...');
    const { error: activateError } = await supabase
      .from('current_mission_data')
      .update({
        is_active: true,
        mission_status: 'active',
        mission_started_at: new Date().toISOString(),
      })
      .eq('mission_name', mission_name);

    if (activateError) {
      log(`⚠️ Activate by name failed: ${activateError.message}`);
      if (mission_id) {
        await supabase.from('current_mission_data').update({ is_active: true, mission_status: 'active', mission_started_at: new Date().toISOString() }).eq('id', mission_id);
      }
    }

    // 6. ⚡ COMPLETE RESET - Delete ALL mission data
    log('🔥🔥🔥 STARTING COMPLETE DATA RESET 🔥🔥🔥');
    
    const deleteResults: Record<string, any> = {};
    
    for (const tableConfig of TABLES_CONFIG) {
      const result = await executeDelete(supabase, tableConfig.name, tableConfig.keyColumn);
      deleteResults[tableConfig.name] = result;
      log(`📊 ${tableConfig.name}: ${result.success ? '✅' : '❌'} (${result.count} deleted)`);
    }

    // 7. Reset user_mission_status (UPDATE, not DELETE)
    log('🔄 Resetting user_mission_status...');
    try {
      const { data: allStatus } = await supabase.from('user_mission_status').select('user_id');
      if (allStatus && allStatus.length > 0) {
        const userIds = allStatus.map((s: any) => s.user_id);
        
        for (let i = 0; i < userIds.length; i += 100) {
          const batch = userIds.slice(i, i + 100);
          const { error: updateError } = await supabase
            .from('user_mission_status')
            .update({
              clues_found: 0,
              mission_progress_percent: 0,
              mission_started_at: new Date().toISOString(),
              mission_days_remaining: 30,
              buzz_counter: 0,
              map_radius_km: null,
              map_area_generated: false,
              updated_at: new Date().toISOString(),
            })
            .in('user_id', batch);
          
          if (updateError) {
            log(`⚠️ user_mission_status batch update error: ${updateError.message}`);
          }
        }
        log(`✅ user_mission_status: ${allStatus.length} users reset`);
        deleteResults['user_mission_status'] = { success: true, count: allStatus.length };
      }
    } catch (e: any) {
      log(`⚠️ user_mission_status reset error: ${e.message}`);
      deleteResults['user_mission_status'] = { success: false, error: e.message };
    }

    // 8. Reset profiles (streak - MA NON M1U e cashback!)
    // 🔧 FIX: Rimosso clues_unlocked che NON esiste nella tabella!
    log('🔄 Resetting profiles (streak)...');
    try {
      const { data: allProfiles } = await supabase.from('profiles').select('id');
      if (allProfiles && allProfiles.length > 0) {
        const profileIds = allProfiles.map((p: any) => p.id);
        
        for (let i = 0; i < profileIds.length; i += 100) {
          const batch = profileIds.slice(i, i + 100);
          await supabase
            .from('profiles')
            .update({ 
              // 🔧 FIX: Reset STREAK al lancio missione
              current_streak_days: 0,
              last_check_in_date: null,
              updated_at: new Date().toISOString() 
              // ⚠️ NON tocchiamo: m1u_balance, cashback, tier - questi RIMANGONO!
            })
            .in('id', batch);
        }
        log(`✅ profiles (streak): ${allProfiles.length} profiles reset`);
        deleteResults['profiles_reset'] = { success: true, count: allProfiles.length };
      }
    } catch (e: any) {
      log(`⚠️ profiles reset error: ${e.message}`);
    }

    // 9. 📱 SEND PUSH NOTIFICATION TO ALL USERS
    log('📤 Sending push notification to ALL users...');
    
    const pushTitle = '🚀 NUOVA M1SSION ATTIVA!';
    const pushBody = `${mission_name} - La caccia al tesoro inizia ORA! Tutti i progressi sono stati azzerati.`;

    if (send_push) {
      // Method 1: webpush-send with admin token (uses webpush_subscriptions - 468 records!)
      const pushAdminToken = Deno.env.get('PUSH_ADMIN_TOKEN');
      
      if (pushAdminToken) {
        try {
          log('📤 Trying webpush-send with admin token...');
          
          // Direct HTTP call to webpush-send with x-admin-token header
          const webpushResponse = await fetch(`${supabaseUrl}/functions/v1/webpush-send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': pushAdminToken,
            },
            body: JSON.stringify({
              payload: {
                title: pushTitle,
                body: pushBody,
                url: '/home',
                icon: '/icon-192x192.png',
              },
            }),
          });
          
          const webpushResult = await webpushResponse.json();
          log(`✅ webpush-send result: ${JSON.stringify(webpushResult)}`);
          
          if (webpushResult.sent > 0) {
            log(`🎉 Successfully sent ${webpushResult.sent} push notifications!`);
          }
        } catch (e: any) {
          log(`⚠️ webpush-send error: ${e.message}`);
        }
      } else {
        log('⚠️ PUSH_ADMIN_TOKEN not configured, skipping webpush-send');
      }

      // Method 2: push-broadcast fallback (uses fcm_subscriptions)
      try {
        log('📤 Trying push-broadcast...');
        const { data: broadcastResult, error: broadcastError } = await supabase.functions.invoke('push-broadcast', {
          body: {
            title: pushTitle,
            body: pushBody,
            url: '/home',
          },
        });
        
        if (!broadcastError && broadcastResult) {
          log(`✅ push-broadcast result: ${JSON.stringify(broadcastResult)}`);
        } else {
          log(`⚠️ push-broadcast error: ${broadcastError?.message || 'Unknown'}`);
        }
      } catch (e: any) {
        log(`⚠️ push-broadcast exception: ${e.message}`);
      }

      // ALWAYS create in-app notifications for ALL users (guaranteed delivery)
      log('📝 Creating in-app notifications for all users...');
      try {
        const { data: allUsers } = await supabase.from('profiles').select('id');
        if (allUsers && allUsers.length > 0) {
          const notifications = allUsers.map((u: any) => ({
            user_id: u.id,
            type: 'mission_launch',
            title: pushTitle,
            message: pushBody,
            is_read: false,
            created_at: new Date().toISOString(),
          }));
          
          for (let i = 0; i < notifications.length; i += 100) {
            const batch = notifications.slice(i, i + 100);
            await supabase.from('user_notifications').insert(batch);
          }
          
          log(`✅ Created ${notifications.length} in-app notifications`);
        }
      } catch (e: any) {
        log(`⚠️ In-app notifications error: ${e.message}`);
      }
    }

    // 10. Log admin action
    await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'MISSION_LAUNCH_GLOBAL_RESET_V5',
      context: `Launched: "${mission_name}"`,
      status_code: 200,
      note: JSON.stringify({ deleteResults, logs }),
    });

    log('🎉 MISSION LAUNCH COMPLETE!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Mission "${mission_name}" launched successfully!`,
        reset_summary: deleteResults,
        logs,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    log(`❌ ERROR: ${error.message}`);
    
    const statusCode = error.message.includes('Unauthorized') ? 403 : 
                       error.message.includes('required') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        logs,
        timestamp: new Date().toISOString(),
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
