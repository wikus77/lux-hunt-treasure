// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT NOTIFY - Send push notifications when Final Shoot becomes available
// Called by CRON 7 days before mission end

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 [FINAL-SHOOT-NOTIFY] Starting notification process...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // VAPID keys for web push
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@m1ssion.eu'

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    // Check if there's an active mission ending in exactly 7 days
    const { data: mission, error: missionError } = await supabase
      .from('current_mission_data')
      .select('id, mission_name, mission_ends_at, mission_status, linked_mission_id')
      .eq('mission_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (missionError || !mission) {
      console.log('🎯 [FINAL-SHOOT-NOTIFY] No active mission found')
      return new Response(
        JSON.stringify({ success: true, message: 'No active mission' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if mission ends in ~7 days (with 12h tolerance)
    const endsAt = new Date(mission.mission_ends_at)
    const now = new Date()
    const daysUntilEnd = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    console.log('🎯 [FINAL-SHOOT-NOTIFY] Mission ends in', daysUntilEnd, 'days')

    // Only send notification if exactly 7 days remain (with some tolerance)
    if (daysUntilEnd !== 7) {
      console.log('🎯 [FINAL-SHOOT-NOTIFY] Not the right day for notification')
      return new Response(
        JSON.stringify({ success: true, message: `Mission ends in ${daysUntilEnd} days, not 7` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all enrolled users for this mission
    const { data: enrollments, error: enrollError } = await supabase
      .from('mission_enrollments')
      .select('user_id')
      .eq('mission_id', mission.linked_mission_id || mission.id)
      .eq('status', 'active')

    if (enrollError || !enrollments || enrollments.length === 0) {
      console.log('🎯 [FINAL-SHOOT-NOTIFY] No enrolled users found')
      return new Response(
        JSON.stringify({ success: true, message: 'No enrolled users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userIds = enrollments.map(e => e.user_id)
    console.log('🎯 [FINAL-SHOOT-NOTIFY] Found', userIds.length, 'enrolled users')

    // Get push subscriptions for enrolled users
    const { data: subscriptions, error: subError } = await supabase
      .from('webpush_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log('🎯 [FINAL-SHOOT-NOTIFY] No push subscriptions found')
      return new Response(
        JSON.stringify({ success: true, message: 'No push subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🎯 [FINAL-SHOOT-NOTIFY] Found', subscriptions.length, 'subscriptions')

    // Prepare notification payload
    const payload = JSON.stringify({
      title: '🎯 FINAL SHOOT ATTIVO!',
      body: 'Hai 7 giorni per trovare il premio! Tocca per aprire la mappa.',
      icon: '/icons/192.png',
      badge: '/icons/72.png',
      tag: 'final-shoot-available',
      data: {
        url: '/map-3d-tiler',
        type: 'final_shoot',
        mission_id: mission.linked_mission_id || mission.id,
      },
      actions: [
        { action: 'open', title: 'Apri Mappa' },
        { action: 'dismiss', title: 'Ignora' },
      ],
    })

    // Send notifications
    let successCount = 0
    let failCount = 0
    const expiredEndpoints: string[] = []

    for (const sub of subscriptions) {
      try {
        // Extract keys from JSONB
        const keys = sub.keys || {}
        const p256dh = keys.p256dh || sub.p256dh
        const auth = keys.auth || sub.auth

        if (!p256dh || !auth || !sub.endpoint) {
          console.warn('🎯 [FINAL-SHOOT-NOTIFY] Invalid subscription:', sub.id)
          failCount++
          continue
        }

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh, auth },
        }

        await webpush.sendNotification(pushSubscription, payload)
        successCount++
      } catch (error: any) {
        failCount++
        // Mark expired endpoints for cleanup
        if (error.statusCode === 410 || error.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint)
        }
      }
    }

    // Cleanup expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('webpush_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
      console.log('🎯 [FINAL-SHOOT-NOTIFY] Cleaned up', expiredEndpoints.length, 'expired subscriptions')
    }

    console.log('🎯 [FINAL-SHOOT-NOTIFY] Complete:', { successCount, failCount })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Final Shoot notifications sent`,
        stats: {
          enrolled_users: userIds.length,
          subscriptions: subscriptions.length,
          sent: successCount,
          failed: failCount,
          cleaned: expiredEndpoints.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ [FINAL-SHOOT-NOTIFY] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})








