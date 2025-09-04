/*
 * M1SSION™ Push Send - Standard VAPID with Web Push Protocol
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://deno.land/x/webpush@v1.5.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  endpoint: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
  ttl?: number;
}

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUB = Deno.env.get('VAPID_SUB') || 'mailto:admin@m1ssion.eu';

// Initialize webpush with VAPID details
webpush.setVapidDetails(
  VAPID_SUB,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET' && req.url.endsWith('/health')) {
    return Response.json({ ok: true, status: 'healthy' }, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('🚀 [PUSH-SEND] Processing push request...');

    // Verify Service Role Key for security
    const authHeader = req.headers.get('Authorization') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader.includes(serviceRoleKey || 'invalid')) {
      console.error('❌ Unauthorized: Service Role Key required');
      return Response.json(
        { error: 'Unauthorized - Service Role Key required' }, 
        { status: 403, headers: corsHeaders }
      );
    }

    const body: PushRequest = await req.json();
    const { endpoint, title = 'M1SSION™', body: message = 'Ping ✅', data = {}, ttl = 60 } = body;

    if (!endpoint) {
      return Response.json(
        { error: 'Endpoint required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📤 Sending to ${classifyEndpoint(endpoint)}...`);

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: message,
      data: {
        ...data,
        timestamp: Date.now()
      }
    });

    // Use webpush library for proper VAPID handling
    try {
      const result = await webpush.sendNotification(
        { endpoint },
        payload,
        {
          TTL: ttl,
          // No custom headers - let webpush handle VAPID
        }
      );

      console.log(`✅ Push sent successfully to ${classifyEndpoint(endpoint)}`);

      return Response.json(
        { 
          ok: true,
          sent: 1,
          failed: 0,
          endpoint_type: classifyEndpoint(endpoint)
        }, 
        { headers: corsHeaders }
      );

    } catch (error) {
      console.error(`❌ Push failed to ${classifyEndpoint(endpoint)}:`, error);
      
      throw error;
    }

  } catch (error) {
    console.error('❌ Push send error:', error);
    return Response.json(
      { 
        ok: false,
        sent: 0,
        failed: 1,
        error: String(error) 
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
});

// VAPID JWT generation now handled by webpush library

/**
 * Classify endpoint type for logging
 */
function classifyEndpoint(endpoint: string): string {
  if (endpoint.includes('web.push.apple.com')) return 'apns';
  if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  if (endpoint.includes('wns.notify.windows.com')) return 'wns';
  return 'other';
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */
