// © 2025 Joseph MULÉ – M1SSION™ – Weekly BUZZ MAPPA Reset Notification
// Edge Function to check and send notifications when weekly BUZZ limits reset

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Checking for users with weekly BUZZ reset...');

    // Get all users who had reached their weekly limit and need to be notified
    const { data: usersToNotify, error: queryError } = await supabase
      .from('user_weekly_buzz_limits')
      .select('user_id, buzz_map_count, max_buzz_map_allowed, next_reset_at')
      .eq('buzz_map_count', 'max_buzz_map_allowed') // Users who reached limit
      .lte('next_reset_at', new Date().toISOString()); // Past reset time

    if (queryError) {
      console.error('❌ Error querying users for notification:', queryError);
      return new Response(JSON.stringify({ error: queryError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!usersToNotify || usersToNotify.length === 0) {
      console.log('📭 No users need weekly reset notifications');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No users need notifications',
        count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📬 Found ${usersToNotify.length} users to notify about BUZZ MAPPA reset`);

    const notifications: NotificationPayload[] = [];
    const pushNotifications: any[] = [];

    // Process each user
    for (const user of usersToNotify) {
      // Get current week info
      const { data: weekStatus, error: weekError } = await supabase.rpc('get_user_weekly_buzz_status', {
        p_user_id: user.user_id
      });

      if (weekError || !weekStatus) {
        console.error(`❌ Error getting week status for user ${user.user_id}:`, weekError);
        continue;
      }

      const status = weekStatus as any;
      const newLimit = status.max_allowed || 10;

      // Create in-app notification
      notifications.push({
        user_id: user.user_id,
        title: '🔄 BUZZ MAPPA Disponibili!',
        message: `I tuoi BUZZ MAPPA settimanali sono stati ripristinati! Hai ${newLimit} BUZZ disponibili per questa settimana.`,
        type: 'buzz_reset'
      });

      // Get user's device tokens for push notifications
      const { data: deviceTokens, error: tokenError } = await supabase
        .from('device_tokens')
        .select('token, device_type')
        .eq('user_id', user.user_id);

      if (!tokenError && deviceTokens) {
        for (const device of deviceTokens) {
          pushNotifications.push({
            to: device.token,
            title: '🔄 BUZZ MAPPA Disponibili!',
            body: `I tuoi BUZZ MAPPA settimanali sono stati ripristinati! ${newLimit} BUZZ disponibili.`,
            data: {
              type: 'buzz_reset',
              user_id: user.user_id,
              new_limit: newLimit
            }
          });
        }
      }
    }

    // Insert in-app notifications
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert(notifications.map(n => ({
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          notification_type: n.type,
          is_read: false
        })));

      if (notificationError) {
        console.error('❌ Error inserting notifications:', notificationError);
      } else {
        console.log(`✅ Created ${notifications.length} in-app notifications`);
      }
    }

    // Send push notifications
    if (pushNotifications.length > 0) {
      try {
        const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: { notifications: pushNotifications }
        });

        if (pushError) {
          console.error('❌ Error sending push notifications:', pushError);
        } else {
          console.log(`✅ Sent ${pushNotifications.length} push notifications`);
        }
      } catch (pushErr) {
        console.error('❌ Exception sending push notifications:', pushErr);
      }
    }

    // Send email notifications
    if (notifications.length > 0) {
      try {
        for (const notification of notifications) {
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: notification.user_id, // Will be resolved to email by send-email function
              subject: 'BUZZ MAPPA Settimanali Ripristinati - M1SSION™',
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #070818; color: white;">
                  <h1 style="color: #00ffff;">🔄 BUZZ MAPPA Disponibili!</h1>
                  <p>${notification.message}</p>
                  <p>Accedi ora all'app per iniziare a utilizzare i tuoi nuovi BUZZ MAPPA!</p>
                  <hr style="border-color: #333;">
                  <p style="font-size: 12px; color: #999;">
                    © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
                  </p>
                </div>
              `
            }
          });

          if (emailError) {
            console.error(`❌ Error sending email to user ${notification.user_id}:`, emailError);
          }
        }
        console.log(`✅ Sent ${notifications.length} email notifications`);
      } catch (emailErr) {
        console.error('❌ Exception sending email notifications:', emailErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Weekly BUZZ reset notifications processed',
      users_notified: usersToNotify.length,
      in_app_notifications: notifications.length,
      push_notifications: pushNotifications.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in weekly-buzz-reset-notification function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);