/**
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * push-self-test: E2E test for push notifications
 * Requires JWT authentication
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'missing_authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'invalid_jwt' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[push-self-test] User ${user.id} requesting E2E push test`);

    const { tag = 'e2e-test' } = await req.json().catch(() => ({ tag: 'e2e-test' }));

    // Step 1: Insert test notification
    const { data: notification, error: notifError } = await supabaseAdmin
      .from('user_notifications')
      .insert({
        user_id: user.id,
        title: '🧪 E2E Push Test',
        message: 'Push notification test in corso...',
        type: 'info'
      })
      .select()
      .single();

    if (notifError) {
      console.error('[push-self-test] Failed to create notification:', notifError);
      return new Response(
        JSON.stringify({ success: false, error: 'notification_insert_failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Log queued status
    const { data: logEntry, error: logError } = await supabaseAdmin
      .from('push_delivery_logs')
      .insert({
        user_id: user.id,
        channel: 'webpush',
        message_tag: tag,
        status: 'queued',
        details: { notification_id: notification.id, timestamp: new Date().toISOString() }
      })
      .select()
      .single();

    if (logError) {
      console.error('[push-self-test] Failed to log push:', logError);
    }

    // Step 3: Invoke existing push function
    try {
      const { data: pushResult, error: pushError } = await supabaseAdmin.functions.invoke('webpush-self-test', {
        body: {
          payload: {
            title: '🧪 E2E Push Test',
            body: 'Test completato con successo! ✅',
            url: '/notifications'
          }
        },
        headers: {
          Authorization: authHeader
        }
      });

      if (pushError) {
        console.error('[push-self-test] Push invocation failed:', pushError);
        
        // Update log to failed
        if (logEntry) {
          await supabaseAdmin
            .from('push_delivery_logs')
            .update({
              status: 'failed',
              details: { error: pushError.message, timestamp: new Date().toISOString() }
            })
            .eq('id', logEntry.id);
        }

        return new Response(
          JSON.stringify({ success: false, error: 'push_failed', details: pushError }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update log to sent
      if (logEntry) {
        await supabaseAdmin
          .from('push_delivery_logs')
          .update({
            status: 'sent',
            details: { result: pushResult, timestamp: new Date().toISOString() }
          })
          .eq('id', logEntry.id);
      }

      console.log('[push-self-test] ✅ Push sent successfully');

      return new Response(
        JSON.stringify({
          success: true,
          tag,
          logId: logEntry?.id,
          notificationId: notification.id,
          message: 'E2E test inviato con successo'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error: any) {
      console.error('[push-self-test] Exception:', error);
      
      if (logEntry) {
        await supabaseAdmin
          .from('push_delivery_logs')
          .update({
            status: 'failed',
            details: { error: error.message, timestamp: new Date().toISOString() }
          })
          .eq('id', logEntry.id);
      }

      return new Response(
        JSON.stringify({ success: false, error: 'exception', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('[push-self-test] Error:', error);
    return new Response(
      JSON.stringify({ error: 'internal_error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
