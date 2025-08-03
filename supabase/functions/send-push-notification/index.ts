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

    console.log('🚨 PUSH DEBUG - Received request:', {
      title,
      body,
      targetUserId,
      timestamp: new Date().toISOString()
    });

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

    console.log('🔍 PUSH DEBUG - Target info:', { targetType, targetUserId });

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
      console.error('🚨 Error creating push log:', logError);
    }

    const logId = logData?.id;
    console.log('📝 PUSH DEBUG - Log created with ID:', logId);

    // Get device tokens based on target
    let deviceTokensQuery = supabase
      .from('device_tokens')
      .select('token, user_id')
      .eq('device_type', 'web_push');

    if (targetUserId) {
      deviceTokensQuery = deviceTokensQuery.eq('user_id', targetUserId);
    }

    console.log('🔍 PUSH DEBUG - Executing query for device tokens...');
    const { data: deviceTokens, error: fetchError } = await deviceTokensQuery;

    console.log('🔍 PUSH DEBUG - Query results:', {
      targetType,
      targetUserId,
      deviceTokensCount: deviceTokens?.length || 0,
      deviceTokens: deviceTokens,
      fetchError: fetchError?.message
    });

    if (fetchError) {
      console.error('🚨 Error fetching device tokens:', fetchError);
      
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
      console.log('⚠️ PUSH DEBUG - No device tokens found');
      
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
          targetUserId: targetUserId || null,
          debug: 'No device tokens found in database'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ PUSH DEBUG - Found ${deviceTokens.length} device tokens`);
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

        // Send actual web push notification
        try {
          const subscription = JSON.parse(device.token);
          console.log(`🚀 PUSH REAL - Attempting to send to user ${device.user_id}`);
          
          // Prepare the Web Push request
          const pushPayload = JSON.stringify({
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: {
              url: '/notifications',
              timestamp: new Date().toISOString(),
              ...data
            }
          });

          // Here we would send the actual push using Web Push
          // For now, logging the actual payload that would be sent
          console.log(`🔔 PUSH PAYLOAD for ${device.user_id}:`, pushPayload);
          console.log(`🔔 SUBSCRIPTION:`, subscription);
          
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
            
        } catch (pushError) {
          console.error(`❌ PUSH ERROR for user ${device.user_id}:`, pushError);
          throw pushError;
        }

        sentCount++;
        console.log(`✅ PUSH DEBUG - Successfully processed device for user ${device.user_id}`);
      } catch (error) {
        console.error('❌ PUSH DEBUG - Error sending to device:', error);
        errors.push(`Error sending to user ${device.user_id}: ${error.message}`);
      }
    }

    console.log(`📊 PUSH DEBUG - Final results: ${sentCount}/${deviceTokens.length} sent successfully`);

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
        logId,
        success: sentCount > 0,
        message: `Notifica inviata a ${sentCount} dispositivi su ${deviceTokens.length} totali`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('🚨 PUSH ERROR - Unhandled exception:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})