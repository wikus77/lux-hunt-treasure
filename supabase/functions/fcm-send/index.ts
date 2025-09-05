import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendPushRequest {
  tokens?: string[];
  user_id?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface FCMResponse {
  name?: string;
  error?: {
    code: number;
    message: string;
    details: Array<{
      '@type': string;
      errorCode: string;
    }>;
  };
}

// Generate OAuth2 access token for FCM
async function generateAccessToken(): Promise<string> {
  try {
    const serviceAccountJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON') || 
                              Deno.env.get('FCM_SERVICE_ACCOUNT_JSON_B64');
    
    if (!serviceAccountJson) {
      throw new Error('FCM service account not configured');
    }
    
    // Decode base64 if needed
    const serviceAccount = serviceAccountJson.startsWith('{') 
      ? JSON.parse(serviceAccountJson)
      : JSON.parse(atob(serviceAccountJson));
    
    const projectId = Deno.env.get('FCM_PROJECT_ID') || serviceAccount.project_id;
    
    if (!projectId) {
      throw new Error('FCM_PROJECT_ID not configured');
    }

    console.log(`🔑 Generating access token for project: ${projectId}`);
    
    // Create JWT for Google OAuth2
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };
    
    const header = { alg: 'RS256', typ: 'JWT' };
    
    // Import private key
    const key = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(serviceAccount.private_key),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Create JWT
    const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
    const signData = `${encodedHeader}.${encodedPayload}`;
    
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      new TextEncoder().encode(signData)
    );
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
    
    const jwt = `${signData}.${encodedSignature}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token generation failed: ${error}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Access token generated successfully');
    
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Access token generation failed:', error);
    throw error;
  }
}

// Send FCM message to a single token
async function sendFCMMessage(
  accessToken: string, 
  token: string, 
  title: string, 
  body: string, 
  data?: Record<string, string>
): Promise<{ success: boolean; response?: FCMResponse; isUnregistered?: boolean }> {
  try {
    const projectId = Deno.env.get('FCM_PROJECT_ID');
    console.log(`📤 Sending to token: ${token.substring(0, 12)}...`);
    
    const message = {
      message: {
        token,
        notification: { title, body },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channel_id: 'mission-notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
              badge: 1
            }
          }
        },
        webpush: {
          notification: {
            title,
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          }
        }
      }
    };
    
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error(`❌ FCM error for ${token.substring(0, 12)}:`, responseData);
      
      // Check if token is unregistered
      const isUnregistered = responseData.error?.details?.some(
        (detail: any) => detail.errorCode === 'UNREGISTERED'
      );
      
      return { 
        success: false, 
        response: responseData,
        isUnregistered 
      };
    }
    
    console.log(`✅ FCM success for ${token.substring(0, 12)}: ${responseData.name}`);
    return { success: true, response: responseData };
    
  } catch (error) {
    console.error(`💥 FCM send error for ${token.substring(0, 12)}:`, error);
    return { success: false };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 FCM Send function called');
    
    // Parse request
    const { tokens, user_id, title, body, data }: SendPushRequest = await req.json();
    
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Collect target tokens
    let targetTokens: string[] = [];
    
    if (tokens && tokens.length > 0) {
      targetTokens = tokens;
      console.log(`📋 Using provided tokens: ${tokens.length}`);
    } else if (user_id) {
      console.log(`👤 Loading tokens for user: ${user_id}`);
      
      const { data: userTokens, error } = await supabase
        .from('fcm_subscriptions')
        .select('token')
        .eq('user_id', user_id)
        .eq('is_active', true);
      
      if (error) {
        console.error('❌ Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to load user tokens' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      targetTokens = userTokens.map(t => t.token);
      console.log(`📋 Found ${targetTokens.length} active tokens for user`);
    } else {
      return new Response(
        JSON.stringify({ error: 'Either tokens or user_id must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (targetTokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No tokens to send to',
          total: 0,
          sent: 0,
          invalidRemoved: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate access token
    const accessToken = await generateAccessToken();
    
    // Send messages and collect results
    const results = await Promise.all(
      targetTokens.map(token => 
        sendFCMMessage(accessToken, token, title, body, data)
      )
    );
    
    // Count results
    const successful = results.filter(r => r.success).length;
    const unregisteredTokens = results
      .filter(r => r.isUnregistered)
      .map((r, index) => targetTokens[index]);
    
    // Clean up unregistered tokens
    let removedCount = 0;
    if (unregisteredTokens.length > 0) {
      console.log(`🧹 Cleaning up ${unregisteredTokens.length} unregistered tokens`);
      
      const { error: deleteError } = await supabase
        .from('fcm_subscriptions')
        .delete()
        .in('token', unregisteredTokens);
      
      if (deleteError) {
        console.error('❌ Failed to clean up tokens:', deleteError);
      } else {
        removedCount = unregisteredTokens.length;
        console.log(`✅ Removed ${removedCount} invalid tokens`);
      }
    }
    
    const response = {
      success: true,
      total: targetTokens.length,
      sent: successful,
      failed: targetTokens.length - successful,
      invalidRemoved: removedCount,
      title,
      body
    };
    
    console.log('📊 FCM Send Results:', response);
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('💥 FCM Send function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});