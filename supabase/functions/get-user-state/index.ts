// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: get-user-state
// Returns complete user state for AI context

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1-debug',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

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

    return new Response(
      JSON.stringify(state),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-user-state] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
