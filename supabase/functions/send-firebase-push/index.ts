// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Push Notification Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  broadcast?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: NotificationRequest = await req.json();
    const { user_id, title, body, data = {}, broadcast = false } = requestBody;

    console.log('🔥 FCM Push notification request:', { user_id, title, body, broadcast });
    console.log('🔥 FCM VERBOSE DEBUG - Request details:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent')
    });

    // Validate required fields
    if (!title || !body) {
      console.error('❌ Missing required fields:', { title: !!title, body: !!body });
      return new Response(JSON.stringify({
        success: false,
        error: 'Title and body are required',
        status: 'validation_error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Firebase Server Key from environment
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY');
    if (!firebaseServerKey) {
      console.error('❌ Firebase Server Key not configured');
      
      // Log to admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_push_error',
          user_id: user_id || null,
          note: 'Firebase Server Key not configured',
          context: 'firebase_fcm'
        });
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Firebase Server Key not configured',
        status: 'server_key_missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch FCM tokens from database
    let tokensQuery = supabase
      .from('user_push_tokens')
      .select('fcm_token, user_id')
      .eq('is_active', true);

    // Filter by user_id if not broadcasting
    if (!broadcast && user_id) {
      tokensQuery = tokensQuery.eq('user_id', user_id);
    }

    const { data: tokens, error: tokensError } = await tokensQuery;

    if (tokensError) {
      console.error('❌ Error fetching FCM tokens:', tokensError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Error fetching FCM tokens'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!tokens || tokens.length === 0) {
      console.warn('⚠️ No FCM tokens found for user(s)');
      
      // Log specific case for user
      const logNote = user_id ? 
        `No FCM tokens found for user ${user_id}` : 
        'No active FCM tokens found for broadcast';
      
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_push_no_tokens',
          user_id: user_id || null,
          note: logNote,
          context: 'firebase_fcm'
        });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'No active FCM tokens found',
        sent_count: 0,
        status: user_id ? 'no_token' : 'no_tokens',
        user_id: user_id || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔥 Found ${tokens.length} FCM tokens to send to`);
    console.log('🔥 FCM VERBOSE DEBUG - Tokens details:', {
      tokens: tokens.map(t => ({
        user_id: t.user_id,
        token_preview: t.fcm_token?.substring(0, 20) + '...',
        token_length: t.fcm_token?.length
      }))
    });

    // Prepare FCM message payload
    const fcmPayload = {
      notification: {
        title: title,
        body: body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...data
      },
      registration_ids: tokens.map(token => token.fcm_token)
    };

    // Send notification via FCM API
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${firebaseServerKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fcmPayload)
    });

    let fcmResult;
    try {
      fcmResult = await fcmResponse.json();
    } catch (jsonError) {
      console.error('❌ FCM Response JSON Parse Error:', jsonError);
      fcmResult = { 
        error: 'Invalid JSON response from FCM',
        success: 0,
        failure: 1,
        rawResponse: await fcmResponse.text()
      };
    }
    console.log('🔥 FCM API Response:', fcmResult);
    console.log('🔥 FCM VERBOSE DEBUG - Full response details:', {
      status: fcmResponse.status,
      statusText: fcmResponse.statusText,
      headers: Object.fromEntries(fcmResponse.headers.entries()),
      payload_sent: fcmPayload,
      fcm_result: fcmResult
    });

    // Save notification to database for each user
    const notifications = tokens.map(token => ({
      user_id: token.user_id,
      type: 'push',
      title: title,
      message: body,
      is_read: false,
      metadata: {
        source: 'fcm_push',
        fcm_response: fcmResult,
        timestamp: new Date().toISOString()
      }
    }));

    // Save to user_notifications table
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('❌ Error saving notifications to database:', notificationError);
    } else {
      console.log('✅ Notifications saved to database successfully');
    }

    // Log comprehensive diagnostic information to admin_logs
    const diagnosticDetails = {
      fcm_request: {
        user_id,
        title,
        body,
        broadcast,
        timestamp: new Date().toISOString()
      },
      fcm_tokens: {
        total_found: tokens.length,
        tokens_preview: tokens.map(t => ({
          user_id: t.user_id,
          token_length: t.fcm_token?.length,
          token_prefix: t.fcm_token?.substring(0, 10)
        }))
      },
      fcm_response: {
        status_code: fcmResponse.status,
        success_count: fcmResult.success || 0,
        failure_count: fcmResult.failure || 0,
        results: fcmResult.results || [],
        multicast_id: fcmResult.multicast_id,
        canonical_ids: fcmResult.canonical_ids || 0
      },
      supabase_operations: {
        notifications_saved: !notificationError,
        notification_error: notificationError?.message || null
      }
    };

    // Save diagnostic log with enhanced details
    await supabase
      .from('admin_logs')
      .insert({
        event_type: 'firebase_push_notification_sent',
        user_id: user_id || null,
        note: `FCM push sent: "${title}" (${fcmResult.success || 0} success, ${fcmResult.failure || 0} failed)`,
        context: 'firebase_fcm'
      });

    // Count successful sends
    const successCount = fcmResult.success || 0;
    const failureCount = fcmResult.failure || 0;

    console.log('✅ FCM notification processing completed:', {
      successCount,
      failureCount,
      totalTokens: tokens.length
    });

    return new Response(JSON.stringify({
      success: fcmResponse.ok && successCount > 0,
      message: successCount > 0 ? 
        `FCM notification sent successfully` : 
        'FCM notification failed - no successful deliveries',
      sent_count: successCount,
      failed_count: failureCount,
      total_tokens: tokens.length,
      status: successCount > 0 ? 'delivered' : 'failed',
      fcm_response: fcmResult
    }), {
      status: fcmResponse.ok && successCount > 0 ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Firebase push notification error:', error);
    
    // Log error to admin_logs
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_push_error',
          note: `FCM push error: ${error.message}`,
          context: 'firebase_fcm'
        });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      status: 'critical_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});