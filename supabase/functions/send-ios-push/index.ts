// © 2025 Joseph MULÉ – M1SSION™ - iOS Push Notifications with Apple Push Service
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64urlEncode } from "https://deno.land/std@0.168.0/encoding/base64url.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  title: string;
  body: string;
  data?: any;
  targetUserId?: string;
}

// Helper function to create JWT for Apple Push Service
async function createAppleJWT(teamId: string, keyId: string, privateKey: string): Promise<string> {
  const header = {
    alg: "ES256",
    kid: keyId,
    typ: "JWT"
  };

  const payload = {
    iss: teamId,
    iat: Math.floor(Date.now() / 1000)
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));

  const data = `${headerB64}.${payloadB64}`;
  
  // Import private key
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    cryptoKey,
    new TextEncoder().encode(data)
  );

  const signatureB64 = base64urlEncode(new Uint8Array(signature));
  return `${data}.${signatureB64}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, data, targetUserId } = await req.json() as NotificationRequest;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Apple Push config from database
    const { data: appleConfig, error: configError } = await supabase
      .from('apple_push_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (configError || !appleConfig) {
      console.error('Apple Push config not found:', configError);
      return new Response(
        JSON.stringify({ error: 'Apple Push configuration not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for device tokens (iOS Web Push endpoints)
    let query = supabase
      .from('device_tokens')
      .select('token, user_id')
      .eq('device_type', 'web_push');

    // Filter by user if specified
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: deviceTokens, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching device tokens:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error fetching device tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No registered devices' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Apple JWT token
    const jwtToken = await createAppleJWT(
      appleConfig.team_id,
      appleConfig.key_id,
      appleConfig.private_key
    );

    let sentCount = 0;
    let failedCount = 0;
    const results: any[] = [];

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
      }
    };

    // Send push notifications
    for (const device of deviceTokens) {
      try {
        const subscription = JSON.parse(device.token);
        
        // Check if this is an Apple endpoint
        const isAppleEndpoint = subscription.endpoint?.includes('web.push.apple.com');
        
        if (isAppleEndpoint) {
          // Use Apple Push Service
          const pushResponse = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
              'apns-topic': appleConfig.bundle_id,
              'apns-push-type': 'alert'
            },
            body: JSON.stringify({
              aps: {
                alert: {
                  title: notificationPayload.title,
                  body: notificationPayload.body
                },
                badge: 1,
                sound: 'default'
              },
              data: notificationPayload.data
            })
          });

          const result = {
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            success: pushResponse.ok,
            status: pushResponse.status,
            user_id: device.user_id
          };

          if (pushResponse.ok) {
            sentCount++;
            console.log(`✅ iOS Push sent successfully to user ${device.user_id}`);
          } else {
            failedCount++;
            const errorText = await pushResponse.text();
            result.error = errorText;
            console.error(`❌ iOS Push failed for user ${device.user_id}:`, errorText);
          }

          results.push(result);
        } else {
          // For non-Apple endpoints, you would use VAPID here
          console.log(`⚠️ Non-Apple endpoint, skipping: ${subscription.endpoint.substring(0, 50)}...`);
        }

        // Save notification to database
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

      } catch (error) {
        failedCount++;
        console.error(`❌ Error processing device for user ${device.user_id}:`, error);
        results.push({
          endpoint: 'unknown',
          success: false,
          error: error.message,
          user_id: device.user_id
        });
      }
    }

    console.log(`🚀 iOS Push campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: deviceTokens.length,
        results,
        apple_config_used: {
          team_id: appleConfig.team_id,
          key_id: appleConfig.key_id,
          bundle_id: appleConfig.bundle_id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ iOS Push error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});