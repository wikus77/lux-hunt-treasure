// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1ssion-sig',
};

const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid JWT token');
    }

    // Verify email hash
    const emailHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.email!));
    const emailHash = Array.from(new Uint8Array(emailHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (emailHash !== AUTHORIZED_EMAIL_HASH) {
      throw new Error('Unauthorized access - invalid email hash');
    }

    // Get client info
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check rate limiting
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      ip_addr: clientIP,
      api_endpoint: '/reset-mission',
      max_requests: 2,
      window_minutes: 60
    });

    if (rateLimitError || !rateLimitResult) {
      await supabase.rpc('block_ip', {
        ip_addr: clientIP,
        block_duration_minutes: 30,
        block_reason: 'rate_limit_exceeded_reset_mission'
      });
      
      throw new Error('Rate limit exceeded');
    }

    const { confirmationCode } = await req.json();
    
    if (confirmationCode !== 'RESET_M1SSION_CONFIRM') {
      throw new Error('Invalid confirmation code');
    }

    console.log(`🔄 MISSION RESET: Starting complete mission reset for user ${user.id}`);

    // Start mission reset process
    const resetOperations = [];

    // 1. Delete all user clues
    resetOperations.push(
      supabase.from('user_clues').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    );

    // 2. Delete all AI generated clues
    resetOperations.push(
      supabase.from('ai_generated_clues').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    );

    // 3. Reset user mission status
    resetOperations.push(
      supabase.rpc('reset_user_mission_full', { user_id_input: user.id })
    );

    // 4. Delete user buzz counters
    resetOperations.push(
      supabase.from('user_buzz_counter').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    );

    // 5. Delete user map areas
    resetOperations.push(
      supabase.from('user_map_areas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    );

    // 6. Delete user notifications
    resetOperations.push(
      supabase.from('user_notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    );

    // Execute all reset operations
    const results = await Promise.allSettled(resetOperations);
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      console.error('❌ MISSION RESET: Some operations failed:', failures);
    }

    // Log the reset action
    await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'mission_reset',
      ip_address: clientIP,
      user_agent: userAgent,
      context: 'Complete mission reset executed',
      status_code: 200,
      note: `Mission reset completed. ${failures.length} operations failed out of ${results.length}`
    });

    console.log(`✅ MISSION RESET: Complete mission reset successful for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Mission reset completed successfully',
      operationsCompleted: results.length - failures.length,
      operationsFailed: failures.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ RESET MISSION ERROR:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: error.message.includes('Unauthorized') ? 403 : 
             error.message.includes('Rate limit') ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});