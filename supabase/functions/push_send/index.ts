// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* SISTEMA PUSH DEFINITIVO CON CHIAVI REALI */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// CHIAVI VAPID M1SSION™ - FIREBASE REALI FORNITE DALL'UTENTE
const REAL_VAPID_KEYS = {
  // Chiave pubblica M1SSION™ Firebase (quella che già funziona)
  publicKey: 'BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o',
  // Chiave privata M1SSION™ Firebase (fornita dall'utente)
  privateKey: 'BOyD6i2o-KW1bAGOAFuQtxIYHpNqZpNJ0Q4YOuTYx8f8exw-DkZo_3KweeRXEKr91xDKMnTRe-yyY3PO5Jg-YBI'
};

function base64UrlToBase64(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = base64UrlToBase64(str);
  const binary = atob(base64);
  return new Uint8Array([...binary].map(char => char.charCodeAt(0)));
}

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64ToBase64Url(base64);
}

async function importVapidPrivateKey(privateKeyBase64Url: string): Promise<CryptoKey> {
  const privateKeyBytes = base64UrlDecode(privateKeyBase64Url);
  
  // Importa come chiave raw P-256
  return await crypto.subtle.importKey(
    'raw',
    privateKeyBytes,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false,
    ['sign']
  );
}

async function createVapidJWT(privateKey: CryptoKey, audience: string): Promise<string> {
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 ora
    sub: 'mailto:push@m1ssion.eu'
  };

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64UrlEncode(signature);
  return `${unsignedToken}.${encodedSignature}`;
}

async function sendPushToEndpoint(endpoint: string, payload: string, privateKey: CryptoKey): Promise<Response> {
  try {
    const url = new URL(endpoint);
    const audience = url.origin;
    
    const vapidJWT = await createVapidJWT(privateKey, audience);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `vapid t=${vapidJWT}, k=${REAL_VAPID_KEYS.publicKey}`,
      'TTL': '2419200' // 4 settimane
    };

    console.log(`[PUSH] Sending to: ${endpoint.substring(0, 50)}...`);
    console.log(`[PUSH] Headers:`, headers);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: payload
    });

    console.log(`[PUSH] Response: ${response.status} ${response.statusText}`);
    return response;

  } catch (error) {
    console.error(`[PUSH] Error:`, error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('[PUSH] Request:', JSON.stringify(body, null, 2));

    // Importa la chiave privata VAPID M1SSION™ Firebase (CORRETTA!)
    console.log('[PUSH] 🔑 Using M1SSION Firebase VAPID keys');
    console.log('[PUSH] 🔑 Public Key:', REAL_VAPID_KEYS.publicKey);
    console.log('[PUSH] 🔑 Private Key length:', REAL_VAPID_KEYS.privateKey.length);
    
    const privateKey = await importVapidPrivateKey(REAL_VAPID_KEYS.privateKey);
    console.log('[PUSH] ✅ M1SSION Firebase VAPID private key imported successfully');

    // Trova subscriptions
    let subscriptions = [];
    
    if (body.endpoint) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('endpoint', body.endpoint);
      subscriptions = data || [];
    } else {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);
      subscriptions = data || [];
    }

    console.log(`[PUSH] Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No subscriptions found',
          endpoint_searched: body.endpoint || 'none'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Payload della notifica
    const notification = {
      title: body.title || '🚀 M1SSION™ FUNZIONA!',
      body: body.body || 'Le notifiche push sono attive!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: body.url || '/',
        timestamp: Date.now(),
        source: 'M1SSION'
      }
    };

    const payload = JSON.stringify(notification);
    console.log('[PUSH] Payload:', payload);

    let sent = 0, failed = 0;
    const results = [];

    // Invia a tutte le subscriptions
    for (const sub of subscriptions) {
      try {
        const response = await sendPushToEndpoint(sub.endpoint, payload, privateKey);
        
        if (response.ok) {
          console.log(`[PUSH] ✅ SUCCESS: ${sub.endpoint.substring(0, 30)}`);
          sent++;
          results.push({
            endpoint: sub.endpoint.substring(0, 50) + '...',
            status: 'success',
            code: response.status
          });
        } else {
          console.log(`[PUSH] ❌ FAILED: ${response.status} for ${sub.endpoint.substring(0, 30)}`);
          failed++;
          results.push({
            endpoint: sub.endpoint.substring(0, 50) + '...',
            status: 'failed',
            code: response.status
          });
        }
      } catch (error) {
        console.error(`[PUSH] Exception for ${sub.endpoint.substring(0, 30)}:`, error);
        failed++;
        results.push({
          endpoint: sub.endpoint.substring(0, 50) + '...',
          status: 'error',
          error: error.message
        });
      }
    }

    const finalResult = {
      success: sent > 0,
      sent,
      failed,
      total: subscriptions.length,
      results,
      vapid_public_key: REAL_VAPID_KEYS.publicKey,
      timestamp: new Date().toISOString()
    };

    console.log('[PUSH] Final result:', JSON.stringify(finalResult, null, 2));

    return new Response(
      JSON.stringify(finalResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[PUSH] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});