// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// FIXED: Robust Firebase Access Token Generation
async function getFirebaseAccessToken(): Promise<string> {
  const rawPrivateKey = Deno.env.get('FIREBASE_PRIVATE_KEY') || "";
  const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL') || "";
  
  console.log('🔑 Firebase credentials check:');
  console.log('  - Email:', clientEmail ? 'Present' : 'Missing');
  console.log('  - Key length:', rawPrivateKey ? rawPrivateKey.length : 0);
  
  if (!rawPrivateKey || !clientEmail) {
    throw new Error('Firebase credentials not configured');
  }

  // FIXED: Handle ALL possible newline escape variations
  let privateKey = rawPrivateKey.trim();
  
  // Process multiple escaping levels and formats
  privateKey = privateKey
    .replace(/\\\\n/g, '\n')     // Double escaped
    .replace(/\\n/g, '\n')       // Single escaped
    .replace(/\r\n/g, '\n')      // Windows CRLF
    .replace(/\r/g, '\n')        // Mac CR
    .trim();
  
  console.log('🔧 Key processing - Final length:', privateKey.length);
  
  // Ensure proper PEM format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }
  
  // Normalize PEM structure
  privateKey = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----\s*/g, '-----BEGIN PRIVATE KEY-----\n')
    .replace(/\s*-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----')
    .replace(/\n+/g, '\n');
  
  console.log('🔍 PEM structure preview:', privateKey.substring(0, 100) + '...');
  
  // Extract base64 content with strict validation
  const pemMatch = privateKey.match(/-----BEGIN PRIVATE KEY-----\n([A-Za-z0-9+\/=\s]+)\n-----END PRIVATE KEY-----/);
  if (!pemMatch || !pemMatch[1]) {
    console.error('❌ PEM extraction failed');
    throw new Error('Invalid PEM format');
  }
  
  const base64Content = pemMatch[1].replace(/\s/g, '');
  console.log(`🔍 Base64 content: ${base64Content.length} chars, valid: ${/^[A-Za-z0-9+\/]+=*$/.test(base64Content)}`);
  
  // Decode to binary
  let binaryKey;
  try {
    binaryKey = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    console.log(`✅ Base64 decode success: ${binaryKey.length} bytes`);
  } catch (error) {
    console.error('❌ Base64 decode failed:', error);
    throw new Error(`Key decode failed: ${error.message}`);
  }
  
  // Import crypto key
  let cryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    console.log('✅ Crypto key imported successfully');
  } catch (error) {
    console.error('❌ Crypto import failed:', error);
    throw new Error(`Key import failed: ${error.message}`);
  }

  // Create JWT
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  }));

  // Sign JWT
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  const jwt = `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // Exchange for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('❌ Token exchange failed:', data);
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ Firebase access token obtained');
  return data.access_token;
}

// FIXED: OS-native push notification with iOS APNs and Android FCM
async function sendFirebasePush(token: string, title: string, body: string, deviceType: string = 'unknown'): Promise<{ success: boolean, messageId?: string, error?: string }> {
  try {
    const accessToken = await getFirebaseAccessToken();
    
    let fcmToken = token;
    
    // Extract FCM token from web push subscription
    if (token.startsWith('{') && token.includes('endpoint')) {
      try {
        const subscription = JSON.parse(token);
        if (subscription.endpoint?.includes('fcm.googleapis.com/fcm/send/')) {
          fcmToken = subscription.endpoint.replace('https://fcm.googleapis.com/fcm/send/', '');
          console.log(`🔑 FCM token extracted: ${fcmToken.substring(0, 30)}...`);
        }
      } catch (e) {
        console.warn('⚠️ Token parsing failed, using as-is');
      }
    }
    
    console.log(`🚀 SENDING PUSH - Type: ${deviceType}, Token: ${fcmToken.substring(0, 25)}...`);
    
    // FIXED: OS-native notification payload
    const message = {
      message: {
        token: fcmToken,
        notification: {
          title: title,
          body: body
        },
        // iOS APNs payload - CRITICAL for lock screen notifications
        apns: {
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert',
            'apns-topic': 'app.lovable.2716f91b957c47ba91e06f572f3ce00d'  // FIXED: Correct bundle ID from Capacitor config
          },
          payload: {
            aps: {
              alert: {
                title: title,
                body: body,
                subtitle: "M1SSION™"
              },
              sound: "default",
              badge: 1,
              'content-available': 1,
              'mutable-content': 1,
              category: 'M1SSION_ALERT'
            },
            customData: {
              source: 'm1ssion',
              url: '/notifications'
            }
          }
        },
        // Android FCM payload - CRITICAL for system notifications  
        android: {
          priority: 'high',
          ttl: '3600s',
          notification: {
            title: title,
            body: body,
            icon: 'ic_notification',
            sound: 'default',
            channel_id: 'm1ssion_notifications',
            priority: 'high',
            visibility: 'public',
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true,
            color: '#00D1FF',
            tag: 'm1ssion-push'
          },
          data: {
            source: 'm1ssion',
            url: '/notifications',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        // Web push fallback
        webpush: {
          notification: {
            title: title,
            body: body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'm1ssion-notification',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: { url: '/notifications' }
          },
          headers: {
            'TTL': '3600',
            'Urgency': 'high'
          }
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/m1ssion-app/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const responseData = JSON.parse(responseText);
      console.log(`✅ PUSH SUCCESS - ${deviceType.toUpperCase()}:`, responseData.name);
      return { success: true, messageId: responseData.name };
    } else {
      console.error(`❌ PUSH FAILED - ${deviceType.toUpperCase()}:`, response.status, responseText);
      return { success: false, error: responseText };
    }
  } catch (error) {
    console.error('❌ Push exception:', error);
    return { success: false, error: error.message };
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, targetUserId } = await req.json();

    console.log('🚨 PUSH REQUEST:', {
      title,
      body,
      targetUserId,
      timestamp: new Date().toISOString()
    });

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const targetType = targetUserId ? 'user' : 'all';
    console.log('🔍 Target:', { targetType, targetUserId });

    // Log the push attempt
    const { data: logData } = await supabase
      .from('push_notification_logs')
      .insert({
        title: title.trim(),
        message: body.trim(),
        target_type: targetType,
        target_user_id: targetUserId || null,
        status: 'pending'
      })
      .select()
      .single();

    console.log('📝 Log created:', logData?.id);

    // Get device tokens (prioritize iOS/Android over web_push)
    let deviceTokensQuery = supabase
      .from('device_tokens')
      .select('token, user_id, device_type')
      .in('device_type', ['ios', 'android', 'web_push', 'mobile']);

    if (targetUserId) {
      deviceTokensQuery = deviceTokensQuery.eq('user_id', targetUserId);
    }

    const { data: deviceTokens, error: fetchError } = await deviceTokensQuery;

    console.log('🔍 Device tokens found:', {
      count: deviceTokens?.length || 0,
      types: deviceTokens?.map(d => d.device_type)
    });

    if (fetchError) {
      console.error('❌ Device fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Device fetch failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      console.log('⚠️ No devices found');
      
      // Update log
      if (logData?.id) {
        await supabase
          .from('push_notification_logs')
          .update({ status: 'sent', devices_sent: 0 })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ 
          sent: 0, 
          message: 'No devices registered',
          targetType,
          targetUserId: targetUserId || null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];
    const results: any[] = [];

    // Send push notifications to all devices
    for (const device of deviceTokens) {
      try {
        console.log(`🚀 Sending to user ${device.user_id} (${device.device_type})`);
        
        const pushResult = await sendFirebasePush(device.token, title, body, device.device_type);
        
        results.push({
          user_id: device.user_id,
          device_type: device.device_type,
          success: pushResult.success,
          messageId: pushResult.messageId,
          error: pushResult.error
        });

        if (pushResult.success) {
          sentCount++;
          console.log(`✅ Push sent to user ${device.user_id}`);
        } else {
          console.warn(`⚠️ Push failed for user ${device.user_id}:`, pushResult.error);
          errors.push(`User ${device.user_id}: ${pushResult.error}`);
        }

        // FIXED: Save notification to user_notifications for in-app sync
        try {
          const { data: notificationData, error: notificationError } = await supabase
            .from('user_notifications')
            .insert({
              user_id: device.user_id,
              title: title,
              message: body,
              type: 'push',
              is_read: false,
              metadata: {
                push_sent: pushResult.success,
                device_type: device.device_type,
                message_id: pushResult.messageId,
                timestamp: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (notificationError) {
            console.error(`❌ Notification save error for user ${device.user_id}:`, notificationError);
          } else {
            console.log(`✅ Notification saved for user ${device.user_id}:`, notificationData?.id);
          }
        } catch (saveError) {
          console.error(`❌ Notification save exception for user ${device.user_id}:`, saveError);
        }

      } catch (error) {
        console.error(`❌ Send error for user ${device.user_id}:`, error);
        errors.push(`User ${device.user_id}: ${error.message}`);
      }
    }

    console.log(`📊 Final results: ${sentCount}/${deviceTokens.length} sent successfully`);

    // Update log with final status
    if (logData?.id) {
      await supabase
        .from('push_notification_logs')
        .update({
          status: sentCount > 0 ? 'sent' : 'failed',
          devices_sent: sentCount,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          sent_at: new Date().toISOString()
        })
        .eq('id', logData.id);
    }

    return new Response(
      JSON.stringify({ 
        sent: sentCount,
        total: deviceTokens.length,
        errors: errors.length > 0 ? errors : undefined,
        results: results,
        success: sentCount > 0,
        message: `Push sent to ${sentCount}/${deviceTokens.length} devices`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('🚨 Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});