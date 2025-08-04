// © 2025 Joseph MULÉ – M1SSION™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Firebase REST API for push notifications
async function getFirebaseAccessToken(): Promise<string> {
  const privateKey = (Deno.env.get('FIREBASE_PRIVATE_KEY') || "").replace(/\\n/g, '\n');
  const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL') || "";
  
  console.log('🔑 Checking Firebase credentials...');
  console.log('📧 Client email:', clientEmail ? 'Present' : 'Missing');
  console.log('🔐 Private key:', privateKey ? `Present (${privateKey.length} chars)` : 'Missing');
  console.log('🔍 Email starts with:', clientEmail ? clientEmail.substring(0, 20) + '...' : 'N/A');
  console.log('🔍 Key starts with:', privateKey ? privateKey.substring(0, 50) + '...' : 'N/A');
  
  if (!privateKey || !clientEmail) {
    throw new Error('Firebase credentials not configured');
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

  // Import private key - gestisci correttamente newline e spazi
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '\n')  // Converte \\n in veri newline
    .replace(/\s+/g, '')    // Rimuove tutti gli spazi e newline
    .replace(/\n/g, '');    // Rimuove tutti i newline rimanenti
  
  console.log(`🔍 Key processing - original length: ${privateKey.length}, processed length: ${keyData.length}`);
  console.log(`🔍 Key starts with: ${keyData.substring(0, 50)}...`);
  
  let binaryKey;
  try {
    binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    console.log(`✅ Key decode successful - binary length: ${binaryKey.length}`);
  } catch (decodeError) {
    console.error(`❌ Key decode failed:`, decodeError);
    throw new Error(`Private key decode failed: ${decodeError.message}`);
  }
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign JWT
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  const jwt = `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function sendFirebasePush(fcmToken: string, title: string, body: string): Promise<boolean> {
  try {
    const accessToken = await getFirebaseAccessToken();
    
    const message = {
      message: {
        token: fcmToken,
        notification: { title, body },
        webpush: {
          notification: {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            requireInteraction: true,
            sound: 'default',
            tag: 'mission-notification',
            data: {
              url: '/notifications',
              click_action: '/notifications'
            }
          },
          fcm_options: { link: '/notifications' }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
                sound: 'default'
              },
              badge: 1,
              sound: 'default',
              'content-available': 1,
              'mutable-content': 1
            }
          },
          fcm_options: {
            image: '/icons/icon-192x192.png'
          }
        },
        android: {
          notification: {
            title,
            body,
            icon: 'ic_notification',
            sound: 'default',
            priority: 'high',
            visibility: 'public',
            channel_id: 'mission_notifications'
          },
          priority: 'high',
          data: {
            click_action: '/notifications'
          }
        }
      }
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/m1ssion-app/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }
    );

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('❌ Firebase push failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });
      return false;
    }

    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ Firebase push sent successfully:', {
        messageId: responseData.name,
        response: responseData
      });
    } catch (e) {
      console.log('✅ Firebase push sent successfully (non-JSON response):', responseText);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firebase push error:', error);
    return false;
  }
}

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

    // Send REAL Firebase push notifications
    for (const device of deviceTokens) {
      try {
        // Parse the Web Push subscription to extract FCM token
        let fcmToken;
        try {
          const subscription = JSON.parse(device.token);
          const endpoint = subscription.endpoint;
          console.log('🔍 PUSH DEBUG - Raw endpoint:', endpoint);
          
          // Extract FCM token from endpoint
          if (endpoint.includes('fcm.googleapis.com/fcm/send/')) {
            // Estrai il token FCM completo dall'endpoint
            const tokenPart = endpoint.replace('https://fcm.googleapis.com/fcm/send/', '');
            fcmToken = tokenPart; // Il token è tutto quello che segue dopo /send/
            console.log(`🔑 FCM token extracted (${fcmToken.length} chars):`, fcmToken.substring(0, 30) + '...');
          } else {
            console.warn(`⚠️ Non-FCM endpoint for user ${device.user_id}:`, endpoint);
            continue;
          }
        } catch (parseError) {
          console.error(`❌ Error parsing token for user ${device.user_id}:`, parseError);
          continue;
        }

        console.log(`🚀 REAL PUSH - Sending to FCM token: ${fcmToken?.substring(0, 20)}...`);

        // Send real Firebase push notification
        const pushSuccess = await sendFirebasePush(fcmToken, title, body);
        
        if (!pushSuccess) {
          console.warn(`⚠️ Firebase push failed for user ${device.user_id}`);
          errors.push(`Firebase push failed for user ${device.user_id}`);
        }
        
        // Save notification to database for in-app display
        await supabase
          .from('user_notifications')
          .insert({
            user_id: device.user_id,
            title,
            message: body,
            type: 'push',
            is_read: false,
            metadata: {
              source: 'admin_push_real',
              sent_at: new Date().toISOString(),
              push_result: pushSuccess ? 'firebase_sent' : 'firebase_failed',
              fcm_token_preview: fcmToken?.substring(0, 20) + '...'
            }
          });

        sentCount++;
        console.log(`✅ REAL PUSH - Successfully sent to user ${device.user_id}`);
      } catch (error) {
        console.error('❌ REAL PUSH - Error sending to device:', error);
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
});