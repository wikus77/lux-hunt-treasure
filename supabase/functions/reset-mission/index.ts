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
    
    console.log(`✅ RESET MISSION: User authenticated - ID: ${user.id}, Email: ${user.email}`);

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

    console.log(`🔄 MISSION RESET: Starting complete mission reset for user ${user.id}`);

    // Execute the complete reset using the database function
    console.log('🔄 MISSION RESET: Calling reset_user_mission_full database function...');
    const { data: resetResult, error: resetError } = await supabase.rpc('reset_user_mission_full', { 
      user_id_input: user.id 
    });

    if (resetError) {
      console.error('❌ MISSION RESET: Database function failed:', resetError.message, resetError.details, resetError.hint);
      throw new Error(`Mission reset failed: ${resetError.message}`);
    }

    console.log(`✅ MISSION RESET: Complete reset successful for user ${user.id}`, resetResult);
    console.log(`📊 MISSION RESET: Tables reset: ${resetResult?.tables_reset?.join(', ')}`);
    console.log(`📅 MISSION RESET: New mission start date: ${resetResult?.reset_date}`);
    console.log(`⏱️ MISSION RESET: Days remaining reset to: ${resetResult?.mission_days_remaining}`);

    // Log the reset action
    console.log('🔄 MISSION RESET: Logging reset action to admin_logs...');
    const { error: logError } = await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'mission_reset',
      ip_address: clientIP,
      user_agent: userAgent,
      context: 'Complete mission reset executed via database function',
      status_code: 200,
      note: 'Mission reset completed successfully using reset_user_mission_full()'
    });

    if (logError) {
      console.warn('⚠️ MISSION RESET: Failed to log action:', logError.message);
    } else {
      console.log('✅ MISSION RESET: Action logged successfully');
    }

    console.log(`✅ MISSION RESET: Complete mission reset successful for user ${user.id}`);

    console.log('🔄 MISSION RESET: Preparing success response...');
    
    const successResponse = {
      status: "ok",
      success: true,
      message: "Complete mission reset executed successfully",
      userid: user.id,
      reset_success: true,
      timestamp: new Date().toISOString(),
      reset_details: resetResult || {},
      mission_status: {
        state: "ATTIVA",
        started_at: resetResult?.reset_date,
        days_remaining: resetResult?.mission_days_remaining || 30,
        progress_percent: 0,
        clues_found: 0
      },
      tables_reset: resetResult?.tables_reset || [],
      logs: [
        "Authorization validated",
        "Rate limit passed", 
        "Confirmation code verified",
        "Complete database reset executed",
        `Reset ${resetResult?.tables_reset?.length || 0} tables`,
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