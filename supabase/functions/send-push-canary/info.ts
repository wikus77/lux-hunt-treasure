// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Send Push Canary Info Endpoint */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Vary': 'Origin'
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const hasInfo = url.searchParams.has('info');
    
    if (!hasInfo) {
      return new Response('Add ?info=1 to get endpoint info', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Get VAPID keys status
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT');

    // Base64url decode for length check
    function b64urlToUint8Array(base64url: string): Uint8Array {
      const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
      const binary = atob(base64);
      return Uint8Array.from(binary, char => char.charCodeAt(0));
    }

    let pubKeyLength = 0;
    let privKeyLength = 0;
    let keyValidation = 'unknown';

    try {
      if (VAPID_PUBLIC_KEY) {
        const pubBytes = b64urlToUint8Array(VAPID_PUBLIC_KEY);
        pubKeyLength = pubBytes.length;
      }
      if (VAPID_PRIVATE_KEY) {
        const privBytes = b64urlToUint8Array(VAPID_PRIVATE_KEY);
        privKeyLength = privBytes.length;
      }
      
      keyValidation = (pubKeyLength === 65 && privKeyLength === 32) ? 'valid' : 'invalid';
    } catch (error) {
      keyValidation = `decode_error: ${error.message}`;
    }

    const info = {
      fnName: 'send-push-canary',
      hasKeys: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT),
      keyLengths: {
        public: pubKeyLength,
        private: privKeyLength,
        validation: keyValidation
      },
      aud: {
        fcm: 'https://fcm.googleapis.com',
        apns: 'https://web.push.apple.com'
      },
      headers: {
        fcm: {
          authorization: 'WebPush <JWT>',
          cryptoKey: 'p256ecdsa=<PUBLIC_KEY>',
          contentType: 'application/octet-stream'
        },
        apns: {
          authorization: 'vapid t=<JWT>, k=<PUBLIC_KEY>',
          cryptoKey: 'none',
          contentType: 'application/octet-stream'
        }
      },
      buildSha: Deno.env.get('BUILD_SHA') || 'dev',
      time: new Date().toISOString(),
      project: 'vkjrqirvdvjbemsfzxof'
    };

    return new Response(JSON.stringify(info, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Info endpoint error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});