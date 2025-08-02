// © 2025 Joseph MULÉ – M1SSION™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  title: string;
  body: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, data, targetUserId } = await req.json() as NotificationRequest & { targetUserId?: string };

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Titolo e messaggio sono obbligatori' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determina target type
    const targetType = targetUserId ? 'user' : 'all';

    // Salva log iniziale
    const { data: logData, error: logError } = await supabase
      .from('push_notification_logs')
      .insert({
        title: title.trim(),
        message: body.trim(),
        target_type: targetType,
        target_user_id: targetUserId || null,
        status: 'pending',
        metadata: {
          data: data || {},
          timestamp: new Date().toISOString(),
          source: 'admin_push_test'
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating push log:', logError);
    }

    const logId = logData?.id;

    // Get device tokens based on target
    let deviceTokensQuery = supabase
      .from('device_tokens')
      .select('token, user_id')
      .eq('device_type', 'web_push');

    if (targetUserId) {
      deviceTokensQuery = deviceTokensQuery.eq('user_id', targetUserId);
    }

    const { data: deviceTokens, error: fetchError } = await deviceTokensQuery;

    if (fetchError) {
      console.error('Error fetching device tokens:', fetchError);
      
      // Aggiorna log con errore
      if (logId) {
        await supabase
          .from('push_notification_logs')
          .update({
            status: 'failed',
            error_message: `Error fetching devices: ${fetchError.message}`,
            devices_sent: 0
          })
          .eq('id', logId);
      }

      return new Response(
        JSON.stringify({ error: 'Errore nel recupero dei dispositivi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      // Aggiorna log con nessun dispositivo
      if (logId) {
        await supabase
          .from('push_notification_logs')
          .update({
            status: 'sent',
            devices_sent: 0,
            sent_at: new Date().toISOString()
          })
          .eq('id', logId);
      }

      return new Response(
        JSON.stringify({ 
          sent: 0, 
          message: 'Nessun dispositivo registrato',
          targetType,
          targetUserId: targetUserId || null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Send push notification to each device
    for (const device of deviceTokens) {
      try {
        const subscription = JSON.parse(device.token);
        
        const payload = JSON.stringify({
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: {
            url: '/notifications',
            ...data
          }
        });

        // Here you would typically use Web Push library
        // For now, we'll simulate sending (in production, integrate with web-push npm package)
        console.log(`Sending notification to user ${device.user_id}:`, payload);
        
        // Save notification to database for in-app display
        await supabase
          .from('user_notifications')
          .insert({
            user_id: device.user_id,
            title,
            message: body,
            type: 'push',
            is_read: false
          });

        sentCount++;
      } catch (error) {
        console.error('Error sending to device:', error);
        errors.push(`Error sending to user ${device.user_id}: ${error.message}`);
      }
    }

    // Aggiorna log finale
    if (logId) {
      await supabase
        .from('push_notification_logs')
        .update({
          status: sentCount > 0 ? 'sent' : 'failed',
          devices_sent: sentCount,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          sent_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({ 
        sent: sentCount,
        total: deviceTokens.length,
        errors: errors.length > 0 ? errors : undefined,
        targetType,
        targetUserId: targetUserId || null,
        logId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})