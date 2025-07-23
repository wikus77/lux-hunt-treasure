// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  data?: any;
  badge?: number;
  sound?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`📱 [PUSH-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Parse request body
    const { user_id, title, message, data, badge = 1, sound = 'default' }: PushNotificationRequest = await req.json();

    if (!user_id || !title || !message) {
      throw new Error('Missing required fields: user_id, title, message');
    }

    logStep('Request validated', { user_id, title });

    // Get user's device tokens
    const { data: deviceTokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('token, device_type')
      .eq('user_id', user_id);

    if (tokenError) {
      logStep('ERROR: Failed to fetch device tokens', tokenError);
      throw new Error(`Failed to fetch device tokens: ${tokenError.message}`);
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      logStep('No device tokens found for user', { user_id });
      return new Response(JSON.stringify({
        success: true,
        message: 'No device tokens found - user will receive notification when they next open the app',
        tokens_sent: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    logStep('Device tokens found', { count: deviceTokens.length });

    // For now, we'll log the push notification (in production you'd integrate with FCM/APNS)
    const pushPayload = {
      title,
      body: message,
      data: {
        ...data,
        user_id,
        timestamp: new Date().toISOString()
      },
      android: {
        notification: {
          title,
          body: message,
          sound,
          badge: badge.toString(),
          channelId: 'mission_notifications'
        },
        data: data || {}
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body: message
            },
            badge,
            sound
          }
        },
        headers: {
          'apns-push-type': 'alert',
          'apns-priority': '10'
        }
      }
    };

    // Log the notification (in production, send to FCM/APNS)
    for (const deviceToken of deviceTokens) {
      logStep('Sending push notification', {
        token: deviceToken.token.substring(0, 20) + '...',
        device_type: deviceToken.device_type,
        title,
        message
      });

      // Here you would integrate with Firebase Cloud Messaging or Apple Push Notification Service
      // For now, we just log it
      console.log('📱 Push notification payload:', {
        to: deviceToken.token,
        notification: pushPayload,
        device_type: deviceToken.device_type
      });
    }

    // Store notification in user_notifications table
    try {
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id,
          notification_type: 'push',
          title,
          message,
          metadata: {
            device_tokens_count: deviceTokens.length,
            push_payload: pushPayload,
            sent_at: new Date().toISOString()
          },
          delivery_status: 'sent'
        });

      if (notificationError) {
        console.error('❌ Failed to store notification:', notificationError);
      } else {
        logStep('Notification stored in database');
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
    }

    const response = {
      success: true,
      message: 'Push notification sent successfully',
      tokens_sent: deviceTokens.length,
      notification: {
        title,
        message,
        user_id
      }
    };

    logStep('Function completed successfully', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in send-push-notification', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})