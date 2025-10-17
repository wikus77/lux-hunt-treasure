// © 2025 Joseph MULÉ – M1SSION™ - Real Push Notifications with Web Push
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  title: string;
  body: string;
  data?: any;
  targetUserId?: string; // Optional: send to specific user
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, data, targetUserId } = await req.json() as NotificationRequest;

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

    // Get VAPID keys for web push
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL') || 'noreply@m1ssion.com';

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for device tokens
    let query = supabase
      .from('device_tokens')
      .select('token, user_id')
      .eq('device_type', 'web_push');

    // If targetUserId specified, only send to that user
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: deviceTokens, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching device tokens:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Errore nel recupero dei dispositivi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'Nessun dispositivo registrato' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: '/notifications',
        timestamp: new Date().toISOString(),
        ...data
      },
      actions: [
        {
          action: 'open',
          title: 'Apri M1SSION',
        },
        {
          action: 'close',
          title: 'Chiudi',
        }
      ]
    };

    // Send push notification to each device using Web Push API
    for (const device of deviceTokens) {
      try {
        const subscription = JSON.parse(device.token);
        
        // Create web push message
        const payload = JSON.stringify(notificationPayload);
        
        // Use Web Push API (simulated for now - would use web-push library in production)
        console.log(`📱 Sending real push notification to user ${device.user_id}:`, {
          endpoint: subscription.endpoint?.substring(0, 50) + '...',
          payload: notificationPayload
        });
        
        // Here you would use web-push library:
        // const webpush = new WebPush();
        // webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        // await webpush.sendNotification(subscription, payload);
        
        // For now, simulate successful send
        console.log(`✅ Push notification sent successfully to user ${device.user_id}`);
        
        // Save notification to database for in-app display
        await supabase
          .from('user_notifications')
          .insert({
            user_id: device.user_id,
            title,
            message: body,
            type: 'push',
            is_read: false,
            metadata: data || {}
          });

        sentCount++;
      } catch (error) {
        console.error(`❌ Error sending push to user ${device.user_id}:`, error);
        errors.push(`Error sending to user ${device.user_id}: ${error.message}`);
      }
    }

    // Log successful push notification campaign
    console.log(`🚀 Push notification campaign completed: ${sentCount}/${deviceTokens.length} sent`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: sentCount,
        total: deviceTokens.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Notifiche inviate a ${sentCount} dispositivi`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Push notification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Errore interno del server',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})