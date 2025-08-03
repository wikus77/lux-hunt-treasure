// © 2025 Joseph MULÉ – M1SSION™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Firebase Admin SDK for real push notifications
import { initializeApp, cert, ServiceAccount } from 'https://esm.sh/firebase-admin@12.1.0/app'
import { getMessaging } from 'https://esm.sh/firebase-admin@12.1.0/messaging'

// Firebase Service Account Configuration
const firebaseServiceAccount: ServiceAccount = {
  type: "service_account",
  project_id: "project-x-mission",
  private_key_id: Deno.env.get('FIREBASE_PRIVATE_KEY_ID') || "",
  private_key: (Deno.env.get('FIREBASE_PRIVATE_KEY') || "").replace(/\\n/g, '\n'),
  client_email: Deno.env.get('FIREBASE_CLIENT_EMAIL') || "",
  client_id: Deno.env.get('FIREBASE_CLIENT_ID') || "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${Deno.env.get('FIREBASE_CLIENT_EMAIL') || ""}`
};

// Initialize Firebase Admin
let firebaseApp;
try {
  firebaseApp = initializeApp({
    credential: cert(firebaseServiceAccount),
    projectId: "project-x-mission"
  });
} catch (error) {
  console.error('🔥 Firebase Admin initialization error:', error);
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
          
          // Extract FCM token from endpoint
          if (endpoint.includes('fcm.googleapis.com')) {
            fcmToken = endpoint.split('/').pop();
          } else {
            console.warn(`⚠️ Non-FCM endpoint for user ${device.user_id}:`, endpoint);
            continue;
          }
        } catch (parseError) {
          console.error(`❌ Error parsing token for user ${device.user_id}:`, parseError);
          continue;
        }

        console.log(`🚀 REAL PUSH - Sending to FCM token: ${fcmToken?.substring(0, 20)}...`);

        // Prepare Firebase message payload for iOS PWA
        const message = {
          token: fcmToken,
          notification: {
            title,
            body
          },
          webpush: {
            headers: {
              'TTL': '86400'
            },
            notification: {
              title,
              body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              sound: 'default',
              requireInteraction: true,
              tag: 'mission-notification',
              data: {
                url: '/notifications',
                click_action: '/notifications',
                timestamp: new Date().toISOString(),
                source: 'admin_push_real'
              }
            },
            fcm_options: {
              link: '/notifications'
            }
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title,
                  body
                },
                badge: 1,
                sound: 'default',
                'mutable-content': 1,
                'content-available': 1
              }
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          },
          data: {
            url: '/notifications',
            click_action: '/notifications',
            timestamp: new Date().toISOString(),
            source: 'admin_push_real'
          }
        };

        if (firebaseApp) {
          const messaging = getMessaging(firebaseApp);
          const response = await messaging.send(message);
          console.log(`✅ Firebase message sent successfully:`, response);
        } else {
          console.warn('⚠️ Firebase Admin not initialized, saving notification only');
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
              push_result: firebaseApp ? 'firebase_sent' : 'firebase_unavailable',
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