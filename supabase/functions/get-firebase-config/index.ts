import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/**
 * ⚠️ DEPRECATED: This function is LEGACY and scheduled for removal.
 * 
 * Firebase config is now hardcoded in frontend: src/lib/push/registerPush.ts
 * These values are PUBLIC (not sensitive) and don't need to be in Supabase secrets.
 * 
 * SECURITY CLEANUP: 2026-01-20
 * - Removed dependency on 7 VITE_FIREBASE_* secrets
 * - Values hardcoded here match frontend config
 * - Safe to remove corresponding secrets from Supabase
 * 
 * Secrets no longer needed:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * - VITE_FIREBASE_VAPID_KEY
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 🔐 PUBLIC Firebase config (safe to expose, matches frontend)
// Source: src/lib/push/registerPush.ts
const FIREBASE_CONFIG_PUBLIC = {
  apiKey: "AIzaSyDt7BJ9kV8Jm9aH3GbS6kL4fP2eR9xW7qZ",
  authDomain: "lux-hunt-treasure.firebaseapp.com",
  projectId: "lux-hunt-treasure",
  storageBucket: "lux-hunt-treasure.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:1a2b3c4d5e6f7g8h9i0j1k2l",
  vapidKey: "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('⚠️ DEPRECATED: get-firebase-config called. Use frontend config instead.');

    // Return hardcoded PUBLIC config (no longer reads from secrets)
    const firebaseConfig = { ...FIREBASE_CONFIG_PUBLIC };

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