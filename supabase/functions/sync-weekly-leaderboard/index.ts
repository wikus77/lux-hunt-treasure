// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const currentWeek = new Date().getWeekNumber()
    const currentYear = new Date().getFullYear()

    console.log(`🔄 Syncing weekly leaderboard for week ${currentWeek}, year ${currentYear}`)

    // Get all users with XP from user_xp table
    const { data: userXpData, error: xpError } = await supabaseClient
      .from('user_xp')
      .select('user_id, total_xp')

    if (xpError) {
      console.error('Error fetching user XP:', xpError)
      throw xpError
    }

    if (!userXpData || userXpData.length === 0) {
      console.log('No user XP data found')
      return new Response(
        JSON.stringify({ success: true, message: 'No data to sync' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sort by XP and assign ranks
    const rankedUsers = userXpData
      .sort((a, b) => b.total_xp - a.total_xp)
      .map((user, index) => ({
        user_id: user.user_id,
        week_number: currentWeek,
        year: currentYear,
        total_xp: user.total_xp || 0,
        rank: index + 1
      }))

    // Upsert to weekly_leaderboard
    const { error: upsertError } = await supabaseClient
      .from('weekly_leaderboard')
      .upsert(rankedUsers, {
        onConflict: 'user_id,week_number,year'
      })

    if (upsertError) {
      console.error('Error upserting leaderboard:', upsertError)
      throw upsertError
    }

    // Refresh materialized view
    const { error: refreshError } = await supabaseClient.rpc('refresh_current_week_leaderboard')

    if (refreshError) {
      console.error('Error refreshing materialized view:', refreshError)
    }

    console.log(`✅ Synced ${rankedUsers.length} users to weekly leaderboard`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        usersSync ed: rankedUsers.length,
        week: currentWeek,
        year: currentYear
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-weekly-leaderboard:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper to get ISO week number
declare global {
  interface Date {
    getWeekNumber(): number;
  }
}

Date.prototype.getWeekNumber = function(): number {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};
