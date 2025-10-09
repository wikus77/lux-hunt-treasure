// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 [NORAH PROACTIVE] Starting analysis...');

    // 1. Get users with recent activity (last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: activeUsers, error: usersError } = await supabaseClient
      .from('agent_clues')
      .select('user_id')
      .gte('created_at', yesterday)
      .limit(100);

    if (usersError) {
      console.error('Error fetching active users:', usersError);
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const uniqueUserIds = [...new Set(activeUsers?.map(u => u.user_id) || [])];
    console.log(`📊 Found ${uniqueUserIds.length} active users`);

    let notificationsSent = 0;

    // 2. Analyze each user
    for (const userId of uniqueUserIds) {
      try {
        // Get user's clues
        const { data: clues } = await supabaseClient
          .from('agent_clues')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!clues || clues.length < 3) continue;

        // Get FCM token
        const { data: tokens } = await supabaseClient
          .from('push_tokens')
          .select('token')
          .eq('user_id', userId)
          .eq('platform', 'web')
          .limit(1);

        if (!tokens || tokens.length === 0) continue;

        // Simple pattern detection: if user has 3+ clues in last 24h
        const recentClues = clues.filter(c => 
          new Date(c.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (recentClues.length >= 3) {
          // Check if we already sent this type of notification recently
          const { data: recentNotifs } = await supabaseClient
            .from('norah_proactive_notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('notification_type', 'pattern_found')
            .gte('sent_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString());

          if (recentNotifs && recentNotifs.length > 0) {
            console.log(`⏭️ User ${userId} already received pattern notification recently`);
            continue;
          }

          // Send proactive notification
          const notificationTitle = '🔍 Ho trovato un pattern!';
          const notificationBody = `Analizzando i tuoi ultimi ${recentClues.length} indizi, ho individuato correlazioni interessanti. Parliamone?`;

          // Call FCM config endpoint
          const fcmConfigResp = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/fcm-config');
          const fcmConfig = await fcmConfigResp.json();

          // Send via FCM
          const fcmResp = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `key=${fcmConfig.serverKey}`
            },
            body: JSON.stringify({
              to: tokens[0].token,
              notification: {
                title: notificationTitle,
                body: notificationBody,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'norah-proactive',
                requireInteraction: true
              },
              data: {
                type: 'norah_proactive',
                notification_type: 'pattern_found',
                deepLink: '/intel'
              }
            })
          });

          if (fcmResp.ok) {
            // Log notification
            await supabaseClient
              .from('norah_proactive_notifications')
              .insert({
                user_id: userId,
                notification_type: 'pattern_found',
                title: notificationTitle,
                body: notificationBody,
                payload: {
                  clues_count: recentClues.length,
                  deepLink: '/intel'
                }
              });

            notificationsSent++;
            console.log(`✅ Sent pattern notification to user ${userId}`);
          }
        }

      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        continue;
      }
    }

    console.log(`🎉 [NORAH PROACTIVE] Completed. Sent ${notificationsSent} notifications.`);

    return new Response(JSON.stringify({ 
      success: true, 
      users_analyzed: uniqueUserIds.length,
      notifications_sent: notificationsSent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [NORAH PROACTIVE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
