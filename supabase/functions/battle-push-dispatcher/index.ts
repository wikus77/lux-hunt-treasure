/**
 * TRON BATTLE - Push Notification Dispatcher
 * Reads unconsumed battle_notifications and sends via webpush-targeted-send
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BattleNotification {
  id: string;
  user_id_target: string;
  type: string;
  payload: {
    title: string;
    body: string;
    url: string;
    [key: string]: any;
  };
  dedupe_key?: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const pushAdminToken = Deno.env.get('PUSH_ADMIN_TOKEN')!;

    if (!supabaseServiceKey || !pushAdminToken) {
      console.error(JSON.stringify({
        function: 'battle-push-dispatcher',
        phase: 'init',
        action: 'error',
        error: 'Missing env vars',
        timestamp: new Date().toISOString()
      }));
      return Response.json({ error: 'Configuration error' }, { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(JSON.stringify({
      function: 'battle-push-dispatcher',
      phase: 'start',
      action: 'fetch_unconsumed',
      timestamp: new Date().toISOString()
    }));

    // 1. Fetch unconsumed notifications (limit 100)
    const { data: notifications, error: fetchError } = await supabase
      .from('battle_notifications')
      .select('*')
      .eq('consumed', false)
      .order('created_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error(JSON.stringify({
        function: 'battle-push-dispatcher',
        phase: 'fetch',
        action: 'error',
        error: fetchError.message,
        timestamp: new Date().toISOString()
      }));
      return Response.json({ error: 'DB error', details: fetchError.message }, { status: 500, headers: corsHeaders });
    }

    if (!notifications || notifications.length === 0) {
      console.log(JSON.stringify({
        function: 'battle-push-dispatcher',
        phase: 'complete',
        action: 'no_notifications',
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }));
      return Response.json({ success: true, processed: 0, message: 'No notifications to send' }, { headers: corsHeaders });
    }

    console.log(JSON.stringify({
      function: 'battle-push-dispatcher',
      phase: 'processing',
      action: 'group_by_user',
      total_notifications: notifications.length,
      timestamp: new Date().toISOString()
    }));

    // 2. Group notifications by user_id_target
    const notificationsByUser = new Map<string, BattleNotification[]>();
    
    for (const notif of notifications as BattleNotification[]) {
      const existing = notificationsByUser.get(notif.user_id_target) || [];
      existing.push(notif);
      notificationsByUser.set(notif.user_id_target, existing);
    }

    console.log(JSON.stringify({
      function: 'battle-push-dispatcher',
      phase: 'processing',
      action: 'grouped',
      unique_users: notificationsByUser.size,
      timestamp: new Date().toISOString()
    }));

    let totalSent = 0;
    let totalFailed = 0;
    const errors: Array<{ user_id: string; error: string }> = [];

    // 3. Send push for each user (use most recent or priority notification)
    for (const [userId, userNotifications] of notificationsByUser.entries()) {
      try {
        // Priority: defense_needed > attack_started > battle_resolved
        const priorityOrder = ['defense_needed', 'attack_started', 'battle_resolved'];
        const sortedNotifs = userNotifications.sort((a, b) => {
          const aPriority = priorityOrder.indexOf(a.type);
          const bPriority = priorityOrder.indexOf(b.type);
          if (aPriority !== bPriority) {
            return aPriority === -1 ? 1 : (bPriority === -1 ? -1 : aPriority - bPriority);
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const selectedNotif = sortedNotifs[0];
        const payload = selectedNotif.payload;

        // Validate payload
        if (!payload.title || !payload.body) {
          console.error(JSON.stringify({
            function: 'battle-push-dispatcher',
            phase: 'send',
            action: 'invalid_payload',
            user_id: userId,
            notification_id: selectedNotif.id,
            timestamp: new Date().toISOString()
          }));
          totalFailed++;
          continue;
        }

        // 4. Call webpush-targeted-send
        const pushResponse = await fetch(`${supabaseUrl}/functions/v1/webpush-targeted-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': pushAdminToken,
          },
          body: JSON.stringify({
            user_ids: [userId],
            payload: {
              title: payload.title,
              body: payload.body,
              url: payload.url || '/map-3d-tiler',
              image: payload.image,
              extra: payload.extra || {},
            },
          }),
        });

        const pushResult = await pushResponse.json();

        if (pushResponse.ok && pushResult.success) {
          totalSent += pushResult.sent || 0;
          
          // 5. Mark all notifications for this user as consumed
          const notifIds = userNotifications.map(n => n.id);
          const { error: updateError } = await supabase
            .from('battle_notifications')
            .update({ consumed: true })
            .in('id', notifIds);

          if (updateError) {
            console.error(JSON.stringify({
              function: 'battle-push-dispatcher',
              phase: 'update',
              action: 'mark_consumed_error',
              user_id: userId,
              error: updateError.message,
              timestamp: new Date().toISOString()
            }));
          } else {
            console.log(JSON.stringify({
              function: 'battle-push-dispatcher',
              phase: 'send',
              action: 'success',
              user_id: userId,
              notification_count: notifIds.length,
              sent: pushResult.sent,
              timestamp: new Date().toISOString()
            }));
          }
        } else {
          totalFailed++;
          errors.push({
            user_id: userId,
            error: pushResult.error || 'Unknown push error',
          });
          console.error(JSON.stringify({
            function: 'battle-push-dispatcher',
            phase: 'send',
            action: 'push_failed',
            user_id: userId,
            error: pushResult.error,
            timestamp: new Date().toISOString()
          }));
        }

      } catch (error) {
        totalFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ user_id: userId, error: errorMsg });
        console.error(JSON.stringify({
          function: 'battle-push-dispatcher',
          phase: 'send',
          action: 'exception',
          user_id: userId,
          error: errorMsg,
          timestamp: new Date().toISOString()
        }));
      }
    }

    const duration = Date.now() - startTime;

    console.log(JSON.stringify({
      function: 'battle-push-dispatcher',
      phase: 'complete',
      action: 'summary',
      user_count: notificationsByUser.size,
      sent: totalSent,
      failed: totalFailed,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    }));

    return Response.json(
      {
        success: true,
        processed: notifications.length,
        unique_users: notificationsByUser.size,
        sent: totalSent,
        failed: totalFailed,
        errors: errors.slice(0, 5), // Limit error details
        duration_ms: duration,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error(JSON.stringify({
      function: 'battle-push-dispatcher',
      phase: 'error',
      action: 'unhandled_exception',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }));

    return Response.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500, headers: corsHeaders }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
