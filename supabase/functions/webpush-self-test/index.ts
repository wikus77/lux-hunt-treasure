/**
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * webpush-self-test: Test push notification to authenticated user only
 * No admin token required - JWT authentication only
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'missing_authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for user verification
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'invalid_jwt' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webpush-self-test] User ${user.id} requesting test push`);

    // Get request payload
    const { payload } = await req.json();
    const { title, body, url } = payload || {};

    // Default test payload
    const testPayload = {
      title: title || '🚀 M1SSION Test',
      body: body || 'Push di test ricevuto correttamente! ✅',
      url: url || '/notifications'
    };

    // Fetch user's active subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('webpush_subscriptions')
      .select('endpoint, keys, platform')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'no_active_subscriptions',
          message: 'Nessuna subscription attiva trovata'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webpush-self-test] Found ${subscriptions.length} active subscriptions`);

    // Load VAPID keys
    const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
    const VAPID_CONTACT = Deno.env.get('VAPID_CONTACT') ?? 'mailto:admin@m1ssion.eu';

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return new Response(
        JSON.stringify({ error: 'vapid_not_configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Import web-push
    const webpush = await import('npm:web-push@3.6.7');
    webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send to all user's subscriptions
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(testPayload));
        sent++;
        console.log(`[webpush-self-test] ✅ Sent to ${sub.platform || 'web'}`);
      } catch (error: any) {
        failed++;
        const reason = error?.statusCode || error?.message || 'unknown';
        errors.push(`${sub.platform || 'web'}: ${reason}`);
        console.error(`[webpush-self-test] ❌ Failed:`, reason);

        // Soft-delete on 410/404
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await supabaseAdmin
            .from('webpush_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', sub.endpoint);
          console.log(`[webpush-self-test] Soft-deleted endpoint (${error.statusCode})`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        message: sent > 0 ? 'Push di test inviato!' : 'Nessuna push inviata'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[webpush-self-test] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'internal_error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
