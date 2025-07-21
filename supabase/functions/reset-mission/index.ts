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

    // Check rate limiting - Allow more resets for admin operations
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      ip_addr: clientIP,
      api_endpoint: '/reset-mission',
      max_requests: 10,
      window_minutes: 30
    });

    if (rateLimitError || !rateLimitResult) {
      console.log(`⚠️ RATE LIMIT: Blocking IP ${clientIP} for reset mission abuse`);
      await supabase.rpc('block_ip', {
        ip_addr: clientIP,
        block_duration_minutes: 15,
        block_reason: 'rate_limit_exceeded_reset_mission'
      });
      
      throw new Error('Rate limit exceeded');
    }

    const { confirmationCode } = await req.json();
    
    if (confirmationCode !== 'RESET_M1SSION_CONFIRM') {
      throw new Error('Invalid confirmation code');
    }

    console.log(`🔄 MISSION RESET: Starting complete mission reset for user ${user.id}`);

    // Execute the complete reset using the database function
    const { error: resetError } = await supabase.rpc('reset_user_mission_full', { 
      user_id_input: user.id 
    });

    if (resetError) {
      console.error('❌ MISSION RESET: Database function failed:', resetError);
      throw new Error(`Mission reset failed: ${resetError.message}`);
    }

    console.log(`✅ MISSION RESET: Database reset completed for user ${user.id}`);

    // Log the reset action
    await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'mission_reset',
      ip_address: clientIP,
      user_agent: userAgent,
      context: 'Complete mission reset executed via database function',
      status_code: 200,
      note: 'Mission reset completed successfully using reset_user_mission_full()'
    });

    console.log(`✅ MISSION RESET: Complete mission reset successful for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Mission reset completed successfully',
      userId: user.id,
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