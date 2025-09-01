// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* FCM Config Endpoint for M1SSION™ */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=3600'
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // M1SSION™ Firebase Configuration - PUBLIC values
    const firebaseConfig = {
      apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
      authDomain: "m1ssion-app.firebaseapp.com", 
      projectId: "m1ssion-app",
      storageBucket: "m1ssion-app.firebasestorage.app",
      messagingSenderId: "21417361168",
      appId: "1:21417361168:web:58841299455ee4bcc7af95",
      vapidPublicKey: "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o"
    };

    console.log('🔥 M1SSION FCM Config requested for project:', firebaseConfig.projectId);

    return new Response(JSON.stringify(firebaseConfig), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('❌ M1SSION FCM Config error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Configuration error',
      message: error.message 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});