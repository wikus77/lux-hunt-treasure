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

    // Validate required fields
    if (!title || !body) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title and body are required'
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
      return new Response(JSON.stringify({
        success: false,
        error: 'Firebase Server Key not configured'
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
      return new Response(JSON.stringify({
        success: true,
        message: 'No active FCM tokens found',
        sent_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔥 Found ${tokens.length} FCM tokens to send to`);

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

    const fcmResult = await fcmResponse.json();
    console.log('🔥 FCM API Response:', fcmResult);

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

    // Count successful sends
    const successCount = fcmResult.success || 0;
    const failureCount = fcmResult.failure || 0;

    return new Response(JSON.stringify({
      success: fcmResponse.ok,
      message: `FCM notification sent successfully`,
      sent_count: successCount,
      failed_count: failureCount,
      total_tokens: tokens.length,
      fcm_response: fcmResult
    }), {
      status: fcmResponse.ok ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Firebase push notification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});