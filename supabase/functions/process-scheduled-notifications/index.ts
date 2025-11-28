// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Process Scheduled Push Notifications (called by cron job)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Processing scheduled notifications...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get notifications that are due to be sent
    const now = new Date().toISOString();
    const { data: dueNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (fetchError) {
      console.error('Error fetching due notifications:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error fetching notifications' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!dueNotifications || dueNotifications.length === 0) {
      console.log('📭 No notifications due at this time');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No notifications due' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📬 Found ${dueNotifications.length} notifications to process`);

    let processedCount = 0;
    const errors: string[] = [];

    // Process each notification
    for (const notification of dueNotifications) {
      try {
        // Get user's webpush subscriptions (primary) and FCM tokens (fallback)
        const { data: webpushSubs } = await supabase
          .from('webpush_subscriptions')
          .select('endpoint, keys, user_id')
          .eq('user_id', notification.user_id)
          .eq('is_active', true);

        const { data: fcmTokens } = await supabase
          .from('fcm_subscriptions')
          .select('token, user_id')
          .eq('user_id', notification.user_id)
          .eq('is_active', true);

        const hasWebPush = webpushSubs && webpushSubs.length > 0;
        const hasFCM = fcmTokens && fcmTokens.length > 0;

        if (hasWebPush || hasFCM) {
          // Call webpush-targeted-send for actual push delivery
          const pushAdminToken = Deno.env.get('PUSH_ADMIN_TOKEN');
          if (pushAdminToken) {
            try {
              const pushResponse = await fetch(`${supabaseUrl}/functions/v1/webpush-targeted-send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-admin-token': pushAdminToken
                },
                body: JSON.stringify({
                  user_ids: [notification.user_id],
                  payload: {
                    title: notification.title,
                    body: notification.message,
                    url: notification.payload?.deepLink || '/notifications',
                    extra: notification.payload
                  }
                })
              });

              if (pushResponse.ok) {
                console.log(`📱 Push sent to user ${notification.user_id}: ${notification.title}`);
              } else {
                console.warn(`⚠️ Push failed for user ${notification.user_id}`);
              }
            } catch (pushError) {
              console.error('Push send error:', pushError);
            }
          }

          // Also create in-app notification
          await supabase
            .from('user_notifications')
            .insert({
              user_id: notification.user_id,
              title: notification.title,
              message: notification.message,
              type: 'push',
              is_read: false,
              payload: notification.payload
            });

          console.log(`📱 Notification sent to user ${notification.user_id}: ${notification.title}`);
        } else {
          // No push subscriptions - create in-app notification only
          await supabase
            .from('user_notifications')
            .insert({
              user_id: notification.user_id,
              title: notification.title,
              message: notification.message,
              type: 'system',
              is_read: false,
              payload: notification.payload
            });

          console.log(`📧 In-app notification for user ${notification.user_id}: ${notification.title}`);
        }

        // Mark notification as sent
        await supabase
          .from('scheduled_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        processedCount++;

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        errors.push(`Notification ${notification.id}: ${error.message}`);
        
        // Mark as failed
        await supabase
          .from('scheduled_notifications')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id);
      }
    }

    console.log(`✅ Processed ${processedCount} notifications successfully`);
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} errors occurred:`, errors);
    }

    return new Response(
      JSON.stringify({ 
        processed: processedCount,
        total: dueNotifications.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Process scheduled notifications error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™