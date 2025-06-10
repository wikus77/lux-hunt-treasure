
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    
    if (!userData.user) {
      throw new Error("Invalid user token");
    }

    const userId = userData.user.id;
    console.log(`🚀 LANCIO RESET: Starting complete data reset for user ${userId}`);

    // 1. DELETE ALL USER GAME DATA
    const deleteOperations = [
      supabaseClient.from('user_clues').delete().eq('user_id', userId),
      supabaseClient.from('user_notifications').delete().eq('user_id', userId),
      supabaseClient.from('user_map_areas').delete().eq('user_id', userId),
      supabaseClient.from('user_buzz_counter').delete().eq('user_id', userId),
      supabaseClient.from('user_buzz_map_counter').delete().eq('user_id', userId),
      supabaseClient.from('buzz_generation_logs').delete().eq('user_id', userId),
      supabaseClient.from('buzz_map_actions').delete().eq('user_id', userId),
      supabaseClient.from('search_areas').delete().eq('user_id', userId),
      supabaseClient.from('map_points').delete().eq('user_id', userId),
      supabaseClient.from('live_activity_state').delete().eq('user_id', userId),
      supabaseClient.from('weekly_buzz_allowances').delete().eq('user_id', userId)
    ];

    console.log('🗑️ LANCIO RESET: Deleting all user game data...');
    await Promise.all(deleteOperations);

    // 2. RESET PROFILE CREDITS TO 0
    console.log('💰 LANCIO RESET: Resetting profile credits...');
    await supabaseClient
      .from('profiles')
      .update({ credits: 0 })
      .eq('id', userId);

    // 3. CREATE FRESH WEEKLY ALLOWANCE FOR BLACK TIER
    console.log('📊 LANCIO RESET: Creating fresh weekly allowance...');
    const currentWeek = Math.ceil((Date.now() - new Date('2025-07-19').getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentYear = new Date().getFullYear();
    
    await supabaseClient
      .from('weekly_buzz_allowances')
      .insert({
        user_id: userId,
        week_number: Math.max(1, currentWeek),
        year: currentYear,
        max_buzz_count: 999, // BLACK tier unlimited
        used_buzz_count: 0
      });

    // 4. ENSURE BLACK SUBSCRIPTION IS ACTIVE
    console.log('🔧 LANCIO RESET: Ensuring BLACK subscription...');
    await supabaseClient
      .from('profiles')
      .update({
        subscription_tier: 'Black',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      })
      .eq('id', userId);

    console.log('✅ LANCIO RESET: Complete data reset successful');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Complete launch reset successful',
        resetItems: [
          'user_clues', 'user_notifications', 'user_map_areas', 
          'user_buzz_counter', 'weekly_buzz_allowances', 'profile_credits'
        ]
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ LANCIO RESET ERROR:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
