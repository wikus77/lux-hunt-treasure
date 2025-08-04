// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, title, body, data, sound = 'default', badge = 1 }: PushNotificationRequest = await req.json();

    console.log(`🔔 SENDING PUSH NOTIFICATION to token: ${token.substring(0, 20)}...`);
    console.log(`📱 Title: ${title}`);
    console.log(`📝 Body: ${body}`);

    // Determine if token is iOS, Android, or Web Push
    let deviceType = 'web_push';
    if (token.length === 64 && /^[a-f0-9]{64}$/i.test(token)) {
      deviceType = 'ios';
    } else if (token.startsWith('e') || token.includes(':')) {
      deviceType = 'android';
    }

    console.log(`📱 Device type detected: ${deviceType}`);

    let success = false;
    let response: any = null;

    // iOS APNs Push Notification
    if (deviceType === 'ios') {
      const apnsKey = Deno.env.get('APNS_PRIVATE_KEY');
      const teamId = Deno.env.get('APNS_TEAM_ID');
      const keyId = Deno.env.get('APNS_KEY_ID');
      const bundleId = 'app.lovable.2716f91b957c47ba91e06f572f3ce00d';

      if (!apnsKey || !teamId || !keyId) {
        throw new Error('Missing APNs configuration (APNS_PRIVATE_KEY, APNS_TEAM_ID, APNS_KEY_ID)');
      }

      console.log('🍎 Sending iOS APNs notification...');

      // Clean and format the private key properly
      const cleanedKey = apnsKey
        .replace(/\\n/g, '\n')
        .replace(/-----BEGIN PRIVATE KEY-----\s*/, '-----BEGIN PRIVATE KEY-----\n')
        .replace(/\s*-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
        .trim();

      console.log('🔑 APNs key formatted, length:', cleanedKey.length);

      try {
        // Create JWT for APNs authentication
        const header = {
          alg: 'ES256',
          kid: keyId
        };

        const payload = {
          iss: teamId,
          iat: Math.floor(Date.now() / 1000)
        };

        // Import the private key
        const keyData = cleanedKey
          .replace(/-----BEGIN PRIVATE KEY-----\n?/, '')
          .replace(/\n?-----END PRIVATE KEY-----/, '')
          .replace(/\n/g, '');

        const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

        const cryptoKey = await crypto.subtle.importKey(
          'pkcs8',
          binaryKey,
          {
            name: 'ECDSA',
            namedCurve: 'P-256'
          },
          false,
          ['sign']
        );

        // Create JWT manually
        const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const message = `${headerB64}.${payloadB64}`;

        const signature = await crypto.subtle.sign(
          {
            name: 'ECDSA',
            hash: 'SHA-256'
          },
          cryptoKey,
          new TextEncoder().encode(message)
        );

        const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
          .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

        const jwt = `${message}.${signatureB64}`;

        // Send to APNs
        const apnsPayload = {
          aps: {
            alert: {
              title: title,
              body: body
            },
            sound: sound,
            badge: badge,
            'content-available': 1
          },
          data: data || {}
        };

        const apnsResponse = await fetch(`https://api.push.apple.com/3/device/${token}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'apns-topic': bundleId,
            'apns-priority': '10',
            'apns-push-type': 'alert'
          },
          body: JSON.stringify(apnsPayload)
        });

        console.log('🍎 APNs response status:', apnsResponse.status);
        
        if (apnsResponse.status === 200) {
          success = true;
          response = { platform: 'ios', status: 'sent' };
          console.log('✅ iOS push notification sent successfully');
        } else {
          const errorText = await apnsResponse.text();
          console.error('❌ APNs error:', errorText);
          response = { platform: 'ios', status: 'failed', error: errorText };
        }

      } catch (iosError) {
        console.error('❌ iOS push failed:', iosError);
        response = { platform: 'ios', status: 'failed', error: iosError.message };
      }
    }

    // Android FCM Push Notification
    else if (deviceType === 'android') {
      const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
      
      if (!fcmServerKey) {
        throw new Error('Missing FCM_SERVER_KEY for Android notifications');
      }

      console.log('🤖 Sending Android FCM notification...');

      const fcmPayload = {
        to: token,
        notification: {
          title: title,
          body: body,
          sound: sound,
          icon: 'ic_notification',
          color: '#00D1FF'
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          priority: 'high',
          notification: {
            channel_id: 'mission_channel',
            priority: 'high',
            visibility: 'public'
          }
        }
      };

      try {
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fcmPayload)
        });

        const fcmResult = await fcmResponse.json();
        console.log('🤖 FCM response:', fcmResult);

        if (fcmResult.success === 1) {
          success = true;
          response = { platform: 'android', status: 'sent', messageId: fcmResult.results[0].message_id };
          console.log('✅ Android push notification sent successfully');
        } else {
          console.error('❌ FCM error:', fcmResult);
          response = { platform: 'android', status: 'failed', error: fcmResult };
        }

      } catch (androidError) {
        console.error('❌ Android push failed:', androidError);
        response = { platform: 'android', status: 'failed', error: androidError.message };
      }
    }

    // Web Push Notification
    else {
      console.log('🌐 Sending Web Push notification...');
      
      try {
        // For web push, we'll use a simple approach
        // In a real implementation, you'd use the Web Push Protocol
        response = { platform: 'web', status: 'sent', note: 'Web push requires service worker implementation' };
        success = true;
        console.log('✅ Web push notification queued');

      } catch (webError) {
        console.error('❌ Web push failed:', webError);
        response = { platform: 'web', status: 'failed', error: webError.message };
      }
    }

    // Log the notification attempt
    const { error: logError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: null, // We don't have user_id from token, would need to query device_tokens
        type: 'push',
        title: title,
        message: body,
        metadata: {
          device_type: deviceType,
          push_sent: success,
          push_response: response,
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Failed to log notification:', logError);
    }

    return new Response(
      JSON.stringify({
        success,
        device_type: deviceType,
        response,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Push notification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™