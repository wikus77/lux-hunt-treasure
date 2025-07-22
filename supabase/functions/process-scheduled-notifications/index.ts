// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Process Scheduled Push Notifications (called by cron job)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        // Get user's push token
        const { data: deviceTokens } = await supabase
          .from('device_tokens')
          .select('token')
          .eq('user_id', notification.user_id)
          .eq('device_type', 'web_push');

        if (deviceTokens && deviceTokens.length > 0) {
          // Send push notification for each device
          for (const device of deviceTokens) {
            try {
              // Parse the subscription object
              const subscription = JSON.parse(device.token);
              
              // In production, you would use web-push library here
              // For now, we'll create an in-app notification
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

              console.log(`📱 Sent notification to user ${notification.user_id}: ${notification.title}`);
            } catch (deviceError) {
              console.error('Error sending to device:', deviceError);
              errors.push(`Device error for user ${notification.user_id}: ${deviceError.message}`);
            }
          }
        } else {
          // Still create in-app notification even without push token
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

          console.log(`📧 Created in-app notification for user ${notification.user_id}: ${notification.title}`);
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