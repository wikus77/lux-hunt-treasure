// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

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
    const previousWeek = currentWeek === 1 ? 52 : currentWeek - 1
    const previousYear = currentWeek === 1 ? currentYear - 1 : currentYear

    console.log(`🔄 Weekly Reset: Archiving week ${previousWeek}/${previousYear}`)

    // Get top 3 from previous week
    const { data: top3, error: top3Error } = await supabaseClient
      .from('weekly_leaderboard')
      .select('user_id, rank, total_xp')
      .eq('week_number', previousWeek)
      .eq('year', previousYear)
      .lte('rank', 3)
      .order('rank', { ascending: true })

    if (top3Error) {
      console.error('Error fetching top 3:', top3Error)
    }

    // Award badges to winners
    if (top3 && top3.length > 0) {
      for (const winner of top3) {
        const badgeId = `weekly_champion_${winner.rank}`
        
        // Insert badge award (assuming user_badges table exists)
        const { error: badgeError } = await supabaseClient
          .from('user_badges')
          .insert({
            user_id: winner.user_id,
            badge_id: badgeId,
            awarded_at: new Date().toISOString()
          })
          .onConflict('user_id,badge_id')
          .doNothing()

        if (badgeError) {
          console.error(`Error awarding badge to user ${winner.user_id}:`, badgeError)
        }

        // Award bonus XP
        const bonusXP = winner.rank === 1 ? 500 : winner.rank === 2 ? 300 : 200

        const { error: xpError } = await supabaseClient.rpc('award_xp', {
          p_user_id: winner.user_id,
          p_xp_amount: bonusXP,
          p_source: 'weekly_podium'
        })

        if (xpError) {
          console.error(`Error awarding XP to user ${winner.user_id}:`, xpError)
        }

        console.log(`🏆 Awarded Rank ${winner.rank} badge and ${bonusXP} XP to user ${winner.user_id}`)
      }
    }

    // Archive old leaderboard data (keep last 4 weeks only)
    const fourWeeksAgo = currentWeek - 4
    const yearToDelete = fourWeeksAgo < 1 ? currentYear - 1 : currentYear

    const { error: deleteError } = await supabaseClient
      .from('weekly_leaderboard')
      .delete()
      .lt('week_number', fourWeeksAgo < 1 ? 52 + fourWeeksAgo : fourWeeksAgo)
      .eq('year', yearToDelete)

    if (deleteError) {
      console.error('Error deleting old leaderboard data:', deleteError)
    }

    console.log(`✅ Weekly reset completed successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        winners: top3?.length || 0,
        previousWeek,
        previousYear
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in weekly-reset-cron:', error)
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
