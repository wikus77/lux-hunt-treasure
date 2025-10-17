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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const today = new Date().toISOString().split('T')[0]

    // Get current profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('current_streak_days, longest_streak_days, last_check_in_date')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw profileError
    }

    const lastCheckIn = profile.last_check_in_date
    const currentStreak = profile.current_streak_days || 0
    const longestStreak = profile.longest_streak_days || 0

    let newStreak = 1
    let streakBroken = false

    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn)
      const todayDate = new Date(today)
      const diffTime = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Already checked in today
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Already checked in today',
            currentStreak,
            xpAwarded: 0
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = currentStreak + 1
      } else {
        // Streak broken
        newStreak = 1
        streakBroken = true
      }
    }

    // Calculate XP: streak_days * 10
    const xpAwarded = newStreak * 10

    // Update profile with new streak
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        current_streak_days: newStreak,
        longest_streak_days: Math.max(newStreak, longestStreak),
        last_check_in_date: today
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw updateError
    }

    // Award XP via RPC function
    const { error: xpError } = await supabaseClient.rpc('award_xp', {
      p_user_id: user.id,
      p_xp_amount: xpAwarded,
      p_source: 'daily_checkin'
    })

    if (xpError) {
      console.error('Error awarding XP:', xpError)
    }

    // Check for milestone badges (7, 30, 100 days)
    const badgesToAward: string[] = []
    if (newStreak === 7) badgesToAward.push('streak_7_days')
    if (newStreak === 30) badgesToAward.push('streak_30_days')
    if (newStreak === 100) badgesToAward.push('streak_100_days')

    console.log(`✅ Daily check-in: User ${user.id}, Streak: ${newStreak}, XP: ${xpAwarded}`)

    return new Response(
      JSON.stringify({
        success: true,
        newStreak,
        xpAwarded,
        streakBroken,
        longestStreak: Math.max(newStreak, longestStreak),
        badgesAwarded: badgesToAward
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in handle-daily-checkin:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
