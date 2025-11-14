// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: get-user-state
// Returns complete user state for AI context

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import { withCors } from '../_shared/cors.ts';

serve(withCors(async (req) => {
  // Debug gate
  const wantsDebug = req.headers.get('x-m1-debug') === '1' || Deno.env.get('DEBUG_PANELS') === 'true';
  const authHeader = req.headers.get('Authorization') ?? '';
  const sawAuth = authHeader.startsWith('Bearer ');
  const jwtLen = sawAuth ? authHeader.replace('Bearer ', '').length : 0;
  const origin = req.headers.get('origin') || null;

  try {
    const { userId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('agent_code, subscription_plan, email')
      .eq('id', userId)
      .single();

    // Get agent profile
    const { data: agentProfile } = await supabaseClient
      .from('agent_profiles')
      .select('nickname, streak_days')
      .eq('user_id', userId)
      .single();

    // Get clues count
    const { count: cluesCount } = await supabaseClient
      .from('agent_clues')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get BUZZ grants
    const { data: buzzGrants } = await supabaseClient
      .from('buzz_grants')
      .select('source, remaining')
      .eq('user_id', userId);

    // Get notification count (if table exists)
    const { data: notificationCounter } = await supabaseClient
      .from('notification_counters')
      .select('unread_count')
      .eq('user_id', userId)
      .single();

    const state = {
      userId,
      agentCode: profile?.agent_code || null,
      tier: profile?.subscription_plan || 'free',
      email: profile?.email || null,
      nickname: agentProfile?.nickname || null,
      streakDays: agentProfile?.streak_days || 0,
      cluesFound: cluesCount || 0,
      buzzAvailable: buzzGrants?.reduce((sum, g) => sum + (g.remaining || 0), 0) || 0,
      unreadNotifications: notificationCounter?.unread_count || 0
    };

    // Add debug block if requested
    const debugBlock = wantsDebug ? {
      sawAuthorizationHeader: sawAuth,
      jwtLen,
      requestOrigin: origin,
      allowedOrigin: origin, // withCors already validated this
      corsHeadersEcho: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
      envSeen: {
        SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
        SERVICE_ROLE_PRESENT: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    } : undefined;

    const responseBody = wantsDebug ? { ...state, __debug: debugBlock } : state;

    // Add expose headers for debug
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (wantsDebug && origin) {
      headers.set('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Methods, x-m1-cors-allowed-origin');
      headers.set('x-m1-cors-allowed-origin', origin);
    }

    return new Response(
      JSON.stringify(responseBody),
      { headers }
    );
  } catch (error) {
    console.error('[get-user-state] Error:', error);
    
    const debugBlock = wantsDebug ? {
      sawAuthorizationHeader: sawAuth,
      jwtLen,
      requestOrigin: origin,
      error: error.message
    } : undefined;

    const errorBody = wantsDebug 
      ? { error: error.message, __debug: debugBlock }
      : { error: error.message };

    return new Response(
      JSON.stringify(errorBody),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
