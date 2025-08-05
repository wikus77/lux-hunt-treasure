import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Getting Firebase config from Supabase secrets...');

    // Get Firebase configuration from environment variables
    const firebaseConfig = {
      apiKey: Deno.env.get('VITE_FIREBASE_API_KEY'),
      authDomain: Deno.env.get('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: Deno.env.get('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: Deno.env.get('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: Deno.env.get('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: Deno.env.get('VITE_FIREBASE_APP_ID'),
      vapidKey: Deno.env.get('VITE_FIREBASE_VAPID_KEY')
    };

    // Check if all required values are present
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      console.error('❌ Missing Firebase config keys:', missingKeys);
      return new Response(
        JSON.stringify({ 
          error: 'Missing Firebase configuration', 
          missingKeys 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ✅ CRITICAL: Validate Web API Key format (must be ~39 chars, NOT Service Account Key)
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length < 35 || firebaseConfig.apiKey.length > 45) {
      console.error('❌ Invalid Web API Key format - Length:', firebaseConfig.apiKey?.length);
      console.error('❌ Expected: 35-45 chars (Web API Key), Got:', firebaseConfig.apiKey?.length, 'chars');
      console.error('❌ This appears to be a Service Account Key, not a Web API Key');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Web API Key format', 
          details: `Length: ${firebaseConfig.apiKey?.length} chars. Expected: 35-45 chars (Web API Key, not Service Account Key)`,
          instruction: 'Get the correct Web API Key from Firebase Console → Project Settings → Web App → Config'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Firebase config loaded successfully');
    console.log('🔧 Config preview:', {
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      vapidKey: firebaseConfig.vapidKey?.substring(0, 10) + '...'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        config: firebaseConfig 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error getting Firebase config:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get Firebase configuration',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})