import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestPushRequest {
  token: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
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

    console.log(`🔑 Generating test access token for project: ${projectId}`);
    
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
    console.log('✅ Test access token generated successfully');
    
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Test access token generation failed:', error);
    throw error;
  }
}

// Send test FCM message
async function sendFCMMessage(
  token: string, 
  title: string, 
  body: string, 
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const accessToken = await generateAccessToken();
    const projectId = Deno.env.get('FCM_PROJECT_ID');
    
    console.log(`🧪 Sending test notification to: ${token.substring(0, 12)}...`);
    
    const message = {
      message: {
        token,
        notification: { title, body },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channel_id: 'mission-notifications',
            click_action: 'FCM_PLUGIN_ACTIVITY'
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
            badge: '/favicon.ico',
            tag: 'mission-test',
            requireInteraction: true
          },
          fcm_options: {
            link: data?.screen || '/'
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
      console.error('❌ FCM test error:', responseData);
      
      // Check for invalid token
      const isInvalidToken = responseData.error?.details?.some(
        (detail: any) => detail.errorCode === 'UNREGISTERED' || detail.errorCode === 'INVALID_ARGUMENT'
      );
      
      if (isInvalidToken) {
        console.log('🔄 Token appears to be invalid or unregistered');
      }
      
      return false;
    }
    
    console.log(`✅ Test notification sent successfully: ${responseData.name}`);
    return true;
    
  } catch (error) {
    console.error('💥 Test FCM send error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 FCM Test function called');
    
    // Parse request
    const { token, title, body, data }: TestPushRequest = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Use default values for test
    const testTitle = title || 'M1SSION™ Test';
    const testBody = body || 'Push notification test successful! 🎉';
    const testData = { 
      ...data,
      screen: data?.screen || '/notifications',
      test: 'true'
    };
    
    console.log('📋 Test parameters:', { 
      tokenPrefix: token.substring(0, 12),
      title: testTitle,
      body: testBody,
      data: testData
    });
    
    // Send test message
    const success = await sendFCMMessage(token, testTitle, testBody, testData);
    
    const response = {
      success,
      message: success 
        ? 'Test notification sent successfully!' 
        : 'Test notification failed. Check token validity.',
      token: token.substring(0, 12) + '...',
      title: testTitle,
      body: testBody
    };
    
    console.log('📊 Test result:', response);
    
    return new Response(
      JSON.stringify(response),
      { 
        status: success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('💥 FCM Test function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});