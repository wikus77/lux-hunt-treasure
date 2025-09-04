/*
 * M1SSION™ Push Send Service - JOSE-powered VAPID JWT
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 * Zero regressioni. Libreria JOSE ufficiale per firma ECDSA.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SignJWT, importJWK } from 'https://esm.sh/jose@5.8.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// VAPID secrets (base64url format)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!; // 65 bytes uncompressed
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!; // 32 bytes private key

// Utility functions for base64url
function base64UrlDecode(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return new Uint8Array(Array.from(atob(base64 + padding), c => c.charCodeAt(0)));
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Derive x,y coordinates from VAPID public key (65 bytes uncompressed)
 */
function deriveXYFromPublic(publicKeyBase64url: string): { x: string; y: string } {
  const publicKeyBytes = base64UrlDecode(publicKeyBase64url);
  
  if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 0x04) {
    throw new Error('Invalid uncompressed public key format');
  }
  
  // Extract x (bytes 1-32) and y (bytes 33-64)  
  const x = publicKeyBytes.slice(1, 33);
  const y = publicKeyBytes.slice(33, 65);
  
  return {
    x: base64UrlEncode(x),
    y: base64UrlEncode(y)
  };
}

/**
 * Classify endpoint type for service-specific headers
 */
function classifyEndpoint(endpoint: string): string {
  if (endpoint.includes('web.push.apple.com')) return 'apns';
  if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  return 'generic';
}

/**
 * Generate dynamic audience for VAPID JWT
 */
function getAudience(endpoint: string): string {
  const endpointType = classifyEndpoint(endpoint);
  
  switch (endpointType) {
    case 'apns':
      return 'https://web.push.apple.com';
    case 'fcm':
      return 'https://fcm.googleapis.com';
    default:
      // Generic Web Push - extract origin from endpoint
      try {
        const url = new URL(endpoint);
        return `${url.protocol}//${url.hostname}`;
      } catch {
        return 'https://web.push.default.com';
      }
  }
}

/**
 * Generate VAPID JWT using JOSE library with proper ES256 signing
 */
async function generateVAPIDToken(endpoint: string): Promise<string> {
  const audience = getAudience(endpoint);
  const subject = 'mailto:support@m1ssion.com';
  
  console.log(`🔐 Generating VAPID JWT for ${classifyEndpoint(endpoint)} with aud: ${audience}`);
  
  try {
    // Derive x,y from public key for JWK
    const { x, y } = deriveXYFromPublic(VAPID_PUBLIC_KEY);
    
    // Create JWK for private key import
    const jwk: JsonWebKey = {
      kty: 'EC',
      crv: 'P-256',
      d: VAPID_PRIVATE_KEY, // 32 bytes base64url private key
      x: x,
      y: y
    };

    // Import private key as JWK
    const privateKey = await importJWK(jwk, 'ES256');
    
    // Create and sign JWT with JOSE
    const jwt = await new SignJWT({
      aud: audience,
      sub: subject,
      exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours
    })
    .setProtectedHeader({ 
      alg: 'ES256', 
      typ: 'JWT' 
    })
    .sign(privateKey);

    console.log(`✅ VAPID JWT generated successfully for ${audience}`);
    return jwt;
    
  } catch (error) {
    console.error('❌ VAPID JWT generation failed:', error);
    throw new Error(`VAPID JWT generation failed: ${error.message}`);
  }
}

/**
 * Build service-specific headers for push notifications
 */
function buildPushHeaders(endpointType: string, vapidToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    'TTL': '86400', // 24 hours
  };

  switch (endpointType) {
    case 'apns':
      // APNs Web Push format
      headers['Authorization'] = `WebPush ${vapidToken}`;
      headers['Crypto-Key'] = `p256ecdsa=${VAPID_PUBLIC_KEY}`;
      break;
      
    case 'fcm':
      // FCM VAPID format
      headers['Authorization'] = `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`;
      break;
      
    default:
      // Generic Web Push (similar to APNs)
      headers['Authorization'] = `WebPush ${vapidToken}`;
      headers['Crypto-Key'] = `p256ecdsa=${VAPID_PUBLIC_KEY}`;
  }

  return headers;
}

/**
 * Send push notification to endpoint
 */
async function sendPushNotification(endpoint: string, vapidToken: string): Promise<{ success: boolean; status: number; stale?: boolean }> {
  const endpointType = classifyEndpoint(endpoint);
  const headers = buildPushHeaders(endpointType, vapidToken);
  
  console.log(`📤 Sending to ${endpointType} endpoint: ${endpoint.substring(0, 50)}...`);
  console.log(`📋 Headers:`, headers);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      // No body for no-payload push notification
    });
    
    const success = response.status >= 200 && response.status < 300;
    const stale = response.status === 404 || response.status === 410;
    
    console.log(`📨 Push response: ${response.status} ${response.statusText}`);
    
    if (stale) {
      console.log(`🗑️ Stale endpoint detected: ${response.status}`);
    }
    
    return { success, status: response.status, stale };
    
  } catch (error) {
    console.error(`❌ Push send failed:`, error);
    return { success: false, status: 500 };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET' && new URL(req.url).pathname === '/health') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      service: 'push_send',
      vapid_configured: !!VAPID_PUBLIC_KEY && !!VAPID_PRIVATE_KEY,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Only allow POST requests for push operations
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify Service Role Key for security
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { endpoint, user_id } = body;

    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'Missing endpoint' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📝 Processing push for user ${user_id} to endpoint: ${endpoint.substring(0, 50)}...`);

    // Generate VAPID token for this endpoint
    const vapidToken = await generateVAPIDToken(endpoint);
    
    // Send push notification
    const result = await sendPushNotification(endpoint, vapidToken);
    
    // If endpoint is stale, optionally clean it up from database
    if (result.stale && user_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      console.log(`🧹 Cleaning stale endpoint for user ${user_id}`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint)
        .eq('user_id', user_id);
    }

    const response = {
      success: result.success,
      status: result.status,
      endpoint_type: classifyEndpoint(endpoint),
      stale: result.stale || false,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Push operation completed:`, response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Push send error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/*
 * Test script example:
 * 
 * # Health check
 * curl https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_send/health
 * 
 * # Send to FCM endpoint
 * curl -X POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_send \
 *   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{"endpoint": "https://fcm.googleapis.com/fcm/send/...", "user_id": "test"}'
 * 
 * Expected: 200/201 response for valid endpoints, stale detection for 404/410
 */