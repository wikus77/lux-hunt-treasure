/*
 * M1SSION™ Web Push Send
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
// webpush will be imported dynamically to avoid build issues

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://m1ssion.eu',
    /^https:\/\/.*\.m1ssion\.pages\.dev$/,
    /^https:\/\/.*\.lovable\.dev$/
  ];
  
  let allowOrigin = 'https://m1ssion.eu';
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) allowOrigin = origin;
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-mi-dropper-version, x-admin-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // ✅ PRIORITY 1: Check x-admin-token FIRST (bypass all auth)
    const adminToken = req.headers.get('x-admin-token');
    const configuredAdminToken = Deno.env.get('PUSH_ADMIN_TOKEN');
    
    if (adminToken && configuredAdminToken && adminToken === configuredAdminToken) {
      console.log('[WEBPUSH-SEND] ✅ Admin bypass via x-admin-token');
      
      // Skip ALL JWT validation, proceed directly to broadcast
      const body = await req.json();
      const { audience, payload } = body;

      if (!payload?.title || !payload?.body) {
        return new Response(JSON.stringify({ 
          error: 'Missing payload with title and body' 
        }), {
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Setup VAPID
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
      const vapidContact = Deno.env.get('VAPID_CONTACT') || 'mailto:admin@m1ssion.eu';

      if (!vapidPublicKey || !vapidPrivateKey) {
        return new Response(JSON.stringify({ 
          error: 'VAPID keys not configured' 
        }), {
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const webpush = await import('npm:web-push@3.6.7');
      webpush.default.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);

      // Fetch all active subscriptions
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: dbSubs, error } = await supabase
        .from('webpush_subscriptions')
        .select('id, endpoint, keys')
        .eq('is_active', true);

      if (error) {
        console.error('[WEBPUSH-SEND] Database error:', error);
        throw error;
      }

      const targets = dbSubs.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint,
        keys: (sub.keys as any) || { p256dh: '', auth: '' }
      }));

      const results = [];
      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/'
      });

      for (const target of targets) {
        try {
          await webpush.default.sendNotification(target, pushPayload);
          results.push({
            endpoint: target.endpoint?.substring(0, 50) + '...',
            success: true,
            status: 201
          });
        } catch (error: any) {
          console.error(`[WEBPUSH-SEND] Failed to send:`, error.message);
          
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('webpush_subscriptions')
              .update({ is_active: false })
              .eq('endpoint', target.endpoint);
          }
          
          results.push({
            endpoint: target.endpoint?.substring(0, 50) + '...',
            success: false,
            error: error?.message || 'Unknown error',
            statusCode: error?.statusCode
          });
        }
      }

      const sent = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`[WEBPUSH-SEND] Admin mode complete: total=${targets.length}, sent=${sent}, failed=${failed}`);

      return new Response(JSON.stringify({
        success: true,
        mode: 'admin',
        results,
        total: targets.length,
        sent,
        failed
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ✅ PRIORITY 2: Check service_role JWT
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (token === serviceRoleKey) {
        console.log('[WEBPUSH-SEND] ✅ Service role JWT validated');
        
        // Same logic as admin bypass
        const body = await req.json();
        const { audience, payload } = body;

        if (!payload?.title || !payload?.body) {
          return new Response(JSON.stringify({ 
            error: 'Missing payload with title and body' 
          }), {
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
        const vapidContact = Deno.env.get('VAPID_CONTACT') || 'mailto:admin@m1ssion.eu';

        if (!vapidPublicKey || !vapidPrivateKey) {
          return new Response(JSON.stringify({ 
            error: 'VAPID keys not configured' 
          }), {
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const webpush = await import('npm:web-push@3.6.7');
        webpush.default.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);

        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { data: dbSubs, error } = await supabase
          .from('webpush_subscriptions')
          .select('id, endpoint, keys')
          .eq('is_active', true);

        if (error) {
          console.error('[WEBPUSH-SEND] Database error:', error);
          throw error;
        }

        const targets = dbSubs.map(sub => ({
          id: sub.id,
          endpoint: sub.endpoint,
          keys: (sub.keys as any) || { p256dh: '', auth: '' }
        }));

        const results = [];
        const pushPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url || '/'
        });

        for (const target of targets) {
          try {
            await webpush.default.sendNotification(target, pushPayload);
            results.push({
              endpoint: target.endpoint?.substring(0, 50) + '...',
              success: true,
              status: 201
            });
          } catch (error: any) {
            console.error(`[WEBPUSH-SEND] Failed to send:`, error.message);
            
            if (error.statusCode === 410 || error.statusCode === 404) {
              await supabase
                .from('webpush_subscriptions')
                .update({ is_active: false })
                .eq('endpoint', target.endpoint);
            }
            
            results.push({
              endpoint: target.endpoint?.substring(0, 50) + '...',
              success: false,
              error: error?.message || 'Unknown error',
              statusCode: error?.statusCode
            });
          }
        }

        const sent = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`[WEBPUSH-SEND] Service role mode complete: total=${targets.length}, sent=${sent}, failed=${failed}`);

        return new Response(JSON.stringify({
          success: true,
          mode: 'service_role',
          results,
          total: targets.length,
          sent,
          failed
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ✅ PRIORITY 3: Validate user JWT (original flow)
    if (!authHeader) {
      console.log('[WEBPUSH-SEND] No authentication provided');
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        reason: 'missing_authentication'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.log('[WEBPUSH-SEND] Invalid user JWT');
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        reason: 'invalid_jwt'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    console.log('[WEBPUSH-SEND] User JWT validated:', data.user.id);

    const body = await req.json();
    const { subscriptions, audience, payload } = body;

    if (!payload?.title || !payload?.body) {
      return new Response(JSON.stringify({ 
        error: 'Missing payload with title and body' 
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Setup VAPID
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidContact = Deno.env.get('VAPID_CONTACT') || 'mailto:admin@m1ssion.eu';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ 
        error: 'VAPID keys not configured' 
      }), {
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Import and configure webpush via npm (stable on Supabase Edge)
    const webpush = await import('npm:web-push@3.6.7');
    webpush.default.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);

    // Determine targets
    let targets = [];

    if (subscriptions?.length > 0) {
      // Case A: Direct subscriptions
      targets = subscriptions;
    } else if (audience) {
      // Case B: Audience from database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: dbSubs, error } = await supabase
        .from('webpush_subscriptions')
        .select('id, endpoint, keys')
        .eq('is_active', true);

      if (error) {
        console.error('[WEBPUSH-SEND] Database error:', error);
        throw error;
      }

      targets = dbSubs.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint,
        keys: (sub.keys as any) || { p256dh: '', auth: '' }
      }));
    }

    // Send notifications
    const results = [];
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/'
    });

    for (const target of targets) {
      try {
        await webpush.default.sendNotification(target, pushPayload);
        results.push({
          endpoint: target.endpoint?.substring(0, 50) + '...',
          success: true,
          status: 201
        });
      } catch (error: any) {
        console.error(`[WEBPUSH-SEND] Failed to send to ${target.endpoint?.substring(0, 50)}:`, error);
        
        // Handle dead endpoints
        if (error.statusCode === 410 || error.statusCode === 404) {
          try {
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL')!,
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            );
            
            await supabase
              .from('webpush_subscriptions')
              .update({ is_active: false })
              .eq('endpoint', target.endpoint);
              
            console.log(`[WEBPUSH-SEND] Marked endpoint as inactive: ${target.endpoint?.substring(0, 50)}`);
          } catch (dbError) {
            console.error('[WEBPUSH-SEND] Failed to mark endpoint as inactive:', dbError);
          }
        }
        
        results.push({
          endpoint: target.endpoint?.substring(0, 50) + '...',
          success: false,
          error: error?.message || 'Unknown error',
          statusCode: error?.statusCode
        });
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`[WEBPUSH-SEND] Complete: total=${targets.length}, sent=${sent}, failed=${failed}`);

    return new Response(JSON.stringify({
      success: true,
      results,
      total: targets.length,
      sent,
      failed
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[WEBPUSH-SEND] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});