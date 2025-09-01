// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* GENERATORE CHIAVI VAPID REALI */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Funzione per generare chiavi VAPID reali P-256
async function generateRealVapidKeys() {
  // Genera una coppia di chiavi P-256 reali
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true, // extractable
    ['sign', 'verify']
  );

  // Esporta la chiave pubblica
  const publicKeyArrayBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyBytes = new Uint8Array(publicKeyArrayBuffer);
  
  // Esporta la chiave privata
  const privateKeyArrayBuffer = await crypto.subtle.exportKey('raw', keyPair.privateKey);
  const privateKeyBytes = new Uint8Array(privateKeyArrayBuffer);

  // Converti in base64url
  const publicKeyBase64Url = btoa(String.fromCharCode(...publicKeyBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const privateKeyBase64Url = btoa(String.fromCharCode(...privateKeyBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    publicKey: publicKeyBase64Url,
    privateKey: privateKeyBase64Url,
    generated: new Date().toISOString()
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const keys = await generateRealVapidKeys();
    
    console.log('[VAPID-GENERATOR] Generated new VAPID keys:', {
      publicKeyLength: keys.publicKey.length,
      privateKeyLength: keys.privateKey.length,
      timestamp: keys.generated
    });

    return new Response(
      JSON.stringify(keys, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[VAPID-GENERATOR] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});