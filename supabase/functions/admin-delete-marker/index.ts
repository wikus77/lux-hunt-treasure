// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: Admin Delete Marker v3 - FORCE DELETE with service role

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    log(`🔑 URL: ${url?.slice(0, 30)}...`);
    log(`🔑 Service key exists: ${!!serviceKey}`);

    // Get marker_id from body
    const body = await req.json().catch(() => ({}));
    const markerId = body.marker_id;

    if (!markerId) {
      return new Response(
        JSON.stringify({ success: false, error: 'marker_id required', logs }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log(`🎯 Marker to delete: ${markerId}`);

    // Verify user is admin using their JWT
    const authHeader = req.headers.get('Authorization') ?? '';
    log(`🔐 Auth header exists: ${!!authHeader && authHeader.length > 0}`);

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError || !user) {
      log(`❌ Auth error: ${authError?.message || 'no user'}`);
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', logs }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log(`👤 User: ${user.id}`);

    // Check if user is admin
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    log(`📋 Profile: ${JSON.stringify(profile)}, error: ${profileError?.message || 'none'}`);

    const isAdmin = profile?.role && ['admin', 'owner'].some(r => 
      profile.role.toLowerCase().includes(r.toLowerCase())
    );

    if (!isAdmin) {
      log(`❌ Not admin. Role: ${profile?.role}`);
      return new Response(
        JSON.stringify({ success: false, error: 'not_admin', role: profile?.role, logs }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log(`✅ Admin verified`);

    // Use SERVICE ROLE client to bypass ALL RLS
    const adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // First, check if marker exists
    log(`🔍 Checking if marker exists...`);
    const { data: existingMarker, error: checkError } = await adminClient
      .from('markers')
      .select('id, title')
      .eq('id', markerId)
      .maybeSingle();

    log(`🔍 Marker check: ${JSON.stringify(existingMarker)}, error: ${checkError?.message || 'none'}`);

    if (!existingMarker) {
      return new Response(
        JSON.stringify({ success: false, error: 'marker_not_found', logs }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete rewards first
    log(`🗑️ Step 1: Deleting rewards...`);
    const { error: rewardsError, count: rewardsCount } = await adminClient
      .from('marker_rewards')
      .delete()
      .eq('marker_id', markerId);
    
    log(`🗑️ Rewards delete: count=${rewardsCount}, error=${rewardsError?.message || 'none'}`);

    // Delete claims
    log(`🗑️ Step 2: Deleting claims...`);
    const { error: claimsError, count: claimsCount } = await adminClient
      .from('marker_claims')
      .delete()
      .eq('marker_id', markerId);
    
    log(`🗑️ Claims delete: count=${claimsCount}, error=${claimsError?.message || 'none'}`);

    // DELETE MARKER - the main operation
    log(`🗑️ Step 3: DELETING MARKER...`);
    const { error: markerError, count: markerCount } = await adminClient
      .from('markers')
      .delete()
      .eq('id', markerId);

    log(`🗑️ Marker delete result: count=${markerCount}, error=${markerError?.message || 'none'}`);

    if (markerError) {
      log(`❌ MARKER DELETE FAILED: ${markerError.message}`);
      return new Response(
        JSON.stringify({ success: false, error: markerError.message, logs }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify deletion
    log(`🔍 Verifying deletion...`);
    const { data: verifyMarker } = await adminClient
      .from('markers')
      .select('id')
      .eq('id', markerId)
      .maybeSingle();

    if (verifyMarker) {
      log(`❌ VERIFICATION FAILED - Marker still exists!`);
      return new Response(
        JSON.stringify({ success: false, error: 'deletion_failed_verification', still_exists: true, logs }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log(`✅ SUCCESS - Marker ${markerId} completely deleted`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        marker_id: markerId,
        logs
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log(`❌ EXCEPTION: ${String(error)}`);
    return new Response(
      JSON.stringify({ success: false, error: String(error), logs }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


