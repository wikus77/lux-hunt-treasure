/*
 * M1SSION™ Push Send - Standard VAPID with Web Push Protocol
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { endpoint, ttl = 86400 } = body; // Default 24 ore TTL

    if (!endpoint) {
      return Response.json(
        { error: 'Endpoint required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📤 Sending no-payload VAPID to ${classifyEndpoint(endpoint)}...`);

    // Generate VAPID JWT token
    const vapidToken = await generateVAPIDToken(endpoint);
    const endpointType = classifyEndpoint(endpoint);
    
    // Build headers based on push service
    const headers: Record<string, string> = buildPushHeaders(endpointType, vapidToken, ttl);

    // Send push notification using standard Web Push protocol (NO PAYLOAD)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      // NO body - invio "tick" push senza payload
    });

    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch (e) {
      // Ignore response body errors
    }

    const isStale = response.status === 404 || response.status === 410;

    if (!response.ok) {
      console.error(`❌ Push failed (${response.status}):`, responseBody);
      
      // Log synthetic details
      console.log(`📊 Push result: endpoint_type=${endpointType}, status=${response.status}, stale=${isStale}`);
      
      // Log detailed error for debugging
      if (endpoint.includes('web.push.apple.com')) {
        console.error('🍎 APNs Error Details:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          vapidClaims: decodeVAPIDToken(vapidToken),
          endpoint: endpoint.substring(0, 50) + '...'
        });
      }
      
      // Return stale info for 404/410 instead of throwing
      if (isStale) {
        return Response.json(
          { 
            ok: true,
            sent: 0,
            failed: 1,
            stale: true,
            status: response.status,
            endpoint_type: endpointType,
            results: [{ stale: true, status: response.status, endpoint_type: endpointType }]
          }, 
          { headers: corsHeaders }
        );
      }
      
      throw new Error(`Push failed (${response.status}): ${responseBody}`);
    }

    console.log(`✅ Push sent successfully to ${endpointType} (${response.status})`);
    console.log(`📊 Push result: endpoint_type=${endpointType}, status=${response.status}, stale=false`);

    return Response.json(
      { 
        ok: true,
        sent: 1,
        failed: 0,
        status: response.status,
        endpoint_type: endpointType,
        stale: false
      }, 
      { headers: corsHeaders }
    );

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

/**
 * Generate VAPID JWT token for push authentication with correct audience per service
 */
async function generateVAPIDToken(endpoint: string): Promise<string> {
  const endpointType = classifyEndpoint(endpoint);
  let audience: string;
  
  // Set correct audience based on push service
  switch (endpointType) {
    case 'apns':
      audience = 'https://web.push.apple.com';
      break;
    case 'fcm':
      audience = 'https://fcm.googleapis.com';
      break;
    default:
      // For other services, extract from endpoint
      const url = new URL(endpoint);
      audience = `${url.protocol}//${url.host}`;
  }
  
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours max
    sub: VAPID_SUB
  };

  // Base64url encode header and payload
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  
  // Create signing input
  const signingInput = `${headerB64}.${payloadB64}`;
  
  try {
    // Import VAPID private key for ECDSA signing
    const privateKeyBuffer = base64UrlDecode(VAPID_PRIVATE_KEY);
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['sign']
    );

    // Sign the JWT
    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256',
      },
      privateKey,
      new TextEncoder().encode(signingInput)
    );

    // Encode signature as base64url
    const signatureB64 = base64UrlEncode(new Uint8Array(signature));
    
    return `${signingInput}.${signatureB64}`;
  } catch (error) {
    console.error('❌ VAPID JWT signing failed:', error);
    throw new Error(`VAPID JWT generation failed: ${error.message}`);
  }
}

/**
 * Base64url encode helper
 */
function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64url decode helper
 */
function base64UrlDecode(data: string): Uint8Array {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const decoded = atob(base64 + padding);
  return new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
}

/**
 * Decode VAPID token for debugging (without verification)
 */
function decodeVAPIDToken(token: string): any {
  try {
    const [header, payload] = token.split('.');
    return {
      header: JSON.parse(new TextDecoder().decode(base64UrlDecode(header))),
      payload: JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)))
    };
  } catch (e) {
    return { error: 'Invalid token format' };
  }
}

/**
 * Classify endpoint type for push service detection
 */
function classifyEndpoint(endpoint: string): string {
  if (endpoint.includes('web.push.apple.com')) return 'apns';
  if (endpoint.includes('fcm.googleapis.com') || endpoint.includes('googleapis.com')) return 'fcm';
  if (endpoint.includes('wns.notify.windows.com')) return 'wns';
  return 'other';
}

/**
 * Build service-specific headers for push notifications
 */
function buildPushHeaders(endpointType: string, vapidToken: string, ttl: number): Record<string, string> {
  const headers: Record<string, string> = {
    'TTL': ttl.toString(),
  };

  switch (endpointType) {
    case 'apns':
      // APNs (Safari PWA) headers
      headers['Authorization'] = `WebPush ${vapidToken}`;
      headers['Crypto-Key'] = `p256ecdsa=${VAPID_PUBLIC_KEY}`;
      headers['Content-Length'] = '0';
      break;
      
    case 'fcm':
      // FCM (Chrome, Firefox) headers  
      headers['Authorization'] = `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`;
      break;
      
    default:
      // Other services use WebPush format like APNs
      headers['Authorization'] = `WebPush ${vapidToken}`;
      headers['Crypto-Key'] = `p256ecdsa=${VAPID_PUBLIC_KEY}`;
      headers['Content-Length'] = '0';
  }

  return headers;
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */
