// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Auto Update VAPID Keys in push_send */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Auto-updating VAPID keys in push_send...');

    // 1. Generate new VAPID keys
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['sign', 'verify']
    );

    // Export keys
    const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
    const privateKeyRaw = await crypto.subtle.exportKey('raw', keyPair.privateKey);

    const publicKeyBase64Url = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const privateKeyBase64Url = btoa(String.fromCharCode(...new Uint8Array(privateKeyRaw)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    console.log('🔑 Generated keys:', {
      publicLength: publicKeyBase64Url.length,
      privateLength: privateKeyBase64Url.length
    });

    // 2. Read current push_send file
    const pushSendPath = './push_send/index.ts';
    let pushSendContent;
    
    try {
      pushSendContent = await Deno.readTextFile(pushSendPath);
    } catch (error) {
      throw new Error(`Cannot read push_send file: ${error.message}`);
    }

    // 3. Replace VAPID keys in push_send
    const updatedContent = pushSendContent.replace(
      /const REAL_VAPID_KEYS = \{[\s\S]*?\};/,
      `const REAL_VAPID_KEYS = {
  // AUTO-GENERATED M1SSION™ VAPID KEYS - ${new Date().toISOString()}
  publicKey: '${publicKeyBase64Url}',
  privateKey: '${privateKeyBase64Url}'
};`
    );

    if (updatedContent === pushSendContent) {
      throw new Error('Failed to update VAPID keys in push_send');
    }

    // 4. Write updated content
    await Deno.writeTextFile(pushSendPath, updatedContent);

    console.log('✅ push_send updated with new VAPID keys');

    return new Response(JSON.stringify({
      success: true,
      message: 'VAPID keys updated in push_send automatically',
      publicKey: publicKeyBase64Url,
      privateKey: privateKeyBase64Url.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
      instructions: [
        'push_send edge function updated automatically',
        `Update frontend VAPID key to: ${publicKeyBase64Url}`,
        'Test push notifications now'
      ]
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('❌ Auto-update failed:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Auto-update failed',
      message: error.message,
      manual_instructions: [
        'Use vapid_generator to get new keys',
        'Manually update push_send/index.ts REAL_VAPID_KEYS',
        'Update frontend VAPID key'
      ]
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});