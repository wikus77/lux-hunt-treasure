// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationPayload {
  title: string;
  body: string;
  link?: string;
  user_ids?: string[];
  all_users?: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, body, link = 'https://m1ssion.eu/', user_ids, all_users } = await req.json() as PushNotificationPayload;

    console.log('🔔 Send push request:', { title, body, link, user_ids, all_users });

    // Get VAPID keys from secrets
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'mailto:admin@m1ssion.eu';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Build query for subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (!all_users && user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error: fetchError } = await query;
    
    if (fetchError) {
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📱 Found ${subscriptions.length} push subscriptions`);

    // Prepare push payload
    const pushPayload = JSON.stringify({
      title,
      body,
      link,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png'
    });

    // Send push notifications using web-push
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Use Deno's built-in WebCrypto for web-push
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          };

          // Create VAPID headers
          const vapidHeaders = {
            'Authorization': `WebPush ${vapidPrivateKey}`,
            'Crypto-Key': `p256ecdsa=${vapidPublicKey}`,
            'Content-Type': 'application/octet-stream',
            'TTL': '86400'
          };

          // Send push notification
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: vapidHeaders,
            body: pushPayload
          });

          if (!response.ok) {
            if (response.status === 410 || response.status === 404) {
              // Subscription expired, remove it
              console.log(`🗑️ Removing expired subscription: ${sub.endpoint}`);
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
              return { success: false, reason: 'subscription_expired' };
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          console.log(`✅ Push sent successfully to ${sub.platform} device`);
          return { success: true };

        } catch (error) {
          console.error(`❌ Push failed for subscription ${sub.id}:`, error);
          return { success: false, error: error.message };
        }
      })
    );

    // Count results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`📊 Push notification results: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: subscriptions.length,
        sent: successful,
        failed,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'rejected' })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Send push error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});