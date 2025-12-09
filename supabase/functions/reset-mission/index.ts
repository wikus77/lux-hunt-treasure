// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1ssion-sig',
};

const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52';

serve(async (req) => {
  console.log(`🔄 RESET MISSION: Request received - Method: ${req.method}, URL: ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ RESET MISSION: CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 RESET MISSION: Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Authorization header
    console.log('🔄 RESET MISSION: Checking authorization header...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ RESET MISSION: Missing or invalid authorization header');
      throw new Error('Missing or invalid authorization header');
    }

    console.log('🔄 RESET MISSION: Validating JWT token...');
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('❌ RESET MISSION: JWT validation failed:', userError?.message);
      throw new Error('Invalid JWT token');
    }
    
    console.log(`✅ RESET MISSION: User authenticated - ID: ...${user.id.slice(-8)}`);

    // Verify email hash
    console.log('🔄 RESET MISSION: Verifying email authorization...');
    const emailHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.email!));
    const emailHash = Array.from(new Uint8Array(emailHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log(`🔄 RESET MISSION: Email hash computed: ${emailHash}`);
    if (emailHash !== AUTHORIZED_EMAIL_HASH) {
      console.error('❌ RESET MISSION: Unauthorized email access attempt');
      throw new Error('Unauthorized access - invalid email hash');
    }
    console.log('✅ RESET MISSION: Email authorization verified');

    // Get client info and parse IP properly
    const rawIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const clientIP = rawIP.split(',')[0].trim(); // Take first IP only
    const userAgent = req.headers.get('user-agent') || 'unknown';
    console.log(`🔄 RESET MISSION: Client info - IP: ${clientIP}, UserAgent: ${userAgent.substring(0, 50)}...`);

    // Check rate limiting - Allow more resets for admin operations
    console.log('🔄 RESET MISSION: Checking rate limits...');
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      ip_addr: clientIP,
      api_endpoint: '/reset-mission',
      max_requests: 10,
      window_minutes: 30
    });

    if (rateLimitError) {
      console.error('❌ RESET MISSION: Rate limit check error:', rateLimitError.message);
      throw new Error('Rate limit check failed');
    }

    if (!rateLimitResult) {
      console.log(`⚠️ RESET MISSION: Rate limit exceeded for IP ${clientIP}`);
      await supabase.rpc('block_ip', {
        ip_addr: clientIP,
        block_duration_minutes: 15,
        block_reason: 'rate_limit_exceeded_reset_mission'
      });
      
      throw new Error('Rate limit exceeded');
    }
    console.log('✅ RESET MISSION: Rate limit check passed');

    console.log('🔄 RESET MISSION: Parsing request body...');
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('❌ RESET MISSION: Failed to parse request body:', parseError);
      throw new Error('Invalid request body');
    }
    
    const { confirmationCode } = requestBody;
    console.log(`🔄 RESET MISSION: Confirmation code received: ${confirmationCode}`);
    
    if (confirmationCode !== 'RESET_M1SSION_CONFIRM') {
      console.error(`❌ RESET MISSION: Invalid confirmation code: ${confirmationCode}`);
      throw new Error('Invalid confirmation code');
    }
    console.log('✅ RESET MISSION: Confirmation code validated');

    console.log(`🔄 MISSION RESET: Starting GLOBAL mission reset (ALL USERS) by admin ...${user.id.slice(-8)}`);

    // 🔥 FIX V2: Reset globale manuale se la funzione RPC non esiste
    // Prima proviamo la RPC, se fallisce facciamo reset manuale
    console.log('🔄 MISSION RESET: Attempting global reset...');
    
    let resetResult: any = { success: true, tables_cleared: [], users_reset: 0 };
    
    // Try RPC first
    const { data: rpcResult, error: rpcError } = await supabase.rpc('reset_all_users_mission');
    
    if (rpcError) {
      console.warn('⚠️ MISSION RESET: RPC failed, executing manual reset...', rpcError.message);
      
      // MANUAL RESET - Delete from ALL mission-related tables
      // 🔥 V3: Aggiunto search_areas che era MISSING!
      const tablesToReset = [
        'user_notifications',
        'user_clues', 
        'buzz_map_actions',
        'user_map_areas',
        'search_areas', // 🔥 AGGIUNTO! Questa tabella mancava!
        'user_buzz_counter',
        'user_buzz_map_counter',
        'final_shots',
        'daily_final_shot_limits',
        'geo_radar_coordinates',
        'map_click_events',
        'map_points',
        'mission_enrollments'
      ];
      
      const clearedTables: string[] = [];
      
      for (const table of tablesToReset) {
        try {
          const { error, count } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (!error) {
            clearedTables.push(`${table}: cleared`);
            console.log(`✅ MISSION RESET: Cleared ${table}`);
          } else {
            console.warn(`⚠️ MISSION RESET: Could not clear ${table}:`, error.message);
          }
        } catch (e) {
          console.warn(`⚠️ MISSION RESET: Exception clearing ${table}:`, e);
        }
      }
      
      // Reset user_mission_status
      const { error: statusError, count: statusCount } = await supabase
        .from('user_mission_status')
        .update({
          clues_found: 0,
          mission_progress_percent: 0,
          mission_days_remaining: 30,
          buzz_counter: 0,
          map_radius_km: null,
          map_area_generated: false,
          updated_at: new Date().toISOString()
        })
        .neq('user_id', '00000000-0000-0000-0000-000000000000');
      
      if (!statusError) {
        clearedTables.push(`user_mission_status: ${statusCount || 'all'} users reset`);
      }
      
      resetResult = {
        success: true,
        tables_cleared: clearedTables,
        users_reset: statusCount || 0,
        reset_date: new Date().toISOString(),
        method: 'manual'
      };
      
      console.log('✅ MISSION RESET: Manual reset completed');
    } else {
      resetResult = rpcResult || { success: true, tables_cleared: [], users_reset: 0 };
      console.log('✅ MISSION RESET: RPC reset completed');
    }

    console.log(`✅ MISSION RESET: GLOBAL reset successful!`);
    console.log(`📊 MISSION RESET: Tables cleared: ${JSON.stringify(resetResult?.tables_cleared)}`);
    console.log(`👥 MISSION RESET: Users reset: ${resetResult?.users_reset}`);
    console.log(`📅 MISSION RESET: Reset date: ${resetResult?.reset_date}`);

    // Log the reset action
    console.log('🔄 MISSION RESET: Logging reset action to admin_logs...');
    const { error: logError } = await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'GLOBAL_MISSION_RESET',
      ip_address: clientIP,
      user_agent: userAgent,
      context: `GLOBAL mission reset - ${resetResult?.users_reset || 0} users reset`,
      status_code: 200,
      note: JSON.stringify(resetResult)
    });

    if (logError) {
      console.warn('⚠️ MISSION RESET: Failed to log action:', logError.message);
    } else {
      console.log('✅ MISSION RESET: Action logged successfully');
    }

    console.log(`✅ MISSION RESET: GLOBAL reset complete! ${resetResult?.users_reset || 0} users affected`);

    console.log('🔄 MISSION RESET: Preparing success response...');
    
    const successResponse = {
      status: "ok",
      success: true,
      message: "GLOBAL mission reset executed - ALL USERS RESET!",
      admin_id: user.id,
      reset_success: resetResult?.success || true,
      timestamp: new Date().toISOString(),
      reset_details: resetResult || {},
      mission_status: {
        state: "ATTIVA",
        started_at: resetResult?.reset_date,
        days_remaining: resetResult?.mission_days_remaining || 30,
        progress_percent: 0,
        clues_found: 0
      },
      users_reset: resetResult?.users_reset || 0,
      tables_reset: resetResult?.tables_cleared || [],
      logs: [
        "Authorization validated",
        "Rate limit passed", 
        "Confirmation code verified",
        "🔥 GLOBAL DATABASE RESET EXECUTED (ALL USERS)",
        `Users reset: ${resetResult?.users_reset || 0}`,
        `Tables cleared: ${JSON.stringify(resetResult?.tables_cleared || [])}`,
        "Action logged"
      ]
    };
    
    console.log('✅ MISSION RESET: Returning success response with explicit HTTP 200');
    return new Response(
      JSON.stringify(successResponse),
      {
        status: 200,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error('❌ RESET MISSION ERROR:', error);
    console.error('❌ RESET MISSION ERROR STACK:', error.stack);
    
    const errorResponse = {
      status: "ERROR",
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      logs: ['Error occurred during reset process']
    };
    
    const statusCode = error.message.includes('Unauthorized') ? 403 : 
                      error.message.includes('Rate limit') ? 429 : 
                      error.message.includes('confirmation') ? 400 : 500;
    
    console.log(`❌ RESET MISSION: Returning error response with status ${statusCode}`);
    
    // FORCE 200 FOR PWA COMPATIBILITY IF NEEDED
    const finalStatusCode = statusCode >= 500 ? 200 : statusCode;
    
    return new Response(JSON.stringify(errorResponse), {
      status: finalStatusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Supabase-Edge-Function': 'reset-mission',
        'X-PWA-Compatible': 'true'
      }
    });
  }
});